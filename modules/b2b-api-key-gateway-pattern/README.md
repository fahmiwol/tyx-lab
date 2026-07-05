# B2B API-Key Gateway Pattern

Multi-tier API key management for platform partners. Supports key rotation, rate limiting per API key, transaction signing with shared secrets, and read-only vs. write permission scopes.

## Features

- Secure key generation (256-bit)
- Read/Write/Admin scopes
- Rate limiting per key
- Key rotation support
- Revocation tracking
- Last-used timestamp

## Usage

```typescript
import { createApiKey, rotateApiKey } from "@tokens/api-gateway";

const key = await createApiKey("partner_acme", "write", 1000);
const rotated = await rotateApiKey(key);
```

Open source — use it wisely.
