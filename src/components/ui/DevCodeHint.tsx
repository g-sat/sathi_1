import { Text, View } from 'react-native';
import { FlaskConical } from 'lucide-react-native';

/**
 * Shown only when the server couldn't actually deliver an email (e.g.
 * Resend's sandbox sender can only reach the account owner's own inbox until
 * a domain is verified) and we're not in production. Surfaces the code
 * directly so local testing is never blocked.
 */
export function DevCodeHint({ code }: { code?: string | null }) {
  if (!code) return null;
  return (
    <View className="flex-row items-center gap-2.5 rounded-2xl bg-mustard-50 px-4 py-3.5">
      <FlaskConical size={16} color="#C9740A" />
      <Text className="flex-1 font-body-medium text-xs text-mustard-700">
        Couldn't deliver the email (Resend sandbox limit) — dev code auto-filled below: {code}
      </Text>
    </View>
  );
}
