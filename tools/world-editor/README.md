# World Config Editor

Monaco-based JSON editor for world configuration management.

## Features

- **Monaco Editor** — Full syntax highlighting, IntelliSense, validation
- **Gateway Integration** — Load/save world.json directly from backend
- **Syntax Checking** — Real-time JSON validation
- **Save Protection** — Backup warning for large file changes

## Setup

```bash
cd tools/world-editor
npm install
npm run dev
```

Open `http://localhost:3060`.

**Important**: Click "Load from gateway" before editing to sync with server state.

## Environment

Create `.env`:
```
VITE_GATEWAY_URL=http://localhost:9797
```

## API

- `GET /api/world/load` — Fetch world.json
- `POST /api/world/save` — Save world.json (overwrites config/world.json on server)

## Warning

The save endpoint overwrites the config file on the host running the gateway. Use git or backup before large changes.

## Build

```bash
npm run build
npm run preview
```

Open source — use it wisely.