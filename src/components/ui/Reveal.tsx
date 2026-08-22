import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ReactNode } from 'react';

/** Simple staggered entrance animation — pass an `index` for list items. */
export function Reveal({
  children,
  index = 0,
  delayStep = 70,
}: {
  children: ReactNode;
  index?: number;
  delayStep?: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(380)
        .delay(index * delayStep)
        .springify()
        .damping(16)}
    >
      {children}
    </Animated.View>
  );
}
