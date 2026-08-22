import { connectDB } from '@/server/db';
import { User } from '@/server/models/User';
import { jsonError, safeJson } from '@/server/http';
import { verifyPassword } from '@/server/auth';
import { buildAuthPayload } from '@/server/authResponse';

// POST /api/auth/login — { role, email, password }
export async function POST(request: Request) {
  await connectDB();
  const body = await safeJson(request);
  const role = body.role === 'chw' ? 'chw' : body.role === 'patient' ? 'patient' : null;
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  if (!role) return jsonError(400, 'A role is required.');
  if (!email || !password) return jsonError(400, 'Email and password are required.');

  const user = await User.findOne({ email, role }).select('+passwordHash');
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return jsonError(401, 'Incorrect email or password.');
  }

  if (!user.emailVerified) {
    return jsonError(403, 'Please verify your email before signing in.', { unverified: true, email });
  }

  const payload = await buildAuthPayload(user);
  return Response.json(payload);
}
