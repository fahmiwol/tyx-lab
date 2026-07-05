import { cookies } from 'next/headers';
import crypto from 'node:crypto';

/**
 * Minimal session cookie auth — HMAC-SHA256 signed tokens.
 * No external library (Auth.js, etc.). Payload format: base64(json).signature
 *
 * Usage:
 *   const token = encodeSession('user-123');  // 'eyJ...Ig.abc123...'
 *   const payload = decodeSession(token);     // { userId: 'user-123', exp: ... }
 *   setSessionCookie('user-123');             // Sets httpOnly cookie
 *   const userId = getCurrentUserId();        // 'user-123' or null
 */

const COOKIE_NAME = 'hub_session';
const SECRET = process.env.HUB_SESSION_SECRET ?? 'dev-secret-change-me';
const TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

export interface SessionPayload {
  userId: string;
  exp: number; // Unix timestamp (seconds)
}

/**
 * Sign a payload with HMAC-SHA256.
 */
function sign(payload: string): string {
  return crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('base64url');
}

/**
 * Encode { userId, exp } as base64.signature
 */
export function encodeSession(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };

  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(body);

  return `${body}.${sig}`;
}

/**
 * Decode and verify base64.signature token.
 * Returns null if invalid, expired, or tampered.
 */
export function decodeSession(token: string): SessionPayload | null {
  const parts = token.split('.');
  const [body, sig] = parts;

  if (!body || !sig || parts.length !== 2) {
    return null;
  }

  // Verify signature
  if (sign(body) !== sig) {
    return null; // Tampered or wrong secret
  }

  // Decode payload
  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString()
    ) as SessionPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null; // Invalid JSON or buffer decode error
  }
}

/**
 * Set session cookie for the given user.
 * Stores in httpOnly, secure, sameSite=lax cookie.
 */
export async function setSessionCookie(userId: string) {
  const c = await cookies();
  const token = encodeSession(userId);

  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_SECONDS,
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSessionCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

/**
 * Get current user ID from session cookie.
 * Returns null if not set, invalid, or expired.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  const payload = decodeSession(raw);
  return payload?.userId ?? null;
}
