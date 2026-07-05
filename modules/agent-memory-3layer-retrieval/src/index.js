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