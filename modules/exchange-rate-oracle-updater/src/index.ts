import { createHmac } from "crypto";

type Source = "external_api" | "manual_entry" | "governance_vote";
type DenominationPair = "GOLD/IDR" | "SILVER/IDR" | "BRONZE/IDR" | "DIAMOND/IDR";

export interface RateUpdate {
  rateId: string;
  pair: DenominationPair;
  rate: number;
  source: Source;
  previousRate: number | null;
  oracleOperatorId: string;
  effectiveAt: Date;
  staleAfterMs: number;
  oracleSignature: string;
}

const STALE_THRESHOLD_MS = 300000;

export async function updateExchangeRate(
  pair: DenominationPair,
  rate: number,
  source: Source,
  oracleOperatorId: string,
  previousRate: number | null = null,
  secret: string = ""
): Promise<RateUpdate> {
  const rateId = `RATE_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const now = new Date();
  const payload = `${pair}|${rate}|${oracleOperatorId}|${now.toISOString()}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  return {
    rateId,
    pair,
    rate,
    source,
    previousRate,
    oracleOperatorId,
    effectiveAt: now,
    staleAfterMs: STALE_THRESHOLD_MS,
    oracleSignature: signature,
  };
}

export function isRateStale(update: RateUpdate): boolean {
  const age = Date.now() - update.effectiveAt.getTime();
  return age > update.staleAfterMs;
}
