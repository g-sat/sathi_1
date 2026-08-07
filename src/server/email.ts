import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set. Add it to your .env.local file.');
    client = new Resend(apiKey);
  }
  return client;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Sathi <onboarding@resend.dev>';

/** True outside of production. Used to decide whether it's safe to echo a
 * verification/reset code back in an API response as a convenience fallback
 * (e.g. Resend's sandbox sender can only deliver to the account owner's own
 * inbox until a domain is verified, which would otherwise silently block
 * testing with any other address). */
export function isDevFallbackAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

function wrapper(title: string, bodyHtml: string): string {
  return `
  <div style="background:#F5F5F7;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:420px;margin:0 auto;background:#FFFFFF;border-radius:20px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0A84FF;">
        Sathi
      </p>
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#1D1D1F;">${title}</h1>
      ${bodyHtml}
      <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#8E8E93;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </div>`;
}

function codeBlock(code: string): string {
  return `
    <div style="margin:20px 0;text-align:center;background:#F5F5F7;border-radius:14px;padding:18px;">
      <span style="font-size:32px;font-weight:700;letter-spacing:0.3em;color:#1D1D1F;">${code}</span>
    </div>
    <p style="margin:0;font-size:13px;color:#6E6E73;">This code expires in 15 minutes.</p>
  `;
}

/**
 * Attempts to send via Resend, but never throws — registration/reset flows
 * should not hard-fail just because an email provider hiccups (and Resend's
 * sandbox sender can only deliver to the account owner's own address until a
 * domain is verified). We always log the code server-side as a fallback so
 * development/testing is never blocked, and report back whether the email
 * actually went out so the caller can decide whether to also surface the
 * code in the API response (dev-only convenience — see routes).
 */
async function trySend(to: string, subject: string, html: string, logLabel: string, code: string): Promise<boolean> {
  console.log(`[email] ${logLabel} for ${to}: ${code}`);
  try {
    const res = await getClient().emails.send({ from: FROM, to, subject, html });
    if ((res as any)?.error) {
      console.warn(`[email] Resend responded with an error for ${to}:`, (res as any).error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[email] Failed to send "${subject}" to ${to} — falling back to server log only.`, err);
    return false;
  }
}

export async function sendVerificationEmail(to: string, name: string, code: string): Promise<boolean> {
  const html = wrapper(
    'Verify your email',
    `<p style="margin:0 0 8px;font-size:15px;color:#3A3A3C;">Hi ${name}, use this code to verify your Sathi account:</p>${codeBlock(code)}`
  );
  return trySend(to, 'Verify your Sathi account', html, 'Verification code', code);
}

export async function sendPasswordResetEmail(to: string, name: string, code: string): Promise<boolean> {
  const html = wrapper(
    'Reset your password',
    `<p style="margin:0 0 8px;font-size:15px;color:#3A3A3C;">Hi ${name}, use this code to reset your Sathi password:</p>${codeBlock(code)}`
  );
  return trySend(to, 'Reset your Sathi password', html, 'Password reset code', code);
}
