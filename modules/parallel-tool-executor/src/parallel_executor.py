from __future__ import annotations
import concurrent.futures
from typing import Any

def execute_parallel(tool_calls: list[dict[str, Any]], *, session_id: str = "parallel", step: int = 0, allow_restricted: bool = False) -> list:
    results = []
    
    if not tool_calls:
        return results
    
    if len(tool_calls) == 1:
        tc = tool_calls[0]
        result = {"tool": tc["name"], "args": tc["args"], "result": "executed"}
        return [(tc, result)]
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=min(len(tool_calls), 8)) as executor:
        futures = {
            executor.submit(lambda t: (t, {"tool": t["name"], "result": "executed"})): tc
            for tc in tool_calls
        }
        
        concurrent.futures.wait(futures.keys())
        
        for tc in tool_calls:
            for future in futures:
                try:
                    result = future.result()
                    if result[0] is tc:
                        results.append(result)
                        break
                except:
                    results.append((tc, {"error": "execution failed"}))
                    break
    
    return results

__all__ = ["execute_parallel"]
