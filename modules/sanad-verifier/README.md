# Sanad Verifier (Multi-Source)

**Category:** `ai` · **Status:** stable

"description":"Cross-verify factual claims across web + corpus + LLM-prior. Reject hallucinations for fact-checkable

## Use it

The implementation is a single self-contained file: [`src/sanad_verifier.py`](src/sanad_verifier.py).
Import it and call the exported verifier. It has one responsibility and no dependency on the rest
of this library.

## Why this exists

Extracted as an atomic, single-purpose unit from a real, running production system — so you can
lift exactly this one capability into a different project.

---

*Open source — use it wisely.*