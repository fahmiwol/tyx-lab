import crypto from 'crypto';

/**
 * AES-256-GCM encrypt/decrypt for storing sensitive integration secrets
 * (API keys, tokens, passwords, DB conn strings, payment secrets).
 *
 * Key derived from process.env.SECRETS_KEY (or fallback COOKIE_SECRET) via SHA-256.
 * Output format: base64(iv[12] || authTag[16] || ciphertext).
 *
 * Usage:
 *   const enc = encryptSecret('sk_live_abc123...');
 *   const plain = decryptSecret(enc);  // 'sk_live_abc123...'
 */

function getKey(): Buffer {
  const seed = process.env.SECRETS_KEY ||
    process.env.COOKIE_SECRET ||
    'fallback-dev-key-not-for-production';
  return crypto.createHash('sha256').update(seed).digest();
}

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;   // Standard GCM nonce
const TAG_LEN = 16;  // Authentication tag

/**
 * Encrypt a string to base64.
 * Returns empty string if input is empty.
 */
export function encryptSecret(plain: string): string {
  if (!plain) return '';

  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();
  const result = Buffer.concat([iv, authTag, ciphertext]);

  return result.toString('base64');
}

/**
 * Decrypt a base64-encoded secret.
 * Returns empty string if invalid or decryption fails.
 */
export function decryptSecret(encoded: string): string {
  if (!encoded) return '';

  try {
    const buffer = Buffer.from(encoded, 'base64');

    // Validate minimum length: iv(12) + tag(16) + at least 1 byte ciphertext
    if (buffer.length < IV_LEN + TAG_LEN + 1) return '';

    const iv = buffer.subarray(0, IV_LEN);
    const authTag = buffer.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ciphertext = buffer.subarray(IV_LEN + TAG_LEN);

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);

    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return plain.toString('utf8');
  } catch {
    // Decryption failed (wrong key, corrupted data, etc.)
    return '';
  }
}

/**
 * Mask a secret for UI/logs: show first 4 + last 4 + bullets.
 * Example: 'sk_live_abc123xyz456...' → 'sk_l●●●●●●●xyz456'
 */
export function maskSecret(plain: string): string {
  if (!plain) return '';
  if (plain.length <= 12) return '●'.repeat(plain.length);
  return `${plain.slice(0, 4)}●●●●●●${plain.slice(-4)}`;
}
