# JWT Token Helper

**Category:** `infra` · **Status:** stable

Create and validate JWT access tokens with configurable TTL. Handles token generation, validation, claim extraction, and error cases for FastAPI services.

## Use it

The implementation is a single self-contained file: [`src/index.py`]("src/index.py").
Copy it into your project, import the exported members, and call them as shown in the source.
It has one responsibility and no dependency on the rest of this library.

## Why this exists

Extracted as an atomic, single-purpose unit from a real, running production system — so you
can lift exactly this one capability into a completely different project without dragging a
framework along.

---

*Open source — use it wisely.*