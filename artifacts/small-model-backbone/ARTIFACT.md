# Backbone Agent Design — intelligence from the SYSTEM, not the weights

> Origin: Fahmi Ghani (PT Tiranyx Digitalis Nusantara) / MiganCore, 2026-07. Fahmi is a non-technical founder; this is his logical framework for building a capable agent on a small owned model (Qwen3-4B) without endlessly growing the weights. Distilled into a portable method so it compounds across projects. Pairs with `disciplined-execution` (build each facility through the 8 gates) + `experiment-ledger` (measure every change).

## Core thesis
**Don't load all intelligence into the model's weights.** Make the model the **core** — the thing that decides and composes language — and put long reasoning, memory, data, validation, and action into a **backbone** of facilities around it. A small model stops failing not because it got smarter, but because it's no longer forced to be encyclopedia + calculator + planner + memory bank + researcher + executor all at once.

> A 4B model with a great backbone beats a raw 70B with none, on the tasks that matter for a real product — at a fraction of the cost, self-hostable, ownable.

## The quality formula (the whole method in one line)
```
Agent Quality = Model Core
              × Context Quality
              × Retrieval Accuracy
              × Tool Reliability
              × Validation Layer
              × Memory Consistency
```
It is **multiplicative**: any factor near zero drags the whole product down, no matter how good the others. Consequences that drive every decision:
- **Raising one weak factor raises effective intelligence — WITHOUT touching the model.** This is the cheapest lever you have.
- **`Context Quality` is the biggest multiplier.** A small model given a clean, relevant, well-ordered brief is dramatically sharper than the same model given a long messy chat history. → the **Intent Engine + Context Compiler go at the very front**.
- To improve an agent, **find its weakest factor and fix that first** — not the factor that's fun to build.

## The backbone — 7 layers, ~17 facilities (a reusable checklist)
A capable agent needs most of these. Treat it as a menu to audit against, not a mandate to build all at once.

**A. Gateway (before the model)** — decide what's being asked before spending a token.
- **Intent Engine** — extract `{intent, sub_intent, entities, constraints, output_format, risk_level, needs_tools, needs_memory}` from raw input. The single biggest lift for a small model: it no longer has to guess intent every turn.
- **Tool + Retrieval Router** — route by need: simple→answer, numbers→calculator, facts→web, files→retrieval, relations→graph, long reasoning→planner, visual→image pipeline.
- **Confidence Gate** — high→answer · medium→gather evidence first · low→ask for data / show assumptions. The main hallucination brake.
- **Semantic Cache** — similar query → reuse prior answer/calculation, adapt to context.

**B. Context (assemble the "work brief")** — the biggest multiplier lives here.
- **Context Compiler / Prompt OS** — select only the most relevant context and shape it into a short brief (CURRENT TASK / PREFERENCES / CONTEXT / OUTPUT REQUIREMENT). NOT the whole history dumped in.
- **User Preference Engine** — inject the user's style/tone/likes/dislikes without retraining.
- **Evidence Pack / Fact Packet** — gather `{facts:[{claim, source, confidence}], unknowns:[…]}` before generating; the model may **only** conclude from the packet. Powerful anti-fabrication.
- **Output Contract** — declare `{language, tone, must_include, must_not_include}` before generating.

**C. Knowledge & Memory** — what the agent knows vs what's happening now.
- **Knowledge Graph + Second Brain** (durable, cross-domain: vector + graph). Vector answers "which docs are relevant?"; graph answers "how do these entities relate?". Combine both.
- **Memory** (working / episodic / procedural) with a **lifecycle**: categories + confidence + expiry; new decisions supersede old; store "decision + reason + date", not raw transcripts.
- **Project State** — active_goal / phase / decisions / open_questions (keeps the agent consistent).
- **Skill Registry** — capability cards (trigger / requires / tools / output / guardrails) the model reads on demand instead of memorizing.

**D. Tools / Execution** — Tool Runtime (code, calculator, dates/units, SQL, API, web, files) · Simulation/What-if engine · Image pipeline.

