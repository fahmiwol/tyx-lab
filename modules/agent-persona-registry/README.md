# Agent Persona Registry

Register and track NPC identities, personalities, skills, and task module assignments in a multi-agent system.

## Input
- Agent config object (name, role, skills, avatarUrl, color, modules, status)

## Output
- Registered agent entity with normalized metadata for runtime lookup

## Dependencies
- None (standalone schema)

## Example
```json
{
  "id": "designer-npc",
  "name": "Dina Mahesa",
  "role": "Visual Designer",
  "color": 13458314,
  "avatarUrl": "https://image.pollinations.ai/...",
  "skills": ["visual-design", "ai-image-generation", "microstock-production"],
  "modules": ["visual_design", "media_generate"],
  "status": "active"
}
```

See LOGIC.md for the reasoning behind this structure.
