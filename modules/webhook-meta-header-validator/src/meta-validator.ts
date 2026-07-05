import * as crypto from "crypto";

/**
 * Meta Webhook Signature Validator
 * Validates HMAC-SHA256 signatures from Meta Cloud API webhooks.
 */
export class MetaWebhookValidator {
  private appSecret: string;

  constructor(appSecret: string) {
    this.appSecret = appSecret;
  }

  /**
   * Validate webhook signature.
   * 
   * @param rawBody Raw request body (Buffer or string, must not be parsed)
   * @param signature X-Hub-Signature-256 header value (format: "sha256=<hex>")
   * @returns { isValid: boolean, error?: string }
   */
  validate(rawBody: Buffer | string, signature: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!signature) {
      return { isValid: false, error: "Missing X-Hub-Signature-256 header" };
    }

    if (!signature.startsWith("sha256=")) {
      return { isValid: false, error: "Invalid signature format" };
    }

    const body = typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody;

    // Compute expected HMAC
    const hmac = crypto
      .createHmac("sha256", this.appSecret)
      .update(body)
      .digest("hex");
    const expected = `sha256=${hmac}`;

    // Use timing-safe comparison to prevent timing attacks
    try {
      const expectedBuf = Buffer.from(expected);
      const receivedBuf = Buffer.from(signature);
      const match = crypto.timingSafeEqual(expectedBuf, receivedBuf);
      return { isValid: match };
    } catch {
      return { isValid: false, error: "Signature comparison failed" };
    }
  }

  /**
   * Verify webhook challenge (setup phase).
   * Called by Meta during webhook configuration.
   * 
   * @param mode Must be "subscribe"
   * @param verifyToken Must match WEBHOOK_VERIFY_TOKEN
   * @param challenge Challenge string to echo back
   * @returns Challenge string if valid, null otherwise
   */
  verifyChallenge(
    mode: string,
    verifyToken: string,
    challenge: string,
    expectedVerifyToken: string
  ): string | null {
    if (mode !== "subscribe") return null;
    if (verifyToken !== expectedVerifyToken) return null;
    if (!challenge) return null;
    return challenge;
  }
}

/**
 * Express middleware for Meta webhook signature validation.
 */
export function createMetaWebhookMiddleware(appSecret: string) {
  const validator = new MetaWebhookValidator(appSecret);

  return (req: any, res: any, next: any) => {
    const signature = req.headers["x-hub-signature-256"];
    const result = validator.validate(req.body, signature);

    if (!result.isValid) {
      console.warn(`[Meta Webhook] Signature validation failed: ${result.error}`);
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
