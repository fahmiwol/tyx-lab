"""Sticky proxy pool manager: 1:1 binding between entity and proxy (residential, datacenter, VPN).

Consistency = anti-detection: same entity always uses same proxy IP. Rotation is across entities only.
Supports multiple proxy types. Persists bindings to JSON.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


class ProxyManager:
    """Pool-based proxy manager with sticky 1:1 entity→proxy binding."""

    def __init__(self, storage_dir: str = "storage/proxies"):
        self.dir = Path(storage_dir)
        self.dir.mkdir(parents=True, exist_ok=True)
        self.pool_file = self.dir / "pool.json"
        self.bind_file = self.dir / "bindings.json"

    def _load_json(self, path: Path) -> dict | list:
        if path.exists():
            try:
                return json.loads(path.read_text("utf-8"))
            except (json.JSONDecodeError, OSError):
                pass
        return {} if "bind" in path.name else []

    def _save_json(self, path: Path, data: dict | list) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

    # ---- Pool CRUD ----
    def add_proxy(self, url: str, kind: str = "residential", country: str | None = None) -> dict:
        """Add proxy to pool (idempotent by URL hash)."""
        pool = self._load_json(self.pool_file)
        if not isinstance(pool, list):
            pool = []
        
        pid = "px_" + hashlib.sha256(url.encode()).hexdigest()[:10]
        if any(p.get("id") == pid for p in pool):
            return next(p for p in pool if p["id"] == pid)
        
        entry = {"id": pid, "url": url, "kind": kind, "country": country, "enabled": True}
        pool.append(entry)
        self._save_json(self.pool_file, pool)
        return entry

    def list_proxies(self, show_urls: bool = False) -> list[dict]:
        """List all proxies (optionally mask URLs for security)."""
        pool = self._load_json(self.pool_file)
        if not show_urls:
            return [{**p, "url": f"[hidden-{p['kind']}]"} for p in pool]
        return pool

    def remove_proxy(self, proxy_id: str) -> bool:
        """Remove proxy from pool and unbind all entities."""
        pool = self._load_json(self.pool_file)
        new_pool = [p for p in pool if p.get("id") != proxy_id]
        self._save_json(self.pool_file, new_pool)
        
        binds = self._load_json(self.bind_file)
        for eid in list(binds.keys()):
            if binds[eid] == proxy_id:
                del binds[eid]
        self._save_json(self.bind_file, binds)
        return len(new_pool) < len(pool)

    def set_enabled(self, proxy_id: str, enabled: bool) -> bool:
        """Enable/disable proxy."""
        pool = self._load_json(self.pool_file)
        hit = False
        for p in pool:
            if p.get("id") == proxy_id:
                p["enabled"] = enabled
                hit = True
        self._save_json(self.pool_file, pool)
        return hit

    # ---- Sticky binding ----
    def bindings(self) -> dict[str, str]:
        """Return all entity→proxy bindings."""
        return self._load_json(self.bind_file) or {}

    def for_entity(self, entity_id: str) -> str | None:
        """Get sticky proxy URL for entity (assign from pool if needed)."""
        binds = self.bindings()
        pool = self._load_json(self.pool_file)
        
        if entity_id in binds:
            pid = binds[entity_id]
            p = next((px for px in pool if px.get("id") == pid and px.get("enabled")), None)
            if p:
                return p["url"]
            # proxy gone/disabled → unbind & re-assign
            del binds[entity_id]

        used = set(binds.values())
        for p in pool:
            if p.get("enabled") and p["id"] not in used:
                binds[entity_id] = p["id"]
                self._save_json(self.bind_file, binds)
                return p["url"]
        
        self._save_json(self.bind_file, binds)
        return None  # Pool exhausted

    def unbind(self, entity_id: str) -> None:
        """Remove entity binding."""
        binds = self.bindings()
        if entity_id in binds:
            del binds[entity_id]
            self._save_json(self.bind_file, binds)

    def status(self) -> dict:
        """Return pool/binding stats."""
        pool = self._load_json(self.pool_file)
        binds = self.bindings()
        enabled_proxies = [p for p in pool if p.get("enabled")]
        assigned = len(binds)
        free = max(0, len(enabled_proxies) - len(set(binds.values())))
        
        return {
            "total_proxies": len(pool),
            "enabled": len(enabled_proxies),
            "assigned_entities": assigned,
            "free_proxies": free,
            "utilization": f"{assigned}/{len(enabled_proxies)}" if enabled_proxies else "0/0"
        }
