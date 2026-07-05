# Statement & Receipt Generator

On-demand PDF generation of transaction statements and receipts. Supports date range filtering, denomination breakdown, QR code embedding for verification, and digital signature. Compliant with accounting and audit requirements.

## Features

- On-demand PDF generation
- Date range filtering
- Digital signature support
- SHA256 integrity hashing
- 90-day retention policy
- Multiple statement types

## Usage

```typescript
import { generateStatement, verifyStatementIntegrity } from "@tokens/statement-gen";

const stmt = await generateStatement("user_123", "monthly_summary", startDate, endDate);
const isValid = await verifyStatementIntegrity(stmt);
```

Open source — use it wisely.
