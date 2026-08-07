import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Activity, ClipboardList, LogOut, Plus, UserPlus, Users } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { StatPill } from '@/components/ui/StatPill';
import { PatientCard } from '@/components/PatientCard';
import { Reveal } from '@/components/ui/Reveal';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import type { PatientProfileDTO } from '@/types';

export default function ChwDashboard() {
  const { session, signOut } = useSession();
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
        title={`Namaste, ${session.user.name.split(' ')[0]}`}
        subtitle={`${patients.length} patient${patients.length === 1 ? '' : 's'} in your care`}
        right={
          <Button size="sm" variant="ghost" onPress={() => signOut().then(() => router.replace('/'))}>
            <LogOut size={14} color="#1C1C1E" />
          </Button>
        }
      />

      <View className="flex-row gap-3">
        <StatPill icon={<Users size={18} color="#30B0C7" />} label="Total patients" value={String(patients.length)} tone="teal" />
        <StatPill icon={<ClipboardList size={18} color="#8F5405" />} label="Draft plans" value={String(drafts)} tone="mustard" />
        <StatPill icon={<Activity size={18} color="#0A84FF" />} label="Published" value={String(published)} tone="accent" />
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button onPress={() => router.push('/chw/onboard')} icon={<UserPlus size={16} color="#FFFFFF" />} fullWidth>
            Onboard patient
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="teal" onPress={() => router.push('/chw/monitor')} icon={<Activity size={16} color="#FFFFFF" />} fullWidth>
            Monitor all
          </Button>
        </View>
      </View>

      <ErrorBanner message={error} />

      {loading ? (
        <ActivityIndicator className="mt-6" color="#30B0C7" />
      ) : patients.length === 0 ? (
        <View className="mt-4 items-center gap-2 rounded-2xl border border-dashed border-cream-300 p-8">
          <Plus size={22} color="#1C1C1E" />
          <Text className="text-center font-body text-sm text-ink-700/70">
            No patients yet. Onboard your first patient to generate their AI plan.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {patients.map((p, i) => (
            <Reveal key={p.id} index={i} delayStep={50}>
              <PatientCard patient={p} onPress={() => router.push(`/chw/patient/${p.id}`)} />
            </Reveal>
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}
