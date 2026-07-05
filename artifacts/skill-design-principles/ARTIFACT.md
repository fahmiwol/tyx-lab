# AI Agent Skill Design Principles & Progressive Disclosure

**Problem:** Skills get bloated. Context window is shared resource — every byte of a skill cuts into conversation history. Agents read 100KB of skill docs for a task that needs only 2KB.

**Solution:** Progressive disclosure + reusable resources:
- **Level 1 (Always loaded):** Metadata (name, description, 100 words)
- **Level 2 (When skill triggers):** SKILL.md body (5KB max)
- **Level 3 (As needed):** Bundled resources (scripts, references, assets) loaded on-demand

## Folder Structure

skill-name/
├── SKILL.md (required) — metadata + main instructions
├── agents/ (recommended) — UI metadata
│   └── openai.yaml
├── scripts/ (optional) — executable code
│   └── example.py, example.sh
├── references/ (optional) — documentation
│   ├── api-reference.md
│   └── examples.md
└── assets/ (optional) — templates, images, boilerplate

DO NOT include: README.md, CHANGELOG.md, SETUP.md, auxiliary docs.

## SKILL.md Frontmatter

---
name: skill-name
description: What it does + WHEN to use it. Include user-facing trigger words. Assume Codex is smart; only add what Codex doesn't know.
metadata: (optional)
  tags: [related, terms]
---

Description is CRITICAL — it's loaded before skill body, must clearly answer "when do I use this?"

Examples:
- BAD: "PDF processing skill"
- GOOD: "Extract text, fill forms, add comments to PDF files. Use for document analysis, form automation, or PDF editing tasks."

## SKILL.md Body

Keep under 500 lines. Structure:

1. **Quick Start** (50 lines max)
   - Minimal example: To extract text: 
   - Don't explain pdfplumber; assume Codex knows Python

2. **Common Patterns** (100 lines)
   - Code snippets for 3-5 typical tasks
   - Each snippet: 10-15 lines + one comment

3. **Advanced Features** (reference links)
   - "For form filling, see "
   - Don't inline; link instead

4. **Scripts & Resources** (reference links)
   - "Run "
   - "See  for full method list"

## Bundled Resources

### scripts/ — Code That Gets Reused

When to include:
- Same code rewritten repeatedly (Python CLI for batch operations, Bash for repetitive shell tasks)
- Deterministic operations (PDF rotation, image batch resize)
- High fragility (regex parsing, file I/O)

Example:


When NOT to include:
- One-off code: write inline in SKILL.md
- Generic utility: use existing tools (ffmpeg, pdfplumber, ImageMagick)

### references/ — Documentation Loaded as Needed

When to include:
- API reference (50+ lines)
- Database schema (complex)
- Detailed examples (multiple scenarios)
- Company policies/templates
- Large JSON/YAML reference

Load pattern in SKILL.md:
"For full endpoint list, see references/api.md"

Codex reads references only when needed.

### assets/ — Output Resources

When to include:
- Templates (HTML boilerplate, React starter, Svelte skeleton)
- Fonts (.ttf files)
- Brand images (logo.png, style-guide.pdf)
- Boilerplate code (not meant to be edited in context)

Assets are NOT loaded into context; they're used as output.

## Context Efficiency Checklist

❌ 50KB SKILL.md with "comprehensive reference"
✅ 2KB SKILL.md + 48KB references/ split by domain

❌ "This skill teaches you how to use Anthropic SDK" (Codex already knows)
✅ "Use when you need X-specific setup: [link to reference]"

❌ Explaining CSV parsing (standard library)
✅ "Use panda.read_csv(file)" (one line, Codex knows the rest)

❌ Inline 100-line API response schema
✅ "See references/schema.md for full response structure"

## Validation

Before publishing:
1. Read SKILL.md in 5 minutes — if taking longer, split into references
2. Check: name is lowercase hyphen-case, description says WHEN to use
3. Check: frontmatter has name + description only (no extras)
4. Check: SKILL.md < 500 lines
5. Check: no auxiliary docs (README, CHANGELOG, SETUP)
6. Run: 

## Benefits
1. Lean SKILL.md keeps shared context pool large
2. Progressive loading matches Codex's needs (doesn't load form-filling if task is text extraction)
3. Reusable scripts avoid code rewrite
4. Multi-agent compatible (Claude/Cursor/Codex all follow pattern)
5. Easy to iterate: edit references without bloating base skill

*Open source — use it wisely.*
