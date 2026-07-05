const orchestrator = new MediaOrchestrator(catalogue, { user_id: 'designer-npc' });

const result = await orchestrator.generate({
  type: 'image',
  prompt: 'Design concept for autumn collection',
  preferences: { prefer_free: true, max_cost: 0.50 }
});

// Tries fallback chain:
// 1. pollinations (free) → success → return
// 2. huggingface (if fail) → try
// 3. replicate (if still fail) → try
// Returns first successful result or error