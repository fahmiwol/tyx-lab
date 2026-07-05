# Token Burn & Redemption Audit Trail

Immutable ledger of token burn events with cryptographic commitment. Records burn reason, timestamp, authorizer, and withdrawal destination. Enables forensic reconstruction of destroyed supply and redemption validation.

## Features

- Immutable burn event logging
- SHA256 event signature
- Audit hash for integrity verification
- Burn reason classification
- Authorizer tracking

## Usage

```typescript
import { recordBurnEvent, verifyBurnEventIntegrity } from "@tokens/burn-audit";

const event = await recordBurnEvent("coin_123", "GOLD", "redemption", "admin_456", "wallet_789");
const isValid = await verifyBurnEventIntegrity(event);
```

Open source — use it wisely.
