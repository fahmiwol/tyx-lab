import { randomBytes } from "crypto";

type Scope = "read" | "write" | "admin";

export interface ApiKey {
  apiKeyId: string;
  partnerId: string;
  secretKey: string;
  scope: Scope;
  rateLimitPerMinute: number;
  createdAt: Date;
  rotatedAt: Date | null;
  lastUsed: Date | null;
  isActive: boolean;
}

export async function createApiKey(
  partnerId: string,
  scope: Scope = "read",
  rateLimitPerMinute: number = 100
): Promise<ApiKey> {
  const keyId = `key_${partnerId}_${Date.now()}`;
  const secret = randomBytes(32).toString("hex");
  const now = new Date();

  return {
    apiKeyId: keyId,
    partnerId,
    secretKey: secret,
    scope,
    rateLimitPerMinute,
    createdAt: now,
    rotatedAt: null,
    lastUsed: null,
    isActive: true,
  };
}

export async function rotateApiKey(key: ApiKey): Promise<ApiKey> {
  const newSecret = randomBytes(32).toString("hex");
  return {
    ...key,
    secretKey: newSecret,
    rotatedAt: new Date(),
  };
}

export async function revokeApiKey(key: ApiKey): Promise<ApiKey> {
  return {
    ...key,
    isActive: false,
  };
}
