import { SECTION_LABELS, SECTION_ORDER } from "@/lib/constants";
import type {
    BehavioralSectionData,
    ExerciseSectionData,
    GrocerySectionData,
    NutritionSectionData,
    ProgressionSectionData,
    RecipesSectionData,
    ReportSectionKey,
    SafetySectionData,
    SummarySectionData,
    WeeklyPlanSectionData,
} from "@/types";
import { GoogleGenAI, Type } from "@google/genai";
import type { PatientProfileDoc } from "./models/PatientProfile";

// ---------------------------------------------------------------------------
// Expo Router's server runtime replaces the global `fetch` with a minimal
// shim ("fetch-nodeshim") that hardcodes a 30-second idle-socket timeout
// (`connectTimeout`) with no way to configure it from the outside. Our full
// 9-section report generation (including the 14-day day-by-day table) can
// legitimately take well over 30 seconds, so without this patch every
// generation/regeneration call fails with a generic "Request timed out"
// (ETIMEDOUT) regardless of any timeout passed to the @google/genai SDK.
// We wrap the global fetch once to raise that timeout for every request.
// ---------------------------------------------------------------------------
const GEMINI_FETCH_TIMEOUT_MS = 180_000;
const patchedFetchMarker = "__sathiConnectTimeoutPatched__";
if (
  typeof globalThis.fetch === "function" &&
  !(globalThis.fetch as any)[patchedFetchMarker]
) {
  const originalFetch = globalThis.fetch.bind(globalThis);
  const patched = (input: any, init?: any) =>
    originalFetch(input, {
      connectTimeout: GEMINI_FETCH_TIMEOUT_MS,
      ...(init || {}),
    });
  (patched as any)[patchedFetchMarker] = true;
  globalThis.fetch = patched as typeof fetch;
}

// ---------------------------------------------------------------------------
// Gemini occasionally returns 503 UNAVAILABLE ("high demand") or 429
// RESOURCE_EXHAUSTED for a transient overload — these are worth retrying
// with backoff rather than immediately failing the CHW's whole generation.
// The SDK has its own default retry behavior, but we add an explicit layer
// here too so we control the attempt count/backoff and can surface a much
// friendlier message (instead of the raw upstream JSON error blob) once
// retries are truly exhausted.
// ---------------------------------------------------------------------------
function isRetryableGeminiError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    /"code"\s*:\s*(429|500|502|503|504)/.test(message) ||
    /UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(message)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  attempts = 4,
  baseDelayMs = 2000,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === attempts - 1 || !isRetryableGeminiError(err)) {
        if (isRetryableGeminiError(err)) {
          throw new Error(
            "Gemini is experiencing high demand right now and didn't respond after several retries. Please wait a minute and try again.",
          );
        }
        throw err;
      }
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 500;
      await sleep(delay);
    }
  }
  throw lastErr;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env.local file.",
      );
    }
    client = new GoogleGenAI({
      apiKey,
      // The full 9-section report (including a 14-day day-by-day table) is a
      // large structured-output generation and can comfortably take over a
      // minute — well past the SDK's default HTTP timeout, which otherwise
      // surfaces as a generic "Request timed out" error.
      httpOptions: { timeout: 180_000 },
    });
  }
  return client;
}

// Pinned to the "latest" flash alias so the app keeps working as Google
// deprecates/rotates specific dated model snapshots over time.
const MODEL = "gemini-flash-latest";

// ---------------------------------------------------------------------------
// This whole module is built directly from the master "AI Prompt" template
// found in assets/reports/P_00X/P_00X AI Prompt.docx (identical across all 6
// sample patients — only the patient data block changes). We reproduce that
// exact clinician persona, principles, and 9-section OUTPUT REQUIREMENTS, but
// ask for structured JSON (matching ReportSectionDataMap in src/types) instead
// of a markdown/PDF document, so the CHW review UI and our own PDF exporter
// can render and iteratively regenerate each section independently.
// ---------------------------------------------------------------------------

