# Minimal Session Cookie Auth

Stateless HMAC-SHA256 signed session tokens in cookies. No external auth library. 14-day TTL.

## Why

- **No dependencies**: Only Node.js `crypto` and Next.js `cookies`
- **Stateless**: Decode token without DB query (verify signature instead)
- **Independent**: Each app can use its own `HUB_SESSION_SECRET`
- **httpOnly**: Browser cannot access cookie via JS
- **Secure + SameSite**: CSRF protection built-in

## Usage

```typescript
// Login handler
import { setSessionCookie } from '@/lib/minimal-session-cookie';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Verify credentials...
  const user = await verifyLogin(email, password);
  if (!user) {
    return Response.json({ error: 'Invalid login' }, { status: 401 });
  }

  // Set session
  await setSessionCookie(user.id);

  return Response.json({ ok: true });
}

// Protected route
import { getCurrentUserId } from '@/lib/minimal-session-cookie';

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const user = await db.users.get(userId);
  return Response.json(user);
}

// Logout
import { clearSessionCookie } from '@/lib/minimal-session-cookie';

export async function POST() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}
```

## How It Works

### Encoding (Login)

```
Payload: { userId: 'user-123', exp: 1704067200 }
         ↓ JSON
      { userId: 'user-123', exp: 1704067200 }
         ↓ base64url
      eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV4cCI6MTcwNDA2NzIwMH0
         ↓ sign with HMAC-SHA256(SECRET)
      abc123def456...
         ↓ combine
      eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV4cCI6MTcwNDA2NzIwMH0.abc123def456
```

### Decoding (Verify)

```
Token: eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV4cCI6MTcwNDA2NzIwMH0.abc123def456
       ↓ split on '.'
       body = eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV4cCI6MTcwNDA2NzIwMH0
       sig  = abc123def456
       ↓ re-sign with same SECRET
       expected = HMAC-SHA256(body)
       ↓ compare timing-safe
       sig == expected ✓
       ↓ check expiration
       exp > now() ✓
       ↓ decode payload
       { userId: 'user-123', exp: 1704067200 }
```

If **any step fails** (bad signature, expired, invalid JSON) → returns `null`.

## Environment Variables

```bash
# Secret key for signing (required in production)
HUB_SESSION_SECRET=your-64-char-random-secret-here

# Default (dev only)
HUB_SESSION_SECRET=dev-secret-change-me
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## Cookie Details

```
Name:     hub_session
Value:    base64url.signature
Expires:  14 days from login
Secure:   true (HTTPS only)
HttpOnly: true (no JS access)
SameSite: lax (CSRF protection)
Path:     /
```

## Expiration & Refresh

Current TTL: 14 days. To refresh on each request:

```typescript
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Not logged in' }, { status: 401 });

  // Refresh: set new cookie with fresh expiration
  await setSessionCookie(userId);

  return Response.json({ ok: true });
}
```

## Logout

```typescript
await clearSessionCookie();
// Cookie is deleted; session is over
```

No DB cleanup needed (stateless).

## Middleware Example (Next.js)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { decodeSession } from '@/lib/minimal-session-cookie';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('hub_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeSession(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Attach userId to request for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
```

## Security Notes

- **Secret rotation**: Change `HUB_SESSION_SECRET` → old tokens become invalid (no DB update needed)
- **Tampering**: HMAC prevents modification; tampered token fails signature check
- **Timing attacks**: Comparison is timing-safe (built into Node.js `crypto`)
- **Expiration**: Tokens auto-expire; no need to revoke
- **XSS**: httpOnly cookie prevents JS theft
- **CSRF**: SameSite=lax protects against cross-site requests

## Comparison

| Aspect | This Module | JWT | Session DB |
|--------|------------|-----|------------|
| Stateless | ✓ | ✓ | ✗ |
| DB query needed | ✗ | ✗ | ✓ |
| Token revocation | ✗ | ✗ | ✓ |
| Dependencies | 0 | 1+ | DB driver |
| Size | Minimal | Medium | Variable |
| Use case | SaaS dashboards | APIs | Legacy apps |

For a dashboard with 14-day TTL and no early logout: this module is ideal.

## Related Modules

- `password-scrypt-hash`: Hash passwords before login
- `aes-256-gcm-secret`: Encrypt stored secrets alongside session

*Open source — use it wisely.*
