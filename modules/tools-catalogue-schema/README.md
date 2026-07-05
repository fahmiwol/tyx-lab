# Tools Catalogue Schema

Unified registry for all available tools, providers, and media services. Tracks provider status (free/paid), required API keys, and fallback chains for graceful degradation.

## Input
- Provider configuration: { name, category, key_required, status, cost, fallbacks }

## Output
- Registered provider with metadata for runtime selection and fallback routing

## Example
```json
{
  "provider": "pollinations",
  "category": "image",
  "models": ["flux", "sdxl"],
  "key_required": false,
  "free": true,
  "cost_per_1k": 0,
  "description": "Free image generation, no API key needed"
}
```

Fallback chain (e.g., image generation):
1. Try `pollinations` (free)
2. Fall back to `huggingface` (if key present)
3. Fall back to `replicate` (if key present)
4. Fail gracefully with cached result or error

See LOGIC.md for registry design and fallback strategy.
