import { AIThinking } from "@/components/ui/AIThinking";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SECTION_LABELS } from "@/lib/constants";
import type {
    BehavioralSectionData,
    ExerciseSectionData,
    GrocerySectionData,
    NutritionSectionData,
    ProgressionSectionData,
    RecipesSectionData,
    ReportSection,
    ReportSectionKey,
    SafetySectionData,
    SummarySectionData,
    WeeklyPlanSectionData,
} from "@/types";
import {
    Brain,
    CalendarDays,
    ChefHat,
    ClipboardList,
    Dumbbell,
    History,
    Salad,
    ShieldAlert,
    ShoppingCart,
    TrendingUp,
    Wand2,
} from "lucide-react-native";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const SECTION_ICON: Record<ReportSectionKey, any> = {
  summary: ClipboardList,
  nutrition: Salad,
  grocery: ShoppingCart,
  recipes: ChefHat,
  exercise: Dumbbell,
  behavioral: Brain,
  weeklyPlan: CalendarDays,
  progression: TrendingUp,
  safety: ShieldAlert,
};

const SECTION_TINT: Record<ReportSectionKey, string> = {
  summary: "bg-mustard-50",
  nutrition: "bg-terracotta-50",
  grocery: "bg-teal-50",
  recipes: "bg-terracotta-50",
  exercise: "bg-teal-50",
  behavioral: "bg-mustard-50",
  weeklyPlan: "bg-teal-50",
  progression: "bg-mustard-50",
  safety: "bg-danger-50",
};

const SECTION_ICON_COLOR: Record<ReportSectionKey, string> = {
  summary: "#FBBF24",
  nutrition: "#8B5CF6",
  grocery: "#67E8F9",
  recipes: "#8B5CF6",
  exercise: "#67E8F9",
  behavioral: "#FBBF24",
  weeklyPlan: "#67E8F9",
  progression: "#FBBF24",
  safety: "#FB7185",
};

