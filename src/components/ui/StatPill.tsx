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
  tone?: 'cream' | 'accent' | 'teal' | 'mustard';
}) {
  const bg = {
    cream: 'bg-white',
    accent: 'bg-terracotta-50',
    teal: 'bg-teal-50',
    mustard: 'bg-mustard-50',
  }[tone];

  return (
    <View
      className={`flex-1 items-start gap-2 rounded-2xl p-3.5 ${bg}`}
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {icon}
      <View>
        <Text className="font-display text-lg text-ink-800">{value}</Text>
        <Text className="font-body text-[11px] text-ink-700/60">{label}</Text>
      </View>
    </View>
  );
}
