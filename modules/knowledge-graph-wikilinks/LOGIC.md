# Why This Exists

Markdown notes with wikilinks are a powerful pattern for capturing knowledge relationships without external databases. This module extracts that graph structure and makes it queryable.

## Problem Solved
- **Manual linking overhead**: Users write notes naturally with `[[references]]`, but can't visualize or query the network.
- **Backlink discovery**: Finding "what links to this note" requires iteration — instead, precompute an index.
- **Graph visualization**: The raw links aren't in a format suitable for D3, Three.js, or force-directed layout libraries.

## Design Decisions
- **Pure functions**: No I/O, mutable state, or side effects. Results are deterministic and composable.
- **Slug normalization**: "My Note Title" → "my-note-title" — consistent matching across variations.
- **Dangling link tolerance**: Links to non-existent notes are silently dropped (they're TODOs to write later).
- **Degree counting**: Both in-degree and out-degree tracked for layout weighting.
