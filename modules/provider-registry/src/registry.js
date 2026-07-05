// Provider Registry: config-driven provider catalog for LLMs, executors, media services.
// Add providers via JSON, zero code changes. Filter by kind + enabled status.
const fs = require('fs');
const path = require('path');

function providers() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'providers.json'), 'utf8')); }
  catch { return { router: [], executor: [], media: [] }; }
}

module.exports = {
  get routerModels() { return (providers().router || []).filter(p => p.enabled !== false); },
  get executorModels() { return (providers().executor || []).filter(p => p.enabled !== false); },
  get mediaProviders() { return (providers().media || []).filter(p => p.enabled !== false); },

  toolsCatalog: [
    { id: 'image_gen', label: 'Image generator' },
    { id: 'video_gen', label: 'Image→Video' },
    { id: 'web_search', label: 'Web search / research' },
    { id: 'note_write', label: 'Write to memory' },
    { id: 'tts', label: 'Text-to-Speech' },
    { id: 'remove_bg', label: 'Remove background' },
  ],
  skillsCatalog: ['image-to-video', 'image-to-3d', 'video-editor', 'tts', 'voice-persona'],

  // Mutator: add/update a provider in the registry
  addProvider(kind, entry) {
    const p = providers();
    if (!p[kind]) p[kind] = [];
    const i = p[kind].findIndex(x => x.id === entry.id);
    if (i >= 0) p[kind][i] = { ...p[kind][i], ...entry }; else p[kind].push(entry);
    fs.writeFileSync(path.join(__dirname, 'providers.json'), JSON.stringify(p, null, 2));
    return entry;
  },

  // Getters for admin UI
  getProvidersByKind(kind) {
    return (providers()[kind] || []).filter(p => p.enabled !== false);
  }
};
