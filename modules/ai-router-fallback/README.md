# Multi-Provider AI Router

Fallback-aware AI content generation with automatic provider failover. Route to Groq → Gemini → Ollama → Anthropic.

## Why

Optimize cost and latency:
- **Groq** (free quota): Fastest inference, ideal for light content tasks
- **Gemini** (free quota): High quota, good for volume
- **Ollama** (local): Zero cost, full privacy
- **Anthropic** (paid): Fallback if others exhausted

Single interface; swap providers without changing call sites.

## Usage

```typescript
import { aiRouter } from '@/lib/ai-router';

const result = await aiRouter(
  'Write a 50-word product description for a coffee mug.',
  {
    maxTokens: 150,
    temperature: 0.8,
    systemPrompt: 'You are a copywriter.',
  }
);

console.log(result.text);      // "Sip in style..."
console.log(result.provider);  // "groq"
console.log(result.model);     // "llama-3.1-8b-instant"
```

## Environment Variables

```bash
# Groq (free: 14400 req/day)
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant  # optional

# Gemini (free: 1M tokens/day)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash    # optional

# Ollama (local, zero cost)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1

# Anthropic (paid fallback)
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## Behavior

1. Tries Groq → Gemini → Ollama → Anthropic in order
2. Skips provider if API key missing
3. On timeout or error, tries next provider
4. Returns `{ text, provider, model }` on success
5. Throws if all providers fail

## Integration

- API routes: use `aiRouter()` to generate content server-side
- Batch jobs: process in parallel with different prompts
- Streaming: wrap with AsyncGenerator for incremental output

## Cost Notes

- **Free tier**: Groq + Gemini cover most use cases
- **Volume limits**: Groq has daily req cap, Gemini has token cap
- **Fallback cost**: Only hits Anthropic if others exhausted
- **Local option**: Run Ollama locally for zero marginal cost

*Open source — use it wisely.*
