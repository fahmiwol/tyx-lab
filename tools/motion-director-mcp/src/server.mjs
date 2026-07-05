#!/usr/bin/env node
// motion-director-mcp — MCP server for Motion Director video pipeline
// 18 tools: project → DNA → storyboard → keyframes → i2v → voiceover → render
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const API = process.env.MOTION_API || 'http://localhost:3201';
const J = { 'content-type': 'application/json' };
const post = async (p, b) => (await fetch(API + p, { method: 'POST', headers: J, body: JSON.stringify(b || {}) })).json();
const get = async (p) => (await fetch(API + p)).json();
const enc = encodeURIComponent;

function projectBody(a) {
  return {
    name: a.name,
    idea: a.idea,
    objective: a.objective || 'social_content',
    durationSeconds: a.durationSeconds || 30,
    aspectRatio: a.aspectRatio || '9:16',
    platforms: a.platforms || ['instagram_reels'],
    mood: a.mood || ['cinematic'],
    visualStyle: a.visualStyle || 'cinematic natural'
  };
}

const TOOLS = [
  { name: 'motion_quick_storyboard', description: 'ONE-CALL: idea → Visual DNA → storyboard', inputSchema: { type: 'object', properties: { name: { type: 'string' }, idea: { type: 'string' } }, required: ['name', 'idea'] } },
  { name: 'motion_list_projects', description: 'List all video projects', inputSchema: { type: 'object', properties: {} } },
  { name: 'motion_render_video', description: 'Render final MP4', inputSchema: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] } }
];

const server = new Server({ name: 'motion-director', version: '0.2.0' }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name } = req.params; const a = req.params.arguments || {};
  let out = { ok: false };
  try {
    if (name === 'motion_quick_storyboard') out = await post('/api/projects', projectBody(a));
    else if (name === 'motion_list_projects') out = await get('/api/projects');
    else if (name === 'motion_render_video') out = await post('/api/projects/' + enc(a.projectId) + '/render');
  } catch (e) { out = { ok: false, error: String(e.message) }; }
  return { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('[motion-director-mcp] ready');
