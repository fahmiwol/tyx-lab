# memory-rag

Obsidian-style agent memory with markdown notes, [[wikilink]] retrieval, and knowledge lineage tracking.

## Features

- **Per-agent isolation**: Each agent gets its own memory directory
- **Wikilink support**: `[[Note Title]]` syntax for linking notes
- **Keyword-based retrieval**: TF-like scoring with title boost (3x vs. 1x for body)
- **Knowledge lineage**: Follow [[links]] recursively to build knowledge chains
- **Metadata frontmatter**: YAML frontmatter with id, title, tags, created timestamp

## Usage

```js
const mem = require('./memory.js');

// Retrieve notes by query
const results = mem.retrieve('agent-123', 'briket ekspor', 3);
// → [{ id, title, tags, body, links, score }, ...]

// Write a note with wikilinks
mem.writeNote('agent-123', {
  title: 'Storyboard Briket BBQ',
  body: 'Visual DNA: cinematic, 16:9 aspect ratio...',
  links: ['Market Research Briket', 'Video Guidelines'],
  tags: ['video', 'storyboard']
});

// Get knowledge lineage from a note
const chain = mem.lineage('agent-123', 'Storyboard Briket BBQ', 3);
// → [{ id, title }, { id, title }, ...]
```

## Note Format

```markdown
---
id: storyboard-briket-bbq-a1b2
title: Storyboard Briket BBQ
tags: video,storyboard
created: 2026-07-05T10:30:00Z
---

Visual DNA: cinematic, 16:9 aspect ratio...

## Terhubung
- [[Market Research Briket]]
- [[Video Guidelines]]
```

## Production Upgrade

Swap the keyword retrieval (`retrieve()`) for vector embeddings to scale beyond ~100 notes per agent.

*Open source — use it wisely.*
