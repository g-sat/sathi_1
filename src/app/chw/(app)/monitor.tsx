import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MonitorRow } from '@/components/MonitorRow';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import type { DailyLogDTO, PatientProfileDTO } from '@/types';

export default function MonitorAll() {
  const { session } = useSession();
  const [rows, setRows] = useState<{ log: DailyLogDTO; patient: PatientProfileDTO }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isChw = session?.role === 'chw';

  const load = useCallback(async () => {
    if (!isChw) return;
    setLoading(true);
    setError(null);
    try {
      const { rows } = await api.listLogsForChw();
      setRows(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load monitoring feed.');
    } finally {
      setLoading(false);
    }
  }, [isChw]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Remote monitoring"
        title="Patient activity feed"
        subtitle="Most recent daily logs across your caseload"
        showBack
      />
      <ErrorBanner message={error} />
      {loading ? (
        <ActivityIndicator color="#2563EB" />
      ) : rows.length === 0 ? (
        <View className="items-center gap-2 rounded-2xl border border-dashed border-cream-300 p-8">
          <Text className="text-center font-body text-sm text-ink-700/70">
            No daily logs submitted yet.
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {rows.map((row, i) => (
            <MonitorRow
              key={`${row.patient.id}-${row.log.id}`}
              patient={row.patient}
              log={row.log}
              index={i}
              onPress={() => router.push(`/chw/patient/${row.patient.id}/monitor`)}
            />
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}
