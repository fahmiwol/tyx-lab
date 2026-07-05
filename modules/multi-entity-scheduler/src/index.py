"""Multi-entity scheduler: staggered, jittered task execution with safety checks.

Runs recurring tasks for many entities (accounts/bots) without detection:
  - Per-entity phase offset (deterministic from ID).
  - Jittered intervals + base interval.
  - Health checks + circadian (sleep hours).
  - Batch writes limit.
"""
from __future__ import annotations

import hashlib
import random
import time


class MultiEntityScheduler:
    """Schedules recurring tasks across many entities with anti-detection jitter/stagger."""

    def __init__(self, base_interval_s: int = 1500, jitter: tuple[float, float] = (0.5, 1.6),
                 stagger_window_s: int = 900, batch_writes: int = 3,
                 retry_unavailable_s: int = 3600, rng: random.Random | None = None):
        """
        Args:
            base_interval_s: Base seconds between runs (before jitter).
            jitter: (min_mult, max_mult) for random interval scaling.
            stagger_window_s: Window size for per-entity phase offset.
            batch_writes: Max writes per run (for rate-limiting).
            retry_unavailable_s: Retry delay for unavailable entities.
            rng: Random generator.
        """
        self.base_interval_s = base_interval_s
        self.jitter = jitter
        self.stagger_window_s = stagger_window_s
        self.batch_writes = batch_writes
        self.retry_unavailable_s = retry_unavailable_s
        self.rng = rng or random.Random()

    def _stagger(self, entity_id: str) -> int:
        """Deterministic phase offset per entity (0 to stagger_window_s)."""
        return int(hashlib.sha256(entity_id.encode()).hexdigest()[:8], 16) % self.stagger_window_s

    def _next_run(self, entity_id: str, now: float) -> float:
        """Calculate next run time: now + base * jitter + stagger."""
        jitter_mult = self.rng.uniform(*self.jitter)
        return now + self.base_interval_s * jitter_mult + self._stagger(entity_id)

    def tick(self, campaigns: list[dict], check_available_fn, check_awake_fn,
             run_task_fn, now: float | None = None) -> dict:
        """
        One tick: execute due campaigns, reschedule, report.
        
        Args:
            campaigns: List of campaign dicts with keys: id, entity_id, enabled, next_run_at.
            check_available_fn: Callable(entity_id) → (available: bool, cooldown_s: float, state: str).
            check_awake_fn: Callable(entity_id, now) → bool.
            run_task_fn: Callable(campaign: dict) → {writes: int, stopped: bool, ...}.
            now: Current time (default: time.time()).
        
        Returns:
            {now, ran: [...], skipped: [...]}
        """
        now = now if now is not None else time.time()
        report = {"now": now, "ran": [], "skipped": []}

        for c in campaigns:
            if not c.get("enabled") or (c.get("next_run_at") or 0) > now:
                continue

            entity_id = c["account_id"]

            # Check health
            available, cooldown, state = check_available_fn(entity_id)
            if not available:
                self._reschedule(c, now + self.retry_unavailable_s + self._stagger(entity_id))
                report["skipped"].append({"campaign_id": c["id"], "why": state})
                continue

            # Check circadian
            if not check_awake_fn(entity_id, now):
                wait_s = 3600  # rough estimate
                self._reschedule(c, now + wait_s + self._stagger(entity_id))
                report["skipped"].append({"campaign_id": c["id"], "why": "sleeping"})
                continue

            # Run task
            try:
                result = run_task_fn(c)
                writes = result.get("writes", 0)
                stopped = result.get("stopped", False)
                self._reschedule(c, self._next_run(entity_id, now))
                report["ran"].append({"campaign_id": c["id"], "entity_id": entity_id, 
                                     "writes": writes, "stopped": stopped})
            except Exception as exc:
                self._reschedule(c, now + self.retry_unavailable_s + self._stagger(entity_id))
                report["skipped"].append({"campaign_id": c["id"], "why": f"error: {exc}"})

        return report

    def _reschedule(self, campaign: dict, next_run_at: float) -> None:
        """Update campaign's next_run_at."""
        campaign["next_run_at"] = next_run_at

    def status(self, campaigns: list[dict], now: float | None = None) -> list[dict]:
        """Return status of all enabled campaigns."""
        now = now if now is not None else time.time()
        out = []
        for c in campaigns:
            if c.get("enabled"):
                next_at = c.get("next_run_at") or now
                out.append({
                    "campaign_id": c["id"],
                    "entity_id": c.get("account_id"),
                    "next_run_at": next_at,
                    "due_in_s": round(next_at - now, 0),
                    "status": c.get("status", "active")
                })
        return out
