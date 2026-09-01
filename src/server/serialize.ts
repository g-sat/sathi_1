import type {
  DailyLogDTO,
  InterventionReportDTO,
  PatientProfileDTO,
  UserDTO,
} from '@/types';

// Mongoose documents (esp. after .lean()) come through as `any`-ish shapes;
// these helpers centralize the conversion to our plain client-safe DTOs.

function idOf(v: unknown): string {
  return String(v);
}

export function serializeUser(doc: any): UserDTO {
  return {
    id: idOf(doc._id),
    role: doc.role,
    name: doc.name,
    email: doc.email,
    emailVerified: !!doc.emailVerified,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function serializePatient(doc: any): PatientProfileDTO {
  return {
    id: idOf(doc._id),
    patientId: doc.patientId,
    userId: doc.userId ? idOf(doc.userId) : undefined,
    chwId: idOf(doc.chwId),

    name: doc.name,
    age: doc.age,
    gender: doc.gender,
    region: doc.region,
    state: doc.state,
    localLanguage: doc.localLanguage,

    heightFeet: doc.heightFeet,
    heightInches: doc.heightInches,
    weightLbs: doc.weightLbs,
    waistCircumferenceCm: doc.waistCircumferenceCm,
    familyHistoryDiabetes: !!doc.familyHistoryDiabetes,
    fastingGlucose: doc.fastingGlucose,
    hba1c: doc.hba1c,
    physicalActivityLevel: doc.physicalActivityLevel,
    dietaryPattern: doc.dietaryPattern,

    raceEthnicity: doc.raceEthnicity,
    immigrationStatus: doc.immigrationStatus,
    yearsInCountry: doc.yearsInCountry,
    culturalFoodTraditions: doc.culturalFoodTraditions,
    languageLiteracyNotes: doc.languageLiteracyNotes,
    occupationDailyRoutine: doc.occupationDailyRoutine,
    familyHomeResponsibilities: doc.familyHomeResponsibilities,
    budgetConcerns: doc.budgetConcerns,
    primaryGoals: doc.primaryGoals,
    mealPrepTimeAvailable: doc.mealPrepTimeAvailable,
    sleepPattern: doc.sleepPattern,
    stressLevel: doc.stressLevel,

    comorbidities: doc.comorbidities,
    relevantSymptoms: doc.relevantSymptoms,
    medications: doc.medications,
    exerciseRestrictions: doc.exerciseRestrictions,
    dietaryRestrictionsAllergies: doc.dietaryRestrictionsAllergies,

    breakfastRecall: doc.breakfastRecall,
    lunchRecall: doc.lunchRecall,
    dinnerRecall: doc.dinnerRecall,
    snacksRecall: doc.snacksRecall,
    beveragesRecall: doc.beveragesRecall,
    eatingOutFrequency: doc.eatingOutFrequency,
    nightEmotionalEatingPattern: doc.nightEmotionalEatingPattern,
    proteinIntakePattern: doc.proteinIntakePattern,
    fruitVegIntake: doc.fruitVegIntake,
    processedFoodsSweetsIntake: doc.processedFoodsSweetsIntake,

    currentExerciseRoutine: doc.currentExerciseRoutine,
    averageDailySteps: doc.averageDailySteps,
    functionalLimitations: doc.functionalLimitations,
    equipmentAccess: doc.equipmentAccess,
    safeWalkingArea: doc.safeWalkingArea,
    enjoyedMovementForms: doc.enjoyedMovementForms,
    dislikedMovementForms: doc.dislikedMovementForms,

    notes: doc.notes,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function serializeReport(doc: any): InterventionReportDTO {
  return {
    id: idOf(doc._id),
    patientId: idOf(doc.patientId),
    chwId: idOf(doc.chwId),
    status: doc.status,
    sections: (doc.sections || []).map((s: any) => ({
      key: s.key,
      data: s.data,
      version: s.version,
      lastPrompt: s.lastPrompt,
    })),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : undefined,
  };
}

export function serializeLog(doc: any): DailyLogDTO {
  return {
    id: idOf(doc._id),
    patientId: idOf(doc.patientId),
    date: doc.date,
    glucoseLevel: doc.glucoseLevel,
    glucoseTiming: doc.glucoseTiming,
    meals: (doc.meals || []).map((m: any) => ({ type: m.type, description: m.description })),
    activityMinutes: doc.activityMinutes,
    activityType: doc.activityType,
    moodNote: doc.moodNote,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

