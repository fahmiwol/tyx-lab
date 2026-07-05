# Connector Base Guard Pattern

## Problem
Multi-platform integration (X, Instagram, Facebook, TikTok, etc.) with anti-detection requirements:
- Each platform has different API/transport (twikit, instagrapi, httpx, etc.).
- All platforms need same guards (rate-limit, health, circadian, think-delays).
- Copy-pasting guards → inconsistent + unmaintainable.

## Solution
**BaseConnector superclass** with injected `_guard()` wrapper. Each platform inherits once, implements only `_raw_*` methods (transport).

```
BaseConnector._guard(action, fn) {
  1. is_available(account)?
  2. is_awake(for writes)?
  3. rate_limit.check_and_consume()?
  4. think_delay.sleep()?
  5. fn() + classify result
  6. sentinel.record(signal)
  → ActionResult
}

class X(BaseConnector):
  capabilities = {LOGIN, GET_COMMENTS, REPLY_COMMENT, ...}
  def _raw_reply_comment(self, id, text): ...  # only this

class Instagram(BaseConnector):
  capabilities = {...}
  def _raw_reply_comment(self, id, text): ...
```

## Benefits
- **Single source of truth**: Guards in one place.
- **Consistency**: All platforms follow same lifecycle.
- **Extensibility**: New guard = add to `_guard()`, applies to all platforms.
- **Testing**: Guard logic decoupled from transport (mock `_raw_*`).
- **Auditability**: Every action logged before/after guards.

## Layers (in `_guard()`)

```
1. Sentinel (Health)
   - Is account available? 
   - Returns (bool, cooldown_s, state).
   - Quarantine = manual intervention needed.
   - Cooling = auto-recovery after cooldown.

2. Humanizer (Circadian)
   - Is account awake (during active hours)?
   - For writes only.
   - Returns seconds_until_awake() if sleeping.

3. RateLimiter
   - Daily budget check (warmup-scaled).
   - Min interval between same-action.
   - Jittered intervals (prevent detection).

4. Think Delay
   - Human-like pause (2.6s for writes, 1.4s for reads).
   - Configurable base + random spread.
   - Blocks outgoing requests.

5. Transport (fn)
   - Platform-specific API call.
   - May return error or challenge.

6. Classification
   - Parse response for signals (captcha, rate-limit, blocked, etc.).
   - Update sentinel.
   - Return structured ActionResult.
```

## Key Interfaces

```python
class Deps:
  vault: SessionVault        # auth tokens
  limiter: RateLimiter       # budgets
  sentinel: Sentinel         # health states
  
class BaseConnector:
  account: Account
  deps: Deps
  proxy: Optional[Proxy]
  blocking_delays: bool
  
  _guard(action, fn, *args) → ActionResult
  
  # Public (called by flow builder):
  login() → ActionResult
  reply_comment(id, text) → ActionResult
  publish(content, media) → ActionResult
  ...
  
  # Private (implemented by subclass):
  _raw_login() → data
  _raw_reply_comment(id, text) → data
  _raw_publish(content, media) → data
```

## Flow

```
[Flow Builder] 
  ↓
[Executor.run_action({account, action, params})]
  ↓
[Connector.get_for_platform(account) → X/Instagram/etc]
  ↓
[connector.login() / .reply_comment() / etc]
  ↓
[_guard(action, _raw_login, ...)]
  ├→ sentinel.is_available?
  ├→ humanizer.is_awake?
  ├→ limiter.check_and_consume?
  ├→ humanizer.sleep_think()
  ├→ _raw_login()          ← only platform-specific code
  ├→ classify_response()
  └→ sentinel.record(signal)
  ↓
[ActionResult {ok, data, signal, error, waited_s, duration_s}]
  ↓
[Flow context += result; decide next node]
```

## Extensibility

### Add a new guard layer:
```python
# In BaseConnector._guard():
# 5a) proxy rotation check
if self.account.proxy_policy == "rotate":
  self.proxy = proxies.rotate_for(self.account.id)
```

### Support new platform:
```python
class TikTok(BaseConnector):
  platform = Platform.TIKTOK
  capabilities = {GET_COMMENTS, REPLY_COMMENT, PUBLISH}
  
  def _raw_reply_comment(self, id, text):
    # Only TikTok-specific logic
    return self.client.comment(id, text).json()
  # Done! All guards + lifecycle inherited.
```

### Override a guard (per-account):
```python
# Some accounts: no think delay (testing) or longer cooldown
class CustomConnector(X):
  def __init__(self, account, deps, ...):
    super().__init__(account, deps, ...)
    self.guard_overrides = {
      "think_delay": 0 if account.tags.get("test") else 2.6,
      "cooldown_multiplier": 2.0 if account.tags.get("premium") else 1.0,
    }
```

## Metrics

Guards emit events on every action:
```python
executor.log  # [
              #   {node_id, type, status, detail, ts},
              #   ...
              # ]
```

Can drive analytics:
- Guard rejection rate (how many actions blocked by rate-limit/health/awake).
- Average waited time per account.
- Signal distribution (captchas vs rate-limits vs OK).
- Platform-specific patterns.

*Open source — use it wisely.*
