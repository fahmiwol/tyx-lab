# Usage

## Input
```typescript
type Note = {
  id: string;        // slug / file path without extension
  title: string;
  content: string;   // raw markdown body
  tags?: string[];
  updated?: string;
};
```

## API

### `extractLinks(content: string): string[]`
Extract all `[[wikilink]]` references from markdown. Returns normalized slugs.

```typescript
const links = extractLinks("See [[my-note]] and [[another-article]]");
// → ["my-note", "another-article"]
```

### `backlinkIndex(notes: Note[]): Record<string, string[]>`
Build reverse index: note ID → array of IDs that link to it.

```typescript
const index = backlinkIndex([
  { id: "home", content: "[[about]]", title: "Home" },
  { id: "blog", content: "[[home]] and [[about]]", title: "Blog" }
]);
// → { about: ["home", "blog"], home: ["blog"] }
```

### `buildGraph(notes: Note[]): GraphData`
Convert notes + links into a force-graph structure (nodes + edges). Filters out dangling links.

```typescript
const graph = buildGraph(notes);
// → { 
//   nodes: [{id, title, degree}, ...],
//   links: [{source, target}, ...] 
// }
```

Use `graph` with D3, Three.js, or any force-directed layout library.

---

*Open source — use it wisely.*
