# Token Counter & Cost Estimator — Multi-Provider Pricing

## Purpose
Estimate token usage and cost before/after LLM calls across multiple providers (Anthropic, OpenAI, Mistral, Ollama, OpenRouter), supporting streaming & cached prompts.

## Problem
- **Cost surprise**: No pre-call estimate; bills explode after production
- **Cached content unclear**: Anthropic & OpenAI support prompt caching, but different rates; naive counters ignore savings
- **Provider variance**: Token counting differs (GPT-3.5 vs Claude vs Gemini); pricing tiers vary
- **Streaming opacity**: Stream calls consume tokens but cost unclear in real-time
- **Multi-model budgets**: Agents with fallback chains need cost alignment per chain leg

## Solution
Modular counter per provider (using official tokenizer where available, or estimation). Pre-call estimate with prompt breakdown, in-call tracking, and post-call reporting.

Each provider module exposes:
- `countTokens(text, model_id) → { prompt, completion_estimate, total }`
- `estimateCost(prompt_tokens, completion_estimate, model_id, cache_metadata?) → { cost_usd, breakdown }`
- `parseStreamingCost(tokens_received, model_id, call_context) → { cost_usd, cumulative }`

## Key Patterns
1. **Provider-native counters** — Use Anthropic token counter, OpenAI tiktoken, Mistral tokenizer; fallback to char-based estimation
2. **Prompt breakdown** — Count separately: system message, cache hit, user input, tools/context → show which part is expensive
3. **Streaming tracking** — Hook into token stream events; accumulate cost in real-time without waiting for call end
4. **Cached prompt handling** — If prompt cached in Anthropic, apply cache discount; track cache hit rate across session
5. **Budget enforcement** — Optional middleware: reject calls exceeding per-session or per-provider budget
6. **Post-call audit** — Compare estimate vs actual; log variance → tune future estimates

## Output
- Factory: `createTokenCounter(provider, model_id) → CounterAPI`
- Estimator: `(prompt, completion_est, model_id) → { cost_usd, prompt_cost, completion_cost, cache_savings? }`
- Stream tracker: attach to stream consumer, accumulate cost per chunk
- Budget enforcer: middleware to block/warn on budget overrun

## Used in
- Mighan agent system (per-NPC cost caps; OpenRouter tracking)
- Migancore video pipeline (storyboard generation cost forecasting)
- Multi-agent systems (allocate token budgets across personas)

---

*Open source — use it wisely.*
