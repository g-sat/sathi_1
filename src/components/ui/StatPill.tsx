import { Text, View } from 'react-native';
import type { ReactNode } from 'react';

export function StatPill({
  icon,
  label,
  value,
  tone = 'cream',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'cream' | 'accent' | 'teal' | 'mustard' | 'highlight';
}) {
  if (tone === 'highlight') {
    return (
      <View className="flex-1 justify-between gap-4 rounded-2xl bg-terracotta-500 p-4">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/15">{icon}</View>
        <View>
          <Text className="font-display text-2xl text-white">{value}</Text>
          <Text className="font-body text-[11px] text-white/75">{label}</Text>
        </View>
      </View>
    );
  }

  const bg = {
    cream: 'bg-cream-50',
    accent: 'bg-terracotta-50',
    teal: 'bg-teal-50',
    mustard: 'bg-mustard-50',
  }[tone];

  return (
    <View className={`flex-1 items-start gap-2 rounded-2xl border border-cream-300 p-3.5 ${bg}`}>
      {icon}
      <View>
        <Text className="font-display text-lg text-ink-800">{value}</Text>
        <Text className="font-body text-[11px] text-ink-700/60">{label}</Text>
      </View>
    </View>
  );
}
