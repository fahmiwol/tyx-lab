# ReAct Reasoning Loop

Reason + Act loop for agentic AI systems.

## Pattern
```
Thought -> Action (tool call) -> Observation -> Loop (max_steps=6)
```

## Features
- Max steps safeguard (default 6, configurable 18 for complex tasks)
- Anti-loop detection (MAX_ACTION_REPEAT=2, MAX_TOOL_ERRORS=3)
- Truncated observations (max 600 tokens to prevent bloat)
- ReActStep dataclass with full trace
- Session context (persona, client_id, agency_id)

## Usage
```python
from react_reasoning_loop import run_react_loop, AgentSession
session = AgentSession(question='How do I...?', persona='AYMAN')
result = run_react_loop(session)
print(result.final_answer)
print(result.steps)  # Full trace
```

Open source — use it wisely.
