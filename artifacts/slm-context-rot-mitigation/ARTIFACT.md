# SLM Multi-Turn Context-Rot Mitigation

**Kind:** method · **Category:** ai · **Status:** beta

A method to stop a **small** language model (≈1–8B) from losing the thread, looping on a canned persona/apology, or hallucinating after ~15 conversation turns — **without a bigger model, without fine-tuning, without a bigger context window.**

## What it gives you

A per-turn context-management recipe that keeps a small model on-thread over long conversations by **externalizing** state instead of stuffing the raw transcript into the prompt.

## Why this exists (the honest WHY)

After ~15 turns a small self-hosted model would abandon the user's actual question and fall into a loop: reciting its identity + apologizing repeatedly. It looked like a capability problem. It is not. Empirically:

- **The model CAN answer.** Asked the *same* question in a clean prompt, it answered correctly. So the weights are fine — the **context is poisoned**.
- **Root cause = "context rot"**, a documented cluster, not a bug:
  - **Lost-in-the-middle** — U-shaped attention (RoPE decay); the original instruction, now buried mid-transcript, is under-attended.
  - **Context drift** — on a vague/frustrated turn the model latches onto noise and answers a different (invented) task.
  - **Error accumulation** — an early wrong turn becomes "fact" in the next turn's context; the loop self-reinforces.
  - **Small-model penalty** — small models hold long-dialogue state far worse than large ones.
- **Stuffing more transcript = fuel for the rot.** A bigger context window makes it *worse*, not better.

### What we tried that DID NOT work (so you don't repeat it)

- **Aggressive anti-repetition sampling** (DRY + high repetition_penalty) to break the loop → the model started **hallucinating wrong facts** (invented a wrong organization name) because the penalty pushed it off the correct-but-repeated tokens. **Backfired. Do not ship sampler tweaks without offline-testing them on the real failing input.**
- **A prompt directive** ("do not apologize, do not recite identity") → **ignored** by the small model when the user turn was noise. Prompt-only guardrails are suggestions, not gates.
- **Letting the small model self-extract** the unresolved question from the messy history → unreliable (it deflected / mis-stated). Use a **separate, slightly larger summarizer** for state extraction, not the answer model doing double-duty.
- **Trusting the test harness** → a fragile shell/SQL escaping bug silently passed an *empty* transcript, so the model "hallucinated" from nothing and we nearly concluded the wrong thing. **Verify the test itself before trusting its verdict.**

## The method (what DOES work)

Per user turn, **before** generating:

1. **Externalize, don't stuff** — keep active context small + dense; history lives in a memory store, not the prompt.
2. **Retrieve-then-generate every turn** — pull only the relevant facts fresh each turn (grounding), instead of relying on stale context.
3. **Position injection** — put the critical facts + the user's actual goal at the **start and end** (high-attention zones); summaries go in the middle.
4. **Compression** — old/middle turns are summarized (by a *separate* small summarizer), not copied verbatim.
5. **Fencing** — memory that was just recalled into context is **not** re-stored raw next turn (prevents recursive memory pollution).
6. **Recap-and-retry** — when the user turn is vague/frustrated AND an earlier question is still unresolved, **re-pose the concrete open question at the recency slot** (the end). This single move recovered a correct answer where a buried-in-system-prompt version failed.
7. **Bi-temporal supersede** — contradicting facts are invalidated (`valid_to` + `superseded_by`), never piled up.

Each technique targets a specific root cause; the cheapest high-impact four are **externalize + retrieve-per-turn + position-injection + compression**.

## Trade-offs

- Needs a **second small model** for summarization/state (the answer model can't reliably double-duty).
- Per-turn retrieve adds latency → keep retrieval fast (pre-indexed vectors + a reranker) and route intent with an **embedding classifier (~ms), not an LLM decision pass**.
- State extraction should be **forward-maintained from turn 1** (cheap, coherent) rather than reconstructed retroactively from a poisoned window (captures the wrong layer).

## Verify before you trust

Reproduce the *exact* failing conversation, run the assembled-context version vs the raw-transcript version, and compare answers on the real input — not a happy-path example.
