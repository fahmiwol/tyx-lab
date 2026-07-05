# Selective Adoption Doctrine

**Kind:** method · **Category:** research · **Status:** stable

When you study an external reference — a library, a competitor product, a sample repo,
a clever gist — extract the **one transferable pattern** and re-implement it in your own
idiom. Do **not** import the whole framework to get that one idea.

---

## Why this exists

Every impressive reference is tempting to adopt wholesale. But wholesale adoption drags
in coupling, bloat, a foreign mental model, and a dependency you now have to track,
patch, and reason about forever. The actual value you wanted was usually a single idea:
one algorithm, one data shape, one control-flow trick. Paying framework-sized cost for
idea-sized value is how codebases rot. This doctrine forces the trade explicit: take the
pattern, leave the framework.

It is also the operating principle behind this whole library — every atom here is a
pattern distilled out of a larger system, precisely so others can adopt selectively.

## The rule

> For any reference, answer: **"What is the ONE pattern here I actually need?"**
> Then re-implement that pattern clean-room, in your own conventions. Reject the rest.

## How to apply

1. **Name the pattern.** State, in one sentence, the transferable idea (e.g. "debounce
   writes behind a 200ms trailing timer", "represent money as integer minor units").
   If you cannot name it in one sentence, you do not understand it yet — keep reading.
2. **Isolate it.** Separate the idea from the reference''s framework, naming, and
   infrastructure. The idea should survive with none of the original scaffolding.
3. **Re-implement clean-room.** Write it in your own codebase''s style and primitives.
   Do not copy files; copy understanding. This also dodges license and coupling issues.
4. **Justify any real dependency.** If you decide to pull the actual library (not just
   the pattern), that is a deliberate, written decision — weigh maintenance, size,
   security surface, and lock-in. Default is: pattern only.
5. **Record the source.** Note where the idea came from (for credit and future context),
   but keep your implementation independent of it.

## When wholesale adoption IS justified

- The dependency is a genuine commodity you should never rebuild (crypto, TLS, a
  database driver, a well-maintained parser). Reinventing these is the anti-pattern.
- The library IS the product boundary (a framework you are standardizing your whole app
  on, chosen deliberately).

The doctrine is about *incidental* references you were merely inspired by — not about
refusing all dependencies.

## Anti-patterns it prevents

- Importing a 300-file framework to reuse one 20-line helper.
- Copy-pasting a competitor''s module and inheriting their assumptions and bugs.
- "We used their whole SDK because their example did" — cargo-culting the scaffolding.

---

*Open source — use it wisely.*