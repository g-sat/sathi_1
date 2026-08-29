import { useState } from 'react';
import * as Print from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { FileDown } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { SECTION_LABELS } from '@/lib/constants';
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
} from '@/types';

function ul(items: string[]) {
  return `<ul style="padding-left:18px;">${items.map((i) => `<li style="margin-bottom:6px;">${i}</li>`).join('')}</ul>`;
}

function field(label: string, value?: string) {
  if (!value) return '';
  return `<p style="margin:6px 0;"><strong>${label}:</strong> ${value}</p>`;
}

function bodyHtml(section: ReportSection): string {
  switch (section.key) {
    case 'summary': {
      const d = section.data as SummarySectionData;
      return `
        ${field('Why this plan is realistic', d.whyThisPlanIsRealistic)}
        <p style="margin:10px 0 4px;"><strong>Strengths</strong></p>${ul(d.strengths || [])}
        <p style="margin:10px 0 4px;"><strong>Barriers &amp; risks</strong></p>${ul(d.barriersAndRisks || [])}
      `;
    }
    case 'nutrition': {
      const d = section.data as NutritionSectionData;
      return `
        ${field('Breakfast', d.breakfastStrategy)}
        ${field('Lunch', d.lunchStrategy)}
        ${field('Dinner', d.dinnerStrategy)}
        ${field('Snacks & beverages', d.snacksAndBeveragesStrategy)}
        ${field('Easiest version for busy days', d.easiestVersionForBusyDays)}
        ${
          d.mealExamples?.length
            ? `<p style="margin:10px 0 4px;"><strong>Meal examples</strong></p>${ul(
                d.mealExamples.map((m) => `<strong>${m.title}:</strong> ${m.description}`)
              )}`
            : ''
        }
      `;
    }
    case 'grocery': {
      const d = section.data as GrocerySectionData;
      const cats: { key: keyof GrocerySectionData; label: string }[] = [
        { key: 'proteins', label: 'Proteins' },
        { key: 'highFiberCarbohydrates', label: 'High-fiber carbs / starches' },
        { key: 'vegetables', label: 'Vegetables' },
        { key: 'fruit', label: 'Fruit' },
        { key: 'healthyFats', label: 'Healthy fats' },
        { key: 'flavorBuilders', label: 'Flavor builders / seasonings' },
        { key: 'convenienceFoods', label: 'Convenience foods' },
      ];
      return cats
        .map(({ key, label }) => {
          const items = d[key] || [];
          if (!items.length) return '';
          return `<p style="margin:10px 0 4px;"><strong>${label}</strong></p>${ul(
            items.map((it) => `<strong>${it.item}:</strong> ${it.why}`)
          )}`;
        })
        .join('');
    }
    case 'recipes': {
      const d = section.data as RecipesSectionData;
      return (d.recipes || [])
        .map(
          (r) => `
        <div style="margin-bottom:14px;padding:10px;border:1px solid #E5E5EA;border-radius:8px;">
          <p style="margin:0 0 4px;"><strong>${r.name}</strong> <em>(${r.mealType})</em></p>
          <p style="margin:0 0 6px;font-style:italic;">${r.whyItFitsThisPatient}</p>
          ${r.ingredients?.length ? `<p style="margin:6px 0 2px;"><strong>Ingredients:</strong> ${r.ingredients.join(', ')}</p>` : ''}
          ${r.steps?.length ? `<p style="margin:6px 0 2px;"><strong>Steps:</strong></p>${ul(r.steps)}` : ''}
          ${r.substitutions ? `<p style="margin:6px 0 0;font-style:italic;">Substitutions: ${r.substitutions}</p>` : ''}
        </div>`
        )
        .join('');
    }
    case 'exercise': {
      const d = section.data as ExerciseSectionData;
      return `
        ${field('Cardio progression', d.cardioProgression)}
        ${field('Resistance training', d.resistanceTraining)}
        ${field('Mobility & balance', d.mobilityAndBalance)}
        ${field('Recovery days', d.recoveryDays)}
        ${field('Minimum goal', d.minimumGoal)}
        ${field('Ideal goal', d.idealGoal)}
        ${field('Home-based alternatives', d.homeBasedAlternatives)}
        ${field('Lower-impact substitutions', d.lowerImpactSubstitutions)}
      `;
    }
    case 'behavioral': {
      const d = section.data as BehavioralSectionData;
      return `
        <p style="margin:10px 0 4px;"><strong>Habit goals</strong></p>${ul(d.habitGoals || [])}
        ${field('Self-monitoring', d.selfMonitoringSuggestions)}
        ${field('Handling missed days', d.handlingMissedDays)}
        ${field('Stress & disruption strategy', d.stressAndDisruptionStrategy)}
      `;
    }
    case 'weeklyPlan': {
      const d = section.data as WeeklyPlanSectionData;
      return (d.weeks || [])
        .map(
          (week) => `
        <h3 style="color:#30B0C7;margin-top:16px;">Week ${week.weekNumber}</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <tr style="background:#E5E5EA;">
            ${['Day', 'Nutrition Focus', 'Meals', 'Physical Activity', 'Strength/Mobility', 'Behavioral Task', 'Notes']
              .map((h) => `<th style="border:1px solid #D1D1D6;padding:6px;text-align:left;">${h}</th>`)
              .join('')}
          </tr>
          ${week.days
            .map(
              (day) => `
            <tr>
              <td style="border:1px solid #D1D1D6;padding:6px;"><strong>${day.day}</strong></td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.nutritionFocus}</td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.mealGuidance}</td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.physicalActivityGoal}</td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.strengthOrMobilityGoal}</td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.behavioralTask}</td>
              <td style="border:1px solid #D1D1D6;padding:6px;">${day.notes}</td>
            </tr>`
            )
            .join('')}
        </table>`
        )
        .join('');
    }
    case 'progression': {
      const d = section.data as ProgressionSectionData;
      return (d.phases || [])
        .map(
          (p) => `
        <div style="margin-bottom:12px;">
          <p style="margin:0 0 4px;"><strong>${p.phase}</strong></p>
          ${field('Nutrition goals', p.nutritionGoals)}
          ${field('Exercise goals', p.exerciseGoals)}
          ${field('Expected milestones', p.expectedMilestones)}
          ${field('Common barriers', p.commonBarriers)}
          ${field('Troubleshooting', p.troubleshootingApproach)}
        </div>`
        )
        .join('');
    }
    case 'safety': {
      const d = section.data as SafetySectionData;
      return `${ul(d.flags || [])}${field('Clinician clearance notes', d.clinicianClearanceNotes)}`;
    }
    default:
      return '';
  }
}

