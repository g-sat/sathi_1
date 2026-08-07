import { useState } from 'react';
import { Text, View } from 'react-native';
import { Droplet, Footprints, Save, Smile, UtensilsCrossed } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ChipSelect } from '@/components/ui/ChipSelect';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { DailyLogDTO } from '@/types';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;
const GLUCOSE_TIMINGS = ['Fasting', 'Post-Meal', 'Random'] as const;

interface DailyLogFormProps {
  patientId: string;
  existingLog?: DailyLogDTO | null;
  onSaved: (log: DailyLogDTO) => void;
}

export function DailyLogForm({ patientId, existingLog, onSaved }: DailyLogFormProps) {
  const [glucoseLevel, setGlucoseLevel] = useState(existingLog?.glucoseLevel?.toString() ?? '');
  const [glucoseTiming, setGlucoseTiming] = useState<(typeof GLUCOSE_TIMINGS)[number] | undefined>(
    existingLog?.glucoseTiming
  );
  const [meals, setMeals] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const m of existingLog?.meals ?? []) initial[m.type] = m.description;
    return initial;
  });
  const [activityMinutes, setActivityMinutes] = useState(
    existingLog?.activityMinutes?.toString() ?? ''
  );
  const [activityType, setActivityType] = useState(existingLog?.activityType ?? '');
  const [moodNote, setMoodNote] = useState(existingLog?.moodNote ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const { log } = await api.submitLog({
        patientId,
        glucoseLevel: glucoseLevel ? Number(glucoseLevel) : undefined,
        glucoseTiming,
        meals: MEAL_TYPES.filter((t) => meals[t]?.trim()).map((t) => ({
          type: t,
          description: meals[t].trim(),
        })),
        activityMinutes: activityMinutes ? Number(activityMinutes) : undefined,
        activityType: activityType.trim() || undefined,
        moodNote: moodNote.trim() || undefined,
      });
      onSaved(log);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="gap-4">
      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Droplet size={18} color="#0A84FF" />
          <Text className="font-body-semibold text-base text-ink-800">Glucose reading</Text>
        </View>
        <Input
          label="Glucose level (mg/dL)"
          keyboardType="numeric"
          value={glucoseLevel}
          onChangeText={setGlucoseLevel}
          placeholder="e.g. 108"
        />
        <ChipSelect
          label="When was this taken?"
          options={GLUCOSE_TIMINGS}
          value={glucoseTiming}
          onChange={setGlucoseTiming}
        />
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <UtensilsCrossed size={18} color="#FF9500" />
          <Text className="font-body-semibold text-base text-ink-800">Meals eaten today</Text>
        </View>
        {MEAL_TYPES.map((type) => (
          <Input
            key={type}
            label={type}
            value={meals[type] ?? ''}
            onChangeText={(text) => setMeals((prev) => ({ ...prev, [type]: text }))}
            placeholder={`What did you eat for ${type.toLowerCase()}?`}
          />
        ))}
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Footprints size={18} color="#30B0C7" />
          <Text className="font-body-semibold text-base text-ink-800">Physical activity</Text>
        </View>
        <Input
          label="Minutes active"
          keyboardType="numeric"
          value={activityMinutes}
          onChangeText={setActivityMinutes}
          placeholder="e.g. 30"
        />
        <Input
          label="What did you do?"
          value={activityType}
          onChangeText={setActivityType}
          placeholder="e.g. Evening walk, household chores"
        />
      </Card>

      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Smile size={18} color="#8F5405" />
          <Text className="font-body-semibold text-base text-ink-800">How are you feeling?</Text>
        </View>
        <Input
          label="Optional note"
          value={moodNote}
          onChangeText={setMoodNote}
          placeholder="Anything you'd like your CHW to know"
          multiline
        />
      </Card>

      <Button onPress={handleSave} loading={saving} icon={<Save size={16} color="#FFFFFF" />} fullWidth>
        Save today's log
      </Button>
    </View>
  );
}
