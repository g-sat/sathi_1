import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { hashPassword, isCodeExpired, isStrongEnoughPassword } from '@/server/auth';

// POST /api/auth/reset-password — { role, email, code, newPassword }
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);
  const role = body.role === 'chw' ? 'chw' : body.role === 'patient' ? 'patient' : null;
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const code = String(body.code || '').trim();
  const newPassword = String(body.newPassword || '');

  if (!role) return jsonError(400, 'A role is required.');
  if (!email || !code) return jsonError(400, 'Email and code are required.');
  if (!isStrongEnoughPassword(newPassword)) {
    return jsonError(400, 'Password must be at least 8 characters.');
  }

  const user = await User.findOne({ email, role }).select('+resetCode +resetCodeExpires');
  if (!user || !user.resetCode || user.resetCode !== code) {
    return jsonError(400, 'That code is incorrect.');
  }
  if (isCodeExpired(user.resetCodeExpires)) {
    return jsonError(400, 'That code has expired. Request a new one.');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  // Verifying a reset code proves ownership of the inbox, same as email
  // verification would.
  user.emailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  return Response.json({ ok: true });
}
