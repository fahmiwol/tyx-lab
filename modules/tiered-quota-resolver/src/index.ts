import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import getDb from '@/lib/db';
import { verifyUserToken } from '@/lib/user-auth';
import { verifyToken as verifyAdminToken } from '@/lib/auth';
import { getUserByEmail } from '@/lib/auth-users';
import { deductToolCoin, TOOL_COIN_COST } from '@/lib/billing';

/**
 * Tiered quota resolver: Admin (unlimited) → Pro (500/day free + coin) →
 * Free (5/day free + coin) → Anonymous (2/day IP-based, no coin).
 */

const FREE_QUOTA = 5;      // Free users: 5/day
const PRO_QUOTA = 500;     // Pro users: 500/day
const ANON_QUOTA = 2;      // Anonymous: 2/day

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function hashIP(ip: string): string {
  return createHmac('sha256', process.env.COOKIE_SECRET ?? 'anon')
    .update(ip)
    .digest('hex')
    .slice(0, 16);
}

export type QuotaResult =
  | { allowed: true; userId: string | null; charged: boolean; tier: 'admin' | 'pro' | 'free' | 'anon' }
  | { allowed: false; reason: string };

/**
 * Resolve user: trx_admin cookie (highest priority) → trx_user cookie → anonymous
 */
async function resolveUser(): Promise<{
  userId: string | null;
  isAdmin: boolean;
  hasPro: boolean;
}> {
  const db = getDb();
  const jar = await cookies();

  // Try admin token
  try {
    const adminToken = jar.get('trx_admin')?.value;
    if (adminToken) {
      const v = verifyAdminToken(adminToken);
      if (v.valid && v.email) {
        const user = getUserByEmail(v.email);
        if (user) return { userId: user.id, isAdmin: true, hasPro: true };
        return { userId: null, isAdmin: true, hasPro: true };
      }
    }
  } catch {
    // Continue to trx_user
  }

  // Try user token
  try {
    const userToken = jar.get('trx_user')?.value;
    if (userToken) {
      const v = verifyUserToken(userToken);
      if (v.valid && v.userId) {
        const userId = v.userId;

        // Check if admin or owner
        const userRow = db
          .prepare('SELECT role_id, is_owner FROM users WHERE id = ?')
          .get(userId) as { role_id: number; is_owner: number } | undefined;

        if (userRow?.role_id === 1 || userRow?.is_owner === 1) {
          return { userId, isAdmin: true, hasPro: true };
        }

        // Check active pro license (non-demo plan)
        const proLic = db
          .prepare(
            `SELECT l.id FROM platform_licenses l
             JOIN platform_app_plans p ON l.plan_id = p.id
             WHERE l.user_id = ? AND l.status = 'active' AND p.plan_code != 'demo'
             LIMIT 1`
          )
          .get(userId);

        return { userId, isAdmin: false, hasPro: !!proLic };
      }
    }
  } catch {
    // Continue to anonymous
  }

  return { userId: null, isAdmin: false, hasPro: false };
}

/**
 * Check quota and optionally deduct coins.
 * Returns { allowed: true, ... } or { allowed: false, reason: '...' }
 */
export async function checkAndChargeQuota(
  toolSlug: string,
  clientIp: string
): Promise<QuotaResult> {
  const db = getDb();
  const today = todayISO();
  const { userId, isAdmin, hasPro } = await resolveUser();

  // ─── ADMIN: unlimited ───────────────────────────────────────────────────
  if (isAdmin) {
    if (userId) {
      try {
        db.prepare(
          `INSERT INTO tool_usage (user_id, tool_slug, usage_date, count)
           VALUES (?, ?, ?, 1)
           ON CONFLICT(user_id, tool_slug, usage_date)
           DO UPDATE SET count = count + 1`
        ).run(userId, toolSlug, today);
      } catch {
        // Non-fatal
      }
    }
    return { allowed: true, userId, charged: false, tier: 'admin' };
  }

  // ─── LOGGED-IN USER: free or pro tier ──────────────────────────────────
  if (userId) {
    const dailyLimit = hasPro ? PRO_QUOTA : FREE_QUOTA;

    const row = db
      .prepare(
        'SELECT count FROM tool_usage WHERE user_id = ? AND tool_slug = ? AND usage_date = ?'
      )
      .get(userId, toolSlug, today) as { count: number } | undefined;

    const used = row?.count ?? 0;

    // Within free quota
    if (used < dailyLimit) {
      db.prepare(
        `INSERT INTO tool_usage (user_id, tool_slug, usage_date, count)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(user_id, tool_slug, usage_date)
         DO UPDATE SET count = count + 1`
      ).run(userId, toolSlug, today);
      return { allowed: true, userId, charged: false, tier: hasPro ? 'pro' : 'free' };
    }

    // Over quota: try coin deduction
    const cost = TOOL_COIN_COST[toolSlug];
    if (!cost) {
      // No cost defined, allow free
      return { allowed: true, userId, charged: false, tier: hasPro ? 'pro' : 'free' };
    }

    const ok = await deductToolCoin(userId, toolSlug);
    if (!ok) {
      const msg = hasPro
        ? 'Daily quota exceeded. Insufficient coins.'
        : 'Daily free quota exceeded. Purchase coins or upgrade to Pro.';
      return { allowed: false, reason: msg };
    }

    db.prepare(
      `INSERT INTO tool_usage (user_id, tool_slug, usage_date, count)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(user_id, tool_slug, usage_date)
       DO UPDATE SET count = count + 1`
    ).run(userId, toolSlug, today);

    return { allowed: true, userId, charged: true, tier: hasPro ? 'pro' : 'free' };
  }

  // ─── ANONYMOUS: IP-based, 2/day, no coin support ────────────────────────
  const ipHash = hashIP(clientIp);
  const anonRow = db
    .prepare(
      'SELECT count FROM tool_usage_anon WHERE ip_hash = ? AND tool_slug = ? AND usage_date = ?'
    )
    .get(ipHash, toolSlug, today) as { count: number } | undefined;

  const anonUsed = anonRow?.count ?? 0;

  if (anonUsed >= ANON_QUOTA) {
    return { allowed: false, reason: 'Daily quota exceeded. Sign up free for 5/day.' };
  }

  db.prepare(
    `INSERT INTO tool_usage_anon (ip_hash, tool_slug, usage_date, count)
     VALUES (?, ?, ?, 1)
     ON CONFLICT(ip_hash, tool_slug, usage_date)
     DO UPDATE SET count = count + 1`
  ).run(ipHash, toolSlug, today);

  return { allowed: true, userId: null, charged: false, tier: 'anon' };
}
