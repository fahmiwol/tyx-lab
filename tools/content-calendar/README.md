# Content Calendar

Editorial calendar and content scheduling tool.

## Features

- **Multiple Views** — Month, week, day calendar layouts
- **Drag & Drop** — Easy event scheduling and rescheduling
- **Status Tracking** — Draft, scheduled, published, archived
- **Team Collaboration** — Assign team members, comments
- **Recurring Events** — Template-based recurring content
- **Publishing Integration** — Direct publish to multiple platforms

## Setup

```bash
cd tools/content-calendar
npm install
npm run dev
```

Open `http://localhost:3055`.

## Environment

```env
VITE_GATEWAY_URL=http://localhost:9797
```

## API

- `GET /api/calendar/events` — Fetch events for date range
- `POST /api/calendar/events` — Create event
- `PATCH /api/calendar/events/:id` — Update event
- `DELETE /api/calendar/events/:id` — Delete event
- `POST /api/calendar/events/:id/publish` — Publish to platforms

## Event Schema

```json
{
  "id": "evt_123",
  "title": "Blog Post: AI Trends",
  "description": "...",
  "date": "2026-07-15",
  "time": "10:00",
  "platforms": ["blog", "twitter", "linkedin"],
  "status": "scheduled",
  "assigned_to": "user_456",
  "tags": ["ai", "tech"],
  "content_url": "https://..."
}
```

## Build

```bash
npm run build
npm run preview
```

Open source — use it wisely.