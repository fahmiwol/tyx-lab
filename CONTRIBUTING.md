# Contributing to tyx-lab

One rule above all: **one PR = one atom.**

> Open source — use it wisely.

---

## What we accept

An atom belongs here if it passes this test:

> *Can someone use this on a completely different project, without the rest of this repo?*

Yes → submit it. No → break it smaller, or don't.

There are two lanes. Pick the one that fits:

| Lane | For | Structure |
|---|---|---|
| `modules/` | Atomic **code** | `README.md` + `LOGIC.md` + `USAGE.md` + `module.json` + `src/` + `examples/` |
| `artifacts/` | Atomic **non-code** (prompt, template, formula, method, playbook, framework, checklist, finding) | `ARTIFACT.md` + `artifact.json` + optional `assets/` |

---

## module.json

```json
{
  "id": "your-slug",
  "name": "Human Readable Name",
  "version": "1.0.0",
  "category": "ai | video | 3d | business | legal | ops | infra | crm | research | manufacturing",
  "description": "One sentence: what this module does",
  "input": ["input-type"],
  "output": ["output-type"],
  "tags": ["tag1", "tag2"],
  "compatible_with": [],
  "used_in_recipes": [],
  "status": "stable | beta | experimental",
  "author": "your-name",
  "license": "MIT"
}
```

## artifact.json

```json
{
  "id": "your-slug",
  "name": "Human Readable Name",
  "version": "1.0.0",
  "kind": "prompt | template | formula | method | playbook | framework | checklist | finding",
  "category": "ai | video | 3d | business | legal | ops | infra | crm | research | manufacturing",
  "description": "One sentence: what this artifact gives you",
  "tags": ["tag1", "tag2"],
  "compatible_with": [],
  "used_in_recipes": [],
  "status": "stable | beta | experimental",
  "author": "your-name",
  "license": "MIT"
}
```

---

## The WHY is mandatory

For a module it is `LOGIC.md`; for an artifact it is the *Why this exists* section.
It answers:

- Why was this built this way?
- What problem does it solve?
- What did you try that didn't work?
- What trade-offs were made?

Not a tutorial. Not marketing. Just honest reasoning. Anyone can copy code — the
value is knowing when and why to use it.

---

## What we don't accept

- Client-specific business logic or full applications
- Client names, project names, private domains, or identifying data
- Hardcoded credentials, API keys, or secrets
- Atoms that depend on non-public internal systems
- Two functions in one atom
- An atom missing its WHY

---

## Anonymize before you commit

Keep the reusable essence, drop the identity. A client's wiring becomes "a pattern";
a client's sheet becomes "a formula". If it depends on being secret, it does not go in.

---

## PR process

1. Fork
2. Branch: `atom/{your-slug}`
3. Add your atom following the structure above
4. PR title: `[module|artifact] your-slug — one line description`

That's it.
