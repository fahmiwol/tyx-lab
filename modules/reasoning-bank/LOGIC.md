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

## v2 extension — trust scores (TAME correction)
TAME (arXiv 2602.03224) shows experience-grown memories DEGRADE agent trustworthiness
without per-item feedback. Extension: add `uses`, `helped` counters per entry; bump
`uses` on injection, bump `helped` from downstream quality signal (rating, no re-correction
on the same class); demote (score penalty) or expire entries with uses>N and helped/uses
below a floor. Keep seeds exempt from expiry, not from demotion.
