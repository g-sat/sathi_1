import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// Filled buttons get a diagonal two-tone gradient + a glossy top highlight and
// a shadow tinted with the accent color — this depth/gloss is what separates
// a "premium" Apple-style pill button from a flat Material-style one.
// Tinted/light buttons (secondary, mustard, ghost) stay flat per HIG.
const GRADIENTS: Record<'primary' | 'teal' | 'mustard' | 'danger', readonly [string, string]> = {
  primary: ['#3FA2FF', '#0055D4'],
  teal: ['#5CC9DC', '#1E8494'],
  mustard: ['#FFB648', '#D97706'],
  danger: ['#FF6B60', '#C81E12'],
};

const SHADOW_COLORS: Record<'primary' | 'teal' | 'mustard' | 'danger', string> = {
  primary: '#0A66FF',
  teal: '#1E8494',
  mustard: '#D97706',
  danger: '#FF3B30',
};

const LIGHT_STYLES: Record<'secondary' | 'ghost', { bg: string; text: string }> = {
  secondary: { bg: 'bg-cream-200', text: 'text-ink-800' },
  ghost: { bg: 'bg-transparent', text: 'text-ink-800' },
};

const SIZE_STYLES: Record<Size, { pad: string; radius: number; text: string }> = {
  sm: { pad: 'px-4 py-2.5', radius: 999, text: 'text-sm' },
  md: { pad: 'px-5 py-4', radius: 999, text: 'text-base' },
  lg: { pad: 'px-6 py-[18px]', radius: 999, text: 'text-lg' },
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
        const scale = pressed ? 0.97 : 1;

        if (isFilled) {
          const gradient = GRADIENTS[variant as 'primary' | 'teal' | 'mustard' | 'danger'];
          const shadowColor = SHADOW_COLORS[variant as 'primary' | 'teal' | 'mustard' | 'danger'];
          return (
            <View
              style={{
                opacity: isDisabled ? 0.45 : 1,
                transform: [{ scale }],
                borderRadius: sizing.radius,
                shadowColor,
                shadowOffset: { width: 0, height: pressed ? 3 : 10 },
                shadowOpacity: pressed ? 0.22 : 0.38,
                shadowRadius: pressed ? 8 : 18,
                elevation: pressed ? 3 : 8,
                width: fullWidth ? '100%' : undefined,
              }}
            >
              <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: sizing.radius, overflow: 'hidden' }}
              >
                {/* Glossy top highlight — the subtle sheen that reads as "premium". */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 0.9 }}
                  style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '65%' }}
                />
                <View className={`flex-row items-center justify-center gap-2 ${sizing.pad}`}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : icon}
                  <Text className={`font-body-semibold ${sizing.text} text-white`}>{children}</Text>
                </View>
              </LinearGradient>
            </View>
          );
        }

        const light = LIGHT_STYLES[variant as 'secondary' | 'ghost'];
        return (
          <View
            className={`flex-row items-center justify-center gap-2 ${light.bg} ${sizing.pad} ${fullWidth ? 'w-full' : ''}`}
            style={{
              borderRadius: sizing.radius,
              opacity: isDisabled ? 0.45 : pressed ? 0.75 : 1,
              transform: [{ scale }],
            }}
          >
            {loading ? <ActivityIndicator color="#1C1C1E" /> : icon}
            <Text className={`font-body-semibold ${sizing.text} ${light.text}`}>{children}</Text>
          </View>
        );
      }}
    </Pressable>
  );
}
