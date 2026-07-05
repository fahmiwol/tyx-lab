# Skill Registry Contract Pattern

Define agent skills with enforced contracts: every skill must have a description, typed parameters, and clear semantics. Boot-time validation catches misconfiguration before runtime.

## Input
- Skill definition: { name, description, params, handler }

## Output
- Validated skill entry; throws on missing description or param type info

## Example
```javascript
defineSkill({
  name: 'visual_design',
  description: 'Create visual design concepts with mood boards and color palettes',
  params: {
    topic: { type: 'string', description: 'Design topic or brief' },
    style: { type: 'string', enum: ['modern', 'vintage', 'minimalist'] }
  },
  handler: async (params) => {
    // implementation
    return { designs: [...] };
  }
});
```

Attempting to register a skill without description will throw at gateway boot.

See LOGIC.md for the contract design rationale.
