# Brute Force Login Guard

Rate limiter for login attempts using combined IP + identifier tracking. Prevents credential stuffing attacks.

## API

`login_check_attempts(string $identifier): int`
- Returns attempt count in last 15 minutes
- Checks both identifier (email) and IP

`login_record_attempt(string $identifier): void`
- Record failed attempt

`login_clear_attempts(string $identifier): void`
- Clear attempts on successful login

## Example
```php
$attempts = login_check_attempts($email);
if ($attempts > 5) {
  die("Too many attempts. Try again in 15 minutes.");
}
if (!verify_password($pwd, $hash)) {
  login_record_attempt($email);
  die("Invalid credentials");
}
login_clear_attempts($email);
```

*Open source — use it wisely.*
