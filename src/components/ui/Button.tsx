import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'teal' | 'mustard' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

// Flat, solid-fill buttons with a tight tinted shadow — the restrained,
// "enterprise dashboard" treatment instead of glossy gradient pills.
const FILLED_STYLES: Record<'primary' | 'teal' | 'mustard' | 'danger', { bg: string; shadow: string }> = {
  primary: { bg: 'bg-terracotta-500', shadow: '#8B5CF6' },
  teal: { bg: 'bg-teal-500', shadow: '#22D3EE' },
  mustard: { bg: 'bg-mustard-500', shadow: '#F59E0B' },
  danger: { bg: 'bg-danger-500', shadow: '#F43F5E' },
};

const LIGHT_STYLES: Record<'secondary' | 'ghost', { bg: string; text: string }> = {
  secondary: { bg: 'bg-cream-200', text: 'text-ink-800' },
  ghost: { bg: 'bg-transparent', text: 'text-ink-800' },
};

const SIZE_STYLES: Record<Size, { pad: string; text: string }> = {
  sm: { pad: 'px-3.5 py-2.5', text: 'text-sm' },
  md: { pad: 'px-4 py-3.5', text: 'text-sm' },
  lg: { pad: 'px-5 py-4', text: 'text-base' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'teal' || variant === 'mustard' || variant === 'danger';
  const sizing = SIZE_STYLES[size];

  return (
    <Pressable accessibilityRole="button" disabled={isDisabled} {...props}>
      {({ pressed }) => {
        if (isFilled) {
          const filled = FILLED_STYLES[variant as 'primary' | 'teal' | 'mustard' | 'danger'];
          return (
            <View
              className={`flex-row items-center justify-center gap-2 rounded-xl ${filled.bg} ${sizing.pad} ${fullWidth ? 'w-full' : ''}`}
              style={{
                opacity: isDisabled ? 0.4 : pressed ? 0.88 : 1,
                shadowColor: filled.shadow,
                shadowOffset: { width: 0, height: pressed ? 1 : 4 },
                shadowOpacity: pressed ? 0.12 : 0.28,
                shadowRadius: pressed ? 4 : 10,
                elevation: pressed ? 1 : 4,
              }}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : icon}
              <Text className={`font-body-semibold ${sizing.text} text-white`}>{children}</Text>
            </View>
          );
        }

        const light = LIGHT_STYLES[variant as 'secondary' | 'ghost'];
        return (
          <View
            className={`flex-row items-center justify-center gap-2 rounded-xl ${light.bg} ${sizing.pad} ${fullWidth ? 'w-full' : ''}`}
            style={{ opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1 }}
          >
            {loading ? <ActivityIndicator color="#F2F2F5" /> : icon}
            <Text className={`font-body-semibold ${sizing.text} ${light.text}`}>{children}</Text>
          </View>
        );
      }}
    </Pressable>
  );
}
