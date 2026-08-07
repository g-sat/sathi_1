import { Text, View } from 'react-native';

export function StepIndicator({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row gap-1.5">
        {steps.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= current ? 'bg-terracotta-500' : 'bg-cream-200'}`}
          />
        ))}
      </View>
      <Text className="font-body-semibold text-xs uppercase tracking-wide text-ink-700/60">
        Step {current + 1} of {steps.length} · {steps[current]}
      </Text>
    </View>
  );
}
