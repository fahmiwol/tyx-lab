# Agent Memory: 3-Layer Retrieval — Why This Exists

## The Problem

Agent systems that remember conversation history hit a wall:

- **Token cost explodes** — storing 1000 events = 10k+ tokens; at \$0.01 per 1M, that's \$0.0001 per call
- **Context window fills up** — 4k-token context limit means ~50 events max before hitting ceiling
- **Naive retrieval fails** — "get all events" works until 10k events, then query time is seconds
- **No ranking** — all historical events treated equally (old and new, relevant and noise)

Result: agents either forget everything after 50 calls, or blow context window with full history.

## The Solution: 3-Layer Progressive Retrieval

A **tiered memory system** that:

1. **Layer 1: Index** — FTS5 (SQLite full-text search) finds relevant events by keyword
   - Cost: one fast query (~1ms), returns top K matches
   - Used first because most relevant events match the query

2. **Layer 2: Timeline** — recent events (last N days) always included
   - Cost: select * WHERE timestamp > now() - N days
   - Used second because recency matters (what happened last week is usually relevant)

3. **Layer 3: Full context** — complete history retrieved only if still under token limit
   - Cost: full table scan (slow, only do this if layer 1+2 didn't fill context)
   - Used last resort if agent asks "what have we ever done?"

**Token accounting at each layer:**
```
Layer 1 (index):    500 tokens used, 1500 remaining
Layer 2 (timeline): +300 tokens, 1200 remaining
Layer 3 (full):     +1000 tokens, 200 remaining → stop
```

Typical result: ~800 tokens of relevant history fits in 2000-token context (vs 2000 full history).

## Why This Shape

### FTS5 (not embeddings)
- **Embeddings** (e.g., OpenAI) cost $0.02 per 1M tokens; with 10k events, that's \$0.0002 per query
- **FTS5** (SQLite) cost $0; already running; slightly less accurate but good enough
- **Trade-off**: FTS5 misses semantic similarity (agent says "happy" but memory stored "joyful"), but covers 90% of use cases
- **Upgrade path**: if FTS5 accuracy isn't enough, add embeddings later (doesn't break existing setup)

### Timeline layer
- Recent events are almost always relevant (what happened last week > what happened a year ago)
- Time-based cutoff (last 7 days) is simpler than ranking by recency (O(1) vs O(N log N))
- Can be tuned per agent (high-frequency agents: 3 days; slow agents: 30 days)

### Progressive retrieval
- Try cheap sources first (FTS5: 1ms)
- Fall back to expensive sources (full scan: 100ms) only if needed
- Most queries finish at layer 1 or 2; layer 3 is rare

### SQLite FTS5 (not external search engine)
- No infrastructure (Elasticsearch, Typesense cost $$$)
- Runs locally (no data sent to third party)
- Bundled with most languages (Node.js sqlite3, Python sqlite)

## Trade-offs

✅ **Pros**
- 10x token reduction (800 relevant tokens vs 2000 full history)
- Cost savings cascade (fewer tokens = fewer LLM calls or faster completion)
- No embeddings vendor lock-in
- Offline-capable (all in SQLite)
- Easy to debug (query → see exactly what was retrieved)

❌ **Cons**
- FTS5 doesn't understand semantics (misses paraphrases)
- Recency bias (old but relevant events deprioritized)
- Timeline cutoff is arbitrary (7 days good for some agents, wrong for others)
- No ranking by relevance (FTS5 returns all matches, must truncate)

## How to Extend

### Add BM25 ranking to FTS5 (better relevance):
```sql
SELECT *, BM25(events) as rank FROM events WHERE events MATCH 'query'
ORDER BY rank DESC LIMIT 20
```

### Per-agent memory settings:
```javascript
{
  agent_id: 'designer-npc',
  memory: {
    index_query_limit: 30,        // return top 30 FTS5 results
    timeline_days: 7,              // include last 7 days
    max_context_tokens: 1500       // stop filling context at 1500
  }
}
```

### Add embeddings for semantic search:
```javascript
// If FTS5 returns < 5 results, fall back to embedding search
const fts_results = await db.search(query, { limit: 5 });
if (fts_results.length < 5) {
  const embedding = await embed(query);
  const semantic_results = await db.searchByEmbedding(embedding, { limit: 20 - fts_results.length });
  return [...fts_results, ...semantic_results];
}
```

---

Open source — use it wisely.
