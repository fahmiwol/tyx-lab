# Platform Connector Adapter

Unified API adapter layer for social platforms, messaging, and e-commerce services.

## Supported Platforms

- **Messaging** — Telegram, Discord, WhatsApp, Twitter
- **Cloud Storage** — Google Drive, Notion
- **Social** — TikTok, Instagram, Twitter
- **E-Commerce** — Shopee, Tokopedia

## Features

- **Unified Schema** — Normalized responses across platforms
- **Auth Management** — OAuth, token refresh, credential storage
- **Rate Limiting** — Built-in backoff and throttling
- **Error Handling** — Consistent error codes and recovery
- **Modular** — Add/remove adapters as needed

## Setup

```bash
npm install
cp .env.example .env
# Fill in API keys and endpoints
npm start
```

## Usage

```javascript
import { ConnectorFactory } from "./src/factory.js";

const connector = ConnectorFactory.create("telegram");
connector.setCredentials({ token: process.env.TELEGRAM_TOKEN });

// Send message
const result = await connector.sendMessage({
  chat_id: "123456",
  text: "Hello",
});

console.log(result); // { success: true, id: "msg_123" }
```

## Environment

```env
TELEGRAM_TOKEN=bot_token_here
DISCORD_TOKEN=token_here
TWITTER_API_KEY=key
TWITTER_API_SECRET=secret
WHATSAPP_TOKEN=token
GDRIVE_SERVICE_ACCOUNT_KEY={}
NOTION_API_KEY=key
```

## API Response Format

All adapters normalize to:
```json
{
  "success": true,
  "platform": "telegram",
  "id": "msg_123",
  "data": { ... },
  "error": null
}
```

## Error Codes

- `INVALID_CREDS` — Authentication failed
- `RATE_LIMITED` — Throttled by platform
- `INVALID_PARAMS` — Bad input
- `UNKNOWN` — Unexpected error

Open source — use it wisely.