# JSON File Store — Atomic

ACID-like file-based JSON storage with atomic writes, recovery, and no dependencies.

## What This Does

- **Atomic writes** — writes to `.tmp`, then renames (prevents corruption)
- **Fallback** — read errors return defaults (corrupted file? defaults kick in)
- **No dependencies** — Node.js `fs` and `path` only
- **Backup/restore** — optional `.backup` snapshots
- **Multi-tenant** — per-user/org store patterns

## Input

```typescript
new JsonStore(filePath, defaults, options?)
```

## Output

Data matching the defaults type.

## Usage

```typescript
import { JsonStore } from './src/index';

// Create store
const store = new JsonStore('/data/users.json', {
  users: [],
  settings: {},
});

// Read
const data = store.read();
console.log(data.users);

// Write (full overwrite)
store.write({ users: [{ id: 1, name: 'Alice' }], settings: {} });

// Update (read → transform → write)
store.update((data) => {
  data.users.push({ id: 2, name: 'Bob' });
  return data;
});

// Backup before risky operation
store.backup();
// ...
store.restore();  // if something went wrong
```

## Multi-Tenant Pattern

```typescript
// Admin store (shared)
const adminStore = new JsonStore('/data/admin.json', {
  users: [],
  subscriptions: [],
});

// Tenant stores (per user)
function getTenantStore(userId) {
  return new JsonStore(`/data/tenants/${userId}.json`, {
    documents: [],
    tasks: [],
  });
}

const user1Store = getTenantStore('user-001');
user1Store.update((data) => {
  data.documents.push({ id: '1', title: 'Doc A' });
});
```

## Why This Exists

Small projects, MVPs, and offline-first apps often don't need a database:
- SQLite/PostgreSQL overhead is real
- File-based storage is simpler to deploy
- Atomic writes prevent corruption (`.tmp` + rename pattern)
- Easy to version in git
- Backups = file copies

This pattern came from 3 Tiranyx SaaS apps (HR/CRM, documents, projects) that all needed simple persistence before graduating to databases.

## Compatibility

- Works standalone
- No dependencies (except Node.js fs/path)
- Used by multi-tenant patterns (pair with `env-config-schema`)

*Open source — use it wisely.*
