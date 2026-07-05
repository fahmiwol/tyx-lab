# RBAC Role/Permission Matrix Template

## Overview
Structured Role-Based Access Control (RBAC) framework for multi-tier platforms. Distilled from waste-management ecosystem, community, and motion design products.

## Core Principles

1. **Least Privilege**: Users get minimum permissions needed for their role
2. **Role Hierarchy**: Lower roles are subsets of higher roles
3. **Resource & Action Separation**: Permissions bind resource + action
4. **Visibility & Data Access**: Permission also controls what data appears
5. **Audit Trail**: All permission-based denials and role changes logged

## Role Definition Template

**Role Name: Visitor**
- Tier: 0 (Lowest)
- Description: Unauthenticated user browsing public content
- Permission Scope: Read-only on public resources
- Features: Browse posts, search listings, view profiles, read community threads
- Restrictions: Cannot create, edit, delete; no DM without login

**Role Name: Member**
- Tier: 1
- Description: Authenticated individual user, creator, participant
- Permission Scope: Read own + public, create/edit own content
- Features: Create posts/listings, join community, send DM, edit profile, earn badges
- Parent: Visitor (inherits all read permissions)

**Role Name: Vendor**
- Tier: 1.5
- Description: Organization offering services/marketplace listings
- Permission Scope: Member permissions + vendor profile + service listings
- Features: Create service listing, manage vendor profile, see inquiry queue
- Parent: Member
- Prerequisite: Vendor profile must exist (admin creates or user onboards)

**Role Name: Moderator**
- Tier: 2
- Description: Enforcer of community standards, content reviewer
- Permission Scope: Read all + moderate (hide, pin, remove, warn)
- Features: Moderation queue, approve posts, close threads, warn users, generate reports
- Parent: Member (read permissions) + moderation overlay
- Assignment: Subset of users invited by admin

**Role Name: Admin**
- Tier: 3 (Highest)
- Description: System owner, full governance
- Permission Scope: Read all + write all + configure system
- Features: User management, role assignment, system settings, backups, audit logs
- Parent: All (inherits all permissions)

## Permission Matrix

| Resource | Action | Visitor | Member | Vendor | Moderator | Admin |
|---|---|---|---|---|---|---|
| Posts | Create | No | Yes | Yes | Yes | Yes |
| Posts | Read (own) | No | Yes | Yes | Yes | Yes |
| Posts | Read (others) | Yes (pub) | Yes (pub) | Yes (pub) | Yes (all) | Yes |
| Posts | Edit (own) | No | Yes | Yes | No | Yes |
| Posts | Approve | No | No | No | Yes | Yes |
| Listings | Create | No | Yes | Yes | Yes | Yes |
| Listings | Read (own) | No | Yes (all) | Yes (all) | Yes | Yes |
| Listings | Read (others) | Yes (active) | Yes (active) | Yes (active) | Yes (all) | Yes |
| Listings | Inquiry access | No | No (seller) | Yes (own) | Yes (all) | Yes |
| Messages | Send | No | Yes | Yes | Yes | Yes |
| Messages | Read (own) | No | Yes | Yes | No | Yes |
| Community | Read thread | Yes (public) | Yes | Yes | Yes | Yes |
| Community | Create thread | No | Yes | Yes | Yes | Yes |
| Community | Close thread | No | No | No | Yes | Yes |
| Profiles | View (own) | No | Yes | Yes | Yes | Yes |
| Profiles | View (public) | Yes | Yes | Yes | Yes | Yes |
| Profiles | Edit (own) | No | Yes | Yes | Yes | Yes |
| Vendor Profile | Create | No | No (admin) | Yes (onboard) | No | Yes |
| Vendor Profile | Verify badge | No | No | No | No | Yes |
| Admin Panel | Moderation queue | No | No | No | Yes | Yes |
| Admin Panel | User management | No | No | No | No | Yes |
| Admin Panel | Role assignment | No | No | No | No | Yes |
| Admin Panel | System settings | No | No | No | No | Yes |

## Implementation Patterns

**Route-Level Guards:**
```
POST /api/posts
  - requireAuth() → must be Member or higher
  - validate() → POST body schema
  - checkPostsCreate() → has posts:create permission
```

**Field-Level Masking:**
- Visitor: basic fields (id, title, category, price, location)
- Member: adds seller_id, seller_name, seller_badge
- Moderator: adds seller_email, verification_status, report_count
- Admin: all fields

**Permission String Format:**
- resource:action (posts:create, vendor.manage, users:admin)

## Role Transition & Escalation

**Visitor → Member**: Self-signup or admin invite, email verification optional

**Member → Vendor**: User initiates onboarding, admin reviews and approves

**Member → Moderator**: Admin invites specific users, no self-signup

**Demotion/Suspension**: Admin can revoke roles, reasons logged in audit

## Compliance & Audit

- **Audit Table**: actor_id, action, resource_type, resource_id, timestamp
- **Access Logs**: user_id, endpoint, status_code, timestamp
- **Sensitive Actions**: Admin login, role change, user suspension → alert ops
- **Retention**: Keep audit logs for 1-2 years

## Testing Checklist

- [ ] Visitor can browse but not create
- [ ] Member can create own content but not others
- [ ] Vendor can create services and view inquiries
- [ ] Moderator can see all content and approve/hide
- [ ] Admin can modify any resource
- [ ] Role inheritance works (vendor has member perms)
- [ ] Demotion removes permissions immediately
- [ ] Audit trail captures all permission checks
- [ ] API returns 403 (not 404) for unauthorized access
- [ ] Field masking hides sensitive data from lower roles

---

*Open source — use it wisely.*
