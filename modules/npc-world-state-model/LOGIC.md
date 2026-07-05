# NPC World State Model — Why This Exists

## The Problem

Multi-user 3D worlds (metaverse rooms, game scenes, collaborative environments) need to:
- Persist state durably (database, JSON file, API snapshot)
- Load the same scene consistently across clients
- Allow editing (drag NPCs, paint floors, place objects) without reimporting 3D models
- Sync partial updates (one agent moves; only send delta, not full scene)
- Version scenes (save/restore room states, undo/redo)

Without a **declarative state model**, these tasks require:
- Tightly coupling the renderer to data storage (hard to swap 3D engines)
- Encoding game logic in the 3D engine (objects are just mesh groups, not entities)
- Manual serialization for each feature (save/load/undo become N separate systems)

## The Solution: Scene-as-JSON

A **declarative, renderer-agnostic schema** where:

1. **Grid is the coordinate system** — all positions are [x, y] tile indices, not 3D vectors
2. **Objects and agents are data, not meshes** — the renderer fetches the mesh based on `type` and `color`
3. **Zones are declarative regions** — no overlap/ordering issues, just rectangles with metadata
4. **Theme is data-driven** — colors, fog, lighting come from JSON, not hardcoded shader parameters
5. **Serialization is trivial** — `JSON.stringify(world)` works; no runtime state hidden in object graphs

## Why This Shape

### grid: { w, h, tile }
- `w`, `h`: world dimensions in tiles
- `tile`: physical size of one tile (e.g., 1 unit = 1 meter)
- Allows scene reuse at different scales

### theme: { bg, floor, ... }
- Background color, floor color, environment constants
- Stored as hex codes or color names
- Renderer applies to camera, fog, materials

### objects: [{ type, tile, spec? }]
- Static/interactive objects (desk, chair, plant, portal)
- `type`: object template key (mesh, physics)
- `tile`: grid position
- `spec`: custom variant data

### agents: [{ id, name, tile, color }]
- NPCs or player avatars
- Fields align with agent-persona-registry
- Renderer fetches avatar by id

### zones: [{ x, y, w, h, label, color }]
- Declarative regions (meeting area, admin zone)
- Rectangles with optional text label
- Used for culling, permissions, visuals

### floors: [{ tile, color }]
- Painted floor tiles (sparse)
- Allows user painting, undo via list removal

## Trade-offs

✅ **Pros**
- Renderer-agnostic (swap Three.js easily)
- Trivial persistence
- Undo/redo = state snapshots
- Efficient diffs for networked sync
- Testable schema validation

❌ **Cons**
- Renderer must interpret types
- Grid-only (extend with 3D positions if needed)
- No animation data (motion is runtime)

---

Open source — use it wisely.
