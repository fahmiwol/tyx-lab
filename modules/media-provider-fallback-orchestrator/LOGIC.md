# Media Provider Fallback Orchestrator — Why This Exists

## The Problem

Media generation (images, videos, audio, design) relies on external APIs. When one fails:
- User sees error instead of graceful fallback
- Cost tracking is forgotten (calls go to quota ledger, then...nothing)
- Retry logic is ad-hoc (one agent retries 3x, another gives up immediately)
- Provider selection is hardcoded (image agent always hits OpenAI; wasteful when free option exists)

## The Solution: Orchestrator with Fallback Chains

A **single gateway** that:

1. **Selects provider** — checks preferences (prefer_free? respect cost budget?)
2. **Executes request** — call provider with timeout
3. **Tracks cost** — log call to user quota ledger
4. **On failure** — try next provider in fallback chain
5. **Returns result** — media + metadata (which provider, cost, latency)

## Why This Shape

### Request object
```javascript
{
  type: 'image',                 // category (image|video|audio|design)
  prompt: 'Design concept...',   // what to generate
  params: { width: 1024, height: 1024 },  // provider-specific params
  preferences: {
    prefer_free: true,           // skip paid providers if possible
    max_cost: 0.50,              // fail if estimated cost > this
    timeout_ms: 30000            // abort if takes > 30s
  }
}
```

### Fallback chain strategy
Given catalogue entry:
```json
{
  "provider": "openai",
  "fallbacks": ["replicate", "local_sd"]
}
```

Orchestrator tries:
1. `openai` — if fails or timeout, next
2. `replicate` — if fails or timeout, next
3. `local_sd` — last resort (cheapest, on-premise)

Cost minimization:
- If `prefer_free: true`, reorder chain: `["local_sd", "replicate", "openai"]`

### Cost tracking
```javascript
{
  user_id: 'designer-npc',
  call: { provider: 'openai', type: 'image', tokens: 2048, cost: 0.02 },
  timestamp: Date.now(),
  quota: { remaining: 47.50, limit: 50.00, reset_date: '2026-08-01' }
}
```

Track per user, per day, per provider for billing.

## Trade-offs

✅ **Pros**
- Transparent fallback (user never sees provider failure)
- Cost optimization (prefer cheap providers when appropriate)
- Budget control (fail fast if over quota)
- Auditability (every call logged with cost)
- Retry logic centralized (DRY)

❌ **Cons**
- Latency on primary fail (wait for timeout before trying fallback)
- Fallback chain outdated (if new provider added, catalogue isn't updated automatically)
- Cost tracking overhead (every call requires write to quota ledger)

## How to Extend

### Weighted random selection (A/B test):
```javascript
// Don't always use openai; 60% of time use openai, 40% replicate
const providers = ['openai', 'openai', 'openai', 'replicate', 'replicate', 'replicate'].sort(() => Math.random() - 0.5);
const selected = providers[0];
```

### Dynamic quota per agent role:
```javascript
{
  agent_id: 'designer-npc',
  role: 'visual_designer',
  daily_budgets: {
    'image': 10.00,
    'video': 50.00,
    'audio': 1.00
  }
}
```

### Latency-based fallback (not just failure):
```javascript
// If primary takes > 5s, try fallback in parallel
const race = Promise.race([
  orchestrator.call(primary, { timeout: 5000 }),
  delay(5000).then(() => orchestrator.call(fallback))
]);
```

---

Open source — use it wisely.
