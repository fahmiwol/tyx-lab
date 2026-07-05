// from a production ledger service src/lib/audit.ts
import { recordUserAudit, auditMetaFromRequest } from "./audit";

// In a route handler
export async function POST(req: FastifyRequest) {
  const { ip, userAgent } = auditMetaFromRequest(req);
  
  try {
    // ... business logic ...
    await recordUserAudit({
      userId: "user_123",
      username: "fahmi",  // cache this
      action: "user.transfer",
      amount: 500,
      denom: "SILVER",
      txId: "tx_abc",
      payload: { from: "wallet_1", to: "wallet_2" },
      ip,
      userAgent,
    });
  } catch (e) {
    // Audit failure does NOT crash the request
    console.error("[AUDIT FAIL]", e.message);
  }
}