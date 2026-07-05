# Agent Session Handoff & Continuity Pattern

**Problem:** Multi-agent coding work loses context across sessions. LLM limits, agent switches, and handoffs cause rework, forgotten state, and inconsistent memory.

**Solution:** A durable, living continuity log (one file per project) that captures every session atomically. Each agent reads one file to rebuild full context; each agent appends to the same file to hand off to the next agent (or human).

## Core Pattern

### 1. File Structure: `docs/AGENT_CONTINUITY.md`

```markdown
# Agent continuity log — [Project Name]

**Tujuan:** One file for handoff antar AI agent (Claude, Cursor, OpenCode, etc.) dan manusia.

**Cara pakai:**
1. **Mulai sesi:** Read entri paling baru + baris "Current focus"
2. **Selama sesi:** Iterate → QA → test
3. **Akhir sesi:** Append entri baru + session detail blok + follow-ups

**Traceability:** Gunakan ID `AGENT-YYYYMMDD-###` (### = urutan hari itu, mulai 001).

---

## Current focus (update setiap akhir sesi)

| Field | Nilai terakhir |
|-------|---|
| **North Star** | [Project vision 1 sentence] |
| **Prioritas** | [P0, P1, P2...] |
| **Blokir** | [If any] |
| **Files kunci** | [Active files this sprint] |
| **Status** | [OK / BLOCKED / IN PROGRESS] |

---

## Session Index

| ID | Date | Agent | Summary |
|-------|------|-------|---------|

---

## Session detail

### AGENT-YYYYMMDD-001

> **Dibuat oleh:** Agent Name  
> **Waktu:** 2026-MM-DD HH:MM  

**Permintaan:** What user asked

**Perubahan:** 
- File A: change 1
- File B: change 2

**Hasil tes:**
- `npm run verify` ✅ PASS
- Browser E2E test ✅ PASS

**Tidak dilakukan:** [What was deferred]

**Follow-ups:** 
- [ ] Next task A
- [ ] Next task B
```

### 2. Session ID Format: `AGENT-YYYYMMDD-###`

- **YYYY-MM-DD:** Date of session start
- **###:** Sequence number (001, 002, ...) — increments each session on that date, resets at midnight

**Example:** `AGENT-20260705-003` = 3rd session on July 5, 2026

### 3. Current Focus Table

A 1–5 row snapshot that every new agent reads first:

| Field | Purpose |
|-------|---------|
| **North Star (SaaS/Product Vision)** | One-liner: what are we building? |
| **Prioritas Saat Ini** | P0/P1/P2 backlog items + why blocked if any |
| **Blokir** | Any external dependency (DNS, API key, user decision) |
| **Tool status** | Bash ✅, SSH ✅, Bash tool ✅, etc. |
| **Files kunci aktif** | Top 5 files changed this sprint |
| **Peta proyek** | Link to PROJECT_CARTOGRAPHY + key docs |

This table IS the context refresh. Read it in 30 seconds before asking questions.

### 4. Session Detail Block

Append at end of file after every material session:

```markdown
### AGENT-YYYYMMDD-NNN

> **Dibuat oleh:** Agent Name (e.g., Claude Code Opus 4.8)  
> **Waktu:** 2026-MM-DD HH:MM (Jakarta time)  

**Permintaan:** [User's request or task]

**Perubahan:** 
- `server/gateway.js` — added 3 endpoints for workflow engine
- `src/ui/SopPanel.js` — created new panel
- `config/workflows/` — added 5 workflow JSON defs

**Hasil tes:**
- `npm run verify` ✅ PASS (18 server + 6 client + 2 JSON files)
- Manual E2E in browser: workflow run → agent dispatch ✅
- Socket.io live-refresh ✅

**Tidak dilakukan:**
- Post-processing pipeline (bloom/SSAO) — defer to next phase
- GPU particles — low priority

**Follow-ups:**
- [ ] Deploy to VPS — Fahmi manual
- [ ] Test LLM parsing with complex commands
- [ ] Buat UI chat panel global di browser
```

### 5. Integration with Changelog

For material product changes, update `docs/bible/06_CHANGELOG.md` with same date:

```markdown
## 2026-07-05

**Session AGENT-20260705-003 (Claude):**
- Added workflow engine real async LLM dispatch
- Fixed AI provider fallback chain with circuit breaker
- Deployed SOP Editor panel integration
```

## Usage Pattern

### For Session Start

```
1. Clone/pull repo
2. Open AGENT_CONTINUITY.md
3. Read "Current focus" table (30s)
4. Read newest session detail block (2–5 min)
5. Read PROJECT_CARTOGRAPHY.md if confused
6. Start work
```

### For Session End

```
1. Run tests: npm run verify
2. Commit changes (atomic, meaningful messages)
3. Append NEW session detail block to AGENT_CONTINUITY.md
4. Update "Current focus" table if priorities changed
5. Update CHANGELOG.md if product-level change
6. Commit doc changes
7. Push to main
```

### For Handoff Between Agents

No special steps — just update the continuity log and push. Next agent will read it on session start.

## Benefits

1. **No context loss:** One file, append-only, versioned in git
2. **Deterministic:** Session IDs are sortable by date; newest is at bottom
3. **Audit trail:** Every decision and test result is logged
4. **Scalable:** Works for 2 agents or 10 agents on same project
5. **Supports async handoff:** Agent A finishes, Agent B picks up next day
6. **Machine-readable:** Session IDs, table format, and structured blocks enable parsing and dashboards

## Anti-Patterns to Avoid

❌ **Scattered memory:** Notes in Slack, Notion, email  
✅ **Centralized:** One AGENT_CONTINUITY.md file in git

❌ **Lossy handoff:** "Tell me what you did?"  
✅ **Atomic:** Every session is logged with test results

❌ **No follow-ups:** Missing next steps  
✅ **Tracked:** Follow-ups section with checkboxes

❌ **Merged changelog:** Product changes lost in git log  
✅ **Separate:** CHANGELOG.md mirrors continuity log at product level

*Open source — use it wisely.*
