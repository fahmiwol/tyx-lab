# Embeddable Balance Widget SDK

JavaScript/React SDK for embedding real-time wallet balance display in partner web apps. Reads from public REST API, handles currency formatting per denomination, includes dark mode + localization. No API key required for read-only views.

## Features

- Real-time balance updates (configurable interval)
- Display modes: compact, full, card
- Currency filtering (GOLD, SILVER, BRONZE, DIAMOND, or ALL)
- Dark mode support
- Internationalization (i18n)
- Lightweight iframe-based embedding
- No authentication required for public wallets

## Usage

```typescript
import { initializeWidget, mountWidget } from "@tokens/balance-widget";

const config = {
  walletAddress: "wallet_abc123",
  displayMode: "card",
  currency: "ALL",
  refreshInterval: 5000,
  theme: "dark",
  locale: "en",
};

await mountWidget("balance-container", config);
```

## HTML Integration

```html
<div id="balance-container"></div>
<script src="https://cdn.example.com/widget-1.0.0.js"></script>
<script>
  window.BalanceWidget.mount("balance-container", {
    walletAddress: "wallet_abc123",
    displayMode: "card",
    currency: "ALL"
  });
</script>
```

Open source — use it wisely.
