import { Text, View } from 'react-native';

type Tone = 'draft' | 'published' | 'neutral' | 'warning' | 'good';

const TONES: Record<Tone, { bg: string; text: string }> = {
  draft: { bg: 'bg-mustard-100', text: 'text-mustard-700' },
  published: { bg: 'bg-teal-100', text: 'text-teal-700' },
  neutral: { bg: 'bg-cream-200', text: 'text-ink-700' },
  warning: { bg: 'bg-danger-100', text: 'text-danger-700' },
  good: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: string }) {
  const t = TONES[tone];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${t.bg}`}>
      <Text className={`font-body-semibold text-xs uppercase tracking-wide ${t.text}`}>{children}</Text>
    </View>
  );
}
