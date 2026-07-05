/**
 * Canvas Editor API — by Cursor (CommonJS)
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function projectPath(id) {
  return path.join(DATA_DIR, `${id}.json`);
}

const app = express();
app.use(
  cors({
    origin: ['http://localhost:9797', 'http://localhost:8080', 'http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '25mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'Studio-canvas', version: '0.1.0', port: PORT }
  });
});

app.get('/canvas/list', (req, res) => {
  try {
    ensureDataDir();
    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
    const list = files.map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      return {
        id: raw.id,
        name: raw.name || 'Untitled',
        updatedAt: raw.updated_at || raw.updatedAt
      };
    });
    res.json({ success: true, data: { projects: list } });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e.message) });
  }
});

app.get('/canvas/:id', (req, res) => {
  try {
    const p = projectPath(req.params.id);
    if (!fs.existsSync(p)) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const doc = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e.message) });
  }
});

app.post('/canvas/save', (req, res) => {
  try {
    ensureDataDir();
    const body = req.body || {};
    const id = body.id || uuidv4();
    const name = body.name || 'Untitled';
    const fabric = body.canvas || body.fabric_json || {};
    const now = new Date().toISOString();
    const existingPath = projectPath(id);
    let created_at = now;
    if (fs.existsSync(existingPath)) {
      const prev = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      created_at = prev.created_at || prev.createdAt || now;
    }
    const doc = {
      id,
      name,
      fabric_json: fabric,
      created_at,
      updated_at: now
    };
    fs.writeFileSync(projectPath(id), JSON.stringify(doc, null, 2), 'utf8');
    res.json({ success: true, data: { id, name, updatedAt: now } });
  } catch (e) {
    res.status(500).json({ success: false, error: String(e.message) });
  }
});

app.post('/canvas/export', (req, res) => {
  const body = req.body || {};
  res.json({
    success: true,
    data: {
      message:
        'Raster/vector export runs in the Fabric client (PNG/JPG/SVG). Extend this endpoint for server-side PDF in a later phase.',
      received: Object.keys(body)
    }
  });
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

ensureDataDir();
app.listen(PORT, () => {
  console.log(`[by Cursor] Canvas Editor API http://localhost:${PORT}`);
});
