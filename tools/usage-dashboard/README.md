# Credit & Usage Dashboard

Real-time dashboard for tracking credit balance, usage, and cost trends.

## Features

- **Live Polling** — Updates credit status every 10 seconds
- **30-Day Trends** — Historical usage charts
- **Mock Fallback** — Synthetic data when gateway unavailable
- **Flexible API** — Adapts to various credit response formats
- **Cost Visualization** — Charts and metrics

## Setup

```bash
cd tools/usage-dashboard
npm install
npm run dev
```

Open `http://localhost:3051`.

## Environment

Create `.env`:
```
VITE_GATEWAY_URL=http://localhost:9797
```

## API

- `GET /api/credits/status` — Fetch current credit balance and usage

Response (flexible format):
```json
{
  "balance": 1000.50,
  "spent": 234.75,
  "daily_limit": 100,
  "usage_today": 45.25,
  "period": "2026-07-01"
}
```

## Documentation

See `docs/` folder for PRD, user stories, functions, and ERD.

## Build

```bash
npm run build
npm run preview
```

Open source — use it wisely.