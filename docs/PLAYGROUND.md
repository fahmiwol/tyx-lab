# Playground & Preview

No install needed to *try* the browser tools, and a one-liner to run the rest. Nothing here
is hosted by us — GitHub serves the source, your browser (or a free preview CDN) runs it.

## 1. Preview a web tool in your browser (zero install)

These tools are self-contained single-file web apps. Click **Open preview** — it renders the
tool live from this repo via `raw.githack.com` (a free CDN that serves GitHub files with the
right content type). Nothing is installed or hosted.

| Tool | Live preview | Source |
|------|--------------|--------|
| **ai-prompt-lab** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/ai-prompt-lab/src/index.html) | [source](tools/ai-prompt-lab) |
| **bg-remover** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/bg-remover/src/index.html) | [source](tools/bg-remover) |
| **image-to-3d** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/image-to-3d/src/index.html) | [source](tools/image-to-3d) |
| **image-to-video** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/image-to-video/src/index.html) | [source](tools/image-to-video) |
| **map-generator** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/map-generator/src/index.html) | [source](tools/map-generator) |
| **npc-generator** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/npc-generator/src/index.html) | [source](tools/npc-generator) |
| **photo-editor** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/photo-editor/src/index.html) | [source](tools/photo-editor) |
| **video-editor** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/video-editor/src/index.html) | [source](tools/video-editor) |
| **visual-flow-builder** | [▶ Open preview](https://raw.githack.com/fahmiwol/tyx-lab/main/tools/visual-flow-builder/src/index.html) | [source](tools/visual-flow-builder) |

> Note: the UI loads instantly. Features that call an AI/API need **your own key** — the
> preview won''t have one, so those buttons stay inert until you add a key (see each tool''s README).
> For full offline use, download the `src/index.html` and open it locally.

## 2. Run a module (copy-paste)

Modules are single-file, dependency-light. Grab the file and import it:
`ash
# example
curl -O https://raw.githubusercontent.com/fahmiwol/tyx-lab/main/modules/redis-queue-wrapper/src/index.ts
# then import the exported function into your project
`

## 3. Run a build-based tool (React / Vite)

Some tools (dashboards, editors) ship a small app. Download the tool folder, then:
`ash
cd tools/<tool>/src
npm install
npm run dev      # or: node index.js  for scripts/CLIs
`

## 4. Run the MCP server (query the whole library)

`ash
cd tools/tyx-lab-mcp/src
npm install
node server.js
`
Register it in your MCP client (Claude Desktop / Cursor):
`json
{ "mcpServers": { "tyx-lab": { "command": "node", "args": ["/abs/path/tyx-lab/tools/tyx-lab-mcp/src/server.js"] } } }
`
Then ask your agent to `search_atoms("...")` and `get_atom("...")`.

---

*Open source — use it wisely.*