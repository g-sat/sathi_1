import { Text, View } from 'react-native';
import { Droplet, Footprints } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import type { DailyLogDTO } from '@/types';

function glucoseTone(level?: number) {
  if (level == null) return 'text-ink-700/60';
  if (level < 70 || level > 180) return 'text-danger-600';
  if (level > 140) return 'text-mustard-700';
  return 'text-teal-600';
}

export function LogHistoryList({ logs }: { logs: DailyLogDTO[] }) {
  if (logs.length === 0) {
    return (
      <Card tone="cream">
        <Text className="text-center font-body text-sm text-ink-700/70">
          No logs yet — your daily entries will appear here.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {logs.map((log, i) => (
        <Reveal key={log.id} index={i} delayStep={40}>
          <Card className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-body-semibold text-sm text-ink-800">{log.date}</Text>
              {log.glucoseLevel != null ? (
                <View className="flex-row items-center gap-1">
                  <Droplet size={14} color="#F43F5E" />
                  <Text className={`font-body-semibold text-sm ${glucoseTone(log.glucoseLevel)}`}>
                    {log.glucoseLevel} mg/dL{log.glucoseTiming ? ` · ${log.glucoseTiming}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            {log.meals.length > 0 ? (
              <View className="gap-1">
                {log.meals.map((m, idx) => (
                  <Text key={idx} className="font-body text-xs text-ink-700/85">
                    <Text className="font-body-semibold">{m.type}: </Text>
                    {m.description}
                  </Text>
                ))}
              </View>
            ) : null}

            {log.activityMinutes != null ? (
              <View className="flex-row items-center gap-1">
                <Footprints size={13} color="#22D3EE" />
                <Text className="font-body text-xs text-ink-700/85">
                  {log.activityMinutes} min {log.activityType ? `· ${log.activityType}` : ''}
                </Text>
              </View>
            ) : null}

            {log.moodNote ? (
              <Text className="font-body text-xs italic text-ink-700/70">"{log.moodNote}"</Text>
            ) : null}
          </Card>
        </Reveal>
      ))}
    </View>
  );
}
