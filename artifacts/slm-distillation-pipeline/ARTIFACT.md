# SLM Distillation Pipeline: Teacher-Student Recursive Refinement

**Version:** 1.0.0 | **Category:** AI/ML | **Status:** stable

## Overview

A production-grade methodology for distilling knowledge from larger teacher models (70B+) into smaller student models (7B) via multi-teacher consensus quorum voting and preference pair collection. Used to bootstrap self-improving SLMs without relying on proprietary closed APIs.

## Core Principles

### 1. Teacher Consensus Quorum
Instead of trusting a single teacher model, use **2-4 diverse teachers** voting on quality:
- **Gemini Flash** (cheap, fast baseline — ~$0.075/1M input tokens)
- **Kimi K2.6** (specialized for non-English — ~$0.60/1M)
- **GPT-4o** (strong general reasoning — $2.50/1M)
- **Claude Sonnet** (nuanced output — $3.00/1M)

**Voting rule:** Accept a preference pair only if ≥2 teachers agree on winner + loser labels (majority pass-through).

### 2. Budget-Gated Collection
Implement hard cost caps to prevent runaway expenses:
```
Daily budget: $5.00
Teacher cost per interaction: ~$0.001–0.01 (2-teacher quorum, 2K tokens avg)
Auto-abort if single pair cost > $0.05 (pre-check guard)
Monitor daily: cost_today vs budget_today
Ban unhealthy teacher for 30min if 3 consecutive failures
```

### 3. Preference Pair Data Format
Collect in standard DPO/RLHF format:
```jsonl
{
  "prompt": "User's original request",
  "chosen": "Preferred response from teacher consensus",
  "rejected": "Non-preferred response",
  "teacher_votes": {"gemini": "chosen", "kimi": "chosen", "gpt4": "rejected"},
  "avg_score": 3.5,
  "collected_at": "2026-05-11T14:32Z",
  "teachers_count": 3
}
```

### 4. Synthetic Bootstrap + CAI Pipeline
Kick-start with synthetic data, then inject real user feedback:
- **Phase 1:** Self-critique loop (student critiques own outputs) → generate 500–1K synthetic pairs
- **Phase 2:** CAI pipeline (Constitutional AI): user chat → revision loop → critique → refined output → store preference
- **Phase 3:** Teacher distillation: collect from external teachers when high-stakes or confidence needed

Quality signal: Track `judge_score` per pair (1–5 scale). Pairs <3.0 are outliers; investigate drift.

## Implementation Checklist

- [ ] Set up teacher model APIs with budget tracking (SQLite daily ledger)
- [ ] Implement pre-check guard (abort if $0.05 threshold exceeded)
- [ ] Build quorum voting: 2-teacher consensus is threshold
- [ ] Store in `preference_pairs` table with fields: prompt, chosen, rejected, teacher_votes, judge_score
- [ ] Export to JSONL format for DPO training (batch import)
- [ ] Monitor cost daily, pause if budget trending over-spend
- [ ] Implement health check: failure ban after 3 strikes

## Why It Works

1. **Diversity reduces bias:** Multiple teacher perspectives catch blind spots one model has.
2. **Budget control prevents runaway costs:** Daily cap + per-pair guard.
3. **Synthetic + real mix:** Bootstrap fast, then refine with real signals.
4. **Measurable quality:** Track judge_score to detect data drift early.

## Genericized for Any SLM

- Replace teacher models with any 70B+ model (Llama3, Mixtral, etc.)
- Adjust budget and quorum size based on your constraints
- Scale vote weights by teacher cost (expensive teachers get higher weight)
- For non-English: add language-specific teacher (Kimi for Chinese, etc.)

*Open source — use it wisely.*