const SYSTEM_INSTRUCTION = `You are an expert obesity medicine clinician, lifestyle medicine specialist,
exercise counselor, and culturally responsive dietitian. You create highly practical, safe,
incremental, and personalized 14-day diet and physical activity plans for community-based adult
South Asian patients with prediabetes or diabetes — including South Asian immigrants and their
families living abroad.

Your goals:
- Create a feasible plan the patient can actually follow.
- Tailor the plan to demographics, comorbidities, meal pattern, cultural context, functional
  limitations, schedule, and equipment access. Pay particular attention to dietary preferences
  and any religious or cultural restrictions.
- Start at an appropriate baseline and increase gradually over 14 days.
- Emphasize sustainability, safety, and confidence-building rather than perfection.
- Use the patient's name, region, and ancestry as a proxy to validate the cultural sensitivity
  and feasibility of the diet you recommend.

Important principles:
- Be realistic and conservative at the start. Never prescribe an abrupt or overly ambitious plan.
- Use small, progressive increases in activity and nutrition changes.
- Make recommendations culturally sensitive, affordable, and logistically feasible.
- Respect pain, fatigue, mobility restrictions, and access barriers.
- If equipment access is limited, provide home-based options.
- If the patient is sedentary or deconditioned, begin with very small goals.
- Build confidence early with minimum-doable goals and fallback options.
- Avoid unsafe exercise, all-or-nothing language, or extreme diets.
- NEVER default to Western/US assumptions as generic filler (e.g. "avoid bread", "eat oatmeal",
  "go for a jog"). Every recommendation must be grounded in the patient's specific regional and
  everyday South Asian home-cooking and lifestyle context — real dish names, cooking oils, staple
  grains, and culturally-common daily routines.
- Keep clinical claims conservative and always suggest confirming numeric targets with a doctor.
- Output must strictly match the requested JSON schema. Do not include markdown formatting.`;

function bmiFrom(
  heightFeet?: number,
  heightInches?: number,
  weightLbs?: number,
): number | undefined {
  if (!heightFeet || !weightLbs) return undefined;
  const totalInches = heightFeet * 12 + (heightInches || 0);
  if (!totalInches) return undefined;
  return (
    Math.round(((703 * weightLbs) / (totalInches * totalInches)) * 10) / 10
  );
}

