"""reasoning_bank.py — read-path strategy memory for LLM agents (zero retraining).

Pattern: ReasoningBank (Google, ICLR 2026) adapted for small self-hosted models —
store REASONING STRATEGIES (not facts) mined from real failures (user corrections,
reflection heuristics), retrieve them by task-intent + token overlap, and inject
1-2 relevant lessons into the prompt. The agent improves from its own mistakes
with zero fine-tuning. Production-validated: 92% correct-class retrieval on real
traffic queries, with a by-design anti-spam property.

Design points that matter (learned in production):
  - INTENT WEIGHT (0.25) IS DELIBERATELY BELOW THE THRESHOLD (0.30): an intent
    match alone can never inject — real token overlap is always required.
    (With 0.5, generic same-intent entries outranked the specific lesson.)
  - Entries carry outcome "gagal"/"failed" (avoid this) or "sukses"/"proven"
    (do this) — format both into the injected block, tagged differently.
  - Dedup by normalized strategy text; cap the bank; oldest non-seed dropped.
  - TAME (arXiv 2602.03224) correction: memories that grow from experience
    degrade trust WITHOUT per-item feedback — see LOGIC.md for the trust-score
    extension (v2): track uses/helped per entry, demote losers.

Zero dependencies beyond stdlib. Storage = one JSON file (atomic writes).
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path

_WORD_RE = re.compile(r"[\w']+", re.UNICODE)
# Adjust stopwords to your language(s). These are Indonesian+casual defaults.
STOPWORDS = {
    "aku", "saya", "kamu", "anda", "yang", "dan", "atau", "di", "ke", "dari",
    "ini", "itu", "nya", "dong", "tolong", "buat", "buatkan", "jelaskan",
    "apa", "kenapa", "bagaimana", "bisa", "dengan", "untuk", "dalam", "jadi",
    "kalau", "juga", "lagi", "masih", "udah", "sudah", "coba",
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "is", "it",
}

MAX_ENTRIES = 500
MIN_SCORE = 0.30          # retrieval threshold
INTENT_WEIGHT = 0.25      # deliberately < MIN_SCORE (anti-spam — see module doc)
MAX_CONTEXT_CHARS = 700


@dataclass(frozen=True)
class Strategy:
    id: str
    intent: str
    trigger: str
    strategy: str
    outcome: str  # "failed" (lesson/avoid) | "proven" (do this)
    source: str
    score: float = 0.0


class ReasoningBank:
    def __init__(self, path: str | os.PathLike):
        self._path = Path(path)
        self._mtime: float | None = None
        self._rows: list[dict] = []

    # ---------- storage ----------
    def _load(self) -> list[dict]:
        if not self._path.exists():
            self._mtime, self._rows = None, []
            return []
        mtime = self._path.stat().st_mtime
        if self._mtime == mtime:
            return self._rows
        try:
            data = json.loads(self._path.read_text(encoding="utf-8"))
        except Exception:
            return self._rows or []
        self._rows = [r for r in data if isinstance(r, dict) and r.get("strategy")] if isinstance(data, list) else []
        self._mtime = mtime
        return self._rows

    def _save(self, rows: list[dict]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self._path.with_suffix(".tmp")
        tmp.write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
        os.replace(tmp, self._path)
        self._mtime, self._rows = self._path.stat().st_mtime, rows

    # ---------- write path ----------
    @staticmethod
    def _entry_id(strategy_text: str) -> str:
        norm = " ".join((strategy_text or "").lower().split())
        return hashlib.sha1(norm.encode("utf-8")).hexdigest()[:12]

    def record(self, *, intent: str | None, trigger: str, strategy: str,
               outcome: str, source: str) -> bool:
        """Append one strategy (dedup by normalized text). True if added."""
        strategy = (strategy or "").strip()
        if not strategy:
            return False
        rows = list(self._load())
        eid = self._entry_id(strategy)
        if any(r.get("id") == eid for r in rows):
            return False
        rows.append({
            "id": eid,
            "intent": (intent or "").strip().lower(),
            "trigger": (trigger or "")[:300],
            "strategy": strategy[:600],
            "outcome": outcome if outcome in ("failed", "proven") else "failed",
            "source": (source or "runtime")[:120],
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        })
        if len(rows) > MAX_ENTRIES:
            seeds = [r for r in rows if str(r.get("source", "")).startswith("seed")]
            rest = [r for r in rows if not str(r.get("source", "")).startswith("seed")]
            rows = seeds + rest[-(MAX_ENTRIES - len(seeds)):]
        self._save(rows)
        return True

    def record_from_correction(self, prompt_text: str, correction: str,
                               intent: str | None = None) -> bool:
        """Thumbs-down + typed correction → one 'failed' lesson."""
        essence = (correction or "").strip()
        if len(essence) < 4:
            return False
        preview = " ".join((prompt_text or "").split())[:140]
        return self.record(
            intent=intent, trigger=preview,
            strategy=(f'For requests like "{preview}": the previous answer was corrected '
                      f"by the owner — {essence[:220]}. Avoid repeating that mistake."),
            outcome="failed", source="correction_thumbsdown",
        )

    # ---------- read path ----------
    @staticmethod
    def _tokens(text: str) -> set[str]:
        return {t for t in _WORD_RE.findall((text or "").lower())
                if len(t) >= 3 and t not in STOPWORDS}

    def _score(self, query: str, query_intent: str | None, row: dict) -> float:
        qt = self._tokens(query)
        rt = self._tokens(str(row.get("trigger", "")) + " " + str(row.get("strategy", "")))
        overlap = 0.0
        if qt and rt:
            inter = len(qt & rt)
            overlap = max(inter / max(1, len(qt | rt)),
                          (inter / max(1, min(len(qt), len(rt)))) * 0.8)
        intent_match = INTENT_WEIGHT if (query_intent and row.get("intent") == query_intent) else 0.0
        return intent_match + overlap

    def retrieve(self, query: str, query_intent: str | None = None,
                 limit: int = 2) -> list[Strategy]:
        rows = self._load()
        scored = []
        for row in rows:
            s = self._score(query, query_intent, row)
            if s >= MIN_SCORE:
                scored.append(Strategy(
                    id=str(row.get("id", "")), intent=str(row.get("intent", "")),
                    trigger=str(row.get("trigger", "")), strategy=str(row.get("strategy", "")),
                    outcome=str(row.get("outcome", "failed")), source=str(row.get("source", "")),
                    score=round(s, 3)))
        scored.sort(key=lambda x: x.score, reverse=True)
        return scored[:max(0, limit)]

    @staticmethod
    def format_context(entries: list[Strategy]) -> str:
        """Prompt block to inject. Keep it short; never mention it to the user."""
        if not entries:
            return ""
        lines = [
            "[STRATEGIES FROM EXPERIENCE — real lessons from owner corrections/reflection]",
            "Apply ONLY what is relevant to the current request; never mention this block.",
        ]
        for ex in entries:
            tag = "avoid" if ex.outcome == "failed" else "proven"
            lines.append(f"- ({tag}) {ex.strategy}")
        return "\n".join(lines)[:MAX_CONTEXT_CHARS]