function buildHtml(patient: PatientProfileDTO, report: InterventionReportDTO) {
  const sectionHtml = report.sections
    .map(
      (s) => `
      <section style="margin-bottom:28px;">
        <h2 style="color:#30B0C7;border-bottom:1px solid #E5E5EA;padding-bottom:6px;">
          ${SECTION_LABELS[s.key]}
        </h2>
        ${bodyHtml(s)}
      </section>`
    )
    .join('');

  return `
  <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 32px; background:#F2F2F7;">
      <div style="border-radius:20px; padding:28px; background:white; box-shadow:0 2px 24px rgba(0,0,0,0.08);">
        <p style="letter-spacing:2px; text-transform:uppercase; color:#0A84FF; font-size:12px; font-weight:700;">
          Sathi · Diabetes Prevention Program
        </p>
        <h1 style="color:#1C1C1E; margin-top:4px;">${patient.name}'s Personalized Plan</h1>
        <p style="color:#48484A;">
          ${patient.region} · ${patient.state} · Language: ${patient.localLanguage}<br/>
          Patient ID: ${patient.patientId}
        </p>
        <hr style="border:none;border-top:1px solid #E5E5EA;margin:20px 0;" />
        ${sectionHtml}
        <p style="font-size:11px;color:#8E8E93;margin-top:24px;">
          This plan was generated with AI assistance and reviewed/approved by your Community
          Health Worker. Always confirm numeric health targets with a doctor.
        </p>
      </div>
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
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" icon={<FileDown size={16} color="#1C1C1E" />} onPress={handleExport} loading={loading}>
      Export as PDF
    </Button>
  );
}
