import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ReportSectionCard } from '@/components/ReportSectionCard';
import { PdfExportButton } from '@/components/PdfExportButton';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';
import type { InterventionReportDTO } from '@/types';

export default function PatientPlan() {
  const { session } = useSession();
  const [report, setReport] = useState<InterventionReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patient = session?.role === 'patient' ? session.patient : undefined;

  const load = useCallback(async () => {
    if (!patient) return;
    setLoading(true);
    setError(null);
    try {
      const { report } = await api.getReport(patient.id, 'published');
      setReport(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your plan.');
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

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Your plan"
        title="Personalized for you"
        subtitle="Approved by your Community Health Worker"
        showBack
      />
      <ErrorBanner message={error} />

      {loading ? (
        <ActivityIndicator color="#22D3EE" />
      ) : !report ? (
        <View className="items-center gap-2 rounded-2xl border border-dashed border-cream-300 p-8">
          <Text className="text-center font-body text-sm text-ink-700/70">
            Your plan hasn't been published yet. Check back after your CHW finishes reviewing it.
          </Text>
        </View>
      ) : (
        <>
          <PdfExportButton patient={patient} report={report} />
          {report.sections.map((section, i) => (
            <ReportSectionCard key={section.key} section={section} index={i} readOnly />
          ))}
        </>
      )}
    </ScreenScaffold>
  );
}
