# agent-cascade-router

2-tier LLM cascade: a lightweight **controller** picks the right tool + executor model, then a **specialist executor** does the work. Each agent has its own persona + tool set + executor model.

## Architecture

```
task
  ↓
[Controller] (lightweight, fast)
  ├─ recall memory (RAG)
  ├─ pick tool
  └─ pick executor model
      ↓
[Executor] (specialized, heavy)
  ├─ do the work
  └─ write result to memory
```

## Usage

```js
const { routeTask } = require('./cascade.js');
const mem = require('../memory-rag/src/memory.js');

const agent = {
  id: 'designer-1',
  name: 'Visual Designer',
  role: 'Storyboard creator',
  controllerModel: 'gemini-2.0-flash', // or hermes-4-70b via OpenRouter
  executorModel: 'claude-opus', // heavy model for quality output
  tools: ['image_gen', 'video_gen', 'stitch_video']
};

const task = 'Create a briket BBQ storyboard, 16:9, 3 scenes, cinematic mood';

// Route: controller decides → executor works
const route = await routeTask(agent, task, mem, { apiKey: process.env.LLM_KEY });

if (route.ok) {
  console.log(`Tool: ${route.selectedTool}`);
  console.log(`Executor brief: ${route.executorBrief}`);
  console.log(`Recalled memory:`, route.memory);
  // Now call the executor with route.executorBrief
}
```

## Model Flexibility

- **Controller**: Any LLM (set `agent.controllerModel`). Hermes, Qwen, Gemini all work.
- **Executor**: Depends on task complexity. Can be different per tool.
- **No lock-in**: Swap models by changing config, zero code changes.

## With Memory

Controller sees RAG results before deciding. Executor brief includes memory context. Result written back as a new note.

## Production Notes

- Controller timeout: 5–10s (fast decision)
- Executor timeout: depends on tool (60–300s for video)
- Cascade reduces controller load by ~70% (vs. controller doing everything)

*Open source — use it wisely.*
