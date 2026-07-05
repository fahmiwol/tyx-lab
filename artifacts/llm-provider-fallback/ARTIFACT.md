# LLM Provider Router with Fallback & Rate-Limit Recovery

## Purpose
Route LLM calls across multiple providers (OpenRouter, Anthropic, OpenAI, Gemini, Ollama) based on cost/latency preferences, with automatic fallback on rate-limit and automatic model slug sync.

## Problem
- **Multi-provider requirement**: Games/agents need diverse models (cheap fast tokens, premium reasoning, local inference)
- **Provider coupling**: Each provider has different auth, pricing, model identifiers → scattered logic
- **No resilience**: Rate limit or API outage stops execution
- **Slug drift**: Model names change → hardcoded references break

## Solution
Minimal router abstracting provider selection, preset configurations, and fallback chain. Each preset includes:
- Priority-ordered provider list
- Allowed model patterns (allowlist / denylist)
- Cost & latency hints
- Auto-discovered resolved_model tracking

## Key Patterns
1. **Preset + Allowlist** — NPC preference (`"openrouter/free"` → routes to list of free models) without repeating configs
2. **Auto-router** — Delegate model choice to provider (OpenRouter auto, Ollama local), then log resolved slug for future pinning
3. **Fallback chain** — Try primary, then backup providers in order; emit observability event per attempt
4. **Slug sync job** — Background task fetches live model lists weekly, validates configured slugs, alerts on discontinuation
5. **Per-session correlation** — Store `session_id` + `resolved_model_slug` in logs for cost attribution & debugging

## Output
- Agnostic client factory: `createMultiProviderAgent(opts) → { send, stream, listModels }`
- Preset registry (YAML/JSON): maps role/persona → provider+model list
- Observable: each LLM call emits `{ provider, model, status, latency_ms, fallback_reason, cost_tokens }`

## Used in
- Mighan NPC agent system (OpenRouter → fallback chain)
- Multi-agent orchestration (per-agent model routing)

---

*Open source — use it wisely.*
