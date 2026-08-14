import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Sparkles } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { AIThinking } from '@/components/ui/AIThinking';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Reveal } from '@/components/ui/Reveal';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import {
  ACTIVITY_LEVELS,
  DIETARY_PATTERNS,
  IMMIGRATION_STATUSES,
  LOCAL_LANGUAGES,
  REGIONS,
  STATES_BY_REGION,
} from '@/lib/constants';
import type { LocalLanguage, Region } from '@/types';

type FormState = Record<string, string | boolean | undefined>;

const STEPS = ['Identity & Region', 'Clinical Baseline', 'Life & Culture', 'Current Diet', 'Activity & Movement'];

function Field({
  label,
  formKey,
  form,
  set,
  placeholder,
  keyboardType,
  multiline,
  hint,
}: {
  label: string;
  formKey: string;
  form: FormState;
  set: (key: string, value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <Input
      label={label}
      value={(form[formKey] as string) || ''}
      onChangeText={(v) => set(formKey, v)}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      hint={hint}
    />
  );
}

export default function OnboardPatient() {
  const { session } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({});
  const [region, setRegion] = useState<Region>();
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>();
  const [localLanguage, setLocalLanguage] = useState<LocalLanguage>();
  const [activityLevel, setActivityLevel] = useState<(typeof ACTIVITY_LEVELS)[number]>();
  const [dietaryPattern, setDietaryPattern] = useState<(typeof DIETARY_PATTERNS)[number]>();
  const [immigrationStatus, setImmigrationStatus] = useState<(typeof IMMIGRATION_STATUSES)[number]>();
  const [familyHistory, setFamilyHistory] = useState<'Yes' | 'No'>();
  const [safeWalkingArea, setSafeWalkingArea] = useState<'Yes' | 'No'>();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stateOptions = useMemo(() => (region ? STATES_BY_REGION[region] : []), [region]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const step0Valid = !!(form.name && form.age && gender && region && form.state && localLanguage);

  function goNext() {
    if (step === 0 && !step0Valid) {
      setError('Please fill in all required fields (marked with *) before continuing.');
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!session || session.role !== 'chw') return;
    if (!step0Valid) {
      setError('Please fill in the required fields (marked with *).');
      setStep(0);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { patient } = await api.createPatient({
        name: (form.name as string)?.trim(),
        age: Number(form.age),
        gender,
        region,
        state: form.state,
        localLanguage,

        heightFeet: form.heightFeet,
        heightInches: form.heightInches,
        weightLbs: form.weightLbs,
        waistCircumferenceCm: form.waistCircumferenceCm,
        familyHistoryDiabetes: familyHistory === 'Yes',
        fastingGlucose: form.fastingGlucose,
        hba1c: form.hba1c,
        physicalActivityLevel: activityLevel || 'Sedentary',
        dietaryPattern: dietaryPattern || 'Vegetarian',

        raceEthnicity: form.raceEthnicity,
        immigrationStatus,
        yearsInCountry: form.yearsInCountry,
        culturalFoodTraditions: form.culturalFoodTraditions,
        languageLiteracyNotes: form.languageLiteracyNotes,
        occupationDailyRoutine: form.occupationDailyRoutine,
        familyHomeResponsibilities: form.familyHomeResponsibilities,
        budgetConcerns: form.budgetConcerns,
        primaryGoals: form.primaryGoals,
        mealPrepTimeAvailable: form.mealPrepTimeAvailable,
        sleepPattern: form.sleepPattern,
        stressLevel: form.stressLevel,

        comorbidities: form.comorbidities,
        relevantSymptoms: form.relevantSymptoms,
        medications: form.medications,
        exerciseRestrictions: form.exerciseRestrictions,
        dietaryRestrictionsAllergies: form.dietaryRestrictionsAllergies,

        breakfastRecall: form.breakfastRecall,
        lunchRecall: form.lunchRecall,
        dinnerRecall: form.dinnerRecall,
        snacksRecall: form.snacksRecall,
        beveragesRecall: form.beveragesRecall,
        eatingOutFrequency: form.eatingOutFrequency,
        nightEmotionalEatingPattern: form.nightEmotionalEatingPattern,
        proteinIntakePattern: form.proteinIntakePattern,
        fruitVegIntake: form.fruitVegIntake,
        processedFoodsSweetsIntake: form.processedFoodsSweetsIntake,

        currentExerciseRoutine: form.currentExerciseRoutine,
        averageDailySteps: form.averageDailySteps,
        functionalLimitations: form.functionalLimitations,
        equipmentAccess: form.equipmentAccess,
        safeWalkingArea: safeWalkingArea === 'Yes',
        enjoyedMovementForms: form.enjoyedMovementForms,
        dislikedMovementForms: form.dislikedMovementForms,

        notes: form.notes,
      });

      // The patient record now exists — from here on, always land on the
      // review screen instead of retrying this form, otherwise a retry
      // (e.g. after a transient Gemini overload below) would create a
      // duplicate patient. The review screen has its own "Generate AI plan"
      // button for exactly this case (no report yet).
      try {
        await api.generateReport(patient.id);
      } catch {
        // Swallow here — the review screen will show the empty state with a
        // retry button. We still navigate so the CHW isn't stuck re-filling
        // the intake form.
      }
      router.replace(`/chw/patient/${patient.id}/review`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Patient onboarding"
        title="Invite a new patient"
        subtitle="A full intake helps Gemini write a plan that actually fits their life"
        showBack
      />

      <StepIndicator steps={STEPS} current={step} />

      {step === 0 ? (
        <Reveal index={0}>
          <Card className="gap-4">
            <Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Basic details
            </Text>
            <Field label="Full name *" formKey="name" form={form} set={set} placeholder="Patient's name" />
            <Field label="Age *" formKey="age" form={form} set={set} keyboardType="numeric" placeholder="e.g. 45" />
            <ChipSelect label="Gender *" options={['Male', 'Female', 'Other'] as const} value={gender} onChange={setGender} />

            <Text className="mt-2 font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Region &amp; language
            </Text>
            <ChipSelect
              label="Region of South Asian ancestry *"
              options={REGIONS}
              value={region}
              onChange={(r) => {
                setRegion(r);
                set('state', '');
              }}
            />
            {region ? (
              <ChipSelect
                label="State / Province *"
                options={stateOptions}
                value={form.state as string | undefined}
                onChange={(v) => set('state', v)}
              />
            ) : null}
            <ChipSelect
              label="Local language for nudges *"
              options={LOCAL_LANGUAGES}
              value={localLanguage}
              onChange={setLocalLanguage}
            />
          </Card>
        </Reveal>
      ) : null}

      {step === 1 ? (
        <Reveal index={0}>
          <Card className="gap-4">
            <Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Body &amp; baseline
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Height (feet)" formKey="heightFeet" form={form} set={set} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Field label="Height (inches)" formKey="heightInches" form={form} set={set} keyboardType="numeric" />
              </View>
            </View>
            <Field label="Weight (lb)" formKey="weightLbs" form={form} set={set} keyboardType="numeric" />
            <Field label="Waist circumference (cm)" formKey="waistCircumferenceCm" form={form} set={set} keyboardType="numeric" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field label="Fasting glucose (mg/dL)" formKey="fastingGlucose" form={form} set={set} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Field label="HbA1c (%)" formKey="hba1c" form={form} set={set} keyboardType="numeric" />
              </View>
            </View>
            <ChipSelect label="Family history of diabetes" options={['Yes', 'No'] as const} value={familyHistory} onChange={setFamilyHistory} />
            <ChipSelect label="Current activity level" options={ACTIVITY_LEVELS} value={activityLevel} onChange={setActivityLevel} />
            <ChipSelect label="Dietary pattern" options={DIETARY_PATTERNS} value={dietaryPattern} onChange={setDietaryPattern} />

            <Text className="mt-2 font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Comorbidities &amp; clinical context
            </Text>
            <Field label="Comorbidities" formKey="comorbidities" form={form} set={set} placeholder="e.g. Prediabetes, Type 2 diabetes" />
            <Field label="Relevant symptoms" formKey="relevantSymptoms" form={form} set={set} multiline />
            <Field label="Medications" formKey="medications" form={form} set={set} placeholder="e.g. Metformin" />
            <Field label="Exercise restrictions / precautions" formKey="exerciseRestrictions" form={form} set={set} multiline />
            <Field label="Dietary restrictions / allergies / intolerances" formKey="dietaryRestrictionsAllergies" form={form} set={set} multiline />
          </Card>
        </Reveal>
      ) : null}

      {step === 2 ? (
        <Reveal index={0}>
          <Card className="gap-4">
            <Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Life &amp; cultural context
            </Text>
            <Field label="Race / ethnicity" formKey="raceEthnicity" form={form} set={set} placeholder="e.g. Indian" />
            <ChipSelect label="Immigration status" options={IMMIGRATION_STATUSES} value={immigrationStatus} onChange={setImmigrationStatus} />
            <Field label="Years in current country" formKey="yearsInCountry" form={form} set={set} keyboardType="numeric" />
            <Field
              label="Cultural background / food traditions"
              formKey="culturalFoodTraditions"
              form={form}
              set={set}
              multiline
              placeholder="e.g. South Indian foods, no red meat"
            />
            <Field label="Language / literacy notes" formKey="languageLiteracyNotes" form={form} set={set} />
            <Field label="Occupation / daily routine" formKey="occupationDailyRoutine" form={form} set={set} multiline />
            <Field label="Family / home responsibilities" formKey="familyHomeResponsibilities" form={form} set={set} multiline />
            <Field label="Budget / food insecurity concerns" formKey="budgetConcerns" form={form} set={set} />
            <Field label="Primary goals" formKey="primaryGoals" form={form} set={set} multiline placeholder="e.g. Improve glucose, maintain healthy lifestyle" />
            <Field label="Time available for meal prep" formKey="mealPrepTimeAvailable" form={form} set={set} placeholder="e.g. 3-4 hours" />
            <Field label="Sleep pattern" formKey="sleepPattern" form={form} set={set} multiline />
            <Field label="Stress level / major stressors" formKey="stressLevel" form={form} set={set} multiline />
          </Card>
        </Reveal>
      ) : null}

      {step === 3 ? (
        <Reveal index={0}>
          <Card className="gap-4">
            <Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Current dietary intake
            </Text>
            <Field label="Breakfast recall" formKey="breakfastRecall" form={form} set={set} multiline />
            <Field label="Lunch recall" formKey="lunchRecall" form={form} set={set} multiline />
            <Field label="Dinner recall" formKey="dinnerRecall" form={form} set={set} multiline />
            <Field label="Snacks" formKey="snacksRecall" form={form} set={set} multiline />
            <Field label="Beverages" formKey="beveragesRecall" form={form} set={set} multiline />
            <Field label="Eating out frequency" formKey="eatingOutFrequency" form={form} set={set} />
            <Field label="Night / emotional eating, grazing, large portions" formKey="nightEmotionalEatingPattern" form={form} set={set} multiline />
            <Field label="Protein intake pattern" formKey="proteinIntakePattern" form={form} set={set} multiline />
            <Field label="Fruit / vegetable intake" formKey="fruitVegIntake" form={form} set={set} multiline />
            <Field label="Ultra-processed foods / sweets / sugary drinks" formKey="processedFoodsSweetsIntake" form={form} set={set} multiline />
          </Card>
        </Reveal>
      ) : null}

      {step === 4 ? (
        <Reveal index={0}>
          <Card className="gap-4">
            <Text className="font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
              Function &amp; physical activity baseline
            </Text>
            <Field label="Current exercise routine" formKey="currentExerciseRoutine" form={form} set={set} multiline />
            <Field label="Average daily steps (if known)" formKey="averageDailySteps" form={form} set={set} keyboardType="numeric" />
            <Field label="Functional limitations" formKey="functionalLimitations" form={form} set={set} multiline placeholder="e.g. Joint pain in knees" />
            <Field label="Access to equipment" formKey="equipmentAccess" form={form} set={set} multiline placeholder="e.g. Elliptical, gym membership" />
            <ChipSelect label="Access to a safe walking area" options={['Yes', 'No'] as const} value={safeWalkingArea} onChange={setSafeWalkingArea} />
            <Field label="Enjoyed forms of movement" formKey="enjoyedMovementForms" form={form} set={set} />
            <Field label="Disliked forms of movement" formKey="dislikedMovementForms" form={form} set={set} />
            <Field
              label="CHW notes (optional)"
              formKey="notes"
              form={form}
              set={set}
              multiline
              placeholder="Anything else Gemini should know"
            />
          </Card>
        </Reveal>
      ) : null}

      <ErrorBanner message={error} />

      {submitting ? (
        <AIThinking label="Creating patient profile and generating their culturally-tailored plan…" />
      ) : (
        <View className="flex-row gap-3">
          {step > 0 ? (
            <View className="flex-1">
              <Button variant="ghost" onPress={goBack} fullWidth>
                Back
              </Button>
            </View>
          ) : null}
          <View className="flex-1">
            {isLastStep ? (
              <Button onPress={handleSubmit} icon={<Sparkles size={16} color="#FFFFFF" />} fullWidth>
                Save &amp; generate AI plan
              </Button>
            ) : (
              <Button onPress={goNext} icon={<ArrowRight size={16} color="#FFFFFF" />} fullWidth>
                Continue
              </Button>
            )}
          </View>
        </View>
      )}
    </ScreenScaffold>
  );
}
