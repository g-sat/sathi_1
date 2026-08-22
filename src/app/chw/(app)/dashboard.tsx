import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Activity, ClipboardList, Plus, UserPlus, Users } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatPill } from '@/components/ui/StatPill';
import { PatientCard } from '@/components/PatientCard';
import { Reveal } from '@/components/ui/Reveal';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import type { PatientProfileDTO } from '@/types';

export default function ChwDashboard() {
  const { session } = useSession();
  const [patients, setPatients] = useState<(PatientProfileDTO & { reportStatus: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isChw = session?.role === 'chw';

  const load = useCallback(async () => {
    if (!isChw) return;
    setLoading(true);
    setError(null);
    try {
      const { patients } = await api.listPatients();
      setPatients(patients);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load patients.');
    } finally {
      setLoading(false);
    }
  }, [isChw]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (session?.role !== 'chw') return null;

  const published = patients.filter((p) => p.reportStatus === 'published').length;
  const drafts = patients.filter((p) => p.reportStatus === 'draft').length;

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="CHW Dashboard"
        title={`Welcome back, ${session.user.name.split(' ')[0]}`}
        subtitle={`${patients.length} patient${patients.length === 1 ? '' : 's'} in your care`}
        showMenu
      />

      <View className="flex-row gap-3">
        <StatPill icon={<Users size={16} color="#FFFFFF" />} label="Total patients" value={String(patients.length)} tone="highlight" />
        <StatPill icon={<ClipboardList size={18} color="#B45309" />} label="Draft plans" value={String(drafts)} tone="mustard" />
        <StatPill icon={<Activity size={18} color="#0E7490" />} label="Published" value={String(published)} tone="teal" />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button onPress={() => router.push('/chw/onboard')} icon={<UserPlus size={16} color="#FFFFFF" />} fullWidth>
            Onboard patient
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" onPress={() => router.push('/chw/monitor')} icon={<Activity size={16} color="#1E293B" />} fullWidth>
            Monitor all
          </Button>
        </View>
      </View>

      <ErrorBanner message={error} />

      <View className="flex-row items-center justify-between px-1">
        <Text className="font-body-semibold text-sm text-ink-800">Patients</Text>
        <Text className="font-body text-xs text-ink-700/50">{patients.length} total</Text>
      </View>

      {loading ? (
        <ActivityIndicator className="mt-6" color="#2563EB" />
      ) : patients.length === 0 ? (
        <View className="mt-1 items-center gap-2 rounded-2xl border border-dashed border-cream-300 p-8">
          <Plus size={22} color="#64748B" />
          <Text className="text-center font-body text-sm text-ink-700/70">
            No patients yet. Onboard your first patient to generate their AI plan.
          </Text>
        </View>
      ) : (
        <Reveal index={0}>
          <Card padded={false}>
            {patients.map((p, i) => (
              <PatientCard
                key={p.id}
                patient={p}
                isLast={i === patients.length - 1}
                onPress={() => router.push(`/chw/patient/${p.id}`)}
              />
            ))}
          </Card>
        </Reveal>
      )}
    </ScreenScaffold>
  );
}
