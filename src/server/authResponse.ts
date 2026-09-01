import { createSessionToken } from './auth';
import { serializeUser } from './serialize';

/** Builds the { token, user } payload returned after a successful login/verify. */
export async function buildAuthPayload(user: any) {
  const token = createSessionToken({ sub: String(user._id), role: 'chw' });
  return { token, user: serializeUser(user) };
}
