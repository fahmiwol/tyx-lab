# ReAct Agent Loop Pattern
**Status**: Canonical | **License**: MIT | **Source**: fahmiwol/sidix

## Overview
**ReAct** (Reasoning + Action + Observation) is a core agent execution pattern. The agent alternates between thinking (reasoning about what to do), acting (calling tools), observing (reading results), and looping until it has enough info to generate a final answer.

## Pattern Flow

```
User Question
    ↓
[Agent Thought] "What do I need to find?"
    ↓
[Agent Action] → call_tool(search_database, params)
    ↓
[Observation] → Tool Result: "Found X, Y, Z"
    ↓
[Loop Decision]
  - Is this enough info? → YES → [Final Answer]
  - Still missing? → NO → Back to [Thought]
```

## Pseudocode

```
function react_loop(question, max_steps=6):
    session = new_session(question)
    
    for step in range(max_steps):
        # 1. Generate thought
        thought = llm(f"Question: {question}\nContext: {session.context}\nWhat should I do?")
        
        # 2. Parse action
        action = parse_action(thought)  # extract tool_name + params
        if action.is_final_answer:
            return action.text
        
        # 3. Execute action (call tool)
        try:
            observation = call_tool(action.name, action.params)
        except ToolError:
            observation = "Tool failed. Try different approach."
        
        # 4. Store step in trace
        session.add_step(thought, action, observation)
        
        # 5. Decide: continue or finalize?
        if confidence_high(session) or step == max_steps-1:
            final = llm(f"Generate final answer from: {session.trace}")
            return final
    
    return "Max steps reached"
```

## Key Design Choices

1. **Max Steps Limit** — Prevent infinite loops (default 6, configurable)
2. **Tool Error Handling** — Gracefully degrade vs crash
3. **Observation Truncation** — Cap observation size to prevent context bloat
4. **Step Storage** — Keep full trace for debugging, learning, validation

## Configuration

```yaml
react_config:
  max_steps: 6                    # max loop iterations
  max_observation_tokens: 600     # truncate long results
  max_tool_errors: 3              # fail after N errors
  max_repeated_actions: 2         # prevent infinite retry loops
```

## LLM-Agnostic

This pattern works with:
- **Neural LLMs** (GPT, Claude, Qwen, etc.) — parse thoughts/actions from text
- **Rule-Based Agents** — hardcode thought as pattern-match, action as dispatch
- **Hybrid** — symbolic reasoning over neural embeddings

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Agent loops forever | Cap `max_steps`, detect repeated actions, add "I'm stuck" exit |
| Observation too long | Truncate to `max_observation_tokens`, summarize before storing |
| Tool not found | Graceful fallback, log error, try alternative |
| Hallucinated tool names | Whitelist available tools; parse strict JSON from LLM |

## Integration

### With Tool Registry
```python
available_tools = {
    "search_kb": search_knowledge_base,
    "fetch_doc": fetch_document,
    "compute": compute_expression,
}

observation = available_tools[action.name](**action.params)
```

### With Sanad Validation (IHOS)
```python
# Validate tool results before accepting observation
if not is_sanad_valid(observation.source):
    observation = "Source not trusted; try alternative tool"
```

## Why This Matters

- **Generalizable** — Works for coding, research, customer support, creative tasks
- **Transparent** — Full trace of reasoning visible to user (vs black-box LLM)
- **Iterative** — Naturally refinable through iteration; agent can backtrack
- **Tool-Agnostic** — Same pattern for web search, database, calculator, or custom tools

## Files & Examples
- Module: `modules/agent-react-loop/` (Python implementation)
- Examples: See sidix codebase `apps/brain_qa/brain_qa/agent_react.py`

## Related
- Self-Refining Agent Loop (post-generation refinement)
- Tool Registry Pattern (available actions)
- Wisdom Gate (tool permission checks)

*Open source — use it wisely.*
