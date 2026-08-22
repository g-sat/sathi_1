import { Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View className="flex-row items-center gap-2.5 rounded-2xl bg-danger-50 px-4 py-3.5">
      <AlertTriangle size={18} color="#E11D48" />
      <Text className="flex-1 font-body-medium text-sm text-danger-700">{message}</Text>
    </View>
  );
}
