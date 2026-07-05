"""Adaptive rate limiter with account age-based warmup curve and jittered intervals.

Principles:
  - New accounts start at ~8% budget, ramp to 100% over ~21 days (smooth ease-out curve).
  - Daily caps per action type + per-action minimum intervals with jitter.
  - Persistent per-account state (JSON) survives restarts.
  - Timezone-aware daily resets.
"""
from __future__ import annotations

import json
import os
import random
import time
from datetime import datetime, timezone
from pathlib import Path


def warmup_multiplier(age_days: float, ramp_days: float = 21.0) -> float:
    """Ease-out curve: 0.08 at day 0 → 1.0 at ramp_days."""
    if age_days >= ramp_days:
        return 1.0
    frac = age_days / ramp_days
    return max(0.08, 1.0 - (1.0 - frac) ** 2)


class AdaptiveRateLimiter:
    """Per-account rate limiter with warmup scaling and persistent state."""

    def __init__(self, storage_dir: str = "storage/rate", rng: random.Random | None = None,
                 ramp_days: float = 21.0):
        self.dir = Path(storage_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.rng = rng or random.Random()
        self.ramp_days = ramp_days

    def _path(self, entity_id: str) -> Path:
        return self.dir / f"{entity_id}.json"

    def _load(self, entity_id: str) -> dict:
        p = self._path(entity_id)
        if p.exists():
            try:
                return json.loads(p.read_text("utf-8"))
            except (json.JSONDecodeError, OSError):
                pass
        return {"day": None, "counts": {}, "last_ts": {}}

    def _save(self, entity_id: str, state: dict) -> None:
        tmp = self._path(entity_id).with_suffix(".tmp")
        tmp.write_text(json.dumps(state), "utf-8")
        os.replace(tmp, self._path(entity_id))

    def _today_local(self, tz_offset_hours: int) -> str:
        ts = time.time() + tz_offset_hours * 3600
        return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")

    def scaled_budget(self, age_days: float, base_cap: int) -> int:
        """Return daily budget: base_cap * warmup_multiplier(age_days)."""
        return max(1, int(base_cap * warmup_multiplier(age_days, self.ramp_days)))

    def check_and_consume(self, entity_id: str, action_key: str, age_days: float,
                          base_cap: int, min_interval: float | None = None,
                          tz_offset_hours: int = 0) -> tuple[bool, float, str]:
        """Check budget and interval; consume if allowed.
        
        Returns: (allowed, wait_seconds, reason).
        """
        state = self._load(entity_id)
        today = self._today_local(tz_offset_hours)
        if state.get("day") != today:
            state = {"day": today, "counts": {}, "last_ts": {}}

        used = state["counts"].get(action_key, 0)
        cap = self.scaled_budget(age_days, base_cap)
        if used >= cap:
            secs_left = 86400 - (time.time() + tz_offset_hours * 3600) % 86400
            return False, float(secs_left), f"daily cap {used}/{cap}"

        if min_interval is not None:
            mult = 1.0 / max(0.2, warmup_multiplier(age_days, self.ramp_days))
            need = self.jittered_interval(min_interval * mult)
            last = state["last_ts"].get(action_key, 0.0)
            elapsed = time.time() - last
            if elapsed < need:
                return False, round(need - elapsed, 1), "min interval"

        state["counts"][action_key] = used + 1
        state["last_ts"][action_key] = time.time()
        self._save(entity_id, state)
        return True, 0.0, f"ok {used + 1}/{cap}"

    def jittered_interval(self, base: float, spread: float = 0.35) -> float:
        """Add random jitter: base * (1 + U(-spread, spread))."""
        return base * (1.0 + self.rng.uniform(-spread, spread))

    def remaining(self, entity_id: str, action_key: str, age_days: float, base_cap: int,
                  tz_offset_hours: int = 0) -> int:
        """Remaining budget for today."""
        state = self._load(entity_id)
        if state.get("day") != self._today_local(tz_offset_hours):
            return self.scaled_budget(age_days, base_cap)
        return max(0, self.scaled_budget(age_days, base_cap) - state["counts"].get(action_key, 0))
