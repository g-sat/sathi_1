import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MessageCircleHeart } from 'lucide-react-native';
import type { NudgeDTO } from '@/types';

export function NudgeCard({ nudge }: { nudge: NudgeDTO | null }) {
  return (
    <Animated.View
      entering={FadeIn.duration(380)}
      className="gap-2 rounded-3xl bg-terracotta-500 p-5"
      style={{
        shadowColor: '#0A84FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <View className="flex-row items-center gap-2">
        <MessageCircleHeart size={18} color="#FFFFFF" />
        <Text className="font-body-semibold text-xs uppercase tracking-widest text-white/80">
          Today's nudge{nudge ? ` · ${nudge.language}` : ''}
        </Text>
      </View>
      {nudge ? (
        <>
          <Text className="font-display text-lg leading-6 text-white">{nudge.translatedMessage}</Text>
          <Text className="font-body text-xs italic text-white/75">{nudge.message}</Text>
        </>
      ) : (
        <Text className="font-body text-sm text-white/90">Preparing your encouragement for today…</Text>
      )}
    </Animated.View>
  );
}
