import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useSession } from '@/context/SessionContext';
import { api, ApiError } from '@/lib/api';

export default function PatientLogin() {
  const { signInPatient } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { patient, token } = await api.login('patient', email.trim(), password);
      if (patient && token) {
        await signInPatient(patient, token);
        router.replace('/patient/home');
      }
    } catch (e) {
      if (e instanceof ApiError && (e.payload as any)?.unverified) {
        router.push({ pathname: '/patient/verify', params: { email: email.trim() } });
        return;
      }
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScaffold contentClassName="pt-6">
      <ScreenHeader eyebrow="Patient sign-in" title="Welcome back" showBack />
      <Card className="mt-6 gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />
        <Link href="/patient/forgot-password" className="self-end">
          <Text className="font-body-medium text-sm text-teal-600">Forgot password?</Text>
        </Link>
        <ErrorBanner message={error} />
        <Button onPress={handleContinue} loading={loading} icon={<LogIn size={16} color="#FFFFFF" />} fullWidth>
          Sign in
        </Button>
        <View className="flex-row justify-center gap-1 pt-1">
          <Text className="font-body text-sm text-ink-700/70">Have a Patient ID from your CHW?</Text>
          <Link href="/patient/register">
            <Text className="font-body-semibold text-sm text-teal-600">Set up your account</Text>
          </Link>
        </View>
      </Card>
    </ScreenScaffold>
  );
}
