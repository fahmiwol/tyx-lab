# tools/ — Runnable Mini-Tools, Mini-Apps & MCP Servers

Unlike `modules/` (importable code) and `artifacts/` (docs), a **tool** is something you
can **run**: a single-file web app, a CLI, an MCP server, a script, or a ready-to-drop-in
API integration. Each one does one useful job end to end.

```
tools/{slug}/
├── README.md    # what it does + HOW TO RUN it (the run command matters)
├── tool.json    # metadata (kind: cli | web-app | mcp-server | script | api-integration)
└── src/         # the runnable code (e.g. index.html for a web-app, server.ts for an MCP server)
```

Every tool is self-contained and anonymized — no keys, no private endpoints. Configure
secrets via environment variables. Open source — use it wisely.
