import { Pressable, Text, View } from 'react-native';

interface ChipSelectProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | undefined;
  onChange: (value: T) => void;
}

export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: ChipSelectProps<T>) {
  return (
    <View className="gap-1.5">
      <Text className="font-body-semibold text-sm text-ink-800">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable key={option} onPress={() => onChange(option)}>
              <View
                className={`rounded-lg border px-4 py-2.5 ${
                  active ? 'border-terracotta-500 bg-terracotta-500' : 'border-cream-300 bg-cream-100'
                }`}
              >
                <Text className={`font-body-medium text-sm ${active ? 'text-white' : 'text-ink-700'}`}>
                  {option}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
