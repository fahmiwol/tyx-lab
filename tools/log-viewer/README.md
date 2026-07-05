# Log Viewer Dashboard

Real-time reactive log viewer dashboard for monitoring structured logs, agent activity, and system events.

## Features

- **Live Polling** — Fetches logs every 15 seconds with manual refresh button
- **Socket.io Integration** — Real-time state synchronization via `agent:learned`, `agent:learning:proposal`, `learning:adopted` events
- **Dynamic Filtering** — Filter by agent/service from live data
- **Approval Queue** — Interactive approve/reject buttons for pending proposals
- **Responsive UI** — Tailwind CSS + React dashboard

## Setup

```bash
cd tools/log-viewer
npm install
npm run dev
```

Then open `http://localhost:3052`.

**Gateway Required**: Backend must be running (e.g., port 9797) and allow CORS from localhost.

## Environment

Create `.env`:
```
VITE_GATEWAY_URL=http://localhost:9797
```

## API

- `GET /api/learning/log` — Fetch current log
- `GET /api/learning/pending` — Fetch pending approvals
- `POST /api/learning/approve` — Approve proposal
- `POST /api/learning/reject` — Reject proposal

See `docs/FUNCTIONS.md` for full API reference.

## Build

```bash
npm run build
npm run preview
```

Open source — use it wisely.