function or(
  value: string | number | boolean | undefined | null,
  fallback = "not provided",
): string {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function patientContext(patient: PatientProfileDoc): string {
  const bmi = bmiFrom(
    patient.heightFeet ?? undefined,
    patient.heightInches ?? undefined,
    patient.weightLbs ?? undefined,
  );
  const heightText = patient.heightFeet
    ? `${patient.heightFeet} foot ${patient.heightInches ?? 0} inches`
    : "not provided";

  return `
PATIENT PROFILE
Full name: ${patient.name}
Age: ${patient.age}
Sex/gender: ${patient.gender}
Height: ${heightText}
Weight: ${or(patient.weightLbs, "not provided")}${patient.weightLbs ? " lb" : ""}
BMI: ${or(bmi)}
Race/ethnicity: ${or(patient.raceEthnicity, patient.region)}
Region of South Asian ancestry: ${patient.region} (${patient.state})
Immigration status: ${or(patient.immigrationStatus)}
Years in current country: ${or(patient.yearsInCountry)}
Cultural background / food traditions: ${or(patient.culturalFoodTraditions)}
Dietary pattern: ${patient.dietaryPattern}
Language preferences / literacy considerations: ${patient.localLanguage}${
    patient.languageLiteracyNotes ? ` — ${patient.languageLiteracyNotes}` : ""
  }
Occupation / daily routine: ${or(patient.occupationDailyRoutine)}
Family/home responsibilities: ${or(patient.familyHomeResponsibilities)}
Budget/food insecurity concerns: ${or(patient.budgetConcerns, "None reported")}
Primary goals: ${or(patient.primaryGoals, "Improve glucose control and build a sustainable lifestyle")}
Time available for meal prep: ${or(patient.mealPrepTimeAvailable)}
Sleep pattern: ${or(patient.sleepPattern)}
Stress level / major stressors: ${or(patient.stressLevel)}

COMORBIDITIES / CLINICAL CONTEXT
Comorbidities: ${or(patient.comorbidities, patient.familyHistoryDiabetes ? "Family history of diabetes" : "not provided")}
Relevant symptoms: ${or(patient.relevantSymptoms, "none reported")}
Medications: ${or(patient.medications, "none reported")}
Exercise restrictions / precautions: ${or(patient.exerciseRestrictions, "none reported")}
Dietary restrictions/allergies/intolerances: ${or(patient.dietaryRestrictionsAllergies, "none reported")}
Fasting glucose: ${or(patient.fastingGlucose)}${patient.fastingGlucose ? " mg/dL" : ""}
HbA1c: ${or(patient.hba1c)}${patient.hba1c ? " %" : ""}
Waist circumference: ${or(patient.waistCircumferenceCm)}${patient.waistCircumferenceCm ? " cm" : ""}

CURRENT DIETARY INTAKE
Breakfast recall: ${or(patient.breakfastRecall)}
Lunch recall: ${or(patient.lunchRecall)}
Dinner recall: ${or(patient.dinnerRecall)}
Snacks: ${or(patient.snacksRecall)}
Beverages: ${or(patient.beveragesRecall)}
Eating out frequency: ${or(patient.eatingOutFrequency)}
Night eating / emotional eating / grazing / large portions: ${or(patient.nightEmotionalEatingPattern, "not reported")}
Protein intake pattern: ${or(patient.proteinIntakePattern)}
Fruit/vegetable intake: ${or(patient.fruitVegIntake)}
Ultra-processed foods / sweets / sugar-sweetened beverages: ${or(patient.processedFoodsSweetsIntake)}

FUNCTION/PHYSICAL ACTIVITY BASELINE
Current physical activity level: ${patient.physicalActivityLevel}
Current exercise routine: ${or(patient.currentExerciseRoutine)}
Average daily steps if known: ${or(patient.averageDailySteps)}
Functional limitations: ${or(patient.functionalLimitations, "none reported")}
Access to equipment: ${or(patient.equipmentAccess, "none reported")}
Access to safe walking area: ${patient.safeWalkingArea === undefined || patient.safeWalkingArea === null ? "not provided" : patient.safeWalkingArea ? "yes" : "no"}
Enjoyed forms of movement: ${or(patient.enjoyedMovementForms)}
Disliked forms of movement: ${or(patient.dislikedMovementForms, "none reported")}

CHW notes: ${or(patient.notes, "none")}
`.trim();
}

const SECTION_INSTRUCTIONS: Record<ReportSectionKey, string> = {
  summary: `Summarize the main barriers, strengths, risks, and opportunities. Explain why the
starting plan is realistic for this patient specifically.`,
  nutrition: `Modify the patient's usual breakfast, lunch, and dinner rather than replacing
everything. Preserve cultural foods whenever possible. Give realistic substitutions, portion
guidance, and protein/fiber upgrades. Include breakfast, lunch, dinner, and snack/beverage
strategy. Include 3-5 culturally appropriate meal examples. Include an easiest possible version
for busy days.`,
  grocery: `Create a sample grocery list explicitly tailored to the patient's culture, household
needs, comorbidities, and budget, organized into these categories: proteins, high-fiber
carbohydrates/starches, vegetables, fruit, healthy fats, flavor builders/culturally relevant
seasonings, and convenience foods for busy days. For each category include 5-10 practical items,
each with a brief note on why it fits this patient.`,
  recipes: `Create 4-6 simple recipes using foods that would appear on the grocery list. For each
include: recipe name, meal type, why it fits this patient, ingredients, simple preparation steps,
and easy substitutions for culture/budget/dietary restriction. Include at least 1 breakfast, 1
lunch, 1 dinner, and 1 snack/grab-and-go recipe. Recipes must be realistic, low burden, and
feasible on busy days.`,
  exercise: `Include walking/cardio progression, resistance training, mobility/stretching/balance
as appropriate, recovery days, a minimum goal and an ideal goal, home-based alternatives, and
lower-impact substitutions. Use clear dosage: frequency, duration, intensity, and progression.`,
  behavioral: `Include only 2-4 habit goals at a time. Include self-monitoring suggestions.
Explain how to handle missed days without starting over. Include strategies for stress eating,
schedule disruption, weekends, and social events.`,
  weeklyPlan: `Output the full 14-day plan as two weeks (Week 1 and Week 2), each covering Monday
through Sunday. For every single day include: nutrition focus, breakfast/lunch/dinner guidance,
physical activity goal, strength/mobility goal, behavioral task/tracking goal, and
notes/modifications. Progress gradually week to week, keep repetition manageable but not
identical, include at least one lighter/recovery day each week, and include fallback options for
pain flares, busy days, or low motivation days. Cover all 14 days — never omit any day.`,
  progression: `Provide a concise phase-by-phase summary: main nutrition goals, main exercise
goals, expected milestones, common barriers, and troubleshooting approach for each phase.`,
  safety: `List important safety considerations based on comorbidities and functional
limitations. Note when clinician clearance or a modification of the plan is needed.`,
};

// ---------------------------------------------------------------------------
// Structured output schemas (one per section, plus the combined full report)
// ---------------------------------------------------------------------------

const GROCERY_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    item: { type: Type.STRING },
    why: { type: Type.STRING },
  },
  required: ["item", "why"],
};

const SUMMARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    barriersAndRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
    whyThisPlanIsRealistic: { type: Type.STRING },
  },
  required: ["strengths", "barriersAndRisks", "whyThisPlanIsRealistic"],
};

const MEAL_EXAMPLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ["title", "description"],
};

const NUTRITION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    breakfastStrategy: { type: Type.STRING },
    lunchStrategy: { type: Type.STRING },
    dinnerStrategy: { type: Type.STRING },
    snacksAndBeveragesStrategy: { type: Type.STRING },
    mealExamples: { type: Type.ARRAY, items: MEAL_EXAMPLE_SCHEMA },
    easiestVersionForBusyDays: { type: Type.STRING },
  },
  required: [
    "breakfastStrategy",
    "lunchStrategy",
    "dinnerStrategy",
    "snacksAndBeveragesStrategy",
    "mealExamples",
    "easiestVersionForBusyDays",
  ],
};

const GROCERY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    proteins: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    highFiberCarbohydrates: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    vegetables: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    fruit: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    healthyFats: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    flavorBuilders: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
    convenienceFoods: { type: Type.ARRAY, items: GROCERY_ITEM_SCHEMA },
  },
  required: [
    "proteins",
    "highFiberCarbohydrates",
    "vegetables",
    "fruit",
    "healthyFats",
    "flavorBuilders",
    "convenienceFoods",
  ],
};

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    mealType: {
      type: Type.STRING,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"],
    },
    whyItFitsThisPatient: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    substitutions: { type: Type.STRING },
  },
  required: [
    "name",
    "mealType",
    "whyItFitsThisPatient",
    "ingredients",
    "steps",
    "substitutions",
  ],
};

const RECIPES_SCHEMA = {
  type: Type.OBJECT,
  properties: { recipes: { type: Type.ARRAY, items: RECIPE_SCHEMA } },
  required: ["recipes"],
};

const EXERCISE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    cardioProgression: { type: Type.STRING },
    resistanceTraining: { type: Type.STRING },
    mobilityAndBalance: { type: Type.STRING },
    recoveryDays: { type: Type.STRING },
    minimumGoal: { type: Type.STRING },
    idealGoal: { type: Type.STRING },
    homeBasedAlternatives: { type: Type.STRING },
    lowerImpactSubstitutions: { type: Type.STRING },
  },
  required: [
    "cardioProgression",
    "resistanceTraining",
    "mobilityAndBalance",
    "recoveryDays",
    "minimumGoal",
    "idealGoal",
    "homeBasedAlternatives",
    "lowerImpactSubstitutions",
  ],
};

const BEHAVIORAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    habitGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
    selfMonitoringSuggestions: { type: Type.STRING },
    handlingMissedDays: { type: Type.STRING },
    stressAndDisruptionStrategy: { type: Type.STRING },
  },
  required: [
    "habitGoals",
    "selfMonitoringSuggestions",
    "handlingMissedDays",
    "stressAndDisruptionStrategy",
  ],
};

