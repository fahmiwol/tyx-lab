# Exchange Rate Oracle Updater

Trusted price feed mechanism that updates denomination-to-fiat conversion rates via authenticated oracle transactions. Supports historical rate tracking, rate staleness checks, and fallback rates for circuit-breaker scenarios.

## Features

- Authenticated rate updates (HMAC-SHA256)
- Staleness detection (5-min default)
- Rate history tracking
- Multiple source types (API, manual, governance)
- Previous rate retention for reversal scenarios

## Usage

```typescript
import { updateExchangeRate, isRateStale } from "@tokens/oracle-updater";

const update = await updateExchangeRate("GOLD/IDR", 10000, "external_api", "oracle_1", null, secret);
if (isRateStale(update)) {
  console.log("Rate is stale, use fallback");
}
```

Open source — use it wisely.
