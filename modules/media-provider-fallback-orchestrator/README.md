# Media Provider Fallback Orchestrator

Orchestrate media generation (image, video, audio, design) across multiple providers with automatic fallback chains, cost tracking, and quota management.

## Input
- request: { type, prompt, params, preferences: { prefer_free, max_cost } }
- catalogue: tools-catalogue-schema

## Output
- result: { media, provider_used, cost, latency_ms }
- usage_stats: { calls_today, cost_today, quota_remaining }

## Example
```javascript
const orchestrator = new MediaOrchestrator(catalogue, { user_id: 'designer-npc' });

const result = await orchestrator.generate({
  type: 'image',
  prompt: 'Design concept for autumn collection',
  preferences: { prefer_free: true, max_cost: 0.50 }
});

// Tries fallback chain:
// 1. pollinations (free) → success → return
// 2. huggingface (if fail) → try
// 3. replicate (if still fail) → try
// Returns first successful result or error
```

See LOGIC.md for fallback strategy and cost tracking.
