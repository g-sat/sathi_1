import { Button } from "@/components/ui/Button";
import { SECTION_LABELS } from "@/lib/constants";
import type {
  BehavioralSectionData,
  ExerciseSectionData,
  GrocerySectionData,
  InterventionReportDTO,
  NutritionSectionData,
  PatientProfileDTO,
  ProgressionSectionData,
  RecipesSectionData,
  ReportSection,
  SafetySectionData,
  SummarySectionData,
  WeeklyPlanSectionData,
} from "@/types";
import * as Print from "expo-print";
import { isAvailableAsync, shareAsync } from "expo-sharing";
import { FileDown } from "lucide-react-native";
import { useState } from "react";

// ---------------------------------------------------------------------------
// This mirrors the layout of the hand-authored sample reports in
// assets/reports/P_00X/P_00X Plan.pdf: a cover title + tagline, numbered
// "Section N: {label}" headers, weekly/progression data as real tables, and
// a fresh page for each major section so it reads like a publication-ready
// clinical handout rather than an in-app card list.
// ---------------------------------------------------------------------------

const INK = "#1C1C1E";
const SUBTLE = "#6E6E73";
const ACCENT = "#6D28D9";
const RULE = "#D9D9DE";
const PANEL = "#F7F6FB";

function ul(items: string[]) {
  return `<ul style="margin:6px 0 0;padding-left:20px;">${items
    .map((i) => `<li style="margin-bottom:7px;line-height:1.5;">${i}</li>`)
    .join("")}</ul>`;
}

function field(label: string, value?: string) {
  if (!value) return "";
  return `<p style="margin:10px 0;"><strong>${label}:</strong> ${value}</p>`;
}

function panel(html: string) {
  return `<div style="margin-bottom:12px;padding:12px 14px;background:${PANEL};border:1px solid ${RULE};border-radius:10px;">${html}</div>`;
}

