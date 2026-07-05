"""Action executor with guarded wrapper: automatic rate-limit, health, and circadian checks.

Wraps any callable with layers: is_available? → is_awake? → rate_limit? → think_delay → execute.
Logs all attempts. Returns structured ActionResult.
"""
from __future__ import annotations

import time
from dataclasses import dataclass, asdict
from typing import Any, Callable, Optional


@dataclass
class ActionResult:
    """Structured result from guarded action execution."""
    ok: bool
    action: str
    entity_id: str
    data: Any = None
    error: str = ""
    signal: str = "unknown"
    waited_s: float = 0.0
    duration_s: float = 0.0

    def to_dict(self) -> dict:
        return asdict(self)


class ActionExecutor:
    """Wraps any function with guard layers (health, rate-limit, think-delay, retry)."""

    def __init__(self, rate_limiter: Any = None, sentinel: Any = None, 
                 humanizer_fn: Optional[Callable[[str], Any]] = None):
        """
        Args:
            rate_limiter: Must have check_and_consume(entity_id, action_key, age_days, base_cap, min_interval, tz).
            sentinel: Must have is_available(entity_id) → (bool, float, str).
            humanizer_fn: Callable(entity_id) → object with is_awake(), seconds_until_awake(), sleep_think(base).
        """
        self.rate_limiter = rate_limiter
        self.sentinel = sentinel
        self.humanizer_fn = humanizer_fn
        self.log = []

    def _emit(self, entity_id: str, action: str, status: str, detail: Any = None):
        self.log.append({
            "entity_id": entity_id,
            "action": action,
            "status": status,
            "detail": detail,
            "ts": round(time.time(), 3)
        })

    def execute(self, entity_id: str, action: str, fn: Callable, 
                age_days: float = 0.0, base_cap: int = 100, min_interval: float = 0.0,
                tz_offset_hours: int = 0, is_write: bool = False,
                blocking_delays: bool = True) -> ActionResult:
        """
        Execute fn with guard layers.
        
        Args:
            entity_id: Account/workspace/user ID.
            action: Action name (e.g., "post", "reply").
            fn: Callable with no args; returns data dict.
            age_days: Account age (for warmup scaling).
            base_cap: Daily budget (scaled by warmup).
            min_interval: Min seconds between actions.
            tz_offset_hours: Timezone offset for daily reset.
            is_write: If True, check circadian (humanizer) to ensure awake.
            blocking_delays: If True, apply think_think delays.

        Returns:
            ActionResult with ok, data, error, signal, waited_s, duration_s.
        """
        started = time.time()
        waited = 0.0

        # 1) Health check
        if self.sentinel:
            available, cooldown, state = self.sentinel.is_available(entity_id)
            if not available:
                reason = "quarantined (manual intervention needed)" if cooldown < 0 else f"cooling {cooldown}s"
                self._emit(entity_id, action, "blocked", {"why": "health", "state": state})
                return ActionResult(False, action, entity_id, error=f"unavailable: {reason}", 
                                  signal=state, waited_s=cooldown if cooldown > 0 else 0.0)

        # 2) Circadian check (for writes)
        if is_write and self.humanizer_fn:
            hz = self.humanizer_fn(entity_id)
            if not hz.is_awake():
                wait = hz.seconds_until_awake()
                self._emit(entity_id, action, "blocked", {"why": "sleeping", "wait_s": wait})
                return ActionResult(False, action, entity_id, 
                                  error="account sleeping (outside active hours)", waited_s=wait)

        # 3) Rate limit
        if self.rate_limiter:
            allowed, wait, reason = self.rate_limiter.check_and_consume(
                entity_id, action, age_days, base_cap, min_interval, tz_offset_hours
            )
            if not allowed:
                self._emit(entity_id, action, "blocked", {"why": "rate_limit", "wait_s": wait, "reason": reason})
                return ActionResult(False, action, entity_id, error=f"rate limited: {reason}", waited_s=wait)

        # 4) Think delay
        if blocking_delays and self.humanizer_fn:
            hz = self.humanizer_fn(entity_id)
            base = 2.6 if is_write else 1.4
            waited = hz.sleep_think(base)

        # 5) Execute
        try:
            data = fn()
            self._emit(entity_id, action, "ok", {"data_type": type(data).__name__})
            return ActionResult(True, action, entity_id, data=data, signal="ok", 
                              waited_s=waited, duration_s=time.time() - started)
        except Exception as exc:
            self._emit(entity_id, action, "error", {"error": str(exc)})
            return ActionResult(False, action, entity_id, error=str(exc), 
                              signal="exception", waited_s=waited, duration_s=time.time() - started)

    def clear_log(self):
        self.log = []

    def get_log(self):
        return self.log.copy()
