import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Where to go if there's no history to pop (e.g. this screen was reached
   * via `router.replace`, a deep link, or a page refresh). Defaults to the
   * landing screen, which itself redirects based on the current session. */
  fallbackHref?: Href;
  right?: ReactNode;
  eyebrow?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack,
  fallbackHref = '/',
  right,
  eyebrow,
}: ScreenHeaderProps) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(320)}
      className="flex-row items-start justify-between gap-3"
    >
      <View className="flex-1 flex-row items-start gap-3">
        {showBack ? (
          <Pressable
            onPress={handleBack}
            className="mt-0.5 h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <ArrowLeft size={18} color="#1C1C1E" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          {eyebrow ? (
            <Text className="font-body-semibold text-xs uppercase tracking-widest text-terracotta-600">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="font-display text-2xl text-ink-800">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 font-body text-sm text-ink-700/70">{subtitle}</Text>
          ) : null}
        </View>
      </View>
      {right}
    </Animated.View>
  );
}
