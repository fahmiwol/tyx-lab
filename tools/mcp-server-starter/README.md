# MCP Server Skeleton

Minimal [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server template using **stdio transport**, with tool registration and example tool. Use as the foundation for adapting any service or API to MCP.

## Features

- **Minimal footprint**: ~100 lines of TypeScript
- **Stdio transport**: Works with Claude, Cursor, VS Code, Hermes
- **Example tools**: Two example tool handlers (fetch/action) — replace with your domain logic
- **MCP SDK**: Uses `@modelcontextprotocol/sdk` (v1.0+)
- **Extensible**: Add tools by editing `TOOLS` array and `handleTool()` function

## Installation

```bash
npm install @modelcontextprotocol/sdk
```

## Usage

### Run Standalone

```bash
node src/server.ts
```

The server will start listening on **stdin/stdout**. Press Ctrl+C to stop.

### Register in Claude Desktop

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-starter/src/server.ts"]
    }
  }
}
```

Restart Claude Desktop. The server and its tools will appear in the MCP panel.

### Register in Cursor / VS Code

Add to `.claude/settings.json` in your workspace:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-starter/src/server.ts"]
    }
  }
}
```

### Customize for Your API

1. **Edit `TOOLS`**: Replace example tool definitions with your own.
2. **Edit `handleTool()`**: Add tool handler logic for each tool name.
3. **Deploy**: Copy the file, update paths, and register in your client.

#### Example: Add a `weather_forecast` Tool

```typescript
const TOOLS = [
  {
    name: 'weather_forecast',
    description: 'Get a weather forecast for a location.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name or coordinates' },
        days: { type: 'number', description: 'Number of days (1-10)' },
      },
      required: ['location'],
    },
  },
  // ... other tools
];

async function handleTool(name, args) {
  if (name === 'weather_forecast') {
    const { location, days } = args;
    // Call your weather API here
    return { ok: true, location, forecast: [...] };
  }
  // ... other handlers
}
```

## Tool Anatomy

Each tool in `TOOLS` requires:

- **name**: Unique tool identifier (snake_case)
- **description**: 1-2 sentence user-facing description
- **inputSchema**: JSON Schema for tool arguments (type, properties, required)

Example input schema:

```json
{
  "type": "object",
  "properties": {
    "resource": { "type": "string", "description": "Resource ID" },
    "action": { "type": "string", "enum": ["get", "set"] }
  },
  "required": ["resource"]
}
```

## Error Handling

All tool results must be **JSON-serializable**. The server catches exceptions and returns:

```json
{
  "ok": false,
  "error": "Human-readable error message"
}
```

Example:

```typescript
async function handleTool(name, args) {
  try {
    // tool logic
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}
```

## Environment Variables

Pass API keys via environment variables (never hardcode):

```bash
MY_API_KEY=secret node src/server.ts
```

Inside `handleTool()`:

```typescript
const apiKey = process.env.MY_API_KEY || '';
```

## Debugging

The server logs startup to **stderr**:

```
[mcp-server-starter] ready on stdio
```

To see all MCP messages in Claude Desktop, enable debug logging:

1. Set environment variable: `DEBUG=mcp:*`
2. Restart Claude Desktop
3. Check Console output

## Testing

Call tools from any MCP client:

```python
# Example: Python MCP client
import asyncio
from mcp.client.stdio import StdioClient

async def main():
    async with StdioClient() as client:
        tools = await client.list_tools()
        result = await client.call_tool('example_fetch', {'resource': 'test'})
        print(result)

asyncio.run(main())
```

## See Also

- [MCP Documentation](https://modelcontextprotocol.io/)
- [SDK Reference](https://github.com/modelcontextprotocol/python-sdk)
- [Claude Integration](https://claude.ai/docs/integrations/mcp)

## License

MIT — Open source, use it wisely.
