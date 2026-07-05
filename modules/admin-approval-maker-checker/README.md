# Admin Approval Workflow — Maker-Checker Pattern

Four-eye approval system for high-value or sensitive operations. Separates initiation (Maker) from authorization (Checker). Logs all decisions with audit trail.

## Features

- Maker-checker separation of duties
- Configurable operation types
- Optional amount tracking
- Approval/rejection workflow
- Full audit trail

## Usage

```typescript
import { createApprovalRequest, approveRequest } from "@tokens/approval-checker";

const req = await createApprovalRequest("withdrawal_request", "user_123", "admin_1", 1000);
const approved = await approveRequest(req, "admin_2", "Verified user KYC");
```

Open source — use it wisely.
