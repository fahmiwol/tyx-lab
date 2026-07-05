# Upload Monitor Dashboard

Real-time file upload status and progress tracking.

## Features

- **Live Progress** — Real-time upload status updates
- **Queue Visualization** — Active, pending, completed uploads
- **Error Tracking** — Failed uploads with error details
- **File Metrics** — Size, speed, ETA tracking
- **Socket.io Events** — Real-time push updates

## Setup

```bash
cd tools/upload-monitor
npm install
npm run dev
```

Open `http://localhost:3054`.

## Environment

Create `.env`:
```
VITE_GATEWAY_URL=http://localhost:9797
```

## API

- `GET /api/uploads/status` — Fetch current upload queue
- `GET /api/uploads/history` — Upload history

## Socket.io Events

Listen for:
- `upload:start` — Upload initiated
- `upload:progress` — Progress update
- `upload:complete` — Upload finished
- `upload:error` — Upload failed
- `queue:updated` — Queue changed

## Build

```bash
npm run build
npm run preview
```

Open source — use it wisely.