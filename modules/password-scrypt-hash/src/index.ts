import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Password hashing with scrypt (Node.js built-in, no external dependencies).
 *
 * Hash format: hexSalt:hexKey
 *   - Salt: 16 random bytes
 *   - Key: 64-byte derived key
 *
 * Usage:
 *   const hash = hashPassword('mypassword');
 *   const ok = verifyPassword('mypassword', hash);
 */

const SALT_LEN = 16;  // 16-byte random salt
const KEY_LEN = 64;   // 64-byte derived key

/**
 * Hash a plain-text password.
 * Returns "hexSalt:hexKey" format.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password, salt, KEY_LEN);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

/**
 * Verify a password against a stored hash.
 * Timing-safe comparison prevents timing attacks.
 * Returns false if hash format invalid.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const colonIdx = stored.indexOf(':');

  // Validate format
  if (colonIdx <= 0) {
    return false;
  }

  const saltHex = stored.slice(0, colonIdx);
  const keyHex = stored.slice(colonIdx + 1);

  try {
    // Reconstruct buffers
    const salt = Buffer.from(saltHex, 'hex');
    const storedKey = Buffer.from(keyHex, 'hex');

    // Validate lengths
    if (salt.length !== SALT_LEN || storedKey.length !== KEY_LEN) {
      return false;
    }

    // Derive candidate key
    const candidateKey = scryptSync(password, salt, KEY_LEN);

    // Timing-safe comparison
    return timingSafeEqual(storedKey, candidateKey);
  } catch {
    return false;
  }
}
