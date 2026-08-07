import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import type { ReactNode } from 'react';

interface ScreenScaffoldProps {
  children: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
  scrollProps?: ScrollViewProps;
}

export function ScreenScaffold({
  children,
  scroll = true,
  contentClassName = '',
  scrollProps,
}: ScreenScaffoldProps) {
  return (
    <SafeAreaView className="flex-1 bg-cream-100" edges={['top', 'left', 'right']} style={{ backgroundColor: '#F2F2F7' }}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={`gap-4 p-5 pb-16 ${contentClassName}`}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 gap-4 p-5 ${contentClassName}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
