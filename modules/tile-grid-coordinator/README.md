# Tile Grid Coordinator

**Category:** `ai` · **Status:** stable

Pure grid coordinate conversion utility for top-down and isometric tile maps (RPG/Gather-style). Square tiles, screen offset support, Manhattan distance, bounds checking. All functions are deterministic and side-effect-free.

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