**E. Reasoning & Output Control** (inference) —
- **Constrained Decoding** — enforce structure at the token level while generating (JSON-schema / grammar / GBNF via Outlines/xgrammar/vLLM guided decoding, or the runtime's `format`/schema option). Output is *guaranteed* valid — cheap, huge impact for small models. **Fixes FORMAT, not content quality** — don't mistake it for making a weak model smart.
- **Planner + Task Graph** — break big tasks into nodes ("executive function"). Small models fail from too many steps at once, not from being dumb.
- **Test-time compute** — thinking mode, best-of-N + verifier, adaptive depth (easy=fast, hard=deep).

**F. Validation (before the answer leaves)** —
- **Output Validator** — deterministic checks: all questions answered? numbers without a source? instruction missed? contradictions? tool result unused? format ok? Even a rule-based validator helps a lot.
- **Critic / Reviewer** — Draft → Critic → Revision → Final. Expensive; **only for high-stakes** (numbers/business/coding/legal/research), never for light chat.
- **Grounding + Abstain** — check claims against the knowledge source; no evidence → "I'm not sure."

**G. Learning & Eval (background)** —
- **Self-Reflection Log** — record failure → root_cause → new_rule → feed into skill cards / policy. The agent improves **from experience without fine-tuning**.
- **Evaluation Harness** — 100–500 internal test cases from YOUR domain. Every change to system prompt / tool / memory / loop must pass it. This is how you know the agent is *actually* smarter, not just *feels* smarter.

## The 3-point output discipline (don't conflate these)
Structured/high-quality output comes from three DIFFERENT points, in order:
1. **Output Contract** (Layer B) — the *spec* of what's wanted (before generation).
2. **Constrained Decoding** (Layer E) — *enforce* the structure while generating (at the token level).
3. **Output Validator** (Layer F) — *verify* the finished output (after generation).
Spec ≠ enforcement ≠ verification. Build all three; they catch different failures.

## How to apply (the method)
1. **Score the agent against the formula.** Which factor is weakest — context, retrieval, tools, validation, memory? Be honest; usually it's Context Quality.
2. **Audit against the 17-facility menu.** Mark each EXISTS / PARTIAL / PLANNED against the real code. This is your map (worked example: MiganCore — a 4B Qwen3 in production behind a 17-facility backbone).
3. **Build biggest-impact-first (tiered):**
   - *Tier 1 (makes it instantly better):* Intent Engine · Context Compiler · Project State + Preferences · Skill Registry · Tool Router + Confidence · Output Contract · **Constrained Decoding** · Output Validator · Grounding+abstain.
   - *Tier 2 (feels autonomous):* Planner + Task Graph · Evidence Pack · Critic · Semantic Cache · Reflection Log · Test-time compute.
   - *Tier 3 ("org brain"):* Knowledge Graph · Simulation Engine · Evaluation Harness · multi-agent roles.
4. **Build each facility as one episode through the 8 gates** (`disciplined-execution`): design → offline-validate on real data → build → static-check → shadow-deploy → live-verify → iterate/rollback → record. Flag/shadow anything on the hot path.
5. **Measure against the Eval Harness** every time. "Feels smarter" is not proof.

## Load-bearing principles
- **Offload, don't overload.** If the model is doing something a deterministic system could do (math, format, retrieval, routing), move it OUT of the model.
- **Deterministic-before-LLM.** Prefer a rule/lookup/embedding over an LLM call when it's reliable and cheap (routing, gating, validation).
- **The extractor/summarizer floor is real.** Semantic state-extraction (e.g. "what's the unanswered question across this whole thread?") needs a *capable* model (≥7B in practice); tiny models hallucinate or capture the wrong layer. Amortize a capable model via caching rather than dropping to one too small. (MiganCore EXP-107.)
- **Learn without retraining.** Turn failures into rules/skill-cards/policy, not fine-tunes. Fine-tune only when the base behavior itself must change.
- **Own everything where it's the moat.** Self-hosted, no egress, own model + own backbone. Stock/hosted models are *tools behind your agent's face*, not its brain — if owning the model is the point.

## When to use / not
- **Use** when: building or improving any agent/assistant on a small or budget model; the model hallucinates / loses the thread / ignores instructions / feels dumber than its size; you want capability without paying to scale the model; you're designing a moat around an owned small model.
- **Don't force** when: a one-shot prompt on a frontier model already solves it and cost isn't a constraint; the task genuinely needs raw frontier reasoning (then the backbone still helps, but isn't the point).

## Pairs with
`disciplined-execution` (ship each facility safely) · `experiment-ledger` (prove each facility moved a metric) · any project's memory/SSOT (record the facility map so agents don't re-derive it).

*This is a portable design method, not a MiganCore-only plan. Any project building capable agents on cheap/owned models can apply the formula → facility audit → biggest-impact-first rollout.*
