import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, RefreshCcw, Sparkles } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AIThinking } from '@/components/ui/AIThinking';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ReportSectionCard } from '@/components/ReportSectionCard';
import { api } from '@/lib/api';
import type { InterventionReportDTO, PatientProfileDTO, ReportSectionKey } from '@/types';

export default function ReviewReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientProfileDTO | null>(null);
  const [report, setReport] = useState<InterventionReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [{ patient }, { report }] = await Promise.all([
        api.getPatient(id),
        api.getReport(id),
      ]);
      setPatient(patient);
      setReport(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the report.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleGenerate() {
    if (!id) return;
    setGenerating(true);
    setError(null);
    try {
      const { report } = await api.generateReport(id);
      setReport(report);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate(section: ReportSectionKey, instruction: string) {
    if (!report) return;
    try {
      const { report: updated } = await api.regenerateSection(report.id, section, instruction);
      setReport(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regeneration failed.');
    }
  }

  async function handlePublish() {
    if (!report) return;
    setPublishing(true);
    setError(null);
    try {
      const { report: updated } = await api.publishReport(report.id);
      setReport(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publishing failed.');
    } finally {
      setPublishing(false);
    }
  }

  if (loading || !patient) {
    return (
      <ScreenScaffold contentClassName="flex-1 items-center justify-center">
        <ActivityIndicator color="#2563EB" />
      </ScreenScaffold>
    );
  }

  const isPublished = report?.status === 'published';

  return (
    <ScreenScaffold>
      <ScreenHeader
        eyebrow="Human-in-the-loop review"
        title={`${patient.name}'s plan`}
        subtitle="Review each section — refine anything that doesn't feel right before publishing"
        showBack
        right={report ? <Badge tone={isPublished ? 'published' : 'draft'}>{report.status}</Badge> : undefined}
      />

      <ErrorBanner message={error} />

      {!report ? (
        generating ? (
          <AIThinking />
        ) : (
          <View className="items-center gap-3 rounded-2xl border border-dashed border-cream-300 p-8">
            <Sparkles size={22} color="#64748B" />
            <Text className="text-center font-body text-sm text-ink-700/70">
              No plan generated yet for {patient.name}.
            </Text>
            <Button onPress={handleGenerate} icon={<Sparkles size={16} color="#FFFFFF" />}>
              Generate AI plan
            </Button>
          </View>
        )
      ) : (
        <>
          {report.sections.map((section, i) => (
            <ReportSectionCard
              key={section.key}
              section={section}
              index={i}
              readOnly={isPublished}
              onRegenerate={
                isPublished ? undefined : (instruction) => handleRegenerate(section.key, instruction)
              }
            />
          ))}

          {!isPublished ? (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  variant="ghost"
                  onPress={handleGenerate}
                  loading={generating}
                  icon={<RefreshCcw size={16} color="#1E293B" />}
                  fullWidth
                >
                  Regenerate all
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  onPress={handlePublish}
                  loading={publishing}
                  icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                  fullWidth
                >
                  Accept &amp; Publish
                </Button>
              </View>
            </View>
          ) : (
            <View className="items-center gap-2 rounded-2xl bg-teal-50 p-4">
              <CheckCircle2 size={20} color="#0891B2" />
              <Text className="text-center font-body-medium text-sm text-teal-700">
                Published — {patient.name} can now see this plan in their app.
              </Text>
              <Button size="sm" variant="ghost" onPress={() => router.push(`/chw/patient/${patient.id}`)}>
                Back to patient
              </Button>
            </View>
          )}
        </>
      )}
    </ScreenScaffold>
  );
}