function bodyHtml(section: ReportSection): string {
  switch (section.key) {
    case "summary": {
      const d = section.data as SummarySectionData;
      return `
        ${field("Why this plan is realistic", d.whyThisPlanIsRealistic)}
        <p style="margin:14px 0 4px;"><strong>Strengths</strong></p>${ul(d.strengths || [])}
        <p style="margin:14px 0 4px;"><strong>Barriers &amp; risks</strong></p>${ul(d.barriersAndRisks || [])}
      `;
    }
    case "nutrition": {
      const d = section.data as NutritionSectionData;
      return `
        ${field("Breakfast", d.breakfastStrategy)}
        ${field("Lunch", d.lunchStrategy)}
        ${field("Dinner", d.dinnerStrategy)}
        ${field("Snacks &amp; beverages", d.snacksAndBeveragesStrategy)}
        ${field("Easiest version for busy days", d.easiestVersionForBusyDays)}
        ${
          d.mealExamples?.length
            ? `<p style="margin:14px 0 4px;"><strong>Meal examples</strong></p>${ul(
                d.mealExamples.map((m) => `<strong>${m.title}:</strong> ${m.description}`),
              )}`
            : ""
        }
      `;
    }
    case "grocery": {
      const d = section.data as GrocerySectionData;
      const cats: { key: keyof GrocerySectionData; label: string }[] = [
        { key: "proteins", label: "Proteins" },
        { key: "highFiberCarbohydrates", label: "High-fiber carbs / starches" },
        { key: "vegetables", label: "Vegetables" },
        { key: "fruit", label: "Fruit" },
        { key: "healthyFats", label: "Healthy fats" },
        { key: "flavorBuilders", label: "Flavor builders / seasonings" },
        { key: "convenienceFoods", label: "Convenience foods" },
      ];
      return cats
        .map(({ key, label }) => {
          const items = d[key] || [];
          if (!items.length) return "";
          return `<p style="margin:14px 0 4px;"><strong>${label}</strong></p>${ul(
            items.map((it) => `<strong>${it.item}:</strong> ${it.why}`),
          )}`;
        })
        .join("");
    }
    case "recipes": {
      const d = section.data as RecipesSectionData;
      return (d.recipes || [])
        .map(
          (r, i) => `
        <div style="margin-bottom:14px;padding:12px 14px;border:1px solid ${RULE};border-radius:10px;">
          <p style="margin:0 0 4px;font-size:14px;"><strong>${i + 1}. ${r.mealType}: ${r.name}</strong></p>
          <p style="margin:0 0 8px;font-style:italic;color:${SUBTLE};">Why it fits: ${r.whyItFitsThisPatient}</p>
          ${r.ingredients?.length ? `<p style="margin:6px 0 2px;"><strong>Ingredients:</strong> ${r.ingredients.join(", ")}</p>` : ""}
          ${r.steps?.length ? `<p style="margin:8px 0 2px;"><strong>Steps:</strong></p>${ul(r.steps)}` : ""}
          ${r.substitutions ? `<p style="margin:8px 0 0;font-style:italic;color:${SUBTLE};">Substitutions: ${r.substitutions}</p>` : ""}
        </div>`,
        )
        .join("");
    }
    case "exercise": {
      const d = section.data as ExerciseSectionData;
      return `
        ${field("Cardio progression", d.cardioProgression)}
        ${field("Resistance training", d.resistanceTraining)}
        ${field("Mobility &amp; balance", d.mobilityAndBalance)}
        ${field("Recovery days", d.recoveryDays)}
        ${field("Minimum goal", d.minimumGoal)}
        ${field("Ideal goal", d.idealGoal)}
        ${field("Home-based alternatives", d.homeBasedAlternatives)}
        ${field("Lower-impact substitutions", d.lowerImpactSubstitutions)}
      `;
    }
    case "behavioral": {
      const d = section.data as BehavioralSectionData;
      return `
        <p style="margin:0 0 4px;"><strong>Habit goals</strong></p>${ul(d.habitGoals || [])}
        ${field("Self-monitoring", d.selfMonitoringSuggestions)}
        ${field("Handling missed days", d.handlingMissedDays)}
        ${field("Stress &amp; disruption strategy", d.stressAndDisruptionStrategy)}
      `;
    }
    case "weeklyPlan": {
      const d = section.data as WeeklyPlanSectionData;
      return (d.weeks || [])
        .map(
          (week, i) => `
        <div style="${i > 0 ? "page-break-before:always;" : ""}">
          <h3 style="color:${ACCENT};margin:${i > 0 ? "0" : "18px"} 0 8px;font-size:15px;">Week ${week.weekNumber}</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed;">
            <thead>
              <tr style="background:${PANEL};">
                ${["Day", "Nutrition Focus", "Meals", "Physical Activity", "Strength/Mobility", "Behavioral Task", "Notes"]
                  .map(
                    (h) =>
                      `<th style="border:1px solid ${RULE};padding:6px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.03em;color:${SUBTLE};">${h}</th>`,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${week.days
                .map(
                  (day) => `
                <tr>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;"><strong>${day.day}</strong></td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.nutritionFocus}</td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.mealGuidance}</td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.physicalActivityGoal}</td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.strengthOrMobilityGoal}</td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.behavioralTask}</td>
                  <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${day.notes}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>`,
        )
        .join("");
    }
    case "progression": {
      const d = section.data as ProgressionSectionData;
      return `
        <table style="width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed;">
          <thead>
            <tr style="background:${PANEL};">
              ${["Phase", "Nutrition Goals", "Exercise Goals", "Expected Milestones", "Common Barriers", "Troubleshooting Approach"]
                .map(
                  (h) =>
                    `<th style="border:1px solid ${RULE};padding:6px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.03em;color:${SUBTLE};">${h}</th>`,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${(d.phases || [])
              .map(
                (p) => `
              <tr>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;"><strong>${p.phase}</strong></td>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${p.nutritionGoals}</td>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${p.exerciseGoals}</td>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${p.expectedMilestones}</td>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${p.commonBarriers}</td>
                <td style="border:1px solid ${RULE};padding:6px;vertical-align:top;">${p.troubleshootingApproach}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
    }
    case "safety": {
      const d = section.data as SafetySectionData;
      return `${ul(d.flags || [])}${field("Clinician clearance notes", d.clinicianClearanceNotes)}`;
    }
    default:
      return "";
  }
}

/** Builds a publication-style cover title/tagline from the patient's own
 * profile fields (no dependency on any AI-generated title/tagline field). */
function resolveCover(patient: PatientProfileDTO) {
  const title = "Personalized Metabolic & Lifestyle Plan";
  const tagline = `14-Day Culturally-Tailored Guide • ${patient.dietaryPattern} • ${patient.region} Focus`;
  return { title, tagline };
}

function buildHtml(patient: PatientProfileDTO, report: InterventionReportDTO) {
  const { title, tagline } = resolveCover(patient);

  const generatedOn = new Date(report.publishedAt || report.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sectionHtml = report.sections
    .map((s, i) => {
      // Tables (weeklyPlan/progression) already manage their own internal
      // page breaks; every other section starts on a fresh page so nothing
      // in this "publication-ready" document reads as cramped.
      const breakBefore = i > 0 ? "page-break-before:always;" : "";
      return `
      <section style="${breakBefore}margin-bottom:26px;">
        <div style="display:flex;align-items:baseline;gap:10px;border-bottom:2px solid ${INK};padding-bottom:8px;margin-bottom:14px;">
          <span style="font-size:12px;font-weight:700;letter-spacing:0.06em;color:${ACCENT};text-transform:uppercase;">
            Section ${i + 1}
          </span>
          <h2 style="margin:0;font-size:18px;color:${INK};">${SECTION_LABELS[s.key]}</h2>
        </div>
        ${bodyHtml(s)}
      </section>`;
    })
    .join("");

  return `
  <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; color:${INK}; padding: 40px 44px; background:#FFFFFF; line-height:1.45;">
      <div style="text-align:center;padding-bottom:20px;">
        <p style="letter-spacing:0.14em; text-transform:uppercase; color:${ACCENT}; font-size:11px; font-weight:700; margin:0 0 10px;">
          Sathi · Diabetes Prevention Program
        </p>
        <h1 style="color:${INK}; margin:0; font-size:28px; line-height:1.25;">${title}</h1>
        <p style="color:${SUBTLE}; font-size:13px; margin:8px 0 0; font-style:italic;">${tagline}</p>
      </div>

      ${panel(`
        <table style="width:100%;font-size:12px;border-collapse:collapse;">
          <tr>
            <td style="padding:2px 0;color:${SUBTLE};width:110px;">Patient</td>
            <td style="padding:2px 0;"><strong>${patient.name}</strong> &middot; Age ${patient.age} &middot; ${patient.gender}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;color:${SUBTLE};">Region</td>
            <td style="padding:2px 0;">${patient.region}, ${patient.state} &middot; ${patient.localLanguage}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;color:${SUBTLE};">Patient ID</td>
            <td style="padding:2px 0;font-family:monospace;">${patient.patientId}</td>
          </tr>
          <tr>
            <td style="padding:2px 0;color:${SUBTLE};">Plan date</td>
            <td style="padding:2px 0;">${generatedOn}</td>
          </tr>
        </table>
      `)}

      ${sectionHtml}

      <p style="font-size:11px;color:${SUBTLE};margin-top:8px;border-top:1px solid ${RULE};padding-top:14px;">
        This plan was generated with AI assistance and reviewed/approved by your Community
        Health Worker. Always confirm numeric health targets with a doctor.
      </p>
    </body>
  </html>`;
}

export function PdfExportButton({
  patient,
  report,
}: {
  patient: PatientProfileDTO;
  report: InterventionReportDTO;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const html = buildHtml(patient, report);
      // On web this opens the browser's print dialog (the patient can choose
      // "Save as PDF"). On iOS/Android it writes a PDF file that we then
      // share/save with the system share sheet.
      const { uri } = await Print.printToFileAsync({ html });
      if (uri && (await isAvailableAsync())) {
        await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="secondary"
      icon={<FileDown size={16} color="#1C1C1E" />}
      onPress={handleExport}
      loading={loading}
    >
      Export as PDF
    </Button>
  );
}
