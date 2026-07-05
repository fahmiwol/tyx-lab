# Agent Memory: 3-Layer Progressive Retrieval

Three-layer memory architecture for agents that reduces context token use by 10x:

1. **Index layer** — SQLite FTS5 full-text search over all historical events
2. **Timeline layer** — recent events (last N days) always included
3. **Full context layer** — complete history retrieved only if needed

## Input
- query: search query (free text or FTS5 syntax)
- context_window: max tokens available (e.g., 2000)

## Output
- ranked results: [{ content, score, source_layer }]

## Example
```javascript
const memory = new AgentMemory(dbPath);

// Index: add event
await memory.add({
  timestamp: Date.now(),
  agent_id: 'designer-npc',
  event: 'Created mood board for autumn collection'
});

// Retrieve: query with progressive layers
const results = await memory.query('autumn collection', {
  max_tokens: 2000,
  layers: ['index', 'timeline', 'full']  // try in order
});
```

See LOGIC.md for retrieval strategy and token accounting.
