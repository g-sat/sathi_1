import { createHmac, randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { jsonError } from './http';

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function isStrongEnoughPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}

// ---------------------------------------------------------------------------
// One-time codes (email verification / password reset)
// ---------------------------------------------------------------------------

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function generateNumericCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) code += randomInt(0, 10).toString();
  return code;
}

export function codeExpiry(): Date {
  return new Date(Date.now() + CODE_TTL_MS);
}

export function isCodeExpired(expires: Date | null | undefined): boolean {
  if (!expires) return true;
  return Date.now() > new Date(expires).getTime();
}

// ---------------------------------------------------------------------------
// Session tokens — stateless, HMAC-signed (no external JWT dependency).
// Format: base64url(json payload) + "." + base64url(hmac-sha256 signature)
// ---------------------------------------------------------------------------

const SESSION_SECRET = process.env.APP_SESSION_SECRET;
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  if (!SESSION_SECRET) {
    throw new Error('APP_SESSION_SECRET is not set. Add it to your .env.local file.');
  }
  return SESSION_SECRET;
}

export interface SessionPayload {
  sub: string; // User _id
  role: 'chw';
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const full: SessionPayload = { ...payload, exp: Date.now() + TOKEN_TTL_MS };
  const body = Buffer.from(JSON.stringify(full)).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | null | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expectedSig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Throws an AuthError (catch with `authErrorResponse`) if there is no valid session. */
export function requireSession(request: Request, role?: 'chw'): SessionPayload {
  const session = verifySessionToken(getBearerToken(request));
  if (!session) throw new AuthError(401, 'Your session has expired. Please sign in again.');
  if (role && session.role !== role) throw new AuthError(403, 'You are not authorized to do that.');
  return session;
}

/** Wraps `requireSession` so route handlers can `return` a JSON error in one line. */
export function withSession(
  request: Request,
  role?: 'chw'
): { session: SessionPayload; error?: undefined } | { session?: undefined; error: Response } {
  try {
    return { session: requireSession(request, role) };
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 401;
    const message = err instanceof Error ? err.message : 'Not authenticated.';
    return { error: jsonError(status, message) };
  }
}
