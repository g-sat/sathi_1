import { PatientProfile } from './models/PatientProfile';
import { createSessionToken } from './auth';
import { serializePatient, serializeUser } from './serialize';

/** Builds the { token, user } or { token, patient } payload returned after a
 * successful verify/login, embedding the right IDs into the session token. */
export async function buildAuthPayload(user: any) {
  if (user.role === 'chw') {
    const token = createSessionToken({ sub: String(user._id), role: 'chw' });
    return { token, user: serializeUser(user) };
  }

  const patient = await PatientProfile.findOne({ userId: user._id }).lean();
  const token = createSessionToken({
    sub: String(user._id),
    role: 'patient',
    patientProfileId: patient ? String(patient._id) : undefined,
  });
  return { token, patient: patient ? serializePatient(patient) : null };
}
