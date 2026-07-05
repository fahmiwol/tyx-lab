# Dialogue Tree: Branching Narrative Model

Declarative dialogue tree for NPC conversations with branching choices, conditions, and narrative outcomes. Supports dynamic dialogue generation and player agency.

## Input
- Dialogue definition: { nodes, edges, conditions, outcomes }

## Output
- Validated dialogue tree; ready for conversation engine

## Example
```json
{
  "name": "designer-greeting",
  "start_node": "greet_1",
  "nodes": [
    {
      "id": "greet_1",
      "speaker": "designer-npc",
      "text": "Hi! Working on a new design. What can I help with?",
      "type": "dialogue"
    },
    {
      "id": "choice_1",
      "speaker": "player",
      "type": "choice",
      "options": [
        { "id": "opt_help", "text": "I need design feedback" },
        { "id": "opt_busy", "text": "I'll leave you alone" }
      ]
    },
    {
      "id": "response_help",
      "speaker": "designer-npc",
      "text": "Sure! Send me the design.",
      "outcomes": { "relationship": 1 }
    }
  ],
  "edges": [
    { "from": "greet_1", "to": "choice_1" },
    { "from": "choice_1", "to": "response_help", "condition": "opt_help" }
  ]
}
```

See LOGIC.md for branching design and narrative patterns.
