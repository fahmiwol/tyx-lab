# Canvas Editor (Fabric.js)

2D canvas drawing and manipulation editor with REST API backend.

## Features

- **Fabric.js v6** — Full-featured object manipulation, layers, transforms
- **Export/Import** — Save canvas as JSON, load from storage
- **REST API** — Express backend for persistence
- **CORS Support** — Configurable origins
- **React UI** — Responsive canvas interface

## Setup

```bash
cd tools/canvas-editor
npm install
cd client && npm install && cd ..
npm run dev
```

Open `http://localhost:5173` (Vite proxies to port 3001).

## Production Build

```bash
cd client && npm run build && cd ..
npm start
```

Open `http://localhost:3001`.

## API

- `GET /health` — Health check
- `POST /canvas/save` — Save canvas state
- `GET /canvas/list` — List saved canvases
- `GET /canvas/:id` — Load specific canvas
- `POST /canvas/export` — Export as image

See docs/FUNCTIONS.md for details.

Open source — use it wisely.