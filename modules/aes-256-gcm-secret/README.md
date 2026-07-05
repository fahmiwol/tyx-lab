# AES-256-GCM Secret Encrypt/Decrypt

Symmetric encryption for storing sensitive secrets in a database or config store. Uses AES-256-GCM with random IV and authentication tag.

## Why

- **Integration secrets**: Midtrans, Stripe, PayPal API keys
- **Auth tokens**: OAuth refresh tokens, API keys
- **Connection strings**: Database URIs, service URLs
- **Masked display**: Safe to log without exposing full values

Store encrypted in DB; decrypt on-demand in memory.

## Usage

```typescript
import { encryptSecret, decryptSecret, maskSecret } from '@/lib/aes-256-gcm-secret';

// Encrypt before storing in DB
const encrypted = encryptSecret('sk_live_abc123...');
// → 'aBc1dE/f+gH2iJkL3mNoP4qRs5tUvWxYz6aB7cDeF8=' (random each call)

// Store in DB
db.prepare('UPDATE integrations SET secret = ? WHERE id = ?')
  .run(encrypted, integrationId);

// Decrypt when needed
const plain = decryptSecret(encrypted);
// → 'sk_live_abc123...'

// Display safely (first 4 + last 4)
const masked = maskSecret(plain);
// → 'sk_l●●●●●●●abc123'
```

## How It Works

1. Key: SHA-256 hash of `process.env.SECRETS_KEY` (or `COOKIE_SECRET` fallback)
2. Cipher: AES-256-GCM (256-bit key)
3. Nonce: Random 12-byte IV per encryption
4. Auth: 16-byte authentication tag (detects tampering)
5. Output: Base64(iv || authTag || ciphertext)

Each encryption produces different output (random IV) but decrypts to same plaintext.

## Environment Variables

```bash
# Primary secret key (recommended)
SECRETS_KEY=your-64-character-random-hex-string-here

# Fallback if SECRETS_KEY not set
COOKIE_SECRET=your-fallback-key

# Without either, uses built-in dev key (NOT FOR PRODUCTION)
```

## Security Notes

- **Key rotation**: Change `SECRETS_KEY`, manually re-encrypt old values
- **No key derivation**: Uses raw SHA-256 of seed (fast, single derive)
- **GCM mode**: Prevents tampering; decryptSecret returns '' if tag fails
- **Timing-safe**: Comparison (for auth) is timing-resistant
- **Random IV**: Every encryption unique, safe to store multiple encrypted copies

## Database Storage

```sql
-- Example: integrations table
CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,        -- 'stripe', 'paypal', etc.
  secret TEXT NOT NULL,          -- encrypted value
  secret_masked TEXT,            -- 'sk_l●●●●●●●abc123' for UI
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert
INSERT INTO integrations (id, provider, secret, secret_masked)
VALUES (?, 'stripe', ?, maskSecret(plainSecret));

-- Retrieve and decrypt
const row = db.prepare('SELECT secret FROM integrations WHERE id = ?').get(id);
const plain = decryptSecret(row.secret);
```

## Comparison

| Method | Speed | Size | Complexity |
|--------|-------|------|------------|
| AES-256-GCM | Fast | Medium (IV+Tag+CT) | Standard |
| Bcrypt | Slow (intentional) | Large | Overkill for secrets |
| RSA | Asymmetric (key exchange needed) | Very large | More complex |
| PlainText | N/A | Small | NEVER USE |

Use AES-256-GCM for secrets you control both key and value for. Use bcrypt only for password verification (not storage).

*Open source — use it wisely.*
