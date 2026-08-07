import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { isCodeExpired } from '@/server/auth';
import { buildAuthPayload } from '@/server/authResponse';

// POST /api/auth/verify — { role, email, code } confirms the 6-digit code
// sent by email, marks the account verified, and signs the user in.
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);
  const role = body.role === 'chw' ? 'chw' : body.role === 'patient' ? 'patient' : null;
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const code = String(body.code || '').trim();

  if (!role) return jsonError(400, 'A role is required.');
  if (!email || !code) return jsonError(400, 'Email and code are required.');

  const user = await User.findOne({ email, role }).select('+verificationCode +verificationCodeExpires');
  if (!user) return jsonError(404, 'No account found for that email.');

  if (user.emailVerified) {
    const payload = await buildAuthPayload(user);
    return Response.json(payload);
  }

  if (!user.verificationCode || user.verificationCode !== code) {
    return jsonError(400, 'That code is incorrect.');
  }
  if (isCodeExpired(user.verificationCodeExpires)) {
    return jsonError(400, 'That code has expired. Request a new one.');
  }

  user.emailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  const payload = await buildAuthPayload(user);
  return Response.json(payload);
}
