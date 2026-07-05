# Multi-Provider AI Router

Unified LLM interface with auto-fallback across 6+ providers.

## Default Chat Fallback Chain

1. Anthropic Claude (if BYOK)
2. OpenAI GPT (if BYOK)
3. Cerebras Llama 3.3 70B (free, fastest)
4. Google Gemini 2.0 Flash (free, multilingual)
5. Pollinations (always-on, no key)

## Providers

| Provider | Chat | Embed | Image | Notes |
|----------|:----:|:-----:|:-----:|-------|
| Gemini | ✅ | ✅ | — | Free 1800/min |
| Cerebras | ✅ | — | — | Free, fastest |
| Pollinations | ✅ | — | ✅ | No key needed |
| HuggingFace | — | ✅ | ✅ | Free token |
| Anthropic | ✅ | — | — | BYOK Premium |
| OpenAI | ✅ | ✅ | — | BYOK Premium |

## Usage

```js
const { chat } = require('@tiranyx/ai-router');
const reply = await chat({
  prompt: 'Explain quantum computing',
  maxTokens: 256
});
console.log(reply.text, reply.provider);
```

*Open source — use it wisely.*