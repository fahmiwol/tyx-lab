# Recipe: Build & Ship an MCP Server

## Description
Go from zero to a working Model Context Protocol server that any MCP client (Claude, an IDE, an agent) can call.

## Atoms Used
1. `artifacts/build-mcp-server` — the step-by-step method
2. `tools/mcp-server-starter` — the runnable stdio skeleton with an example tool
3. `modules/tools-catalogue-schema` — a typed registry for your tools
4. `tools/cli-tool-starter` — optional CLI wrapper for local testing

## Execution Order
build-mcp-server (read) -> mcp-server-starter (clone) -> add tools via tools-catalogue-schema -> register in client config -> test

## Final Output
A published MCP server exposing your own tools to any MCP-capable agent.

*Open source — use it wisely.*