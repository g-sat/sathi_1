import { connectDB } from '@/server/db';
import { PatientProfile } from '@/server/models/PatientProfile';
import { InterventionReport } from '@/server/models/InterventionReport';
import { serializePatient } from '@/server/serialize';
import { jsonError, safeJson } from '@/server/http';
import { generatePatientId } from '@/server/ids';
import { withSession } from '@/server/auth';

// GET /api/patients — list the signed-in CHW's patients, with their latest
// report status, for the CHW dashboard.
export async function GET(request: Request) {
  await connectDB();
  const { session, error } = withSession(request, 'chw');
  if (error) return error;
  const chwId = session.sub;

  const patients = await PatientProfile.find({ chwId }).sort({ createdAt: -1 }).lean();
  const patientIds = patients.map((p) => p._id);
  const reports = await InterventionReport.find({ patientId: { $in: patientIds } })
    .sort({ updatedAt: -1 })
    .lean();

  const latestReportByPatient = new Map<string, (typeof reports)[number]>();
  for (const report of reports) {
    const key = String(report.patientId);
    if (!latestReportByPatient.has(key)) latestReportByPatient.set(key, report);
  }

  const result = patients.map((p) => ({
    ...serializePatient(p),
    reportStatus: latestReportByPatient.get(String(p._id))?.status ?? 'none',
  }));

  return Response.json({ patients: result });
}

// POST /api/patients — signed-in CHW onboards a new patient.
export async function POST(request: Request) {
  await connectDB();
  const { session, error } = withSession(request, 'chw');
  if (error) return error;
  const body = await safeJson(request);

  const required = ['name', 'age', 'gender', 'region', 'state', 'localLanguage'];
  for (const field of required) {
    if (!body[field]) return jsonError(400, `${field} is required.`);
  }

  let patientId = generatePatientId();
  // Extremely unlikely collision, but guard anyway.
  // eslint-disable-next-line no-await-in-loop
  while (await PatientProfile.exists({ patientId })) {
    patientId = generatePatientId();
  }

  const num = (v: unknown) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };
  const str = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : String(v));
  const bool = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : !!v);

  const patient = await PatientProfile.create({
    patientId,
    chwId: session.sub,

    name: String(body.name),
    age: Number(body.age),
    gender: body.gender as 'Male' | 'Female' | 'Other',
    region: body.region as 'India' | 'Pakistan' | 'Bangladesh' | 'Sri Lanka' | 'Nepal',
    state: String(body.state),
    localLanguage: String(body.localLanguage),

    heightFeet: num(body.heightFeet),
    heightInches: num(body.heightInches),
    weightLbs: num(body.weightLbs),
    waistCircumferenceCm: num(body.waistCircumferenceCm),
    familyHistoryDiabetes: !!body.familyHistoryDiabetes,
    fastingGlucose: num(body.fastingGlucose),
    hba1c: num(body.hba1c),
    physicalActivityLevel:
      (body.physicalActivityLevel as 'Sedentary' | 'Light' | 'Moderate' | 'Active') || 'Sedentary',
    dietaryPattern:
      (body.dietaryPattern as 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Vegan') ||
      'Vegetarian',

    raceEthnicity: str(body.raceEthnicity),
    immigrationStatus: body.immigrationStatus as
      | 'Immigrant'
      | 'First Generation'
      | 'Second Generation'
      | 'Born in Home Country'
      | undefined,
    yearsInCountry: num(body.yearsInCountry),
    culturalFoodTraditions: str(body.culturalFoodTraditions),
    languageLiteracyNotes: str(body.languageLiteracyNotes),
    occupationDailyRoutine: str(body.occupationDailyRoutine),
    familyHomeResponsibilities: str(body.familyHomeResponsibilities),
    budgetConcerns: str(body.budgetConcerns),
    primaryGoals: str(body.primaryGoals),
    mealPrepTimeAvailable: str(body.mealPrepTimeAvailable),
    sleepPattern: str(body.sleepPattern),
    stressLevel: str(body.stressLevel),

    comorbidities: str(body.comorbidities),
    relevantSymptoms: str(body.relevantSymptoms),
    medications: str(body.medications),
    exerciseRestrictions: str(body.exerciseRestrictions),
    dietaryRestrictionsAllergies: str(body.dietaryRestrictionsAllergies),

    breakfastRecall: str(body.breakfastRecall),
    lunchRecall: str(body.lunchRecall),
    dinnerRecall: str(body.dinnerRecall),
    snacksRecall: str(body.snacksRecall),
    beveragesRecall: str(body.beveragesRecall),
    eatingOutFrequency: str(body.eatingOutFrequency),
    nightEmotionalEatingPattern: str(body.nightEmotionalEatingPattern),
    proteinIntakePattern: str(body.proteinIntakePattern),
    fruitVegIntake: str(body.fruitVegIntake),
    processedFoodsSweetsIntake: str(body.processedFoodsSweetsIntake),

    currentExerciseRoutine: str(body.currentExerciseRoutine),
    averageDailySteps: num(body.averageDailySteps),
    functionalLimitations: str(body.functionalLimitations),
    equipmentAccess: str(body.equipmentAccess),
    safeWalkingArea: bool(body.safeWalkingArea),
    enjoyedMovementForms: str(body.enjoyedMovementForms),
    dislikedMovementForms: str(body.dislikedMovementForms),

    notes: str(body.notes),
  });

  return Response.json({ patient: serializePatient(patient) }, { status: 201 });
}
