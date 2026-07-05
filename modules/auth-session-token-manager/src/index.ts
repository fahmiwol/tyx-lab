/**
 * Auth Session Token Manager
 * In-memory session + token auth with bcrypt hashing and Express middleware
 * Version: 1.0.0
 */

import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface Session {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
  createdAt: number;
  expiresAt?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  role: string;
}

/**
 * In-memory session store
 * Token (hex string) -> Session
 */
export class SessionManager {
  private sessions = new Map<string, Session>();
  private sessionTTL: number; // milliseconds

  constructor(ttlMinutes: number = 1440) {
    // default 24 hours
    this.sessionTTL = ttlMinutes * 60 * 1000;
  }

  /**
   * Create a session and return token
   */
  createSession(userId: string, email: string, role: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const session: Session = {
      userId,
      email,
      role: role as 'user' | 'admin' | 'owner',
      createdAt: Date.now(),
      expiresAt: Date.now() + this.sessionTTL,
    };
    this.sessions.set(token, session);
    return token;
  }

  /**
   * Get session by token
   */
  getSession(token: string): Session | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  /**
   * Invalidate session
   */
  invalidateSession(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Get all active sessions (for admin tools)
   */
  getAllSessions(): { token: string; session: Session }[] {
    return Array.from(this.sessions.entries())
      .filter(([, session]) => !session.expiresAt || Date.now() < session.expiresAt)
      .map(([token, session]) => ({ token, session }));
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpired(): number {
    let count = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.sessions.delete(token);
        count++;
      }
    }
    return count;
  }
}

/**
 * Password hasher and verifier
 */
export class PasswordHasher {
  private saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

/**
 * Express middleware for token auth
 * Expects: Authorization: Bearer <token>
 */
export function createAuthMiddleware(sessionManager: SessionManager) {
  return (req: any, res: any, next: any) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const session = sessionManager.getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.session = session;
    req.token = token;
    next();
  };
}

/**
 * Express middleware for admin-only routes
 */
export function createAdminMiddleware(sessionManager: SessionManager) {
  return (req: any, res: any, next: any) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '').trim();

    const session = sessionManager.getSession(token);
    if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.session = session;
    req.token = token;
    next();
  };
}

/**
 * Utility: extract token from request header
 */
export function extractToken(req: any): string | null {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '').trim();
  return token || null;
}
