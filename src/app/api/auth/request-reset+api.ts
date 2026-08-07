import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { codeExpiry, generateNumericCode } from '@/server/auth';
import { isDevFallbackAllowed, sendPasswordResetEmail } from '@/server/email';

// POST /api/auth/request-reset — { role, email } sends a 6-digit reset code.
// Always responds with 200 (even if no account exists) so we don't leak
// which emails are registered.
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
