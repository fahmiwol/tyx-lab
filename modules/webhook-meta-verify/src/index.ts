/**
 * Meta Cloud API webhook verification and signature validation.
 *
 * Why: WhatsApp/Meta webhooks require challenge-response verification and signature
 * checking. This atomic pattern safely validates webhook authenticity before processing.
 *
 * Usage:
 *   constructor(private config: ConfigService) {}
 *   @Get()
 *   verify(@Query("hub.mode") mode, @Query("hub.verify_token") token, @Query("hub.challenge") challenge) {
 *     const verifier = new MetaWebhookVerifier(this.config.get("meta.verifyToken"));
 *     return verifier.verify(mode, token, challenge);
 *   }
 */

export class MetaWebhookVerifier {
  constructor(private readonly expectedToken: string) {}

  /**
   * Verify Meta webhook challenge-response (OAuth 2.0 pattern).
   * Returns challenge string if valid, throws if invalid.
   */
  verify(mode: string, token: string, challenge: string): string {
    if (mode !== "subscribe") {
      throw new Error("Invalid mode");
    }
    if (!token || token !== this.expectedToken) {
      throw new Error("Invalid verify token");
    }
    if (!challenge) {
      throw new Error("Missing challenge");
    }
    return challenge;
  }

  /**
   * Verify webhook X-Hub-Signature header (HMAC-SHA256).
   * Compares signature with request body hash.
   */
  verifySignature(
    rawBody: Buffer,
    headerSignature: string,
    appSecret: string,
  ): boolean {
    if (!headerSignature || !headerSignature.startsWith("sha256=")) {
      return false;
    }
    const crypto = require("crypto");
    const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
    return expected === headerSignature;
  }
}
