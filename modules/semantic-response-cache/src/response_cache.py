from __future__ import annotations
import hashlib, json, logging, time
from collections import OrderedDict
from dataclasses import dataclass
from threading import Lock
from typing import Any, Optional

log = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    key: str
    value: Any
    created_at: float
    last_accessed: float
    hit_count: int = 0

class ResponseLRUCache:
    def __init__(self, max_size: int = 500, ttl_seconds: int = 3600):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self._cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self._lock = Lock()
        self._hits = self._misses = self._evictions = 0
    
    def _make_key(self, *parts) -> str:
        canonical = "|".join(str(p) for p in parts if p is not None)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:32]
    
    def get(self, *key_parts) -> Optional[Any]:
        key = self._make_key(*key_parts)
        with self._lock:
            entry = self._cache.get(key)
            if not entry:
                self._misses += 1
                return None
            now = time.time()
            if now - entry.created_at > self.ttl_seconds:
                del self._cache[key]
                self._misses += 1
                return None
            entry.last_accessed = now
            entry.hit_count += 1
            self._cache.move_to_end(key)
            self._hits += 1
            return entry.value
    
    def set(self, value: Any, *key_parts) -> str:
        key = self._make_key(*key_parts)
        with self._lock:
            now = time.time()
            entry = CacheEntry(key=key, value=value, created_at=now, last_accessed=now)
            if key in self._cache:
                del self._cache[key]
            self._cache[key] = entry
            self._cache.move_to_end(key)
            while len(self._cache) > self.max_size:
                self._cache.popitem(last=False)
                self._evictions += 1
            return key
    
    def stats(self) -> dict:
        with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total) if total else 0.0
            return dict(size=len(self._cache), max_size=self.max_size, hits=self._hits, misses=self._misses, evictions=self._evictions, hit_rate=round(hit_rate, 3), ttl_seconds=self.ttl_seconds)

_cache_instance: Optional[ResponseLRUCache] = None
_init_lock = Lock()

def get_cache() -> ResponseLRUCache:
    global _cache_instance
    if _cache_instance is None:
        with _init_lock:
            if _cache_instance is None:
                _cache_instance = ResponseLRUCache()
    return _cache_instance

__all__ = ["ResponseLRUCache", "get_cache"]
