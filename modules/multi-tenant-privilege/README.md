# multi-tenant-privilege

Role-based access control (RBAC) system for multi-tenant SaaS platforms. Per-module granular permissions with session caching. PDO-based, works with any PHP/MySQL stack.

## Database Schema

```sql
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  level INT DEFAULT 10
);

CREATE TABLE privileges (
  id INT PRIMARY KEY,
  role_id INT,
  module VARCHAR(100),
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_delete BOOLEAN,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## Usage

```php
// Check permission
if (can('leads', 'create')) {
  // User can create leads
}

// Require permission or show 403
require_priv('orders', 'edit');

// Check super admin
if (role_has_full_access()) {
  // Full access, bypass module checks
}

// Load privileges (cached in session)
load_privileges();
```

## Actions

Per-module:
- `view` — read data
- `create` — add records
- `edit` — modify existing
- `delete` — remove records

## Super Admin

Set `role_level >= 100` for full access (bypasses all module checks).

## Integration

Include in foundation layer, share across all platform modules (CRM, Inventory, Finance, HR). Each module calls `require_priv('module_name', 'action')` at entry points.

## Multi-Tenant

Store `tenant_id` in role or privileges table to isolate access per tenant. Admin sees all, users see their tenant only.

*Open source — use it wisely.*
