import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Response, Request } from "express";

export interface AuthConfig {
  jwtSecret: string;
  accessTokenExpiry: number; // seconds (default: 3600)
  refreshTokenExpiry: number; // seconds (default: 604800)
  cookieSecure: boolean;
  cookieSameSite: "lax" | "strict" | "none";
  cookieHttpOnly: boolean;
}

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT Authentication Service with cookie management.
 */
export class AuthService {
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Hash password with bcrypt.
   */
  hashPassword(plainPassword: string): string {
    return bcrypt.hashSync(plainPassword, 10);
  }

  /**
   * Verify password against hash.
   */
  verifyPassword(plainPassword: string, hash: string): boolean {
    return bcrypt.compareSync(plainPassword, hash);
  }

  /**
   * Create access token (short-lived).
   */
  createAccessToken(user: UserPayload): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      },
      this.config.jwtSecret,
      {
        expiresIn: this.config.accessTokenExpiry,
        algorithm: "HS256",
      }
    );
  }

  /**
   * Create refresh token (long-lived).
   */
  createRefreshToken(userId: string): string {
    return jwt.sign(
      {
        sub: userId,
        type: "refresh",
      },
      this.config.jwtSecret,
      {
        expiresIn: this.config.refreshTokenExpiry,
        algorithm: "HS256",
      }
    );
  }

  /**
   * Set auth tokens in cookies.
   */
  setAuthCookies(response: Response, tokens: TokenPair): void {
    const maxAge = this.config.accessTokenExpiry * 1000; // milliseconds

    response.cookie("access_token", tokens.accessToken, {
      maxAge,
      httpOnly: this.config.cookieHttpOnly,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      path: "/",
    });

    response.cookie("refresh_token", tokens.refreshToken, {
      maxAge: this.config.refreshTokenExpiry * 1000,
      httpOnly: this.config.cookieHttpOnly,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      path: "/",
    });
  }

  /**
   * Clear auth cookies (logout).
   */
  clearAuthCookies(response: Response): void {
    response.clearCookie("access_token", { path: "/" });
    response.clearCookie("refresh_token", { path: "/" });
  }

  /**
   * Verify access token.
   */
  verifyAccessToken(token: string): UserPayload | null {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret) as any;
      if (payload.type !== "access") return null;
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    } catch {
      return null;
    }
  }

  /**
   * Verify refresh token.
   */
  verifyRefreshToken(token: string): string | null {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret) as any;
      if (payload.type !== "refresh") return null;
      return payload.sub; // Return user ID
    } catch {
      return null;
    }
  }

  /**
   * Extract token from request (cookie or Authorization header).
   */
  extractAccessToken(request: Request): string | null {
    // Try cookie first
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }

    // Try Authorization header
    const auth = request.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      return auth.slice(7);
    }

    return null;
  }

  /**
   * Middleware: verify current user from request.
   */
  async getCurrentUser(request: Request): Promise<UserPayload> {
    const token = this.extractAccessToken(request);
    if (!token) {
      throw new Error("Unauthorized: No token found");
    }

    const user = this.verifyAccessToken(token);
    if (!user) {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    return user;
  }
}
