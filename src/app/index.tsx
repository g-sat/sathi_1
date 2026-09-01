import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { HeartPulse, Stethoscope } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { GradientIconTile } from '@/components/ui/GradientIconTile';
import { useSession } from '@/context/SessionContext';

export default function Landing() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (session?.role === 'chw') router.replace('/chw/dashboard');
  }, [session, isLoading]);

  return (
    <ScreenScaffold contentClassName="pt-8">
      <Animated.View entering={ZoomIn.duration(500)} className="items-center gap-3">
        <GradientIconTile colors={['#60A5FA', '#1D4ED8']} size={72}>
          <HeartPulse size={34} color="#FFFFFF" strokeWidth={2.2} />
        </GradientIconTile>
        <Text className="mt-1 font-display text-[2.75rem] leading-[3rem] tracking-tight text-ink-800">
          Sathi
        </Text>
        <Text className="max-w-xs text-center font-body text-[15px] leading-5 text-ink-700/70">
          A culturally-adapted Diabetes Prevention Program for South Asian communities
        </Text>
      </Animated.View>

      <View className="mt-11 gap-4">
        <Reveal index={0}>
          <Card className="gap-0">
            <View className="flex-row items-center gap-3.5">
              <GradientIconTile colors={['#67E8F9', '#0891B2']} size={52}>
                <Stethoscope size={24} color="#FFFFFF" strokeWidth={2.2} />
              </GradientIconTile>
              <View className="flex-1">
                <Text className="font-display text-lg text-ink-800">I'm a Doctor / CHW</Text>
                <Text className="mt-0.5 font-body text-[13px] leading-4 text-ink-700/65">
                  Onboard patients, review AI plans, monitor progress
                </Text>
              </View>
            </View>
            <View className="mt-4">
              <Button variant="teal" size="lg" onPress={() => router.push('/chw/login')} fullWidth>
                Continue as Doctor
              </Button>
            </View>
          </Card>
        </Reveal>
      </View>
    </ScreenScaffold>
  );
}
