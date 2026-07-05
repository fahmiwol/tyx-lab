# CSRF Security Guard

CSRF token generation and validation with hardened session cookies (HttpOnly, Secure, SameSite=Strict).

## API

`secure_session_start(): void`
- Start session with HttpOnly, Secure, SameSite=Strict cookies

`csrf_token(): string`
- Get or generate 64-char random token

`csrf_field(): string`
- Render hidden form input for POST forms

`csrf_verify(): bool`
- Check POST or X-CSRF-TOKEN header

`csrf_require(): void`
- Halt with 403 if token invalid

## Example
```php
secure_session_start();

// In form:
echo csrf_field();

// On POST:
csrf_require();
// Process form safely
```

*Open source — use it wisely.*
