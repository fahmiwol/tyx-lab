# Password Hashing with Scrypt

Native Node.js password hashing via scrypt. No external dependencies. Timing-safe verification.

## Why

- **No external deps**: Uses Node.js built-in `crypto` module
- **Scrypt over bcrypt**: Faster in production, still memory-hard
- **Timing-safe**: Protection against timing attacks
- **Simple format**: `salt:key` hex string, easy to store in DB

## Usage

```typescript
import { hashPassword, verifyPassword } from '@/lib/password-scrypt-hash';

// Registration
const password = 'MySecurePassword123!';
const hash = hashPassword(password);
// → 'a1b2c3d4e5f6....:9f8e7d6c5b4a3....'

// Store hash in DB
db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
  .run(hash, userId);

// Login: verify
const storedHash = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId).password_hash;
const ok = verifyPassword(password, storedHash);
// → true or false
```

## How It Works

1. **Hash**: Random 16-byte salt + scryptSync(password, salt, 64 bytes)
2. **Output**: Hex-encoded salt and key, separated by `:`
3. **Verify**: Split stored hash, re-derive with provided password, compare timing-safely

Each hash is unique (random salt) even for same password.

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Registration Example

```typescript
import { hashPassword } from '@/lib/password-scrypt-hash';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Validate
  if (password.length < 8) {
    return Response.json(
      { error: 'Password too short' },
      { status: 400 }
    );
  }

  const db = getDb();

  // Check if user exists
  const existing = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email);

  if (existing) {
    return Response.json(
      { error: 'Email already registered' },
      { status: 409 }
    );
  }

  // Hash and store
  const hash = hashPassword(password);
  const userId = crypto.randomUUID();

  db.prepare(
    'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
  ).run(userId, email, hash);

  return Response.json({ ok: true, userId });
}
```

## Login Example

```typescript
import { verifyPassword } from '@/lib/password-scrypt-hash';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const db = getDb();
  const user = db
    .prepare('SELECT id, password_hash FROM users WHERE email = ?')
    .get(email) as { id: string; password_hash: string } | undefined;

  if (!user) {
    return Response.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // Verify password
  if (!verifyPassword(password, user.password_hash)) {
    return Response.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // Create session / JWT
  const token = createSessionToken(user.id);

  return Response.json({ ok: true, token });
}
```

## Password Reset Flow

```typescript
import { hashPassword } from '@/lib/password-scrypt-hash';

export async function POST(request: Request) {
  const { userId, newPassword } = await request.json();

  // Validate
  if (newPassword.length < 8) {
    return Response.json({ error: 'Password too short' }, { status: 400 });
  }

  // Hash and update
  const hash = hashPassword(newPassword);
  const db = getDb();

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(hash, userId);

  return Response.json({ ok: true });
}
```

## Scrypt vs Bcrypt

| Aspect | Scrypt | Bcrypt |
|--------|--------|--------|
| Speed | Fast (ms) | Slow (intentional, 100ms+) |
| Memory | Yes (memory-hard) | No |
| Built-in | Node.js `crypto` | External dependency |
| Use case | General auth | Defense against GPU attacks |

For typical SaaS: scrypt is sufficient and faster. Bcrypt is more defensible against specialized hardware.

## Security Notes

- **Timing-safe**: Comparison uses `timingSafeEqual` to prevent timing leaks
- **Random salt**: Every hash unique, safe even if DB leaked
- **No peppers**: Salt is sufficient; no need for app-level pepper
- **Scrypt params**: 16-byte salt, 64-byte key (industry standard)
- **Password validation**: Enforce min length (8+ chars) at application level

## Hash Format

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6:9f8e7d6c5b4a3291827364...
 └─────────────────────────────┘ └──────────────────────┘
         16-byte salt (hex)        64-byte key (hex)
```

Colon separator is unambiguous (hex chars are 0-9a-f).

*Open source — use it wisely.*
