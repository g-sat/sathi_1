import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { codeExpiry, generateNumericCode } from '@/server/auth';
import { isDevFallbackAllowed, sendPasswordResetEmail } from '@/server/email';

// POST /api/auth/request-reset — { email } sends a 6-digit reset code.
// Always responds with 200 (even if no account exists) to avoid leaking
// which emails are registered.
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);
  const email = String(body.email || '').trim().toLowerCase();

  if (!email) return jsonError(400, 'Email is required.');

  const user = await User.findOne({ email, role: 'chw' });
  let devCode: string | undefined;
  if (user) {
    const resetCode = generateNumericCode();
    user.resetCode = resetCode;
    user.resetCodeExpires = codeExpiry();
    await user.save();
    const delivered = await sendPasswordResetEmail(email, user.name, resetCode);
    devCode = !delivered && isDevFallbackAllowed() ? resetCode : undefined;
  }

  return Response.json({ ok: true, devCode });
}
