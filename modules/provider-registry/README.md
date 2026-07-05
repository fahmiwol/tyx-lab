# provider-registry

Data-driven catalog of LLM routers, executors, and media providers. Add or enable providers by editing `providers.json` — no code changes needed.

## Structure

```
providers.json
├─ router[]     ← LLM controllers (Hermes, Gemini, etc.)
├─ executor[]   ← LLM workers (Claude, Gemini, Qwen, etc.)
└─ media[]      ← Video/image/audio backends (Kling, FAL, etc.)
```

Each provider entry:
```json
{
  "id": "unique-slug",
  "name": "Display Name",
  "enabled": true,
  "type": "category",
  "costTier": "cheap|mid|premium|free"
}
```

## Usage

```js
const registry = require('./registry.js');

// Get enabled router models
const routers = registry.routerModels;
// [{ id: 'gemini-2.0-flash', name: '...', ... }]

// Get enabled executors
const executors = registry.executorModels;

// Get enabled media providers
const media = registry.mediaProviders;

// Add a new provider (updates providers.json)
registry.addProvider('executor', {
  id: 'claude-sonnet',
  name: 'Claude Sonnet',
  enabled: true,
  type: 'anthropic',
  costTier: 'mid'
});

// Filter by kind manually
const cheapMedia = registry.getProvidersByKind('media')
  .filter(p => p.costTier === 'cheap');
```

## Admin UI Integration

Tools can read from `registry.toolsCatalog` and `registry.skillsCatalog` for dropdowns.

```js
registry.toolsCatalog
// [{ id: 'image_gen', label: '...' }, ...]
```

## Production Notes

- Providers loaded at startup; changes require restart or hot-reload
- Add `enabled: false` to disable without deleting
- Use `costTier` to build cost-aware routing
- Extend the schema as needed (e.g., `rateLimit`, `region`, `features[]`)

*Open source — use it wisely.*
