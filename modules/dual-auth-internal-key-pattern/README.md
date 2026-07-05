# Dual-Auth Internal Key Pattern

**Problem:** API proxies sit between client and protected backend. Client sends user JWT. Proxy must not modify request (MITM risk). Backend needs proof that caller is the proxy, not a client directly calling backend API.

**Solution:** Two-layer authentication:
1. **Client → Proxy:** Include user JWT (authorization)
2. **Proxy → Backend:** Include JWT + x-internal-key header
3. **Backend:** Verify both (JWT = user valid, internal-key = proxy legit)

Prevents:
- Client bypassing proxy (direct backend calls rejected: no internal-key)
- Proxy impersonating user (would need both JWT + key, key is server-only)
- Replay attacks (validate key expiry + nonce)

## Interface

```typescript
interface AuthContext {
  userJwt: string;  // From client
  internalKey: string;  // Server secret
}

async function validateDualAuth(ctx: AuthContext): Promise<{
  authorized: boolean;
  userId?: string;
  role?: string;
  error?: string;
}>;
```

## Usage

```typescript
// Proxy forwards client request to backend
const headers = {
  'Authorization': `Bearer ${userJwt}`,
  'x-internal-key': process.env.INTERNAL_API_KEY,
};

const res = await fetch('http://bank/transfer', {
  method: 'POST',
  headers,
  body: JSON.stringify({ amount, denom }),
});

// Backend validates:
const userJwt = req.headers['authorization']?.replace('Bearer ', '');
const internalKey = req.headers['x-internal-key'];
const auth = await validateDualAuth({ userJwt, internalKey });
if (!auth.authorized) res.status(401).send('Unauthorized');
```

## Key Patterns

- **Server-side only:** internalKey never leaves backend (env var)
- **Layered trust:** Neither JWT alone nor key alone is sufficient
- **Audit trail:** Log all validation failures (brute-force detection)
- **Key rotation:** Replace internalKey annually, retry logic on old key

## Configuration

```env
INTERNAL_API_KEY="CHANGE_ME_STRONG_RANDOM"  # In production, strong random
JWT_SECRET="..."  # Standard JWT signing key
```

## Security Checklist

- [ ] internalKey stored in .env (never in code/git)
- [ ] Validation logged to audit trail
- [ ] Key rotated quarterly
- [ ] Failed auth attempts rate-limited (429)

*Open source — use it wisely.*