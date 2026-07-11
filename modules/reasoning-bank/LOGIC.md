# Logic

## Why strategies, not facts
Facts belong in RAG/KG. What repeat-failures share is a *class of mistake* ("when the
user says the code is still wrong, keep repairing the same artifact — don't restart").
Storing the generalized lesson lets one correction fix a whole class.

## Scoring (the one number that matters)
`score = intent_match(0.25) + token_overlap(query, trigger+strategy)` with threshold 0.30.

**INTENT_WEIGHT (0.25) is deliberately BELOW the threshold (0.30).** Consequences:
1. An intent match alone can NEVER inject → no spam on clean queries (measured 3/3 clean).
2. Real token overlap is always required → the lesson must actually relate to the query.
We first shipped 0.5 and generic same-intent entries outranked the specific lesson on
real queries; rebalancing to 0.25 fixed retrieval from 75% → 92% on the same eval set.

## Trigger field = the real failing input
Don't write abstract triggers. Copy the actual words of the failing request/correction
into `trigger` — that's data, not overfitting; retrieval is overlap-based.

## Rollout discipline
off → shadow (retrieve + log only, prompt unchanged) → on (inject, owner-only first if
the bank may contain private text). Calibrate on shadow logs before injecting.

## v2 — trust scores (TAME correction) — IMPLEMENTED, production-validated
TAME (arXiv 2602.03224) shows experience-grown memories DEGRADE agent trustworthiness
without per-item feedback. v2 closes the loop: `uses` (bumped on actual INJECTION, not
shadow retrieval), `helped`/`hurt` (owner 👍/👎 on an injected turn, attributed by
deterministic re-retrieval on the same prompt + `uses>0` guard), Laplace trust
`(helped+1)/(helped+hurt+2)` (neutral 0.5), demote at `hurt>=3 AND trust<0.25`
(row stays in the file for audit; never retrieved again).

Three corrections we had to make to the naive TAME reading:
1. **No-feedback turns are NOT negative signal.** Most good answers get no rating; if
   `uses` were the trust denominator, every strategy would decay toward demotion by
   default. Only *rated* injected turns move trust.
2. **Trust must not touch the injection threshold.** Gate on the BASE score
   (intent+overlap ≥ MIN_SCORE); trust only re-ranks qualified matches +
   demote-excludes. Otherwise a high-trust entry with intent-match alone
   (0.25 × 1.5 = 0.375 > 0.30) would break the "intent alone never injects"
   anti-spam invariant above.
3. **Ordering matters at the feedback hook:** call `record_outcome()` BEFORE
   `record_from_correction()` — a lesson born from this very rating must not absorb
   the rating that created it (the `uses>0` guard is the second fence).

Old banks without trust fields behave byte-identically (neutral trust ⇒ multiplier
1.0, stable sort), so v2 is a zero-migration drop-in.
