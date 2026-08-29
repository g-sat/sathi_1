import { Pressable, Text, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Badge } from '@/components/ui/Badge';
import type { PatientProfileDTO } from '@/types';

interface PatientCardProps {
  patient: PatientProfileDTO & { reportStatus?: string };
  onPress: () => void;
  isLast?: boolean;
}

export function PatientCard({ patient, onPress, isLast }: PatientCardProps) {
  const status = patient.reportStatus ?? 'none';
  return (
    <Pressable onPress={onPress}>
      <View
        className={`flex-row items-center gap-3 px-4 py-3.5 ${isLast ? '' : 'border-b border-cream-300'}`}
      >
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
          <Text className="font-display text-sm text-teal-700">{patient.name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="font-body-semibold text-sm text-ink-800">{patient.name}</Text>
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color="#0891B2" />
            <Text className="font-body text-xs text-ink-700/70">
              {patient.state}, {patient.region} · {patient.localLanguage}
            </Text>
          </View>
        </View>
        <Text className="hidden font-mono text-xs text-ink-700/50 sm:flex">{patient.patientId}</Text>
        <Badge tone={status === 'published' ? 'published' : status === 'draft' ? 'draft' : 'neutral'}>
          {status === 'none' ? 'No plan' : status}
        </Badge>
        <ChevronRight size={16} color="#94A3B8" />
      </View>
    </Pressable>
  );
}
