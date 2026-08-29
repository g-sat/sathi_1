import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ClipboardList, NotebookPen, Sparkles } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NudgeCard } from '@/components/NudgeCard';
import { Reveal } from '@/components/ui/Reveal';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import type { InterventionReportDTO, NudgeDTO } from '@/types';

export default function PatientHome() {
  const { session } = useSession();
  const [nudge, setNudge] = useState<NudgeDTO | null>(null);
  const [report, setReport] = useState<InterventionReportDTO | null>(null);

  const patient = session?.role === 'patient' ? session.patient : undefined;

  const load = useCallback(async () => {
    if (!patient) return;
    const [nudgeRes, reportRes] = await Promise.all([
      api.getNudge(patient.id).catch(() => ({ nudge: null })),
      api.getReport(patient.id, 'published').catch(() => ({ report: null })),
    ]);
    setNudge(nudgeRes.nudge);
    setReport(reportRes.report);
  }, [patient]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!patient) return null;

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Your Sathi"
        title={`Namaste, ${patient.name.split(' ')[0]}`}
        subtitle={`${patient.state}, ${patient.region}`}
        showMenu
      />

      <NudgeCard nudge={nudge} />

      <Reveal index={0}>
        <Card>
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-terracotta-100">
              <Sparkles size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="font-body-semibold text-base text-ink-800">Your personalized plan</Text>
              <Text className="font-body text-xs text-ink-700/70">
                {report ? 'Diet, activity & lifestyle guidance from your CHW' : 'Not published yet — check back soon'}
              </Text>
            </View>
          </View>
          <View className="mt-3">
            <Button
              variant="secondary"
              onPress={() => router.push('/patient/plan')}
              icon={<ClipboardList size={16} color="#1E293B" />}
              disabled={!report}
              fullWidth
            >
              View my plan
            </Button>
          </View>
        </Card>
      </Reveal>

      <Reveal index={1}>
        <Card>
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-teal-100">
              <NotebookPen size={20} color="#0E7490" />
            </View>
            <View className="flex-1">
              <Text className="font-body-semibold text-base text-ink-800">Daily tracker</Text>
              <Text className="font-body text-xs text-ink-700/70">
                Log today's glucose, meals, and activity
              </Text>
            </View>
          </View>
          <View className="mt-3">
            <Button variant="teal" onPress={() => router.push('/patient/tracker')} icon={<NotebookPen size={16} color="#FFFFFF" />} fullWidth>
              Open tracker
            </Button>
          </View>
        </Card>
      </Reveal>
    </ScreenScaffold>
  );
}
