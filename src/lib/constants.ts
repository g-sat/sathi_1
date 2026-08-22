import type { ImmigrationStatus, LocalLanguage, Region, ReportSectionKey } from '@/types';

export const REGIONS: Region[] = ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'];

export const STATES_BY_REGION: Record<Region, string[]> = {
  India: [
    'Gujarat',
    'Punjab',
    'Tamil Nadu',
    'Maharashtra',
    'Kerala',
    'Karnataka',
    'West Bengal',
    'Uttar Pradesh',
    'Rajasthan',
    'Telangana',
  ],
  Pakistan: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan'],
  Bangladesh: ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet'],
  'Sri Lanka': ['Western', 'Central', 'Southern', 'Northern', 'Eastern'],
  Nepal: ['Bagmati', 'Gandaki', 'Koshi', 'Lumbini', 'Madhesh'],
};

export const LOCAL_LANGUAGES: LocalLanguage[] = [
  'Hindi',
  'Tamil',
  'Telugu',
  'Gujarati',
  'Punjabi',
  'Urdu',
  'Bengali',
  'Marathi',
  'Sinhala',
  'Nepali',
  'English',
];

export const ACTIVITY_LEVELS = ['Sedentary', 'Light', 'Moderate', 'Active'] as const;

export const DIETARY_PATTERNS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'] as const;

export const IMMIGRATION_STATUSES: ImmigrationStatus[] = [
  'Immigrant',
  'First Generation',
  'Second Generation',
  'Born in Home Country',
];

export const SECTION_LABELS: Record<ReportSectionKey, string> = {
  summary: 'Patient-Tailored Summary',
  nutrition: 'Nutrition Strategy',
  grocery: 'Tailored Grocery List',
  recipes: 'Tailored Sample Recipes',
  exercise: 'Exercise & Movement Strategy',
  behavioral: 'Behavioral Strategy',
  weeklyPlan: '14-Day Weekly Plan',
  progression: 'Progression Summary',
  safety: 'Safety & Clinical Flags',
};

export const SECTION_DESCRIPTIONS: Record<ReportSectionKey, string> = {
  summary: "Strengths, barriers/risks, and why this plan is realistic for this patient specifically.",
  nutrition: 'Breakfast/lunch/dinner/snack strategy built on the foods they already eat.',
  grocery: 'A category-by-category shopping list tailored to culture, budget, and comorbidities.',
  recipes: 'Simple, culturally-familiar recipes using items from the grocery list.',
  exercise: 'Cardio, resistance, and mobility progression respecting any physical limitations.',
  behavioral: 'A small number of habit goals, self-monitoring, and how to handle missed days.',
  weeklyPlan: 'The full day-by-day plan across Week 1 and Week 2.',
  progression: 'How the plan should evolve phase-by-phase, with expected milestones.',
  safety: 'Clinical flags and safety notes based on comorbidities and functional limits.',
};

export const SECTION_ORDER: ReportSectionKey[] = [
  'summary',
  'nutrition',
  'grocery',
  'recipes',
  'exercise',
  'behavioral',
  'weeklyPlan',
  'progression',
  'safety',
];
