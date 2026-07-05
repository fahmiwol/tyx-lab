# Dialogue Tree: Branching Narrative — Why This Exists

## The Problem

NPC conversations that branch (player choices, dynamic outcomes) are hard to manage:
- Dialogue hardcoded in scripts (if player_chose_A { say_response_A } else { say_response_B })
- No overview (impossible to see all branches without reading code)
- Non-serializable (can't save player progress mid-conversation)
- Brittle (add new branch → refactor all following dialogue)
- No outcomes tracking (player chose A; did that affect NPC relationship, quest state, inventory?)

## The Solution: Declarative Dialogue Tree

A **graph-based dialogue system** where:

1. **Nodes are dialogue units** — NPC says something, or player chooses something
2. **Edges are transitions** — can be conditional (only follow if player chose X)
3. **Outcomes are side effects** — player choice → relationship change, quest update, item gained
4. **Serializable** — save player's position in tree, resume later
5. **Visualizable** — graph editor can draw conversation flow

## Why This Shape

### nodes: [{ id, speaker, text, type, options?, outcomes? }]
- `id`: unique node identifier (e.g., "greet_1", "choice_1")
- `speaker`: "npc-id" or "player"
- `text`: dialogue text
- `type`: "dialogue" (NPC speaks) or "choice" (player chooses)
- `options`: if type="choice", list of { id, text } for player to pick
- `outcomes`: side effects { relationship: delta, quest_update: X, inventory: [item] }

### edges: [{ from, to, condition? }]
- `from`, `to`: node IDs
- `condition`: optional event name (e.g., "opt_help" means "only follow if player chose this option")
- **No loops** (standard assumption; if you need multi-turn, nest nodes or use state)

### start_node, end_nodes
- `start_node`: which node to begin the conversation
- `end_nodes`: list of nodes that end the conversation (e.g., "goodbye_1")

### conditions object (optional, for complex logic)
```json
{
  "condition_id": { "type": "has_item", "item": "design_brief" }
}
```

Then reference: `{ "from": "greet_1", "to": "greet_expert", "condition": "condition_id" }`

## Why a Tree, Not a Script

**Script approach:**
```javascript
if (player_chose === 'help') {
  npc.say('Sure! Send me the design.');
  player.relationship += 1;
} else if (player_chose === 'busy') {
  npc.say('No problem, I'll keep working.');
  player.relationship -= 1;
}
```

**Tree approach:**
```json
{
  "edges": [
    { "from": "choice_1", "to": "response_help", "condition": "opt_help" }
  ],
  "nodes": [
    { "id": "response_help", "text": "Sure! Send me the design.", "outcomes": { "relationship": 1 } }
  ]
}
```

Benefits:
- Visual (draw as a graph)
- Mergeable (two writers branch the tree, merge non-conflicting branches)
- Reusable (include one subtree in another conversation)
- Debuggable (walk the tree step-by-step, inspect state at each node)
- Versionable (JSON diffs show what changed)

## Trade-offs

✅ **Pros**
- Easy to visualize (graph editors exist)
- Serializable (save conversation position)
- Modular (link subtrees, reuse dialogue)
- Supports complex branching (diamonds, merges)
- Outcomes are explicit (side effects visible in node def)

❌ **Cons**
- No dynamic generation (dialogue text is static strings)
- No context-aware responses (can't generate unique NPC response per player)
- Large trees become unwieldy (100+ nodes is hard to follow)
- No error handling (if condition fails, what happens?)

## How to Extend

### Dynamic dialogue (procedural generation):
```json
{
  "id": "greet_1",
  "speaker": "npc",
  "text_generator": "greeting_template",
  "template_vars": { "player_name": true, "time_of_day": true }
}
```

Then at runtime: `text = template.format({ player_name: "Fahmi", time_of_day: "morning" })`

### Conditional branching (complex logic):
```json
{
  "from": "choice_1",
  "to": "response_expert",
  "condition": {
    "type": "AND",
    "conditions": [
      { "type": "has_item", "item": "design_brief" },
      { "type": "player_relationship", "operator": ">=", "value": 5 }
    ]
  }
}
```

### Memory integration (what did player say before?):
```json
{
  "id": "greet_1",
  "text": "Hi {{player_name}}! How's that {{previous_project}} going?",
  "bindings": {
    "player_name": "memory.player.name",
    "previous_project": "memory.player.last_project"
  }
}
```

### Multi-turn conversations (looping):
```json
{
  "edges": [
    { "from": "choice_1", "to": "choice_1", "condition": "ask_more" }
  ]
}
```

Looping back allows multi-turn without unrolling the tree.

---

Open source — use it wisely.
