# Recipe: Resilient AI Content Pipeline

## Description
Generate on-brand content reliably across LLM providers — with fallback, structured output,
cost tracking, and multi-variant prompts — so a provider outage or a malformed response
never breaks your pipeline.

## Atoms Used
1. `modules/llm-provider-fallback` — route across providers, fall back on error/rate-limit
2. `artifacts/prompt-chain-orchestration` — sequence multi-step prompts with loops/conditionals
3. `modules/json-repair-fallback` — recover valid JSON from malformed model output
4. `modules/token-cost-estimator` — meter tokens + cost per call
5. `artifacts/storyboard-prompt-variants` — produce multi-angle prompt variants

## Execution Order
brief -> prompt-chain-orchestration -> llm-provider-fallback (per step) -> json-repair-fallback (parse) -> token-cost-estimator (log) -> storyboard-prompt-variants (fan out variants)

## Final Output
Structured, on-brand content with guaranteed-valid JSON, provider redundancy, and a cost ledger.

*Open source — use it wisely.*