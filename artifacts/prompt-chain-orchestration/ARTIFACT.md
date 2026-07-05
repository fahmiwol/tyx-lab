# Prompt Chain & Loop Orchestration — Iterative LLM Workflows

## Purpose
Compose multi-step LLM workflows with loops, conditionals, and state tracking — without custom code per workflow.

## Problem
- **Single-shot LLM limits**: One LLM call can't refine ideas iteratively or handle complex multi-hop reasoning
- **Custom orchestration**: Each workflow (research→analysis→write, brainstorm→refine→check) requires bespoke code
- **State opacity**: Loop iterations and conditional branches make control flow hidden
- **Error recovery**: If iteration N fails, restart from N or return best-effort from iteration N-1?

## Solution
Declarative chain spec: `{ steps: [{ prompt, condition?, loop?: { max_iterations, until_condition } }] }`. Each step receives prior output(s) as context; loop runs step N times until condition or max_iterations.

Template syntax (`{{ step_id.output }}`) enables step chaining without explicit passes. State is logged per iteration for post-hoc analysis.

## Key Patterns
1. **Step definition** — Each step = prompt template + input spec (which prior steps to feed)
2. **Conditionals** — `if(output.confidence > 0.8) then next_step else fallback_step`
3. **Loops** — Repeat step (e.g., "refine until user happy or 5 attempts"); each iteration sees prior output
4. **Aggregation** — Multi-branch results (parallel chains) merge before final step
5. **State capture** — All iterations logged; can replay or inspect any step's intermediate state
6. **Early exit** — Stop loop if output_quality(output) > threshold or error_count > limit

## Output
- Chain schema: `{ steps: [ { id, prompt, inputs: { stepId }, loop?: { max, until }, condition?: { if, then, else } } ] }`
- Executor: `executeChain(spec, context) → { final_output, iterations, state_log }`
- Condition evaluator: pluggable (LLM-based or heuristic)
- State inspector: query iterations, branch paths taken, outputs at each step

## Used in
- Brainstorm→refine cycles (creative generation)
- Research→analyze→write pipelines (multi-hop reasoning)
- QA/edit loops (draft→check→revise)
- Sidix agent workflows (iterate until quality threshold)

---

*Open source — use it wisely.*
