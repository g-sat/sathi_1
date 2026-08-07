import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';

interface GradientIconTileProps {
  children: ReactNode;
  colors: readonly [string, string];
  size?: number;
  /** Defaults to Apple's "squircle" ratio (~28% of size). */
  radius?: number;
  /** Tinted drop shadow that matches the gradient — the key ingredient for a
   * "premium" glassy app-icon look instead of a flat colored square. */
  glow?: boolean;
  style?: ViewStyle;
}

export function GradientIconTile({
  children,
  colors,
  size = 56,
  radius,
  glow = true,
  style,
}: GradientIconTileProps) {
  const r = radius ?? Math.round(size * 0.28);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: r,
          ...(glow
            ? {
                shadowColor: colors[1],
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 14,
                elevation: 6,
              }
            : {}),
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: r,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Glossy top highlight for depth. */}
        <LinearGradient
          colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.85 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '60%' }}
        />
        {children}
      </LinearGradient>
    </View>
  );
}
