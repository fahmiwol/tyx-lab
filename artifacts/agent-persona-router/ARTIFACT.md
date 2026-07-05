# Agent Persona Router — Multi-Persona Task Dispatch

## Purpose
Route tasks to specialized agent personas (Researcher, Designer, PM, Content Writer, QA) based on task intent, maintaining per-persona memory, model preferences, and capability sets without duplicating agent logic.

## Problem
- **Agent sprawl**: Large systems have many specialized agents (researcher, designer, PM, copywriter, QA, etc.), each with custom instruction and model
- **Memory fragmentation**: Each agent needs role-specific context (past tasks, style guide, success patterns) but shared RAG is inefficient
- **Capability confusion**: Which agent can do X? How do you compose multi-agent work (research → design → copywrite)?
- **Dynamic routing**: At runtime, how to know which agent should handle an input request?

## Solution
Central router mapping task type → persona, backed by persona registry (JSON/YAML). Each persona has:
- **Identity**: name, role, core instruction template, model preference
- **Capability tags**: `[research, design, writing, code_review, qa, ...]`
- **Memory scope**: isolated cache or shared corpus with role filter
- **Tool allowlist**: which APIs/services this persona can call
- **Escalation chain**: if can't handle, who to delegate to

Router classifies input (e.g., "write product copy" → `wordsmith`, "code review PR" → `reviewer`) and dispatches to appropriate persona's LLM call.

## Key Patterns
1. **Persona registry** — Each persona defined once: instruction, model, capabilities, memory filter
2. **Intent classifier** — Input → capability intent (cached; rerun if registry changes)
3. **Memory isolation** — Each persona stores/retrieves from role-tagged corpus section; prevents cross-contamination
4. **Escalation chain** — If primary persona overloaded or lacks capability, delegate to secondary (defined in persona config)
5. **Audit trail** — Log persona assignment + reason → post-analysis on routing quality

## Output
- Router factory: `createPersonaRouter(registry) → { dispatch(task, context) → { persona, output } }`
- Persona spec: `{ id, name, role, instruction, model_id, capabilities: string[], memory_tags: string[], tools: string[], escalate_to?: string }`
- Intent classifier: ML or rule-based (can be swapped out)

## Used in
- NPC Agent AI Ecosystem (22 agents, organized by role)
- Sidix multi-agent orchestration (research→design→publish pipeline)
- Any large system needing agent specialization without monolithic design

---

*Open source — use it wisely.*
