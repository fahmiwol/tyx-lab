# Visual Workflow Node Schema & Execution Contract

## Purpose
Define a minimal, extensible node spec for visual AI agent orchestration pipelines — enabling drag-drop workflow builders and multi-agent step chaining without reimplementing graphs for each app.

## Problem
- **Graph reinvention**: Each workflow/orchestration tool (n8n, Zapier, custom agents) defines nodes from scratch
- **Compatibility**: Agents, tools, and services don't share node metadata → can't auto-generate UIs or infer input/output
- **Execution gaps**: Visual editor and async engine speak different contracts → custom bridge code per tool
- **Port abstraction**: What's a "socket", "connection point", or "output pin"? How do loops, conditionals, and parallel branches map to async execution?

## Solution
Universal node archetype: `{ id, type, agentId, service, action, input_spec, output_spec, config }` with defined connection rules. Node types: `agent`, `service`, `condition`, `loop`, `notify`, `wait`.

Template interpolation across wire: `{{ stepId.output.field }}` (dot-path into previous step results). No implicit magic — outputs explicitly declared per node, consumed explicitly by following steps.

## Key Patterns
1. **Node contract** — Type, agent/service identity, input schema, output schema, immutable
2. **Port model** — Inputs are map of named sockets (e.g., `{ context, action_data }`); outputs are structured (not just string)
3. **Wire + interpolation** — Connect output port A → input port B; at execution, substitute `{{ a.output.fieldName }}` in B's input template
4. **Async execution** — Nodes fire sequentially or in parallel (declarative `waitFor` list); engine executes via provider (LLM, HTTP, local)
5. **Step result capture** — Each step persists `{ stepId, status, output, duration_ms, error? }` → future steps read from this record, not re-execute
6. **Validation before run** — Check all wires connected, all required inputs provided, templates resolvable

## Output
- Schema: `NodeDef, PortDef, WorkflowDef, WireConnection, ExecutionResult, StepResult`
- Engine hooks: `async executeNode(nodeDef, inputResolved, context) → StepResult`
- Validator: `validateWorkflow(def) → { valid: bool, errors: string[] }`
- Interpolator: `resolveTemplate(template, stepResults) → resolvedInput`

## Used in
- AI Agent Workflow Visual Script Builder (tldraw canvas → node graph → JSON → engine)
- Multi-agent orchestration (compose agent chains with service steps)
- Extensible: new node types (webhook trigger, conditional branch, map-reduce) fit schema

---

*Open source — use it wisely.*
