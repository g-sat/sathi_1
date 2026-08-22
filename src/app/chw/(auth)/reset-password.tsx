import { useState } from 'react';
import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { DevCodeHint } from '@/components/ui/DevCodeHint';
import { api } from '@/lib/api';

export default function ChwResetPassword() {
  const { email: emailParam, devCode } = useLocalSearchParams<{ email: string; devCode?: string }>();
  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState(devCode || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || code.trim().length !== 6 || newPassword.length < 8) {
      setError('Enter your email, the 6-digit code, and a new password (min. 8 characters).');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword('chw', email.trim(), code.trim(), newPassword);
      setDone(true);
      setTimeout(() => router.replace('/chw/login'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScaffold contentClassName="pt-6">
      <ScreenHeader eyebrow="Reset password" title="Set a new password" showBack fallbackHref="/chw/login" />
      <Card className="mt-6 gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@clinic.org"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Reset code" value={code} onChangeText={setCode} placeholder="000000" keyboardType="number-pad" maxLength={6} />
        <Input
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 8 characters"
          secureTextEntry
        />
        <DevCodeHint code={devCode} />
        <ErrorBanner message={error} />
        <Button onPress={handleSubmit} loading={loading} icon={<ShieldCheck size={16} color="#FFFFFF" />} fullWidth>
          {done ? 'Password updated!' : 'Update password'}
        </Button>
        <Text className="text-center font-body text-xs text-ink-700/60">
          Didn't get a code? Go back and request a new one.
        </Text>
      </Card>
    </ScreenScaffold>
  );
}
