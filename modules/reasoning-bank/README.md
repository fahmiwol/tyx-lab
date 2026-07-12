# reasoning-bank

Read-path **strategy memory** for LLM agents: the agent learns from its own failures
(user corrections, reflection heuristics) with **zero retraining**. Strategies — not
facts — are stored, retrieved by task-intent + token overlap, and 1-2 relevant lessons
are injected into the prompt.

Adapted from ReasoningBank (Google, ICLR 2026) for small self-hosted models, and
production-validated: 92% correct-class retrieval on real traffic, anti-spam by design
(an intent match alone can never trigger injection).

- **One JSON file** as storage (atomic writes, mtime-cached) — no DB, no migration.
- **Two writers**: typed user corrections (thumbs-down) + reflection heuristics.
- **Failed vs proven** lessons formatted differently in the injected block.
- **v2 trust loop (implemented):** owner 👍/👎 on injected turns → per-strategy
  `helped`/`hurt` → Laplace trust re-ranks retrieval; proven-harmful strategies
  auto-demote and stop injecting (TAME correction, production-verified E2E).
- Zero dependencies (stdlib only). ~260 lines.

See `LOGIC.md` for the scoring insight and the trust-loop design (incl. three
corrections to the naive TAME reading); `USAGE.md` to wire it into any chat
pipeline in 3 calls (+2 for the trust loop).