function Bullets({ items }: { items: string[] }) {
  return (
    <View className="gap-2">
      {items.map((item, i) => (
        <View key={i} className="flex-row gap-2 rounded-xl bg-cream-100 p-3">
          <View className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terracotta-500" />
          <Text className="flex-1 font-body text-sm leading-5 text-ink-700/90">
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View className="gap-1">
      <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
        {label}
      </Text>
      <Text className="font-body text-sm leading-5 text-ink-800">{value}</Text>
    </View>
  );
}

function SummaryBody({ data }: { data: SummarySectionData }) {
  return (
    <View className="gap-3">
      <Field
        label="Why this plan is realistic"
        value={data.whyThisPlanIsRealistic}
      />
      <View className="gap-1">
        <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
          Strengths
        </Text>
        <Bullets items={data.strengths || []} />
      </View>
      <View className="gap-1">
        <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
          Barriers &amp; risks
        </Text>
        <Bullets items={data.barriersAndRisks || []} />
      </View>
    </View>
  );
}

function NutritionBody({ data }: { data: NutritionSectionData }) {
  return (
    <View className="gap-3">
      <Field label="Breakfast" value={data.breakfastStrategy} />
      <Field label="Lunch" value={data.lunchStrategy} />
      <Field label="Dinner" value={data.dinnerStrategy} />
      <Field
        label="Snacks & beverages"
        value={data.snacksAndBeveragesStrategy}
      />
      <Field
        label="Easiest version for busy days"
        value={data.easiestVersionForBusyDays}
      />
      {data.mealExamples?.length ? (
        <View className="gap-2">
          <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
            Meal examples
          </Text>
          {data.mealExamples.map((ex, i) => (
            <View key={i} className="rounded-xl bg-cream-100 p-3">
              <Text className="font-body-semibold text-sm text-ink-800">
                {ex.title}
              </Text>
              <Text className="mt-0.5 font-body text-xs leading-4 text-ink-700/85">
                {ex.description}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const GROCERY_CATEGORIES: { key: keyof GrocerySectionData; label: string }[] = [
  { key: "proteins", label: "Proteins" },
  { key: "highFiberCarbohydrates", label: "High-fiber carbs / starches" },
  { key: "vegetables", label: "Vegetables" },
  { key: "fruit", label: "Fruit" },
  { key: "healthyFats", label: "Healthy fats" },
  { key: "flavorBuilders", label: "Flavor builders / seasonings" },
  { key: "convenienceFoods", label: "Convenience foods" },
];

function GroceryBody({ data }: { data: GrocerySectionData }) {
  return (
    <View className="gap-3">
      {GROCERY_CATEGORIES.map(({ key, label }) => {
        const items = data[key] || [];
        if (!items.length) return null;
        return (
          <View key={key} className="gap-2">
            <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
              {label}
            </Text>
            {items.map((it, i) => (
              <View key={i} className="rounded-xl bg-cream-100 p-3">
                <Text className="font-body-semibold text-sm text-ink-800">
                  {it.item}
                </Text>
                <Text className="mt-0.5 font-body text-xs leading-4 text-ink-700/85">
                  {it.why}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function RecipesBody({ data }: { data: RecipesSectionData }) {
  return (
    <View className="gap-3">
      {(data.recipes || []).map((r, i) => (
        <View key={i} className="rounded-xl bg-cream-100 p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-ink-800">
              {r.name}
            </Text>
            <View className="rounded-full bg-cream-200 px-2 py-0.5">
              <Text className="font-body-medium text-[10px] text-ink-700">
                {r.mealType}
              </Text>
            </View>
          </View>
          <Text className="mt-1 font-body text-xs italic leading-4 text-ink-700/80">
            {r.whyItFitsThisPatient}
          </Text>
          {r.ingredients?.length ? (
            <View className="mt-2">
              <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
                Ingredients
              </Text>
              <Text className="mt-0.5 font-body text-xs leading-5 text-ink-800">
                {r.ingredients.join(" · ")}
              </Text>
            </View>
          ) : null}
          {r.steps?.length ? (
            <View className="mt-2 gap-1">
              <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
                Steps
              </Text>
              {r.steps.map((s, si) => (
                <Text
                  key={si}
                  className="font-body text-xs leading-5 text-ink-800"
                >
                  {si + 1}. {s}
                </Text>
              ))}
            </View>
          ) : null}
          {r.substitutions ? (
            <Text className="mt-2 font-body text-xs italic leading-4 text-ink-700/70">
              Substitutions: {r.substitutions}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function ExerciseBody({ data }: { data: ExerciseSectionData }) {
  return (
    <View className="gap-3">
      <Field label="Cardio progression" value={data.cardioProgression} />
      <Field label="Resistance training" value={data.resistanceTraining} />
      <Field label="Mobility & balance" value={data.mobilityAndBalance} />
      <Field label="Recovery days" value={data.recoveryDays} />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Minimum goal" value={data.minimumGoal} />
        </View>
        <View className="flex-1">
          <Field label="Ideal goal" value={data.idealGoal} />
        </View>
      </View>
      <Field
        label="Home-based alternatives"
        value={data.homeBasedAlternatives}
      />
      <Field
        label="Lower-impact substitutions"
        value={data.lowerImpactSubstitutions}
      />
    </View>
  );
}

function BehavioralBody({ data }: { data: BehavioralSectionData }) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
          Habit goals
        </Text>
        <Bullets items={data.habitGoals || []} />
      </View>
      <Field label="Self-monitoring" value={data.selfMonitoringSuggestions} />
      <Field label="Handling missed days" value={data.handlingMissedDays} />
      <Field
        label="Stress & disruption strategy"
        value={data.stressAndDisruptionStrategy}
      />
    </View>
  );
}

function WeeklyPlanBody({ data }: { data: WeeklyPlanSectionData }) {
  return (
    <View className="gap-4">
      {(data.weeks || []).map((week) => (
        <View key={week.weekNumber} className="gap-2">
          <Text className="font-display text-base text-ink-800">
            Week {week.weekNumber}
          </Text>
          {week.days.map((day, i) => (
            <View key={i} className="rounded-xl bg-cream-100 p-3">
              <Text className="font-body-semibold text-sm text-ink-800">
                {day.day}
              </Text>
              <Field label="Nutrition focus" value={day.nutritionFocus} />
              <Field label="Meals" value={day.mealGuidance} />
              <Field
                label="Physical activity"
                value={day.physicalActivityGoal}
              />
              <Field
                label="Strength / mobility"
                value={day.strengthOrMobilityGoal}
              />
              <Field label="Behavioral task" value={day.behavioralTask} />
              <Field label="Notes" value={day.notes} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function ProgressionBody({ data }: { data: ProgressionSectionData }) {
  return (
    <View className="gap-3">
      {(data.phases || []).map((p, i) => (
        <View key={i} className="rounded-xl bg-cream-100 p-3">
          <Text className="font-display text-base text-ink-800">{p.phase}</Text>
          <Field label="Nutrition goals" value={p.nutritionGoals} />
          <Field label="Exercise goals" value={p.exerciseGoals} />
          <Field label="Expected milestones" value={p.expectedMilestones} />
          <Field label="Common barriers" value={p.commonBarriers} />
          <Field label="Troubleshooting" value={p.troubleshootingApproach} />
        </View>
      ))}
    </View>
  );
}

function SafetyBody({ data }: { data: SafetySectionData }) {
  return (
    <View className="gap-3">
      <Bullets items={data.flags || []} />
      <Field
        label="Clinician clearance notes"
        value={data.clinicianClearanceNotes}
      />
    </View>
  );
}

function SectionBody({ section }: { section: ReportSection }) {
  switch (section.key) {
    case "summary":
      return <SummaryBody data={section.data} />;
    case "nutrition":
      return <NutritionBody data={section.data} />;
    case "grocery":
      return <GroceryBody data={section.data} />;
    case "recipes":
      return <RecipesBody data={section.data} />;
    case "exercise":
      return <ExerciseBody data={section.data} />;
    case "behavioral":
      return <BehavioralBody data={section.data} />;
    case "weeklyPlan":
      return <WeeklyPlanBody data={section.data} />;
    case "progression":
      return <ProgressionBody data={section.data} />;
    case "safety":
      return <SafetyBody data={section.data} />;
    default:
      return null;
  }
}

interface ReportSectionCardProps {
  section: ReportSection;
  index?: number;
  readOnly?: boolean;
  onRegenerate?: (instruction: string) => Promise<void>;
}

export function ReportSectionCard({
  section,
  index = 0,
  readOnly,
  onRegenerate,
}: ReportSectionCardProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = SECTION_ICON[section.key];

  async function handleRegenerate() {
    if (!onRegenerate || !instruction.trim()) return;
    setLoading(true);
    try {
      await onRegenerate(instruction.trim());
      setInstruction("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Reveal index={index}>
      <Card>
        <View className="flex-row items-center gap-3">
          <View
            className={`h-11 w-11 items-center justify-center rounded-2xl ${SECTION_TINT[section.key]}`}
          >
            <Icon size={20} color={SECTION_ICON_COLOR[section.key]} />
          </View>
          <View className="flex-1">
            <Text className="font-display text-lg text-ink-800">
              {SECTION_LABELS[section.key]}
            </Text>
          </View>
          {section.version > 1 ? (
            <View className="flex-row items-center gap-1 rounded-full bg-cream-200 px-2 py-1">
              <History size={12} color="#F2F2F5" />
              <Text className="font-body-medium text-[10px] text-ink-800">
                v{section.version}
              </Text>
            </View>
          ) : null}
        </View>

        <Animated.View
          key={`body-${section.key}-${section.version}`}
          entering={FadeIn.duration(260)}
          exiting={FadeOut.duration(120)}
          className="mt-3"
        >
          <SectionBody section={section} />
        </Animated.View>

        {section.lastPrompt ? (
          <View className="mt-3 rounded-xl bg-cream-100 px-3 py-2">
            <Text className="font-body text-xs italic text-ink-700/70">
              Last refinement: "{section.lastPrompt}"
            </Text>
          </View>
        ) : null}

        {!readOnly ? (
          <View className="mt-4 gap-2 border-t border-cream-300 pt-4">
            <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/70">
              Not quite right? Ask Gemini to revise this section
            </Text>
            {loading ? (
              <AIThinking label="Refining this section…" />
            ) : (
              <View className="flex-row items-end gap-2">
                <TextInput
                  value={instruction}
                  onChangeText={setInstruction}
                  placeholder='e.g. "Make the breakfast options strictly vegetarian"'
                  placeholderTextColor="#6E6E78"
                  multiline
                  className="flex-1 rounded-xl bg-cream-100 px-3 py-2 font-body text-sm text-ink-800"
                />
                <Button
                  size="sm"
                  variant="teal"
                  onPress={handleRegenerate}
                  disabled={!instruction.trim()}
                  icon={<Wand2 size={16} color="#FFFFFF" />}
                >
                  Redo
                </Button>
              </View>
            )}
          </View>
        ) : null}
      </Card>
    </Reveal>
  );
}
