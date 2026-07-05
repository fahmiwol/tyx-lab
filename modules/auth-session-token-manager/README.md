# Auth Session Token Manager

In-memory session + token auth with bcrypt password hashing and Express middleware.

## What This Does

- **Session manager** — creates tokens, stores sessions, handles expiration
- **Password hashing** — bcrypt with configurable salt rounds
- **Express middleware** — `requireAuth` and `requireAdmin` middleware
- **Token extraction** — parse `Authorization: Bearer <token>` headers
- **Cleanup** — background session expiration

## Input

```typescript
createSession(userId, email, role)
hash(password)
verify(password, hash)
```

## Output

```typescript
token: string           // hex token for Bearer auth
session: Session        // { userId, email, role, createdAt, expiresAt }
```

## Usage

```typescript
import express from 'express';
import { SessionManager, PasswordHasher, createAuthMiddleware } from './src/index';

const app = express();
const sessions = new SessionManager(1440); // 24 hours
const hasher = new PasswordHasher(10);

// Auth middleware
app.use('/api/protected', createAuthMiddleware(sessions));

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email); // your logic

  if (!user || !(await hasher.verify(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = sessions.createSession(user.id, user.email, user.role);
  res.json({ token, userId: user.id, email: user.email, role: user.role });
});

// Protected route
app.get('/api/me', createAuthMiddleware(sessions), (req, res) => {
  res.json({ session: req.session });
});

// Logout
app.post('/api/logout', createAuthMiddleware(sessions), (req, res) => {
  sessions.invalidateSession(req.token);
  res.json({ ok: true });
});

// Password hashing (registration)
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hash = await hasher.hash(password);
  // Store user with hash...
});

// Admin-only route
app.get('/api/admin/sessions', createAdminMiddleware(sessions), (req, res) => {
  res.json(sessions.getAllSessions());
});
```

## Why This Exists

Most SaaS backends need:
- **Session persistence** across requests (Bearer tokens)
- **Password security** (bcrypt, not plaintext)
- **Expiration handling** (1–24 hour sessions)
- **Role-based access control** (admin vs user middleware)
- **Simple, no external DB** (in-memory for MVPs/small scale)

This pattern came from 3 Tiranyx SaaS apps with these exact requirements.

## Compatibility

- Works standalone — requires `bcryptjs` only
- Pairs with `jwt-auth-cookies` for hybrid auth
- Express.js focused, but pattern is portable

## Security Notes

- Tokens are cryptographically random (32 bytes)
- Passwords use bcrypt with configurable salt rounds
- Sessions auto-expire (configurable TTL)
- Cleanup recommended via `cleanupExpired()` (cron or periodic)

*Open source — use it wisely.*
