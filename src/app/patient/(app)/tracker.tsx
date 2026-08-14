import { useCallback, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { DailyLogForm } from '@/components/DailyLogForm';
import { LogHistoryList } from '@/components/LogHistoryList';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import { todayISODateClient } from '@/lib/date';
import type { DailyLogDTO } from '@/types';

export default function PatientTracker() {
  const { session } = useSession();
  const [logs, setLogs] = useState<DailyLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patient = session?.role === 'patient' ? session.patient : undefined;

  const load = useCallback(async () => {
    if (!patient) return;
    setLoading(true);
    setError(null);
    try {
      const { logs } = await api.listLogsForPatient(patient.id);
      setLogs(logs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your logs.');
    } finally {
      setLoading(false);
    }
  }, [patient]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!patient) return null;

  const today = todayISODateClient();
  const todaysLog = logs.find((l) => l.date === today) ?? null;

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Daily tracker"
        title="How was today?"
        subtitle="A minute a day helps your CHW support you better"
        showBack
      />
      <ErrorBanner message={error} />

      <DailyLogForm
        patientId={patient.id}
        existingLog={todaysLog}
        onSaved={(log) => setLogs((prev) => [log, ...prev.filter((l) => l.date !== log.date)])}
      />

      <Text className="mt-2 font-body-semibold text-sm uppercase tracking-wide text-ink-700/70">
        History
      </Text>
      {loading ? <ActivityIndicator color="#22D3EE" /> : <LogHistoryList logs={logs} />}
    </ScreenScaffold>
  );
}
