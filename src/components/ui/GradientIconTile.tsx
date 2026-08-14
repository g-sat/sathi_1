import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';

interface GradientIconTileProps {
  children: ReactNode;
  colors: readonly [string, string];
  size?: number;
  radius?: number;
  glow?: boolean;
  style?: ViewStyle;
}

export function GradientIconTile({
  children,
  colors,
  size = 44,
  radius,
  glow = false,
  style,
}: GradientIconTileProps) {
  const r = radius ?? Math.round(size * 0.26);

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
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 3,
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
        {children}
      </LinearGradient>
    </View>
  );
}
