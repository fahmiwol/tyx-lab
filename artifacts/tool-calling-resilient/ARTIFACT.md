# Tool-Calling Resilience — Schema Validation, Retry, and Fallback

## Purpose
Standardize LLM tool calls across providers (Anthropic, OpenAI, Anthropic with tools, open-source models via function calling), with validation, auto-retry on transient failures, and graceful fallback when tool execution fails.

## Problem
- **Provider tool differences**: Anthropic tools ≠ OpenAI functions; open-source models need custom tool schemas → custom calling code per provider
- **Validation gaps**: LLM returns malformed tool args; no schema validation before execution
- **Execution failures**: Tool call fails (API down, invalid input) → LLM doesn't know; has no chance to retry or adjust
- **Recovery unclear**: Should LLM get entire error message? A sanitized hint? Try a different tool?

## Solution
Universal tool schema (name, description, input_schema, output_schema) compiled for each provider's native format at runtime. Before execution, validate args against input_schema; if invalid, return error to LLM with hint to fix. On execution failure, return error message and allow LLM to retry the tool call or select fallback tool.

## Key Patterns
1. **Tool registry** — Define once: `{ id, name, description, input_schema (JSON Schema), output_schema, handler_function }`
2. **Provider compilation** — At runtime, format registry for Anthropic tools, OpenAI functions, or raw JSON (for open-source)
3. **Arg validation** — Before calling handler, validate args against input_schema; return structured error if invalid
4. **Execution wrapping** — Call handler in try-catch; return `{ status: success|error, output?, error? }`
5. **LLM feedback loop** — Send tool result back to LLM with context: if error, include reason so LLM can adjust args or pick different tool
6. **Retry budget** — Allow LLM N retries per tool call sequence (protect against infinite loops)

## Output
- Tool schema: `{ id, name, description, input_schema, output_schema, handler, fallback_tool_id? }`
- Registry: `createToolRegistry(tools) → { compile(provider) → providerFormat, validate(tool_id, args), execute(tool_id, args) }`
- Middleware: attach to LLM stream to intercept tool calls, validate, execute, and return results

## Used in
- Agent systems with tool use (any LLM agent calling APIs, databases, services)
- Multi-provider compatibility (same tool registry works with Claude, GPT, local models)

---

*Open source — use it wisely.*
