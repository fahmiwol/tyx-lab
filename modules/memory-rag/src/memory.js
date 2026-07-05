// Per-agent memory RAG, Obsidian-style: markdown notes + [[wikilinks]] + keyword retrieval + lineage.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'memory');
const STOP = new Set('yang dan di ke dari untuk dengan pada adalah ini itu the a an of to for with on in is are be as kamu saya buat bikin apa atau juga agar biar per dll'.split(' '));

function agentDir(agentId) {
  const d = path.join(ROOT, agentId);
  fs.mkdirSync(d, { recursive: true });
  return d;
}
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50); }
function tokens(s) { return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(t => t.length > 2 && !STOP.has(t)); }

function parseNote(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = {}; let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split('\n')) {
      const mm = line.match(/^(\w+):\s*(.*)$/);
      if (mm) meta[mm[1]] = mm[2];
    }
  }
  const links = (raw.match(/\[\[([^\]]+)\]\]/g) || []).map(x => x.slice(2, -2));
  return { file, id: meta.id || path.basename(file, '.md'), title: meta.title || '', tags: meta.tags || '', body, links };
}

function listNotes(agentId) {
  const d = agentDir(agentId);
  return fs.readdirSync(d).filter(f => f.endsWith('.md')).map(f => parseNote(path.join(d, f)));
}

// Keyword retrieval: shared-term score + title boost. (Prod upgrade: vector embeddings.)
function retrieve(agentId, query, k = 3) {
  const q = new Set(tokens(query));
  const notes = listNotes(agentId);
  const scored = notes.map(n => {
    const tt = tokens(n.title), bt = tokens(n.body);
    let s = 0;
    for (const t of tt) if (q.has(t)) s += 3;
    for (const t of bt) if (q.has(t)) s += 1;
    return { note: n, score: s };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(x => ({ ...x.note, score: x.score }));
}

// Knowledge lineage: follow [[links]] from a note recursively.
function lineage(agentId, title, depth = 3, seen = new Set()) {
  if (depth <= 0) return [];
  const notes = listNotes(agentId);
  const start = notes.find(n => n.title === title || n.id === slug(title));
  if (!start || seen.has(start.id)) return [];
  seen.add(start.id);
  const chain = [{ id: start.id, title: start.title }];
  for (const l of start.links) chain.push(...lineage(agentId, l, depth - 1, seen));
  return chain;
}

function writeNote(agentId, { title, body, links = [], tags = [] }) {
  const d = agentDir(agentId);
  const id = slug(title) + '-' + Date.now().toString(36).slice(-4);
  const linkStr = links.length ? '\n\n## Terhubung\n' + links.map(l => `- [[${l}]]`).join('\n') : '';
  const fm = `---\nid: ${id}\ntitle: ${title}\ntags: ${tags.join(',')}\ncreated: ${new Date().toISOString()}\n---\n`;
  fs.writeFileSync(path.join(d, id + '.md'), fm + body + linkStr, 'utf8');
  return { id, title };
}

module.exports = { retrieve, writeNote, listNotes, lineage, agentDir };
