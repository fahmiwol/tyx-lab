# motion-director-mcp

MCP server exposing the Motion Director AI-video pipeline as 18 tools. Thin facade over the Motion Director REST API (running at https://motion.tiranyx.co.id or localhost:3201).

## Pipeline

```
motion_quick_storyboard(idea)       ← ONE call: create → DNA → lock → storyboard
  ↓
motion_approve_storyboard
  ↓
per-scene: motion_generate_keyframes → motion_generate_scene_video → motion_generate_voiceover
  ↓
motion_render_video → final MP4
```

## Tools (Core)

- `motion_quick_storyboard(name, idea)` — Full entry point: idea → reviewable storyboard
- `motion_list_projects()` — List all projects
- `motion_get_project(projectId)` — Get project with scenes/assets
- `motion_generate_visual_dna(projectId)` — Create consistent look/style contract
- `motion_lock_visual_dna(dnaVersionId)` — Lock DNA (required before storyboard)
- `motion_generate_storyboard(projectId, dnaVersionId)` — Generate scenes
- `motion_approve_storyboard(projectId)` — Unlock asset generation
- `motion_generate_keyframes(sceneId)` — Generate images for scene
- `motion_generate_scene_video(sceneId, tier)` — i2v clip (tier: cheap/mid/premium/ultra)
- `motion_generate_voiceover(sceneId)` — Voice-over with timing for captions
- `motion_render_video(projectId)` — Final render with clips + VO + BGM
- `motion_get_job(jobId)` — Poll async jobs (i2v, render)
- `motion_provider_status()` — Check provider health

## Use in Claude Desktop

Add to `~/.claude/mcp-servers.json`:

```json
{
  "mcpServers": {
    "motion-director": {
      "command": "node",
      "args": ["/path/to/server.mjs"],
      "env": { "MOTION_API": "https://motion.tiranyx.co.id" }
    }
  }
}
```

## Use with Hermes Agents

Already wired via `server/mcp-bridge.js`. All 18 tools discoverable and callable.

## Run

```bash
MOTION_API=https://motion.tiranyx.co.id node server.mjs
```

*Open source — use it wisely.*
