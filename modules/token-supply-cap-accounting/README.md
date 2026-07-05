# Token Supply Cap & Reserve Accounting

Tracks minted, burned, and circulating supply across denominations with hard limits per tier. Computes remaining mintable reserve and validates cap enforcement at transaction time.

## Features

- Hard cap enforcement per denomination (GOLD/SILVER/BRONZE/DIAMOND)
- Circulating supply calculation (minted - burned)
- Remaining capacity queries
- Transaction-time validation

## Usage

```typescript
import { validateMintCapacity, getSupplyStatus } from "@tokens/supply-cap";

const validation = await validateMintCapacity("GOLD", 100n);
if (validation.allowed) {
  // Proceed with mint
}

const status = await getSupplyStatus("GOLD");
console.log(`Remaining: ${status.remainingMintable}`);
```

Open source — use it wisely.
