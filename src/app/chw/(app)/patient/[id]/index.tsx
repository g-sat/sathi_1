import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Activity, Copy, FileText, MapPin } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Reveal } from '@/components/ui/Reveal';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { api } from '@/lib/api';
import type { InterventionReportDTO, PatientProfileDTO } from '@/types';

export default function PatientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientProfileDTO | null>(null);
  const [report, setReport] = useState<InterventionReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      setError(e instanceof Error ? e.message : 'Could not load patient.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !patient) {
    return (
      <ScreenScaffold contentClassName="flex-1 items-center justify-center">
        <ActivityIndicator color="#2563EB" />
        <ErrorBanner message={error} />
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold>
      <ScreenHeader eyebrow="Patient profile" title={patient.name} showBack subtitle={patient.notes} />

      <Reveal index={0}>
        <Card className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <MapPin size={14} color="#0891B2" />
              <Text className="font-body text-sm text-ink-700/85">
                {patient.state}, {patient.region} · {patient.localLanguage}
              </Text>
            </View>
            <Badge tone={report?.status === 'published' ? 'published' : report ? 'draft' : 'neutral'}>
              {report?.status ?? 'no plan'}
            </Badge>
          </View>

          <View className="flex-row items-center justify-between rounded-xl border border-dashed border-cream-300 bg-cream-100 px-3 py-2">
            <Text className="font-mono text-sm text-ink-800">{patient.patientId}</Text>
            <Button
              size="sm"
              variant="ghost"
              onPress={async () => {
                await Clipboard.setStringAsync(patient.patientId);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              icon={<Copy size={14} color="#1E293B" />}
            >
              {copied ? 'Copied!' : 'Copy ID'}
            </Button>
          </View>
          <Text className="font-body text-xs text-ink-700/60">
            Share this Patient ID with {patient.name.split(' ')[0]} so they can sign in to the
            patient app.
          </Text>

          <View className="flex-row flex-wrap gap-x-4 gap-y-1 pt-2">
            <Text className="font-body text-xs text-ink-700/70">Age: {patient.age}</Text>
            <Text className="font-body text-xs text-ink-700/70">Gender: {patient.gender}</Text>
            <Text className="font-body text-xs text-ink-700/70">Diet: {patient.dietaryPattern}</Text>
            <Text className="font-body text-xs text-ink-700/70">
              Activity: {patient.physicalActivityLevel}
            </Text>
            {patient.fastingGlucose ? (
              <Text className="font-body text-xs text-ink-700/70">
                Fasting glucose: {patient.fastingGlucose} mg/dL
              </Text>
            ) : null}
            {patient.hba1c ? (
              <Text className="font-body text-xs text-ink-700/70">HbA1c: {patient.hba1c}%</Text>
            ) : null}
          </View>
        </Card>
      </Reveal>

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button
            onPress={() => router.push(`/chw/patient/${patient.id}/review`)}
            icon={<FileText size={16} color="#FFFFFF" />}
            fullWidth
          >
            Review plan
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="teal"
            onPress={() => router.push(`/chw/patient/${patient.id}/monitor`)}
            icon={<Activity size={16} color="#FFFFFF" />}
            fullWidth
          >
            Monitor logs
          </Button>
        </View>
      </View>
    </ScreenScaffold>
  );
}
