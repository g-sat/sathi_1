// Shared types used by both client screens and server API routes.
// Kept framework-agnostic (no mongoose imports) so it is safe to import
// from client bundles.

export type UserRole = 'chw' | 'patient';

export interface UserDTO {
  id: string;
  role: UserRole;
  name: string;
  email?: string;
  emailVerified?: boolean;
  createdAt: string;
}

export type Region = 'India' | 'Pakistan' | 'Bangladesh' | 'Sri Lanka' | 'Nepal';

export type LocalLanguage =
  | 'Hindi'
  | 'Tamil'
  | 'Telugu'
  | 'Gujarati'
  | 'Punjabi'
  | 'Urdu'
  | 'Bengali'
  | 'Marathi'
  | 'Sinhala'
  | 'Nepali'
  | 'English';

export type ImmigrationStatus =
  | 'Immigrant'
  | 'First Generation'
  | 'Second Generation'
  | 'Born in Home Country';

// The clinical intake captured by the CHW during onboarding. This mirrors,
// field-for-field, the "AI Prompt" template used to hand-author the sample
// reports in assets/reports — that master prompt is what src/server/gemini.ts
// builds from this profile.
export interface PatientProfileDTO {
  id: string;
  patientId: string;
  userId: string;
  chwId: string;

  // Core identity
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  region: Region;
  state: string;
  localLanguage: LocalLanguage;

  // Body / clinical baseline
  heightFeet?: number;
  heightInches?: number;
  weightLbs?: number;
  waistCircumferenceCm?: number;
  familyHistoryDiabetes: boolean;
  fastingGlucose?: number;
  hba1c?: number;
  physicalActivityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active';
  dietaryPattern: 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan';

  // Immigration / cultural context
  raceEthnicity?: string;
  immigrationStatus?: ImmigrationStatus;
  yearsInCountry?: number;
  culturalFoodTraditions?: string;
  languageLiteracyNotes?: string;
  occupationDailyRoutine?: string;
  familyHomeResponsibilities?: string;
  budgetConcerns?: string;
  primaryGoals?: string;
  mealPrepTimeAvailable?: string;
  sleepPattern?: string;
  stressLevel?: string;

  // Comorbidities / clinical context (qualitative)
  comorbidities?: string;
  relevantSymptoms?: string;
  medications?: string;
  exerciseRestrictions?: string;
  dietaryRestrictionsAllergies?: string;

  // Current dietary intake (recall)
  breakfastRecall?: string;
  lunchRecall?: string;
  dinnerRecall?: string;
  snacksRecall?: string;
  beveragesRecall?: string;
  eatingOutFrequency?: string;
  nightEmotionalEatingPattern?: string;
  proteinIntakePattern?: string;
  fruitVegIntake?: string;
  processedFoodsSweetsIntake?: string;

  // Function / physical activity baseline
  currentExerciseRoutine?: string;
  averageDailySteps?: number;
  functionalLimitations?: string;
  equipmentAccess?: string;
  safeWalkingArea?: boolean;
  enjoyedMovementForms?: string;
  dislikedMovementForms?: string;

  notes?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Intervention report — 9 sections matching the master AI prompt template.
// Each section shares a common envelope (key/version/lastPrompt) and carries
// a section-specific `data` payload. Because the 9 shapes are quite
// different, we keep `data` loosely typed here and rely on the section-key
// switch in the UI/PDF/Gemini layers to interpret it — the interfaces below
// document the exact shape each key's `data` should have.
// ---------------------------------------------------------------------------

export type ReportSectionKey =
  | 'summary'
  | 'nutrition'
  | 'grocery'
  | 'recipes'
  | 'exercise'
  | 'behavioral'
  | 'weeklyPlan'
  | 'progression'
  | 'safety';

export interface SummarySectionData {
  strengths: string[];
  barriersAndRisks: string[];
  whyThisPlanIsRealistic: string;
}

export interface MealExample {
  title: string;
  description: string;
}

export interface NutritionSectionData {
  breakfastStrategy: string;
  lunchStrategy: string;
  dinnerStrategy: string;
  snacksAndBeveragesStrategy: string;
  mealExamples: MealExample[];
  easiestVersionForBusyDays: string;
}

export interface GroceryItem {
  item: string;
  why: string;
}

export interface GrocerySectionData {
  proteins: GroceryItem[];
  highFiberCarbohydrates: GroceryItem[];
  vegetables: GroceryItem[];
  fruit: GroceryItem[];
  healthyFats: GroceryItem[];
  flavorBuilders: GroceryItem[];
  convenienceFoods: GroceryItem[];
}

export interface Recipe {
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  whyItFitsThisPatient: string;
  ingredients: string[];
  steps: string[];
  substitutions: string;
}

export interface RecipesSectionData {
  recipes: Recipe[];
}

export interface ExerciseSectionData {
  cardioProgression: string;
  resistanceTraining: string;
  mobilityAndBalance: string;
  recoveryDays: string;
  minimumGoal: string;
  idealGoal: string;
  homeBasedAlternatives: string;
  lowerImpactSubstitutions: string;
}

export interface BehavioralSectionData {
  habitGoals: string[];
  selfMonitoringSuggestions: string;
  handlingMissedDays: string;
  stressAndDisruptionStrategy: string;
}

export interface DayPlan {
  day: string;
  nutritionFocus: string;
  mealGuidance: string;
  physicalActivityGoal: string;
  strengthOrMobilityGoal: string;
  behavioralTask: string;
  notes: string;
}

export interface WeekPlan {
  weekNumber: 1 | 2;
  days: DayPlan[];
}

export interface WeeklyPlanSectionData {
  weeks: WeekPlan[];
}

export interface ProgressionPhase {
  phase: string;
  nutritionGoals: string;
  exerciseGoals: string;
  expectedMilestones: string;
  commonBarriers: string;
  troubleshootingApproach: string;
}

export interface ProgressionSectionData {
  phases: ProgressionPhase[];
}

export interface SafetySectionData {
  flags: string[];
  clinicianClearanceNotes: string;
}

export type ReportSectionDataMap = {
  summary: SummarySectionData;
  nutrition: NutritionSectionData;
  grocery: GrocerySectionData;
  recipes: RecipesSectionData;
  exercise: ExerciseSectionData;
  behavioral: BehavioralSectionData;
  weeklyPlan: WeeklyPlanSectionData;
  progression: ProgressionSectionData;
  safety: SafetySectionData;
};

// A proper discriminated union: narrowing on `key` correctly narrows `data`
// to that key's specific shape (e.g. `if (section.key === 'summary')` gives
// you `section.data: SummarySectionData`).
export type ReportSection = {
  [K in ReportSectionKey]: {
    key: K;
    data: ReportSectionDataMap[K];
    version: number;
    lastPrompt?: string;
  };
}[ReportSectionKey];

export type ReportStatus = 'draft' | 'published';

export interface InterventionReportDTO {
  id: string;
  patientId: string;
  chwId: string;
  status: ReportStatus;
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DailyLogDTO {
  id: string;
  patientId: string;
  date: string;
  glucoseLevel?: number;
  glucoseTiming?: 'Fasting' | 'Post-Meal' | 'Random';
  meals: { type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'; description: string }[];
  activityMinutes?: number;
  activityType?: string;
  moodNote?: string;
  createdAt: string;
}

export interface NudgeDTO {
  id: string;
  patientId: string;
  date: string;
  language: LocalLanguage;
  message: string;
  translatedMessage: string;
}
