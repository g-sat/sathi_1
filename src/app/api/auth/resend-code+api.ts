import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { codeExpiry, generateNumericCode } from '@/server/auth';
import { isDevFallbackAllowed, sendVerificationEmail } from '@/server/email';

// POST /api/auth/resend-code — { role, email } issues a fresh verification
// code if the account hasn't been verified yet.
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);
  const role = body.role === 'chw' ? 'chw' : body.role === 'patient' ? 'patient' : null;
  const email = String(body.email || '')
    .trim()
    .toLowerCase();

  if (!role) return jsonError(400, 'A role is required.');
  if (!email) return jsonError(400, 'Email is required.');

  const user = await User.findOne({ email, role });
  if (!user) return jsonError(404, 'No account found for that email.');
  if (user.emailVerified) return jsonError(400, 'This account is already verified.');

  const verificationCode = generateNumericCode();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = codeExpiry();
  await user.save();

  const delivered = await sendVerificationEmail(email, user.name, verificationCode);
  const devCode = !delivered && isDevFallbackAllowed() ? verificationCode : undefined;

  return Response.json({ ok: true, devCode });
}
