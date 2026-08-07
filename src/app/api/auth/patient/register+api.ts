import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { PatientProfile } from '@/server/models/PatientProfile';
import { jsonError, safeJson } from '@/server/http';
import { codeExpiry, generateNumericCode, hashPassword, isStrongEnoughPassword } from '@/server/auth';
import { isDevFallbackAllowed, sendVerificationEmail } from '@/server/email';

// POST /api/auth/patient/register — a patient "claims" the account their CHW
// pre-created for them during onboarding. They prove they have the Patient
// ID (shared by their CHW) and then set their own email + password, which
// must be verified via a 6-digit code before they can sign in.
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);

  const patientId = String(body.patientId || '')
    .trim()
    .toUpperCase();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  if (!patientId) return jsonError(400, 'Patient ID is required.');
  if (!email || !email.includes('@')) return jsonError(400, 'A valid email is required.');
  if (!isStrongEnoughPassword(password)) {
    return jsonError(400, 'Password must be at least 8 characters.');
  }

  const patient = await PatientProfile.findOne({ patientId });
  if (!patient) return jsonError(404, 'No patient found with that ID. Check with your CHW.');

  const user = await User.findById(patient.userId).select('+passwordHash');
  if (!user) return jsonError(404, 'No account found for that Patient ID. Check with your CHW.');
  if (user.passwordHash) {
    return jsonError(409, 'This Patient ID has already been registered. Try signing in instead.');
  }

  const emailInUse = await User.findOne({ email, _id: { $ne: user._id } });
  if (emailInUse) {
    return jsonError(409, 'That email is already in use by another account.');
  }

  const passwordHash = await hashPassword(password);
  const verificationCode = generateNumericCode();

  user.email = email;
  user.passwordHash = passwordHash;
  user.emailVerified = false;
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = codeExpiry();
  await user.save();

  const delivered = await sendVerificationEmail(email, user.name, verificationCode);
  const devCode = !delivered && isDevFallbackAllowed() ? verificationCode : undefined;

  return Response.json({ email, devCode }, { status: 201 });
}
