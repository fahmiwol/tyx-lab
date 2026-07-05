# Relative Timestamp Formatter

**Category:** `infra` · **Status:** stable

Format dates as human-readable relative timestamps (5m ago, 2h ago) and locale-aware time strings. Zero dependencies; works in browsers and Node.

## Use it

The implementation is a single self-contained file: [`src/index.ts`]("src/index.ts").
Copy it into your project, import the exported members, and call them as shown in the source.
It has one responsibility and no dependency on the rest of this library.

## Why this exists

Extracted as an atomic, single-purpose unit from a real, running production system — so you
can lift exactly this one capability into a completely different project without dragging a
framework along.

---

*Open source — use it wisely.*