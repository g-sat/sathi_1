import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PatientProfileSchema = new Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    chwId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Core identity
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    region: {
      type: String,
      enum: ['India', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'],
      required: true,
    },
    state: { type: String, required: true },
    localLanguage: { type: String, required: true },

    // Body / clinical baseline
    heightFeet: Number,
    heightInches: Number,
    weightLbs: Number,
    waistCircumferenceCm: Number,
    familyHistoryDiabetes: { type: Boolean, default: false },
    fastingGlucose: Number,
    hba1c: Number,
    physicalActivityLevel: {
      type: String,
      enum: ['Sedentary', 'Light', 'Moderate', 'Active'],
      default: 'Sedentary',
    },
    dietaryPattern: {
      type: String,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'],
      default: 'Vegetarian',
    },

    // Immigration / cultural context
    raceEthnicity: String,
    immigrationStatus: {
      type: String,
      enum: ['Immigrant', 'First Generation', 'Second Generation', 'Born in Home Country'],
    },
    yearsInCountry: Number,
    culturalFoodTraditions: String,
    languageLiteracyNotes: String,
    occupationDailyRoutine: String,
    familyHomeResponsibilities: String,
    budgetConcerns: String,
    primaryGoals: String,
    mealPrepTimeAvailable: String,
    sleepPattern: String,
    stressLevel: String,

    // Comorbidities / clinical context (qualitative)
    comorbidities: String,
    relevantSymptoms: String,
    medications: String,
    exerciseRestrictions: String,
    dietaryRestrictionsAllergies: String,

    // Current dietary intake (recall)
    breakfastRecall: String,
    lunchRecall: String,
    dinnerRecall: String,
    snacksRecall: String,
    beveragesRecall: String,
    eatingOutFrequency: String,
    nightEmotionalEatingPattern: String,
    proteinIntakePattern: String,
    fruitVegIntake: String,
    processedFoodsSweetsIntake: String,

    // Function / physical activity baseline
    currentExerciseRoutine: String,
    averageDailySteps: Number,
    functionalLimitations: String,
    equipmentAccess: String,
    safeWalkingArea: Boolean,
    enjoyedMovementForms: String,
    dislikedMovementForms: String,

    notes: String,
  },
  { timestamps: true }
);

export type PatientProfileDoc = InferSchemaType<typeof PatientProfileSchema>;

export const PatientProfile: Model<PatientProfileDoc> =
  (mongoose.models.PatientProfile as Model<PatientProfileDoc>) ||
  mongoose.model<PatientProfileDoc>('PatientProfile', PatientProfileSchema);
