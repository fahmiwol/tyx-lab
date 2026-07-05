# Semantic Response Cache (2-Tier)

In-memory LRU cache with TTL support and optional embedding-based semantic matching.

## Features

- **Phase A (Stable)**: Exact-match LRU with TTL expiration
- **Phase B (Optional)**: Semantic similarity matching via embeddings (BGE-M3, MiniLM)
- **Thread-safe**: Global singleton with lock protection
- **Memory-efficient**: Configurable max entries (default 500)
- **Hit rate tracking**: Built-in statistics and metrics

## Usage

```python
from semantic_response_cache import get_cache, is_cacheable

cache = get_cache()

# Check if query is cacheable
if is_cacheable(question, is_current_events=False):
    cached = cache.get("ask", question, persona, mode)
    if cached:
        return cached

answer = generate_answer(question)
cache.set(answer, "ask", question, persona, mode)

# Monitor performance
stats = cache.stats()
print(f"Hit rate: {stats[\"hit_rate\"]}")
```

## Configuration

- `max_size`: Maximum cache entries (default 500)
- `ttl_seconds`: Time-to-live per entry (default 3600)
- Anti-cache: Current events, user-specific context, streaming

## Reference

- Redis Semantic Cache (2024)
- LangChain CacheBackedEmbeddings
- Per-domain threshold: fiqh 0.96, factual 0.92, casual 0.88

Open source — use it wisely.
