# Recipe: Self-Hosted Agentic Stack (no vendor lock-in)

## Description
Stand up an autonomous agent that runs on your own model, remembers efficiently, calls tools
safely, and exposes itself over MCP — end to end, self-hosted.

## Atoms Used
1. `artifacts/self-hosted-model-serving` — serve a local SLM
2. `modules/agent-memory-3layer-retrieval` — progressive memory (FTS + timeline + full)
3. `modules/skill-registry-contract` + `modules/tools-catalogue-schema` — safe tool registry
4. `tools/agentic-framework` — the reason to act to observe loop
5. `tools/mcp-server-starter` — expose the agent tools over MCP
6. `artifacts/ihos-epistemology-framework` — grounded, sourced reasoning

## Execution Order
self-hosted-model-serving -> agentic-framework loop (agent-memory + tool registry + mcp-server-starter)

## Final Output
A private, self-hosted agent with no per-token vendor cost, efficient memory, a governed tool registry, and an MCP interface.

*Open source — use it wisely.*