const DAY_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    day: { type: Type.STRING },
    nutritionFocus: { type: Type.STRING },
    mealGuidance: { type: Type.STRING },
    physicalActivityGoal: { type: Type.STRING },
    strengthOrMobilityGoal: { type: Type.STRING },
    behavioralTask: { type: Type.STRING },
    notes: { type: Type.STRING },
  },
  required: [
    "day",
    "nutritionFocus",
    "mealGuidance",
    "physicalActivityGoal",
    "strengthOrMobilityGoal",
    "behavioralTask",
    "notes",
  ],
};

const WEEK_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    weekNumber: { type: Type.NUMBER },
    days: { type: Type.ARRAY, items: DAY_PLAN_SCHEMA },
  },
  required: ["weekNumber", "days"],
};

const WEEKLY_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: { weeks: { type: Type.ARRAY, items: WEEK_PLAN_SCHEMA } },
  required: ["weeks"],
};

const PROGRESSION_PHASE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    phase: { type: Type.STRING },
    nutritionGoals: { type: Type.STRING },
    exerciseGoals: { type: Type.STRING },
    expectedMilestones: { type: Type.STRING },
    commonBarriers: { type: Type.STRING },
    troubleshootingApproach: { type: Type.STRING },
  },
  required: [
    "phase",
    "nutritionGoals",
    "exerciseGoals",
    "expectedMilestones",
    "commonBarriers",
    "troubleshootingApproach",
  ],
};

const PROGRESSION_SCHEMA = {
  type: Type.OBJECT,
  properties: { phases: { type: Type.ARRAY, items: PROGRESSION_PHASE_SCHEMA } },
  required: ["phases"],
};

const SAFETY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    flags: { type: Type.ARRAY, items: { type: Type.STRING } },
    clinicianClearanceNotes: { type: Type.STRING },
  },
  required: ["flags", "clinicianClearanceNotes"],
};

const SECTION_SCHEMAS: Record<ReportSectionKey, object> = {
  summary: SUMMARY_SCHEMA,
  nutrition: NUTRITION_SCHEMA,
  grocery: GROCERY_SCHEMA,
  recipes: RECIPES_SCHEMA,
  exercise: EXERCISE_SCHEMA,
  behavioral: BEHAVIORAL_SCHEMA,
  weeklyPlan: WEEKLY_PLAN_SCHEMA,
  progression: PROGRESSION_SCHEMA,
  safety: SAFETY_SCHEMA,
};

const FULL_REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: SUMMARY_SCHEMA,
    nutrition: NUTRITION_SCHEMA,
    grocery: GROCERY_SCHEMA,
    recipes: RECIPES_SCHEMA,
    exercise: EXERCISE_SCHEMA,
    behavioral: BEHAVIORAL_SCHEMA,
    weeklyPlan: WEEKLY_PLAN_SCHEMA,
    progression: PROGRESSION_SCHEMA,
    safety: SAFETY_SCHEMA,
  },
  required: [
    "summary",
    "nutrition",
    "grocery",
    "recipes",
    "exercise",
    "behavioral",
    "weeklyPlan",
    "progression",
    "safety",
  ],
};

function buildInitialPrompt(patient: PatientProfileDoc): string {
  const sectionsText = SECTION_ORDER.map(
    (key, i) =>
      `SECTION ${i + 1} — "${key}" (${SECTION_LABELS[key]}): ${SECTION_INSTRUCTIONS[key]}`,
  ).join("\n\n");

  return `Create a highly practical, safe, incremental, and personalized 14-day diet and physical
activity plan for the community-based adult South Asian patient described below.

${patientContext(patient)}

Before generating the final plan:
1. Infer the patient's main barriers and strengths from the data.
2. Estimate an appropriate starting point for diet and exercise.
3. Make the first week intentionally easy enough to succeed.
4. Increase difficulty only when justified by baseline capacity.
5. Make sure the grocery list and recipes clearly match the patient profile.

Now produce the full plan as a single JSON object with exactly these 9 keys, one per section:

${sectionsText}

Be specific, structured, and clinically practical, supportive, nonjudgmental, and in plain
language. Favor adherence and sustainability over theoretical perfection.`;
}

