# Structured Brief Intake Framework

**Kind:** framework · **Category:** business · **Status:** stable

A layered questionnaire that turns a vague request into a decision-ready brief. Four
stacked layers plus the audience's current state, so nothing load-bearing is left implicit.

---

## Why this exists

Most rework comes from a brief that was never actually complete — the strategy, the
market, the voice, or the moment was assumed rather than stated. A fixed layered intake
makes the gaps visible before any work starts, and gives an LLM or a human the same
structured context every time, so output is consistent instead of mood-dependent.

## The layers

1. **Business layer** — goal, success metric, constraints, non-negotiables.
2. **Market layer** — audience segment, competitors, category conventions to keep or break.
3. **Personality / voice layer** — tone sliders, archetype, do/don't vocabulary.
4. **Context layer** — the specific occasion and the audience's current state (platform,
   timing, mindset) that the message must fit.

## How to use

- Fill every layer before producing anything; an unanswered layer is a risk flag, not a detail.
- Feed the completed layers to the model as the system context; have it echo them back to
  confirm alignment before generating.
- Store filled briefs — they become training examples and a consistency baseline.

---

*Open source — use it wisely.*
