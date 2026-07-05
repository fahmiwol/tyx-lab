# Parallel Tool Executor

Concurrent execution of independent tool calls.

## Features
- ThreadPoolExecutor (max 8 workers)
- Bundle-by-bundle execution (respects dependencies)
- Single tool sync fallback (avoid overhead)
- Maintains execution order

## Usage
```python
from parallel_tool_executor import execute_parallel
tool_calls = [
  {'name': 'web_search', 'args': {'q': '...'}},
  {'name': 'search_corpus', 'args': {'q': '...'}}
]
results = execute_parallel(tool_calls, session_id='123', step=1)
```

Open source — use it wisely.
