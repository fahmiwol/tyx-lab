# LLM Provider Registry — Switchable

Declarative registry for multi-provider LLM access with fallback routing.

## What This Does

Defines a registry of LLM providers (free-curated, paid-custom, and custom OpenAI-compatible endpoints) with:
- Model lists per provider
- Task compatibility mapping
- Token/credential field names
- Base URLs

Enables your app to:
- Switch providers at runtime
- Query by task ("which provider can do `qa`?")
- Fall back when primary provider fails
- Support both free and paid options

## Input

Provider ID (string) — e.g., `"openai"`, `"huggingface"`, `"anthropic"`

## Output

```typescript
{
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  tasks: string[];
  tokenField: string;  // e.g., "OPENAI_API_KEY" — read from process.env[tokenField]
}
```

## Providers Included

| ID | Name | Category | Models |
|---|---|---|---|
| `openrouter-free` | OpenRouter Free | free-curated | Llama 3.1, Gemma 2 |
| `github-models` | GitHub Models | free-curated | GPT-4.1-mini, Llama-3.1 |
| `huggingface` | Hugging Face | free-curated | Auto-routing, Llama-3.1 |
| `openai` | OpenAI | paid-custom | GPT-4.1-mini, GPT-4o-mini |
| `anthropic` | Anthropic | paid-custom | Claude 3.5 Haiku |
| `gemini` | Google Gemini | paid-custom | Gemini 1.5 Flash, 2.0 Flash |
| `custom-openai-compatible` | Custom | custom | User-defined |

## Usage

```typescript
import { getProvider, getProvidersByCategory, getProvidersForTask } from './src/index';

// Get a specific provider
const openai = getProvider('openai');
const token = process.env[openai.tokenField];  // OPENAI_API_KEY

// Find providers for a task
const qaProviders = getProvidersForTask('qa');

// Get free-only providers
const freeProviders = getProvidersByCategory('free-curated');

// Add a custom provider at runtime
registerCustomProvider({
  id: 'my-local-ollama',
  name: 'Local Ollama',
  category: 'custom',
  baseUrl: 'http://localhost:11434/v1',
  tokenField: 'OLLAMA_TOKEN',
  models: ['llama2', 'mistral'],
  tasks: ['prompt', 'metadata'],
  note: 'Self-hosted, no API key required if local.',
});
```

## Why This Exists

Building multi-provider AI apps requires:
- A **centralized registry** to avoid hardcoding URLs/keys across the app
- **Task-based routing** — different tasks may prefer different models (cheap + fast for metadata, expensive + smart for reasoning)
- **Runtime switching** — fail over to another provider if the primary is down or quota-exhausted
- **Extensibility** — support custom providers (on-prem, fine-tuned, experimental)

This module came from a real microstock uploader that needed to route metadata generation across free trial providers when API quotas filled.

## Compatibility

- Works standalone
- Pairs with `ai-router-fallback` for provider fallback logic
- Compatible with `ai-metadata-stock-generator` (task = `'metadata'`)

*Open source — use it wisely.*
