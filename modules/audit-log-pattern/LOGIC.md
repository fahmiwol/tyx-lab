# Audit Log Implementation Logic

## Core Principles

### 1. Immutability
- Audit logs are **INSERT-ONLY**
- Never UPDATE or DELETE audit records
- This prevents tampering and ensures forensic integrity

### 2. Denormalization
- Store `username` + `userId` together
- If a user is deleted, audit trail remains readable
- Similar: store `adminUser.username` not just `adminUserId`
- Rationale: Audit logs are forensic evidence — must survive cascading deletes

### 3. Soft Failure
Audit log creation must **never crash** the primary request:

```
recordUserAudit() {
  try {
    INSERT INTO user_audit_logs(...)
  } catch (e) {
    console.error("[AUDIT FAIL]", e.message)
    // RETURN SILENTLY — do not throw
  }
}
```

Why? If audit DB is down, users shouldn't be locked out. Ops must be alerted via logging aggregation (Datadog, Sentry, etc.) to fix the audit DB separately.

### 4. Request Context Capture
Automatically extract from HTTP layer:

```
auditMetaFromRequest(req: FastifyRequest) {
  const ip = 
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ??
    req.ip ?? 
    null;
  const userAgent = req.headers["user-agent"] ?? null;
  return { ip, userAgent };
}
```

Handles: proxies, load balancers, reverse proxies (nginx, Cloudflare).

### 5. Metadata Payload Structure
Use structured JSON for complex context:

```typescript
payload: {
  before: { amount: 100, status: "PENDING" },
  after:  { amount: 100, status: "APPROVED" },
  reason: "Manual review by compliance officer"
}
```

This enables:
- Diff detection in dashboards
- Compliance evidence of "why" a change occurred
- Root cause analysis for disputes

## Indexing Strategy

```
User audit:
  @@index([userId])          -- find all actions by user
  @@index([action])          -- find all "user.transfer" across users
  @@index([createdAt])       -- timeline queries
  @@index([userId, action])  -- user's transfer history (composite)

Admin audit:
  @@index([adminUserId])          -- all actions by admin
  @@index([action])               -- all "withdrawal.approve" by anyone
  @@index([targetType, targetId]) -- all changes to a specific resource
  @@index([createdAt])            -- timeline
```

## Action Naming Convention

Use `entity.action` format:

```
User actions:
  user.login
  user.logout
  user.register
  user.password_change
  user.transfer
  user.withdraw
  user.topup
  user.profile_update

Admin actions:
  admin.login
  withdrawal.approve
  withdrawal.reject
  user.suspend
  user.unsuspend
  cms.publish
  settings.change
  payment.manual_credit
```

Benefit: Flat string search finds all related actions (grep "withdrawal").

## Retention & Archival

```
-- Active logs (recent)
SELECT * FROM user_audit_logs 
WHERE createdAt > NOW() - INTERVAL '1 year'

-- Archived (cold storage)
-- After 1 year, move to audit_archive table in S3
-- Keep metadata index for compliance queries
```

Rationale: Fintech regulations (e.g., Indonesia OJK) require 5-7 year audit trail.

*Open source — use it wisely.*
