#!/usr/bin/env node
// tyx-lab MCP server — makes the whole atomic library queryable by any MCP client.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const RAW = "https://raw.githubusercontent.com/fahmiwol/tyx-lab/main";
const API = "https://api.github.com/repos/fahmiwol/tyx-lab/contents";
let cache = null;
async function loadIndex() {
  if (cache) return cache;
  const res = await fetch(`${RAW}/index.json`);
  if (!res.ok) throw new Error(`index.json fetch failed: ${res.status}`);
  cache = await res.json();
  return cache;
}

const server = new McpServer({ name: "tyx-lab", version: "1.0.0" });

server.tool(
  "search_atoms",
  {
    query: z.string().describe("space-separated keywords matched against id/name/category/kind"),
    lane: z.enum(["module", "artifact", "tool"]).optional(),
    category: z.string().optional(),
    limit: z.number().default(15),
  },
  async ({ query, lane, category, limit }) => {
    const idx = await loadIndex();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = idx.atoms
      .filter((a) => (!lane || a.lane === lane) && (!category || a.category === category))
      .filter((a) => {
        const hay = `${a.id} ${a.name} ${a.category} ${a.kind || ""}`.toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, limit);
    const text = hits.length
      ? hits.map((a) => `- [${a.lane}] ${a.name} (${a.category}${a.kind ? "/" + a.kind : ""})\n  path: ${a.path}  id: ${a.id}`).join("\n")
      : "No atoms matched. Try broader keywords or list_categories.";
    return { content: [{ type: "text", text }] };
  }
);

server.tool(
  "get_atom",
  { path: z.string().describe("atom path, e.g. modules/redis-queue-wrapper") },
  async ({ path }) => {
    const res = await fetch(`${API}/${path}`);
    if (!res.ok) return { content: [{ type: "text", text: `Not found: ${path}` }] };
    const files = await res.json();
    let out = `# ${path}\nFiles: ${files.map((f) => f.name).join(", ")}\n\n`;
    const doc = files.find((f) => /^(README|ARTIFACT)\.md$/.test(f.name));
    if (doc && doc.download_url) { const d = await fetch(doc.download_url); out += await d.text(); }
    return { content: [{ type: "text", text: out.slice(0, 14000) }] };
  }
);

server.tool("list_categories", {}, async () => {
  const idx = await loadIndex();
  const counts = {};
  for (const a of idx.atoms) counts[a.category] = (counts[a.category] || 0) + 1;
  const text = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`).join("\n");
  return { content: [{ type: "text", text: `Total ${idx.atoms.length} atoms\n\n${text}` }] };
});

await server.connect(new StdioServerTransport());