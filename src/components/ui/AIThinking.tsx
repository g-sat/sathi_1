import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

function Dot({ delay }: { delay: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 260, easing: Easing.in(Easing.quad) })
        ),
        -1
      )
    );
  }, [delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + t.value * 0.75,
    transform: [{ translateY: -3 * t.value }],
  }));

  return <Animated.View style={style} className="h-2 w-2 rounded-full bg-terracotta-500" />;
}

export function AIThinking({ label = 'Generating culturally-tailored plan…' }: { label?: string }) {
  const rotate = useSharedValue(0);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.linear }), -1);
  }, [rotate]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 360}deg` }],
  }));

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-4">
      <Animated.View style={iconStyle}>
        <Sparkles size={22} color="#2563EB" />
      </Animated.View>
      <Text className="flex-1 font-body-medium text-sm text-ink-800">{label}</Text>
      <View className="flex-row gap-1">
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
      </View>
    </View>
  );
}
