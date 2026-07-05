import { createHash } from "crypto";

type BurnReason = "redemption" | "penalty" | "expiry" | "admin_purge";
type Denomination = "GOLD" | "SILVER" | "BRONZE" | "DIAMOND";

export interface BurnEvent {
  burnEventId: string;
  coinId: string;
  denomination: Denomination;
  burnReason: BurnReason;
  authorizerUserId: string;
  burnedAt: Date;
  previousWalletId: string;
  burnSignature: string;
  auditHash: string;
}

export async function recordBurnEvent(
  coinId: string,
  denomination: Denomination,
  burnReason: BurnReason,
  authorizerUserId: string,
  previousWalletId: string
): Promise<BurnEvent> {
  const eventId = `BURN_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const timestamp = new Date();
  const payload = `${coinId}|${denomination}|${burnReason}|${authorizerUserId}|${timestamp.toISOString()}`;
  const signature = createHash("sha256").update(payload).digest("hex");
  const auditHash = createHash("sha256").update(`${eventId}|${signature}`).digest("hex");

  return {
    burnEventId: eventId,
    coinId,
    denomination,
    burnReason,
    authorizerUserId,
    burnedAt: timestamp,
    previousWalletId,
    burnSignature: signature,
    auditHash,
  };
}

export async function verifyBurnEventIntegrity(event: BurnEvent): Promise<boolean> {
  const payload = `${event.coinId}|${event.denomination}|${event.burnReason}|${event.authorizerUserId}|${event.burnedAt.toISOString()}`;
  const expectedSig = createHash("sha256").update(payload).digest("hex");
  return expectedSig === event.burnSignature;
}
