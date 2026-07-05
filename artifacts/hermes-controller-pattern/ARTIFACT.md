# Hermes Controller — Multi-Agent Orchestration Pattern

## Vision

One shared **controller model** ("Hermes role") serves many **specialized agents**, each with:
- Own persona (system prompt, tools, executor model)
- Own memory (per-agent RAG with wikilinks)
- Cascade dispatch (controller → executor)

Full cycle: **task → recall memory → controller routes → tool runs → executor writes → store new memory note**.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  HERMES CONTROLLER                   │
│   (lightweight, model-agnostic: Gemini, Hermes)      │
│                                                       │
│  1. Load agent persona + tools                       │
│  2. Recall memory (RAG, wikilinks)                   │
│  3. Decide: TOOL + EXECUTOR MODEL                    │
│  4. Write brief for executor                         │
└───────────────────┬─────────────────────────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
      ┌──▼──┐  ┌───▼───┐  ┌──▼──┐
      │Tool1│  │Tool2  │  │Tool3│
      └──┬──┘  └───┬───┘  └──┬──┘
         │         │         │
    ┌────▼────┐ ┌──▼────┐ ┌──▼────┐
    │Executor1│ │Exec2  │ │Executor│
    │(Claude) │ │(Qwen) │ │(Kling)│
    └────┬────┘ └──┬────┘ └──┬────┘
         │         │         │
    ┌────▼────┬────▼────┬────▼────┐
    │ MEMORY  │ MEMORY  │ MEMORY   │
    │(agent1) │ (agent2)│ (agent3) │
    └─────────┴─────────┴──────────┘
```

## Per-Agent Persona

```json
{
  "id": "designer-1",
  "name": "Visual Designer",
  "role": "Storyboard creator",
  "controllerModel": "gemini-2.0-flash",
  "executorModel": "claude-opus",
  "tools": ["image_gen", "video_gen", "stitch_video"],
  "memoryDir": "memory/designer-1/"
}
```

## Cascade Flow

### Step 1: Recall Memory
```js
const recalled = memory.retrieve(agent.id, task, 3);
// → [{ title, body, score }, ...]
```

### Step 2: Controller Decides
```
CONTROLLER PROMPT:
  • Agent: Visual Designer
  • Available tools: [image_gen, video_gen, ...]
  • Recalled memory: [old storyboard notes, ...]
  • Task: "Create 16:9 storyboard for briket BBQ video"

CONTROLLER OUTPUT:
  {
    "thought": "Designer recalled old briket storyboard; reuse that style + visual DNA",
    "tool": "image_gen",
    "tool_args": { "prompt": "...", "style": "..." },
    "executor_brief": "Use recalled storyboard colors + Kling3.0 for video. Brief: ..."
  }
```

### Step 3: Executor Works
```js
const result = await runTool(decision.tool, decision.tool_args, {
  model: agent.executorModel,
  brief: decision.executor_brief
});
```

### Step 4: Write Result to Memory
```js
memory.writeNote(agent.id, {
  title: 'Briket BBQ Storyboard v2',
  body: result,
  links: ['Old Storyboard', 'Market Research'],
  tags: ['video', 'storyboard']
});
```

## Why This Works

1. **Lightweight Controller**: Fast decision (2–5s), not doing the work
2. **Memory-Aware**: Agents recall their past → consistent decisions
3. **Model Flexibility**: Swap Gemini ↔ Hermes ↔ Qwen with JSON config change
4. **Scalable**: Add agents without touching controller code
5. **Debuggable**: Every decision logged (controller thought + tool + brief)

## Trade-offs vs. Single-Model

| Aspect | Single LLM | Hermes Cascade |
|--------|-----------|----------------|
| Cost | High (one heavy model) | Low controller + medium executor |
| Speed | Slow (one LLM) | 2-tier: fast route, then heavy work |
| Memory usage | All context in one | Agent-local, retrieval on-demand |
| Scaling | Linear (add model) | Exponential (add agents) |
| Consistency | Depends on temperature | Persona + memory ensures consistency |

## Production Checklist

- [ ] Replace keyword retrieval with vector embeddings (scale beyond 100 notes)
- [ ] Add event logging: controller thought → executor result → memory write
- [ ] Implement job queue for long-running tools (video render, etc.)
- [ ] Add cost tracking per agent + tool
- [ ] Set timeout per tool (controller 5s, image_gen 30s, video 300s)
- [ ] Cache agent + tool definitions

## Related Atoms

- `memory-rag` — Per-agent memory with wikilinks
- `agent-cascade-router` — Reference implementation
- `provider-registry` — Manage available models
- `multi-tenant-privilege` — Agent access control (if SaaS)

*Open source — use it wisely.*
