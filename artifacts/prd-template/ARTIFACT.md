# PRD Template

## Overview
Product requirements document structure for building digital products at scale. Distilled from waste-management, community, and motion design platforms.

## Core Sections

### 1. Executive Summary
- **Product Name & Domain**: Primary domains, subdomains for users/members/admin
- **SEO Keywords**: 3-5 primary keywords, meta description
- **Mission Statement**: One sentence defining the product purpose

### 2. Product Goals
List 3-5 strategic objectives:
- Hub/marketplace/community function
- User acquisition and retention mechanism
- Data foundation (for SaaS, tools, certifications)

### 3. Target Users
Define 4 primary personas:
- **Visitor/Anonymous**: Browse-only behavior
- **Member/Individual**: Create, publish, communicate
- **Organization/Vendor**: Listing, services, verification
- **Admin/Moderator**: Governance, analytics, moderation

For each: key actions, needs, and permissions.

### 4. Scope (MVP Definition)

**In Scope:**
- Public-facing pages
- Core CRUD (create, read, update) flows
- Authentication (basic)
- Admin moderation queue
- Key marketplace/community features

**Out of Scope:**
- Full payment processing
- Advanced AI integrations
- Realtime features at scale
- Third-party KYC automation

### 5. Architecture Outline

**Domains:**
- Public web (SEO, discovery, landing)
- Member area (dashboard, profile, create)
- Admin panel (moderation, master data, analytics)

**Page List:**
- Group by section (landing, content, marketplace, community, member, admin)
- Per-page: purpose, key components, auth requirement

### 6. Features

List feature categories with type, status hierarchy, and workflow:

- **Feature Name**: Type (blog/marketplace/tool), fields, statuses (draft/review/published/archived), user actions, admin actions
- Repeat for each major feature area

### 7. Design System

**Brand Personality:** Tone and visual language in 2-3 sentences

**Color Palette:**
| Token | Hex | Usage |
| --- | --- | --- |
| Primary | `#HEX` | Navigation, CTAs, main theme |
| Secondary | `#HEX` | Accents, hover states |
| Neutral | `#HEX` | Backgrounds, text |
| Status Colors | | Success, warning, error, info |

**Typography:**
- Primary font (e.g., Plus Jakarta Sans)
- Heading weights and sizes
- Body text hierarchy

**Components:**
- Button styles (primary, secondary, ghost)
- Badge / label system (by category or type)
- Card layouts and radius rules
- Form patterns

**Navigation:**
- Public desktop nav structure
- Member sidebar
- Admin sidebar

### 8. Data Model (ERD)

Provide Mermaid ERD showing:
- Core entities (users, content, listings, etc.)
- Relationships (1:1, 1:many, many:many)
- Key fields per entity (id, timestamps, status, FK links)

### 9. Roles & Permissions

| Role | Key Permissions |
| --- | --- |
| Visitor | Browse, search, read, view profile |
| Member | Create posts/listings/comments, edit own, DM |
| Vendor/Org | Member + create service listings, vendor profile |
| Moderator | Moderate content, approve/reject, pin/feature |
| Admin | Full CRUD, roles, master data, reports |

### 10. Key User Flows

For 3-4 main scenarios (visitor → member, create content, marketplace transaction, request matching):
- Step-by-step flow with decision points
- Auth gates and redirects
- Success and error states

### 11. Acceptance Criteria

Checklist of must-haves for MVP launch:
- All public pages accessible without login
- Create flows require auth
- CRUD operations persist
- Admin moderation functional
- UI consistent with brand
- SEO metadata present

### 12. Release Plan

Phases with feature groupings and dependencies:
- Phase 1: Foundation (public pages, auth, moderation)
- Phase 2: Marketplace/content core
- Phase 3: Community/member area
- Phase 4: Tools/certifications/badges
- Phase 5: Analytics/API/data export

---

*Open source — use it wisely.*
