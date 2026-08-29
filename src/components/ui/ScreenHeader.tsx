import { Pressable, Text, View } from 'react-native';
import { router, useNavigation, type Href } from 'expo-router';
import { ArrowLeft, Menu } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Shows a hamburger button that opens the drawer sidebar. Use on the root
   * screen of each drawer section (dashboard, home) instead of `showBack`. */
  showMenu?: boolean;
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
  showMenu,
  fallbackHref = '/',
  right,
  eyebrow,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  const handleOpenMenu = () => {
    (navigation as unknown as { openDrawer?: () => void }).openDrawer?.();
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
            accessibilityLabel="Go back"
            className="mt-0.5 h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50"
          >
            <ArrowLeft size={18} color="#1E293B" />
          </Pressable>
        ) : showMenu ? (
          <Pressable
            onPress={handleOpenMenu}
            accessibilityLabel="Open menu"
            className="mt-0.5 h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50"
          >
            <Menu size={18} color="#1E293B" />
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
