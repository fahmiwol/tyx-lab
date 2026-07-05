# How to Build an MCP Server

A comprehensive guide to authoring a Model Context Protocol MCP server from scratch. MCP servers expose tools to AI clients via stdio transport.

## Prerequisites

- Node.js 18+
- npm or equivalent
- Basic JavaScript knowledge
- Familiarity with REST APIs

## Architecture Overview

Your API -> MCP Server -> MCP Client (Claude, Cursor, VS Code)

The server listens on stdin/stdout for JSON-RPC messages, registers tools, and handles invocations.

## Step 1: Set Up Project

```bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
```

Create server.js:

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'my-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[my-server] ready on stdio');
```

## Step 2: Define Tools

Each tool needs a name, description, and input schema:

```javascript
const TOOLS = [
  {
    name: 'fetch_user',
    description: 'Fetch a user by ID from database.',
    inputSchema: {
      type: 'object',
      properties: {
        user_id: { type: 'string', description: 'User ID' },
      },
      required: ['user_id'],
    },
  },
];
```

## Step 3: Register Tools

```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS
}));
```

## Step 4: Handle Tool Calls

```javascript
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  
  try {
    let result;
    if (name === 'fetch_user') {
      result = await fetchUser(args.user_id);
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (e) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }],
      isError: true,
    };
  }
});

async function fetchUser(userId) {
  return { ok: true, user: { id: userId, name: 'John' } };
}
```

## Step 5: Register with Client

Claude Desktop - add to ~/.claude/claude_desktop_config.json:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/absolute/path/to/server.js"]
    }
  }
}
```

## Step 6: Test

Start server:
```bash
node server.js
```

Expected output:
```
[my-server] ready on stdio
```

Call from Claude Desktop or use test client.

## Common Patterns

### External API Calls

```javascript
async function fetchUser(userId) {
  const res = await fetch('https://api.example.com/users/' + userId);
  return res.json();
}
```

### Database Integration

```javascript
import Database from 'better-sqlite3';
const db = new Database('./data.db');

async function fetchUser(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return user || { error: 'Not found' };
}
```

### Environment Variables

```javascript
const API_KEY = process.env.MY_API_KEY || '';

async function fetchUser(userId) {
  return await fetch('https://api.example.com/users/' + userId, {
    headers: { 'Authorization': 'Bearer ' + API_KEY }
  }).then(r => r.json());
}
```

### Error Handling

Always catch and return errors as JSON:

```javascript
try {
  result = await someAsyncOperation();
} catch (e) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ error: e.message }) }],
    isError: true,
  };
}
```

### Logging

Log to stderr (stdout reserved for MCP protocol):

```javascript
console.error('Tool called:', { tool: name, args });
```

## Troubleshooting

- Server won't start: Check Node version (18+) and SDK installed
- Tools missing: Restart client and verify absolute path
- Tool calls fail: Add logging to handler and check args match schema

## See Also

- MCP Protocol Spec: https://spec.modelcontextprotocol.io/
- Official SDKs: https://github.com/modelcontextprotocol/
- Community Examples: https://github.com/modelcontextprotocol/servers

## License

MIT - Open source, use it wisely.
