# Tools Catalogue Schema — Why This Exists

## The Problem

Modern AI applications integrate with 20+ external services (image APIs, LLM vendors, design tools, TTS providers). Managing this complexity without a registry leads to:

- Provider keys hardcoded in 10 places (env var here, config there, agent skill there)
- No fallback strategy (image API down? → entire app fails)
- Cost tracking scattered (invoice audit requires grepping 5 codebases)
- Duplication (two agents use the same image provider differently)
- No visibility (what providers are we using? which are free? which cost the most?)

## The Solution: Unified Tools Catalogue

A **declarative, centralized registry** where:

1. **One source of truth** — all providers registered once
2. **Cost & quota tracking** — provider cost per call, free vs paid
3. **Graceful fallback** — if provider down, use backup (human never sees the failure)
4. **Status tracking** — which providers need API key rotation? which hit quota?
5. **Capability matrix** — find provider with specific model (e.g., "I need Flux")

## Why This Shape

### provider: string
- Unique ID (e.g., `pollinations`, `replicate`, `openai`)
- Used as cache key, routing target, in logs

### category: enum
- `image`, `video`, `tts`, `llm`, `design`, `vision`, etc.
- Enables grouping (all image providers in one fallback chain)

### models: [string]
- List of model names the provider supports
- Allows agent to request "Flux" and router finds it

### key_required: bool
- If true, provider needs API key before use
- Cheap self-hosted providers have key_required = false

### free: bool
- Is this provider free (no per-call cost)?
- Router prioritizes free providers

### cost_per_1k: float
- Cost for 1000 calls (normalized unit)
- Enables cost minimization strategies

### description: string
- Human note: why would you use this provider?
- Not machine-interpreted, but critical for decision-making

### status: enum
- `active`, `degraded`, `down`, `deprecated`
- Router avoids `down` providers; warns on `degraded`

### fallbacks: [string]
- Ordered list of provider IDs to try if this one fails
- Example: `["pollinations", "huggingface", "replicate"]`
- Last fallback should always be a high-reliability (paid) provider

## Trade-offs

✅ **Pros**
- Single file = full system visibility
- Fallback chains prevent cascading failures
- Cost tracking enables budget alerts
- Adding new provider = register once, all agents use it
- Testable (mock the catalogue, inject different config)

❌ **Cons**
- Requires coordination (add provider → update catalogue → deploy)
- Can't detect provider downtime in real-time (use monitoring layer)
- Fallback latency (try provider A, fail, retry with B)

## How to Extend

### Provider status tracking:
```json
{
  "provider": "replicate",
  "status": "active",
  "health": {
    "last_check": "2026-07-05T12:00:00Z",
    "success_rate": 0.97,
    "avg_latency_ms": 2300
  }
}
```

### Per-user provider quotas:
```json
{
  "provider": "openai",
  "quota_per_user": {
    "calls_per_day": 100,
    "tokens_per_day": 100000
  }
}
```

### Weighted routing (A/B testing):
```json
{
  "provider": "openai",
  "weight": 0.6,
  "notes": "GPT-4o: high cost, high quality"
}
```

---

Open source — use it wisely.
