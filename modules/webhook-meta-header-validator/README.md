# Webhook Meta Header Validator

## Purpose
Verify authenticity of Meta (WhatsApp, Messenger, Instagram) webhook requests using HMAC-SHA256 signature validation. Prevents spoofed/replay attacks.

## Pattern
```
POST webhook
  ← check X-Hub-Signature-256 header
  → compute HMAC-SHA256(raw body, app secret)
  → compare hex strings
  → reject 403 if mismatch
  → process payload if match
```

## Key Responsibilities
1. **Signature Verification**: Constant-time comparison to prevent timing attacks
2. **Raw Body Handling**: Must use raw buffer (not parsed JSON) for HMAC
3. **Format Validation**: Expect `sha256=<hex>` format
4. **Error Logging**: Log rejections for monitoring

## Meta Signature Algorithm
```
signature = "sha256=" + HMAC-SHA256(raw_request_body, app_secret).toHex()
```

Meta sends in header: `X-Hub-Signature-256`

## Configuration

```env
# From Meta App Dashboard → Settings → Basic
META_APP_SECRET=your_app_secret_here
```

## Middleware Integration

### Express.js
```typescript
import express from "express";

const app = express();

// IMPORTANT: Use raw body parser to preserve buffer
app.post(
  "/webhooks/meta",
  express.raw({ type: "application/json" }),
  validateMetaSignature,
  handleWebhook
);

function validateMetaSignature(req, res, next) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(403).send("Missing signature");

  const { isValid } = validator.validate(
    req.body, // raw Buffer
    signature,
    process.env.META_APP_SECRET
  );

  if (!isValid) {
    return res.status(403).send("Invalid signature");
  }

  req.body = JSON.parse(req.body.toString());
  next();
}
```

### FastAPI
```python
from fastapi import FastAPI, Header, Request
from fastapi.responses import JSONResponse

@app.post("/webhooks/meta")
async def webhook(request: Request, x_hub_signature_256: str = Header(None)):
    body = await request.body()
    
    is_valid = validator.validate(
        body,
        x_hub_signature_256,
        os.getenv("META_APP_SECRET")
    )
    
    if not is_valid:
        return JSONResponse({"error": "Invalid signature"}, status_code=403)
    
    payload = json.loads(body)
    # Process payload
    return {"ok": True}
```

## Webhook Verification Challenge

Meta also sends a GET request with challenge parameters before activating webhook.

```
GET /webhooks/meta?
  hub.mode=subscribe
  hub.verify_token=your_verify_token
  hub.challenge=challenge_string
```

Response: Return challenge string as plain text to confirm subscription.

## Verification Flow (Setup)
```typescript
@Get("/webhooks/meta")
verifyWebhook(
  @Query("hub.mode") mode: string,
  @Query("hub.verify_token") token: string,
  @Query("hub.challenge") challenge: string
) {
  if (
    mode === "subscribe" &&
    token === process.env.WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return challenge; // Must return as text/plain
  }
  return "Forbidden";
}
```

## Signature Mismatch Debugging

**Common Issues:**
1. **Using parsed JSON instead of raw body** — HMAC must compute on raw bytes
2. **Wrong app secret** — Verify in Meta Dashboard
3. **Body encoding** — Ensure UTF-8
4. **Header name case** — Some frameworks lowercase headers; check actual value

**Debug Checklist:**
```typescript
const rawBody = req.body; // Must be Buffer
const signature = req.headers["x-hub-signature-256"];
const appSecret = process.env.META_APP_SECRET;

const hmac = crypto
  .createHmac("sha256", appSecret)
  .update(rawBody)
  .digest("hex");
const expected = `sha256=${hmac}`;
const match = timingSafeEqual(expected, signature);

console.log("Raw body length:", rawBody.length);
console.log("Expected:", expected);
console.log("Received:", signature);
console.log("Match:", match);
```

## Testing Checklist
- [x] Valid signature accepted
- [x] Invalid signature rejected (403)
- [x] Missing signature rejected (403)
- [x] Timing-safe comparison used
- [x] Webhook challenge verification (GET)
- [x] Raw body buffer preserved
- [x] Header parsing case-insensitive

## Security Notes
- Use `crypto.timingSafeEqual()` to prevent timing attacks
- Never log signatures or secrets
- Rotate app secret periodically via Meta Dashboard
- Verify signature before parsing JSON (defense in depth)
- Use HTTPS only in production

*Open source — use it wisely.*
