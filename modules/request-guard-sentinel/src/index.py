"""Request guard sentinel: detect signals (challenge, rate-limit, auth-fail, blocked) and track account health states.

Tracks 3 states: HEALTHY → COOLING → QUARANTINED. Signals escalate with strike count;
pattern matching on error text classifies incidents. State persists per-entity.
"""
from __future__ import annotations

import json
import os
import time
from enum import Enum
from pathlib import Path


class Signal(Enum):
    OK = "ok"
    UNKNOWN = "unknown"
    RATE_LIMIT = "rate_limit"
    BLOCKED = "blocked"
    CHALLENGE = "challenge"
    AUTH_INVALID = "auth_invalid"


class HealthState(Enum):
    HEALTHY = "healthy"
    COOLING = "cooling"
    QUARANTINED = "quarantined"


_PATTERNS = {
    Signal.CHALLENGE: ["captcha", "checkpoint", "challenge_required", "verify", "verification"],
    Signal.RATE_LIMIT: ["rate limit", "too many", "429", "please wait", "slow down"],
    Signal.BLOCKED: ["action blocked", "blocked", "feedback_required", "spam", "restricted"],
    Signal.AUTH_INVALID: ["login_required", "not authorized", "401", "session", "csrf"],
}

_COOLDOWN = {
    Signal.RATE_LIMIT: 3 * 3600,
    Signal.BLOCKED: 12 * 3600,
    Signal.CHALLENGE: 24 * 3600,
    Signal.AUTH_INVALID: 0,
}


def classify_text(text: str) -> Signal:
    """Pattern-match error text to signal type."""
    t = (text or "").lower()
    for sig, pats in _PATTERNS.items():
        if any(p in t for p in pats):
            return sig
    return Signal.UNKNOWN


class RequestGuardSentinel:
    """Per-entity request guard: classify signals, track health state, cooldown."""

    def __init__(self, storage_dir: str = "storage/health"):
        self.dir = Path(storage_dir)
        self.dir.mkdir(parents=True, exist_ok=True)

    def _path(self, entity_id: str) -> Path:
        return self.dir / f"{entity_id}.json"

    def _load(self, entity_id: str) -> dict:
        p = self._path(entity_id)
        if p.exists():
            try:
                return json.loads(p.read_text("utf-8"))
            except (json.JSONDecodeError, OSError):
                pass
        return {
            "state": HealthState.HEALTHY.value,
            "until": 0.0,
            "last_signal": Signal.OK.value,
            "strikes": 0,
            "history": []
        }

    def _save(self, entity_id: str, state: dict) -> None:
        tmp = self._path(entity_id).with_suffix(".tmp")
        tmp.write_text(json.dumps(state), "utf-8")
        os.replace(tmp, self._path(entity_id))

    def is_available(self, entity_id: str) -> tuple[bool, float, str]:
        """Check if entity is available for requests.
        
        Returns:
            (available: bool, cooldown_remaining_s: float, state: str)
            - cooldown = -1.0 if quarantined (manual intervention needed)
            - cooldown = 0.0 if healthy
        """
        state = self._load(entity_id)
        current_state = state.get("state", HealthState.HEALTHY.value)
        if current_state == HealthState.HEALTHY.value:
            return True, 0.0, current_state

        if current_state == HealthState.QUARANTINED.value:
            return False, -1.0, current_state

        until = state.get("until", 0.0)
        remaining = until - time.time()
        if remaining <= 0:
            state["state"] = HealthState.HEALTHY.value
            state["until"] = 0.0
            self._save(entity_id, state)
            return True, 0.0, HealthState.HEALTHY.value
        return False, round(remaining, 1), current_state

    def record(self, entity_id: str, signal: Signal) -> HealthState:
        """Record signal; update state and strikes. Return new HealthState."""
        state = self._load(entity_id)
        state["last_signal"] = signal.value
        state["history"] = (state.get("history", []) + [[round(time.time()), signal.value]])[-50:]

        if signal in (Signal.OK, Signal.UNKNOWN):
            state["strikes"] = max(0, state.get("strikes", 0) - (1 if signal == Signal.OK else 0))
            self._save(entity_id, state)
            return HealthState(state.get("state", HealthState.HEALTHY.value))

        state["strikes"] = state.get("strikes", 0) + 1
        if signal in (Signal.CHALLENGE, Signal.AUTH_INVALID):
            state["state"] = HealthState.QUARANTINED.value
            state["until"] = time.time() + _COOLDOWN.get(signal, 0)
        else:
            state["state"] = HealthState.COOLING.value
            state["until"] = time.time() + _COOLDOWN.get(signal, 3600)
            if state["strikes"] >= 3:
                state["state"] = HealthState.QUARANTINED.value

        self._save(entity_id, state)
        return HealthState(state["state"])

    def reset(self, entity_id: str) -> None:
        """Manual reset (e.g., after solving captcha, re-login)."""
        self._save(entity_id, {
            "state": HealthState.HEALTHY.value,
            "until": 0.0,
            "last_signal": Signal.OK.value,
            "strikes": 0,
            "history": []
        })

    def history(self, entity_id: str, limit: int = 20) -> list[list]:
        """Fetch signal history (last N events)."""
        state = self._load(entity_id)
        return state.get("history", [])[-limit:]
