# Disciplined Execution — the 8-gate loop

**Kind:** method · **Category:** ops · **Status:** stable

A test-driven, modular execution discipline for any non-trivial build/change/fix.
Decompose work into epics -> episodes, and gate **every** episode through 8 validation
steps so you never ship a regression, never let a default silently drift, and never
claim "done" without live proof.

---

## Why this exists

Distilled from repeated real failures where a change "looked fine" but shipped a
regression, a default silently reverted, a quick tweak backfired, or a fix was claimed
without ever reproducing the real failing input. The lesson: **"it looked fine" is not
proof.** System reliability comes from discipline, not one clever edit. This turns
those lessons into an operating loop any agent can apply on any project.

## Decompose first: Epics -> Episodes

- **Epic** = a coherent workstream. **Episode** = one independently shippable,
  independently verifiable, rollback-able unit inside it.
- Each episode has ONE deliverable, an explicit success metric set *before* building,
  and a written dependency list.
- Modular = base/tech-agnostic where possible, flag/shadow-gated on hot paths,
  reversible with one command.

## The 8 gates — every episode passes all, in order

1. **Design** — write the hypothesis + the deciding metric BEFORE code. No post-hoc goalposts.
2. **Offline-validate on REAL data** — test the core logic against the actual failing
   input first, before touching prod. If you can''t reproduce it, you can''t fix it.
3. **Build** — modular, minimal, string-anchored edits; match surrounding style.
4. **Static check** — compile/parse + unit tests + any invariant guard (e.g. "defaults
   didn''t drift"). Never claim a test pass you didn''t run.
5. **Careful deploy** — shadow-first on hot paths; deploy the minimal service; back up
   what you overwrite; don''t touch secrets/env you didn''t intend.
6. **Live E2E verify** — exercise the REAL endpoint with the REAL repro; measure the
   metric before -> after; verify the true runtime, not a status badge.
7. **Iterate or rollback** — fail -> fix and re-run gates 2-6; regression -> roll back now.
8. **Record durably** — append a finding (what/why/metric/verdict) and update the
   handoff so nothing is lost if the session is cut.

## Hard rules (violating any = stop)

- Reproduce the exact failing input before claiming a diagnosis or fix.
- Verify the runtime, not the badge — a health field can be green while the real thing is broken.
- Quick tweaks can backfire — test config/prompt/sampler nudges offline first.
- Don''t rush a hard-to-reverse change at the tail of a long, tired session; defer the deploy.
- Respect project invariants — never silently change defaults, identity, or model pointers.
- One source of truth per fact — link, don''t duplicate.

## One-line lock

*Decompose small, validate on real data before prod, verify the live runtime, iterate
or roll back, and record everything — so progress compounds and regressions never ship.*

---

*Open source — use it wisely.*