/**
 * MCP Server Skeleton
 * Minimal stdio transport MCP server template with tool registration & example tool
 * Ready to adapt for any service/API
 * 
 * Usage:
 *   node mcp_server_starter.js
 * 
 * Register in client (.claude/settings.json or Claude Desktop config):
 *   {
 *     "mcpServers": {
 *       "my-server": {
 *         "command": "node",
 *         "args": ["/path/to/mcp_server_starter.js"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// ============================================
// Tool Definitions (customize here)
// ============================================

const TOOLS = [
  {
    name: 'example_fetch',
    description: 'Fetch and parse data from an example API. Customize endpoint & schema.',
    inputSchema: {
      type: 'object',
      properties: {
        resource: { type: 'string', description: 'Resource ID or name to fetch' },
        format: { type: 'string', enum: ['json', 'text'], description: 'Response format' },
      },
      required: ['resource'],
    },
  },
  {
    name: 'example_action',
    description: 'Perform an action (create, update, delete). Customize for your domain.',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['create', 'update', 'delete'] },
        id: { type: 'string', description: 'Resource ID' },
        data: { type: 'object', description: 'Action payload' },
      },
      required: ['action'],
    },
  },
];

// ============================================
// Tool Handlers (customize here)
// ============================================

async function handleTool(name, args) {
  try {
    if (name === 'example_fetch') {
      // Replace with actual API call
      const resource = args.resource || 'unknown';
      const format = args.format || 'json';
      return {
        ok: true,
        resource,
        format,
        data: { id: resource, sample: true },
      };
    } else if (name === 'example_action') {
      const { action, id, data } = args;
      return {
        ok: true,
        action,
        id: id || 'new',
        result: data || {},
      };
    } else {
      return { ok: false, error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

// ============================================
// MCP Server (no changes needed below)
// ============================================

const server = new Server(
  { name: 'mcp-server-starter', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const result = await handleTool(name, args || {});
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('[mcp-server-starter] ready on stdio');
