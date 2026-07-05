"""Flow/DAG executor: runs node graph with variable binding, control flow (foreach, filter), and logging.

JSON contract: { nodes: [{id, type, action, params, body, ...}] }
Types: trigger, action, foreach, filter, spinner, delay.
Binding: {{path.to.value}} interpolation in params.
"""
from __future__ import annotations

import re
import time
from typing import Any, Callable

_VAR = re.compile(r"\{\{\s*([^}]+?)\s*\}\}")
_STOP = "__STOP__"


def dig(ctx: dict, path: str) -> Any:
    """Resolve {{path.to.value}} in context."""
    cur: Any = ctx
    for part in path.split("."):
        if isinstance(cur, dict):
            cur = cur.get(part)
        elif isinstance(cur, list) and part.isdigit():
            cur = cur[int(part)] if int(part) < len(cur) else None
        else:
            cur = getattr(cur, part, None)
    return cur


def resolve(value: Any, ctx: dict) -> Any:
    """Recursively resolve {{...}} in dict/list/str."""
    if isinstance(value, str):
        m = _VAR.fullmatch(value.strip())
        if m:
            return dig(ctx, m.group(1))
        return _VAR.sub(lambda mm: str(dig(ctx, mm.group(1)) or ""), value)
    if isinstance(value, dict):
        return {k: resolve(v, ctx) for k, v in value.items()}
    if isinstance(value, list):
        return [resolve(v, ctx) for v in value]
    return value


class FlowExecutor:
    """Executes node DAG with context propagation."""

    def __init__(self, run_action_fn: Callable[[dict], dict]):
        """
        Args:
            run_action_fn: Callable taking {action, params, ...} → {ok, data, error, ...}
        """
        self.run_action = run_action_fn
        self.log = []

    def _emit(self, node_id: str, node_type: str, status: str, detail: Any = None):
        self.log.append({
            "node_id": node_id,
            "type": node_type,
            "status": status,
            "detail": detail,
            "ts": round(time.time(), 3)
        })

    def run(self, flow: dict, seed: dict | None = None) -> dict:
        """Execute flow DAG.
        
        Args:
            flow: {id: str, nodes: [...]}
            seed: Initial context values.
            
        Returns:
            {flow_id, log: [...], context_keys: [...]}
        """
        self.log = []
        ctx = seed or {}
        self._run_nodes(flow.get("nodes", []), ctx)
        return {
            "flow_id": flow.get("id"),
            "log": self.log,
            "context_keys": list(ctx.keys())
        }

    def _run_nodes(self, nodes: list, ctx: dict) -> str | None:
        for node in nodes:
            if self._run_node(node, ctx) == _STOP:
                return _STOP
        return None

    def _run_node(self, node: dict, ctx: dict) -> str | None:
        ntype = node.get("type", "action")

        if ntype == "trigger":
            ctx.update(resolve(node.get("emit", {}), ctx))
            self._emit(node.get("id", "trigger"), ntype, "ok")
            return None

        if ntype in ("action", "connector_read"):
            payload = {
                "action": node["action"],
                "params": resolve(node.get("params", {}), ctx),
            }
            result = self.run_action(payload)
            out_key = node.get("output", "result")
            ctx[out_key] = result.get("data")
            ctx[out_key + "_meta"] = {
                "ok": result.get("ok"),
                "signal": result.get("signal"),
                "error": result.get("error")
            }
            self._emit(node.get("id", "action"), ntype, "ok" if result.get("ok") else "fail",
                      {"action": node["action"], "signal": result.get("signal")})
            if not result.get("ok") and result.get("signal") in ("challenge", "auth_invalid", "blocked"):
                return _STOP
            return None

        if ntype == "foreach":
            items = resolve(node.get("items", []), ctx) or []
            var = node.get("as", "item")
            self._emit(node.get("id", "foreach"), ntype, "ok", {"count": len(items)})
            for it in items:
                child = dict(ctx)
                child[var] = it
                self._run_nodes(node.get("body", []), child)
            return None

        if ntype == "filter":
            ok = self._eval_condition(node.get("condition", {}), ctx)
            self._emit(node.get("id", "filter"), ntype, "pass" if ok else "skip")
            return None if ok else _STOP

        if ntype == "spinner":
            variants = node.get("variants", [])
            chosen = variants[0] if variants else ""
            ctx[node.get("output", "text")] = chosen
            self._emit(node.get("id", "spinner"), ntype, "ok", {"chosen": chosen[:60]})
            return None

        if ntype == "delay":
            secs = float(resolve(node.get("seconds", 0), ctx) or 0)
            time.sleep(min(secs, 30)) if secs > 0 else None
            self._emit(node.get("id", "delay"), ntype, "ok", {"seconds": secs})
            return None

        self._emit(node.get("id", "unknown"), ntype, "unknown_type")
        return None

    def _eval_condition(self, cond: dict, ctx: dict) -> bool:
        """Evaluate condition: {op, left, right}."""
        op = cond.get("op", "contains")
        left = resolve(cond.get("left"), ctx)
        right = resolve(cond.get("right"), ctx)
        s = (str(left) if left is not None else "").lower()
        
        if op == "contains":
            return str(right or "").lower() in s
        if op == "not_contains":
            return str(right or "").lower() not in s
        if op == "eq":
            return left == right
        if op == "gt":
            return float(left or 0) > float(right or 0)
        if op == "lt":
            return float(left or 0) < float(right or 0)
        if op == "any_keyword":
            kws = right if isinstance(right, list) else [right]
            return any(str(k).lower() in s for k in kws)
        return True
