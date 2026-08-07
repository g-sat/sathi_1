import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { codeExpiry, generateNumericCode, hashPassword, isStrongEnoughPassword } from '@/server/auth';
import { isDevFallbackAllowed, sendVerificationEmail } from '@/server/email';

// POST /api/auth/chw/register — a Community Health Worker creates a brand
// new account with name + email + password, then must verify their email
// with a 6-digit code before they can sign in.
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);

  const name = String(body.name || '').trim();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  if (!name) return jsonError(400, 'Full name is required.');
  if (!email || !email.includes('@')) return jsonError(400, 'A valid email is required.');
  if (!isStrongEnoughPassword(password)) {
    return jsonError(400, 'Password must be at least 8 characters.');
  }

  const existing = await User.findOne({ email, role: 'chw' });
  if (existing) {
    return jsonError(409, 'An account with that email already exists. Try signing in instead.');
  }

  const passwordHash = await hashPassword(password);
  const verificationCode = generateNumericCode();
  const verificationCodeExpires = codeExpiry();

  await User.create({
    role: 'chw',
    name,
    email,
    passwordHash,
    emailVerified: false,
    verificationCode,
    verificationCodeExpires,
  });

  const delivered = await sendVerificationEmail(email, name, verificationCode);

  // Resend's sandbox sender can only deliver to the account owner's own
  // inbox until a domain is verified — echo the code back outside of
  // production so testing with any address isn't silently blocked.
  const devCode = !delivered && isDevFallbackAllowed() ? verificationCode : undefined;

  return Response.json({ email, devCode }, { status: 201 });
}
