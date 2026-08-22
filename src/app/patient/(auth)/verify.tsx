import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MailCheck, ShieldCheck } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { DevCodeHint } from '@/components/ui/DevCodeHint';
import { useSession } from '@/context/SessionContext';
import { api } from '@/lib/api';

export default function PatientVerify() {
  const { email: emailParam, devCode: devCodeParam } = useLocalSearchParams<{ email: string; devCode?: string }>();
  const { signInPatient } = useSession();
  const [code, setCode] = useState(devCodeParam || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [devCode, setDevCode] = useState(devCodeParam || '');

  const email = emailParam || '';

  async function handleVerify() {
    setError(null);
    if (code.trim().length !== 6) {
      setError('Enter the 6-digit code we emailed you.');
      return;
    }
    setLoading(true);
    try {
      const { patient, token } = await api.verifyEmail('patient', email, code.trim());
      if (patient && token) {
        await signInPatient(patient, token);
        router.replace('/patient/home');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResending(true);
    try {
      const { devCode: freshCode } = await api.resendCode('patient', email);
      if (freshCode) {
        setDevCode(freshCode);
        setCode(freshCode);
      }
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <ScreenScaffold contentClassName="pt-6">
      <ScreenHeader eyebrow="Verify your email" title="Check your inbox" showBack fallbackHref="/patient/login" />
      <Card className="mt-6 gap-4">
        <View className="items-center gap-2 py-2">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <MailCheck size={26} color="#2563EB" />
          </View>
          <Text className="text-center font-body text-sm text-ink-700/80">
            We sent a 6-digit code to{'\n'}
            <Text className="font-body-semibold text-ink-800">{email}</Text>
          </Text>
        </View>
        <Input
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
        />
        <DevCodeHint code={devCode} />
        <ErrorBanner message={error} />
        <Button onPress={handleVerify} loading={loading} icon={<ShieldCheck size={16} color="#FFFFFF" />} fullWidth>
          Verify &amp; continue
        </Button>
        <Button variant="ghost" onPress={handleResend} loading={resending} fullWidth>
          {resent ? 'Code resent!' : "Didn't get a code? Resend"}
        </Button>
      </Card>
    </ScreenScaffold>
  );
}
