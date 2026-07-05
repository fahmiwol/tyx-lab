# JWT Auth Cookies

## Purpose
Implement stateless JWT authentication with secure httpOnly cookies for SPA + API patterns. Provides access/refresh token pair with configurable expiry, auto-refresh logic, and logout.

## Pattern
```
login (email + password)
  → hash & verify password
  → issue accessToken (15-60min) + refreshToken (7d)
  → set as httpOnly cookies (secure, samesite)
  → return user profile + token
  
on expiry:
  → client calls /auth/refresh with refreshToken
  → verify refresh token
  → issue new accessToken
  → return new access token
```

## Key Features
1. **Access Token**: Short-lived (15-60 min), contains user ID + role
2. **Refresh Token**: Long-lived (7 days), stored in DB for revocation
3. **HttpOnly Cookies**: Protected from XSS, auto-sent by browser
4. **Secure Flags**: `secure=true` (HTTPS), `samesite=Lax` (CSRF)
5. **Token Rotation**: Optional refresh token rotation on every refresh
6. **Logout**: Invalidate refresh token in DB

## JWT Claims

### Access Token
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user",
  "exp": 1720000000,
  "type": "access"
}
```

### Refresh Token
```json
{
  "sub": "user_id",
  "exp": 1720604800,
  "type": "refresh"
}
```

## Configuration

```env
# JWT secrets
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=3600           # 1 hour (seconds)
JWT_REFRESH_EXPIRY=604800        # 7 days (seconds)

# Cookie settings
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
COOKIE_HTTP_ONLY=true
COOKIE_PATH=/
```

## Endpoints

### POST /auth/register
Register new user.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```
Returns: `{ id, email, name, role, credits, token }`

### POST /auth/login
Login with email/password.
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
Returns: `{ id, email, name, role, credits, token }`
Sets cookies: `access_token`, `refresh_token` (httpOnly)

### POST /auth/refresh
Refresh expired access token.
Uses `refresh_token` from cookie.
Returns: `{ accessToken }`
Sets new `access_token` cookie.

### POST /auth/logout
Revoke refresh token.
Clears both cookies.
Returns: `{ ok: true }`

## Access Token Verification Middleware

```typescript
async function getCurrentUser(request: Request) {
  const token = request.cookies.get("access_token")
    || request.headers["Authorization"]?.replace("Bearer ", "");
  
  if (!token) throw new HTTPException(401, "Not authenticated");
  
  try {
    const payload = jwt.decode(token, JWT_SECRET);
    if (payload.type !== "access") throw new Error("Invalid token type");
    
    const user = await db.users.findById(payload.sub);
    if (!user) throw new HTTPException(401, "User not found");
    
    return user;
  } catch (error) {
    throw new HTTPException(401, "Invalid token");
  }
}
```

## Testing Checklist
- [x] Register new user with hashed password
- [x] Login returns access + refresh tokens in cookies
- [x] Verify access token claims
- [x] Refresh endpoint returns new access token
- [x] Expired refresh token rejected
- [x] Logout clears cookies + revokes token
- [x] Cookie flags (httpOnly, secure, samesite) set correctly
- [x] CORS handling for cookie credentials

## Security Notes
- Store refresh tokens in DB for revocation control
- Hash passwords with bcrypt (cost factor ≥ 10)
- Use strong JWT secrets (≥ 32 bytes)
- Only send refresh token over HTTPS in production
- Rotate refresh tokens on each refresh (optional)
- Clear cookies on logout
- Verify `type` claim to prevent token type confusion

*Open source — use it wisely.*
