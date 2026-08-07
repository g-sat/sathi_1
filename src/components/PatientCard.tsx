import { Pressable, Text, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { PatientProfileDTO } from '@/types';

interface PatientCardProps {
  patient: PatientProfileDTO & { reportStatus?: string };
  onPress: () => void;
}

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const status = patient.reportStatus ?? 'none';
  return (
    <Pressable onPress={onPress}>
      <Card className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <Text className="font-display text-lg text-teal-700">{patient.name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-body-semibold text-base text-ink-800">{patient.name}</Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color="#7ED4E0" />
            <Text className="font-body text-xs text-ink-700/80">
              {patient.state}, {patient.region} · {patient.localLanguage}
            </Text>
          </View>
          <Text className="font-mono text-xs text-ink-700/60">{patient.patientId}</Text>
        </View>
        <View className="items-end gap-2">
          <Badge tone={status === 'published' ? 'published' : status === 'draft' ? 'draft' : 'neutral'}>
            {status === 'none' ? 'No plan yet' : status}
          </Badge>
          <ChevronRight size={18} color="#1C1C1E" />
        </View>
      </Card>
    </Pressable>
  );
}
