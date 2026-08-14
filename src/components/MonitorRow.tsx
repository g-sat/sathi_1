import { Pressable, Text, View } from 'react-native';
import { Droplet } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import type { DailyLogDTO, PatientProfileDTO } from '@/types';

function glucoseTone(level?: number): { text: string; bg: string } {
  if (level == null) return { text: 'text-ink-700/60', bg: 'bg-cream-200' };
  if (level < 70 || level > 180) return { text: 'text-danger-700', bg: 'bg-danger-100' };
  if (level > 140) return { text: 'text-mustard-700', bg: 'bg-mustard-100' };
  return { text: 'text-teal-700', bg: 'bg-teal-100' };
}

export function MonitorRow({
  patient,
  log,
  index = 0,
  onPress,
}: {
  patient: PatientProfileDTO;
  log: DailyLogDTO;
  index?: number;
  onPress?: () => void;
}) {
  const tone = glucoseTone(log.glucoseLevel);
  return (
    <Reveal index={index} delayStep={45}>
      <Pressable onPress={onPress}>
        <Card className="flex-row items-center gap-3">
          <View className={`h-10 w-10 items-center justify-center rounded-full ${tone.bg}`}>
            <Droplet size={16} color="#F2F2F5" />
          </View>
          <View className="flex-1">
            <Text className="font-body-semibold text-sm text-ink-800">{patient.name}</Text>
            <Text className="font-body text-xs text-ink-700/70">
              {log.date} · {log.meals.length} meal{log.meals.length === 1 ? '' : 's'} logged
              {log.activityMinutes != null ? ` · ${log.activityMinutes}min active` : ''}
            </Text>
          </View>
          <Text className={`font-body-semibold text-sm ${tone.text}`}>
            {log.glucoseLevel != null ? `${log.glucoseLevel} mg/dL` : '—'}
          </Text>
        </Card>
      </Pressable>
    </Reveal>
  );
}
