export type Note = {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  updated?: string;
};

export type GraphData = {
  nodes: { id: string; title: string; degree: number }[];
  links: { source: string; target: string }[];
};

const WIKILINK = /\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g;

export function extractLinks(content: string): string[] {
  const out = new Set<string>();
  for (const m of content.matchAll(WIKILINK)) out.add(slug(m[1]));
  return [...out];
}

export function slug(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

export function backlinkIndex(notes: Note[]): Record<string, string[]> {
  const idx: Record<string, string[]> = {};
  for (const n of notes) {
    for (const target of extractLinks(n.content)) {
      (idx[target] ??= []).push(n.id);
    }
  }
  return idx;
}

export function buildGraph(notes: Note[]): GraphData {
  const ids = new Set(notes.map((n) => n.id));
  const degree: Record<string, number> = {};
  const links: GraphData["links"] = [];
  for (const n of notes) {
    for (const target of extractLinks(n.content)) {
      if (!ids.has(target)) continue;
      links.push({ source: n.id, target });
      degree[n.id] = (degree[n.id] ?? 0) + 1;
      degree[target] = (degree[target] ?? 0) + 1;
    }
  }
  const nodes = notes.map((n) => ({ id: n.id, title: n.title, degree: degree[n.id] ?? 0 }));
  return { nodes, links };
}
