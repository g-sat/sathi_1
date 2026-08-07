import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setAuthToken } from '@/lib/api';
import type { PatientProfileDTO, UserDTO } from '@/types';

const STORAGE_KEY = 'sathi.session.v2';

interface ChwSession {
  role: 'chw';
  user: UserDTO;
  token: string;
}

interface PatientSession {
  role: 'patient';
  patient: PatientProfileDTO;
  token: string;
}

export type Session = ChwSession | PatientSession | null;

interface SessionContextValue {
  session: Session;
  isLoading: boolean;
  signInChw: (user: UserDTO, token: string) => Promise<void>;
  signInPatient: (patient: PatientProfileDTO, token: string) => Promise<void>;
  updatePatient: (patient: PatientProfileDTO) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as Session;
          setSession(parsed);
          setAuthToken(parsed?.token ?? null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (next: Session) => {
    setSession(next);
    setAuthToken(next?.token ?? null);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading,
      signInChw: (user, token) => persist({ role: 'chw', user, token }),
      signInPatient: (patient, token) => persist({ role: 'patient', patient, token }),
      updatePatient: (patient) =>
        persist(session?.role === 'patient' ? { role: 'patient', patient, token: session.token } : session),
      signOut: () => persist(null),
    }),
    [session, isLoading, persist]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
