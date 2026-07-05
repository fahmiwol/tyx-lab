# Lead Source & Bounce-Reason Taxonomy

**Kind:** framework · **Category:** crm · **Status:** stable

A canonical taxonomy for tagging where every lead came from and why lost leads dropped —
so funnel analytics stay clean instead of drowning in free-text chaos.

---

## Why this exists

When lead source and loss reason are free-text, every rep spells them differently and
reporting becomes impossible. A fixed, small, exhaustive taxonomy (with one "other + note"
escape hatch) makes channel ROI and drop-off analysis trivial, and it is the prerequisite
for any attribution or forecasting on top.

## Source taxonomy (adapt, keep it small)

- `organic_search`, `paid_search`, `social_organic`, `social_paid`, `referral`,
  `direct`, `email`, `event`, `marketplace`, `word_of_mouth`, `other` (+ required note).

## Bounce / lost-reason taxonomy

- `no_response`, `no_budget`, `no_authority`, `no_need`, `bad_timing`, `chose_competitor`,
  `price`, `unqualified`, `duplicate`, `spam`, `other` (+ required note).

## How to use

- Store the source at capture time (never backfill from memory).
- Force a single-select reason on every close-lost; block "other" without a note.
- Report channel ROI = revenue by source; drop-off = lost count by reason. Review the
  "other" notes monthly and promote recurring ones into first-class categories.

---

*Open source — use it wisely.*