function buildRegeneratePrompt(
  patient: PatientProfileDoc,
  key: ReportSectionKey,
  currentData: unknown,
  followUpInstruction: string,
): string {
  return `You previously generated the "${SECTION_LABELS[key]}" section of a patient's Diabetes
Prevention Program report. The CHW reviewed it and wants a revision.

${patientContext(patient)}

Section requirements: ${SECTION_INSTRUCTIONS[key]}

Current "${key}" section (JSON):
${JSON.stringify(currentData)}

CHW's follow-up instruction: "${followUpInstruction}"

Regenerate ONLY this section, incorporating the CHW's instruction while keeping it culturally
appropriate, specific, clinically safe, and consistent with the rest of the patient's profile.
Return JSON matching the exact same shape as the current section.`;
}

export interface GeneratedFullReport {
  summary: SummarySectionData;
  nutrition: NutritionSectionData;
  grocery: GrocerySectionData;
  recipes: RecipesSectionData;
  exercise: ExerciseSectionData;
  behavioral: BehavioralSectionData;
  weeklyPlan: WeeklyPlanSectionData;
  progression: ProgressionSectionData;
  safety: SafetySectionData;
}

export async function generateFullReport(
  patient: PatientProfileDoc,
): Promise<GeneratedFullReport> {
  const ai = getClient();
  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: buildInitialPrompt(patient),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: FULL_REPORT_SCHEMA,
        temperature: 0.7,
      },
    }),
  );

  const text = response.text;
  if (!text)
    throw new Error(
      "Gemini returned an empty response while generating the report.",
    );
  return JSON.parse(text) as GeneratedFullReport;
}

/** Turns the raw Gemini output into our stored `ReportSection[]` shape. */
export function toReportSections(report: GeneratedFullReport) {
  const record = report as unknown as Record<ReportSectionKey, unknown>;
  return SECTION_ORDER.map((key) => ({
    key,
    data: record[key],
    version: 1,
  }));
}

export async function regenerateSection(
  patient: PatientProfileDoc,
  key: ReportSectionKey,
  currentData: unknown,
  followUpInstruction: string,
): Promise<unknown> {
  const ai = getClient();
  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: buildRegeneratePrompt(
        patient,
        key,
        currentData,
        followUpInstruction,
      ),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SECTION_SCHEMAS[key],
        temperature: 0.7,
      },
    }),
  );

  const text = response.text;
  if (!text)
    throw new Error(
      "Gemini returned an empty response while regenerating the section.",
    );
  return JSON.parse(text);
}

const NUDGE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    english: { type: Type.STRING },
    translated: { type: Type.STRING },
  },
  required: ["english", "translated"],
};

export async function generateDailyNudge(
  patient: PatientProfileDoc,
): Promise<{ english: string; translated: string }> {
  const ai = getClient();
  const response = await withGeminiRetry(() =>
    ai.models.generateContent({
      model: MODEL,
      contents: `Write ONE short, warm, encouraging daily health nudge (max 2 sentences) for a
Diabetes Prevention Program patient. It should reference something achievable today (a food
swap, a short walk, a breathing/rest habit) appropriate for their culture and routine.

Patient: ${patient.name}, region of South Asian ancestry: ${patient.region} (${patient.state}),
dietary pattern: ${patient.dietaryPattern}, primary goals: ${or(patient.primaryGoals, "improve glucose control")},
comorbidities: ${or(patient.comorbidities, "none reported")},
current exercise routine: ${or(patient.currentExerciseRoutine, "not provided")}.

Return the nudge in English ("english") AND a natural, conversational translation into
${patient.localLanguage} ("translated"). Do not transliterate — write the translation using
the native script of ${patient.localLanguage} where applicable.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: NUDGE_SCHEMA,
        temperature: 0.9,
      },
    }),
  );

  const text = response.text;
  if (!text)
    throw new Error(
      "Gemini returned an empty response while generating the nudge.",
    );
  return JSON.parse(text) as { english: string; translated: string };
}
