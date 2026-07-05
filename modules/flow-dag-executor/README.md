# Flow DAG Executor

Lightweight declarative node DAG executor. Execute workflows from JSON with variable binding, control flow (loops, conditionals), and structured logging.

## Features
- **Declarative**: Pure JSON node graph (no imperative code).
- **Variable binding**: `{{context.path}}` string interpolation.
- **Control flow**: `foreach`, `filter`, early-exit.
- **Node types**: `trigger`, `action`, `delay`, `spinner`, `connector_read`.
- **Logging**: Full execution trace per node.

## Node Types

### trigger
```json
{"id": "init", "type": "trigger", "emit": {"var_name": "value"}}
```
Inject values into context.

### action / connector_read
```json
{"id": "post", "type": "action", "action": "publish", "params": {"text": "{{template}}"}, "output": "result"}
```
Call external function via `run_action(payload)`.

### foreach
```json
{"id": "loop", "type": "foreach", "items": "{{items}}", "as": "item", "body": [...]}
```
Iterate over array.

### filter
```json
{"id": "check", "type": "filter", "condition": {"op": "contains", "left": "{{status}}", "right": "ok"}}
```
Conditional branching. Operators: `contains`, `not_contains`, `eq`, `gt`, `lt`, `any_keyword`.

### delay
```json
{"id": "wait", "type": "delay", "seconds": 5}
```
Sleep.

### spinner
```json
{"id": "pick", "type": "spinner", "variants": ["a", "b", "c"], "output": "chosen"}
```
Pick random variant.

## Usage
```python
from index import FlowExecutor

def my_action(payload: dict) -> dict:
    """External action handler."""
    action = payload["action"]
    params = payload["params"]
    if action == "publish":
        return {"ok": True, "data": {"id": "post_123"}}
    return {"ok": False, "error": "unknown action"}

executor = FlowExecutor(run_action_fn=my_action)

flow = {
    "id": "demo_flow",
    "nodes": [
        {"id": "init", "type": "trigger", "emit": {"template": "Hello {{name}}"}},
        {"id": "post", "type": "action", "action": "publish", "params": {"text": "{{template}}"}, "output": "post_result"},
        {"id": "check", "type": "filter", "condition": {"op": "contains", "left": "{{post_result}}", "right": "ok"}}
    ]
}

result = executor.run(flow, seed={"name": "World"})
print(result)  # {flow_id, log: [...], context_keys: [...]}
```

*Open source — use it wisely.*
