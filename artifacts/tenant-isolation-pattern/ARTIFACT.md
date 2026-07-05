# Tenant Isolation Pattern — Playbook

Multi-tenant architecture for SaaS: per-user data stores + shared admin store.

## Why This Exists

Most SaaS apps need:
- **Data isolation** — tenant A can never see tenant B's data
- **Simple scaling** — start with one-server, file-based storage
- **Clear separation** — admin/billing data lives separately from tenant data
- **Easy to understand** — no complex DB sharding or row-level security

This pattern was extracted from 3 production Tiranyx SaaS apps (HR/CRM, documents, projects) that all followed the same mental model before database graduation.

## The Architecture

```
/data/
├── admin.json              ← shared admin data (users, billing, settings)
└── tenants/
    ├── user-001.json       ← tenant 1 data (isolated)
    ├── user-002.json       ← tenant 2 data (isolated)
    └── user-003.json       ← tenant 3 data (isolated)
```

### Admin Store (Shared)

```typescript
{
  users: [
    { id, email, passwordHash, name, role, plan, createdAt }
  ],
  subscriptions: [
    { id, userId, plan, expiresAt, status }
  ],
  orders: [],
  contacts: [],
  settings: {
    appName,
    pricingPlans: [
      { id: 'free', name, price, period, features, highlighted },
      { id: 'pro', name, price, period, features, highlighted },
      { id: 'enterprise', name, price, period, features, highlighted }
    ]
  }
}
```

### Tenant Store (Per User)

```typescript
// /data/tenants/{userId}.json
{
  documents: [],     // or: people, projects, tasks, etc.
  templates: [],     // or: assessments, milestones, etc.
  exports: [],       // or: custom fields per app
  metadata: {}       // custom app state
}
```

## Implementation

```typescript
import { JsonStore } from 'json-file-store-atomic';

// Admin store (shared)
const adminStore = new JsonStore('/data/admin.json', {
  users: [],
  subscriptions: [],
  orders: [],
  contacts: [],
  settings: { /* ... */ }
});

// Function to get tenant store
function getTenantStore(userId) {
  return new JsonStore(`/data/tenants/${userId}.json`, {
    documents: [],
    templates: [],
    exports: []
  });
}

// Login flow
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = adminStore.read();
  const user = admin.users.find(u => u.email === email);
  
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create session + get tenant store
  const token = createSession(user.id, user.email, user.role);
  const tenantStore = getTenantStore(user.id);  // initialize if needed
  
  res.json({ token, userId: user.id, plan: user.plan });
});

// Protected route: read tenant data
app.get('/api/documents', requireAuth, (req, res) => {
  const tenantStore = getTenantStore(req.session.userId);
  const data = tenantStore.read();
  res.json(data.documents);
});

// Admin route: see all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const admin = adminStore.read();
  res.json(admin.users.map(u => ({ id: u.id, email: u.email, plan: u.plan })));
});
```

## Scaling Phases

### Phase 1: File-Based (Now)
- Admin + tenants in `/data/` directory
- Works for 1–100 users
- Easy to backup, version, debug

### Phase 2: Transition
- Migrate admin store to PostgreSQL
- Keep tenant stores as files (or migrate gradually)

### Phase 3: Full Database
- Both admin + tenant data in PostgreSQL
- Use database-level access control (row-level security)
- Replace `getTenantStore(userId)` with `SELECT * FROM documents WHERE tenant_id = $1`

## Key Principles

1. **Isolation by default** — tenant stores never cross boundaries
2. **Clear ownership** — admin data separate from tenant data
3. **Scalable** — each tenant's store is independent
4. **Debuggable** — peek into `/data/tenants/{userId}.json` to audit

## Security Notes

- Tenant A's token cannot access tenant B's store
- Admin store access gated by `role == 'admin'` or `'owner'`
- Store file permissions: `chmod 600` for production
- Backups should be encrypted at rest

## Real-World Patterns from Tiranyx

- **HR/CRM app (Peplid):** admin store = users/subscriptions, tenant store = employees/departments
- **Document vault (Dokumix):** admin store = billing, tenant store = documents/templates
- **Project manager (Nirmanix):** admin store = accounts, tenant store = projects/tasks/milestones

Each started with this pattern, then graduated to databases as user count grew.

*Open source — use it wisely.*
