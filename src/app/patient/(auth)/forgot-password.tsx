import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { api } from '@/lib/api';

export default function PatientForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const { devCode } = await api.requestPasswordReset('patient', email.trim());
      router.replace({ pathname: '/patient/reset-password', params: { email: email.trim(), devCode } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScaffold contentClassName="pt-6">
      <ScreenHeader
        eyebrow="Reset password"
        title="Forgot your password?"
        subtitle="We'll email you a reset code"
        showBack
        fallbackHref="/patient/login"
      />
      <Card className="mt-6 gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <ErrorBanner message={error} />
        <Button onPress={handleSubmit} loading={loading} icon={<KeyRound size={16} color="#FFFFFF" />} fullWidth>
          Send reset code
        </Button>
        <Text className="text-center font-body text-xs text-ink-700/60">
          If an account exists for that email, a code is on its way.
        </Text>
      </Card>
    </ScreenScaffold>
  );
}
