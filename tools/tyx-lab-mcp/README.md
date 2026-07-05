# tyx-lab MCP Server — the library brain

**Kind:** mcp-server · **Category:** ai · **Status:** beta

An MCP server that turns the whole tyx-lab library into a **live, queryable knowledge base**.
Any MCP client (Claude Desktop, an IDE, an agent) can search and pull atoms on demand.

## Tools
- `search_atoms(query, lane?, category?, limit?)` — keyword search across every atom
- `get_atom(path)` — fetch an atom''s doc by path
- `list_categories()` — category breakdown + total

Reads `index.json` live from GitHub, so it always reflects the current library.

## Run
```bash
cd tools/tyx-lab-mcp/src && npm install && node server.js
```

## Register (Claude Desktop / Cursor / any MCP client)
```json
{ "mcpServers": { "tyx-lab": { "command": "node", "args": ["/abs/path/tyx-lab/tools/tyx-lab-mcp/src/server.js"] } } }
```

## Why
Instead of reading 188 atoms, your agent asks `search_atoms("rate limit redis")`, gets the path,
calls `get_atom(...)`, and lifts the code or method. The library becomes system memory.

---

*Open source — use it wisely.*