import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { LogHistoryList } from '@/components/LogHistoryList';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { api } from '@/lib/api';
import type { DailyLogDTO, PatientProfileDTO } from '@/types';

export default function PatientMonitor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientProfileDTO | null>(null);
  const [logs, setLogs] = useState<DailyLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [{ patient }, { logs }] = await Promise.all([
        api.getPatient(id),
        api.listLogsForPatient(id),
      ]);
      setPatient(patient);
      setLogs(logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load logs.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Remote monitoring"
        title={patient ? `${patient.name}'s logs` : 'Loading…'}
        subtitle="Daily glucose, meals, and activity submitted by the patient"
        showBack
      />
      <ErrorBanner message={error} />
      {loading ? <ActivityIndicator color="#22D3EE" /> : <LogHistoryList logs={logs} />}
    </ScreenScaffold>
  );
}
