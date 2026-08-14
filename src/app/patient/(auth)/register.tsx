import { useState } from 'react';
import { Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { ScreenScaffold } from '@/components/ui/ScreenScaffold';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { api } from '@/lib/api';

export default function PatientRegister() {
  const [patientId, setPatientId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister() {
    setError(null);
    if (!patientId.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { email: registeredEmail, devCode } = await api.registerPatient(patientId.trim(), email.trim(), password);
      router.replace({ pathname: '/patient/verify', params: { email: registeredEmail, devCode } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScaffold contentClassName="pt-6">
      <ScreenHeader
        eyebrow="Patient sign-up"
        title="Set up your account"
        subtitle="Use the Patient ID your Community Health Worker gave you"
        showBack
      />
      <Card className="mt-6 gap-4">
        <Input
          label="Patient ID"
          value={patientId}
          onChangeText={setPatientId}
          placeholder="e.g. SATHI-4821"
          autoCapitalize="characters"
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          secureTextEntry
        />
        <Input
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter your password"
          secureTextEntry
        />
        <ErrorBanner message={error} />
        <Button onPress={handleRegister} loading={loading} icon={<UserPlus size={16} color="#FFFFFF" />} fullWidth>
          Create account
        </Button>
        <View className="flex-row justify-center gap-1 pt-1">
          <Text className="font-body text-sm text-ink-700/70">Already set up?</Text>
          <Link href="/patient/login">
            <Text className="font-body-semibold text-sm text-teal-600">Sign in</Text>
          </Link>
        </View>
      </Card>
    </ScreenScaffold>
  );
}
