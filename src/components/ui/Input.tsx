import { Text, TextInput, View, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, style, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-body-semibold text-sm text-ink-800">{label}</Text>
      <TextInput
        placeholderTextColor="#8E8E93"
        className={`rounded-2xl bg-cream-100 px-4 py-3.5 font-body text-base text-ink-800 ${
          error ? 'border border-danger-500' : 'border border-transparent'
        }`}
        style={style}
        {...props}
      />
      {hint && !error ? <Text className="font-body text-xs text-ink-700/60">{hint}</Text> : null}
      {error ? <Text className="font-body-medium text-xs text-danger-600">{error}</Text> : null}
    </View>
  );
}
