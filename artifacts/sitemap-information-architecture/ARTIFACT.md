# Sitemap & Information Architecture (IA) Template

## Overview
Framework for organizing content and navigation structure in digital products. Includes hierarchies, user flows, labeling conventions, and cross-linking strategies.

## IA Principles

1. Organization: Logical grouping of related content
2. Labeling: Consistent, user-centered terminology
3. Navigation: Clear pathways from entry points to goals
4. Cross-linking: Related content connected
5. Scalability: Structure supports growth without chaos
6. Discoverability: Users can find content without search
7. Accessibility: All content reachable within 3 clicks

## Structure Patterns

**Hierarchical (Tree):**
- Home → Category → Sub-category → Item
- Best for: Large, diverse content (e-commerce, media)
- Example: Home → Products → Electronics → Laptops → MacBook Pro

**Hub & Spoke:**
- Central hub (dashboard) → Multiple features/sections
- Best for: Dashboards, member areas, platforms
- Example: Dashboard → My Listings, My Messages, My Profile, Settings

**Sequential:**
- Step 1 → Step 2 → Step 3 → Completion
- Best for: Wizards, onboarding, checkout flows
- Example: Create Post → Upload Image → Preview → Publish

**Network:**
- All pages related to all others (heavily cross-linked)
- Best for: Wiki, knowledge base, blog
- Example: Articles linked by tags, category, related posts

**Hybrid:**
- Combination of above (hierarchical main, hub for dashboard, sequential for checkout)
- Most common in mature products

## Labeling Strategy

**Naming Conventions:**
- User-centered (what users search for, not internal jargon)
- Consistent terminology (not "Items" in one section, "Products" in another)
- Action-oriented when possible (Browse, Create, Manage)
- Avoid: Acronyms, technical jargon, marketing speak

**Good Labels:**
- "My Listings" not "User Inventory"
- "Browse Waste" not "Material Feed"
- "Services" not "Solutions"
- "Community" not "Forum"

**Bad Labels:**
- "Resources" (vague)
- "Misc" (uninformative)
- "Advanced Settings" (condescending)
- "Other" (lazy)

## Page Categories

**Public / Unauthenticated:**
- Home: Entry point, value proposition, CTAs
- About: Mission, team, partner
- Browse/Search: Discover content or products
- Detail Pages: Content, product, vendor info
- FAQ, Help, Resources
- Blog, News, Media
- Contact, Support

**Authenticated / Member:**
- Dashboard: Overview, quick actions
- Create: New post, listing, request
- My Content: Posts, listings, messages, profile
- Notifications
- Settings: Account, preferences, privacy
- Community: Threads, replies, rooms

**Admin:**
- Dashboard: Stats, alerts
- Moderation Queue: Pending approvals
- Users: Management, roles, suspension
- Content: Categories, master data
- Settings: System config, feature flags
- Reports & Analytics
- Audit Logs

## URL Structure

**Convention:**
- Root: /
- Category: /category or /category-name
- List: /resource or /category/resource
- Detail: /resource/{id} or /resource/slug
- Create/Edit: /resource/create, /resource/{id}/edit
- Admin: /admin, /admin/resource

**Examples:**
- / (home)
- /posts (list all posts)
- /posts/12345 (post detail)
- /posts/create (create post form)
- /listings (list all listings)
- /listings?category=waste (filtered list)
- /listings/12345 (listing detail)
- /user/alice (public profile)
- /dashboard (member dashboard)
- /admin (admin panel)

**Best Practices:**
- Use slugs for human-readable URLs: /posts/waste-management-guide
- Avoid deep nesting: /admin/content/moderation/queue/12345/details (too deep)
- Use query params for filters: /listings?status=active&sort=-date
- Use path params for identity: /listings/12345
- Consistent structure across similar resources

## Navigation Systems

**Global Navigation (Navbar):**
- Home, Listings, Services, Community, About, Search, Auth Controls
- Sticky/fixed to top
- Responsive hamburger on mobile
- Logo = home link

**Secondary Navigation (Sidebar/Menu):**
- Permanent on desktop, collapsible on mobile
- Used in dashboard/admin areas
- Highlights active section
- Scrollable if many items

**Breadcrumbs:**
- Shows location hierarchy
- Last item not clickable (current page)
- Example: Home > Listings > Waste > Paper (not clickable)
- Useful for deep hierarchies, omit if single level

**Footer Navigation:**
- Links to legal pages (Privacy, Terms, Contact)
- Social links
- Copyright, company info
- Secondary categories or resources

**Contextual Navigation:**
- Next/Previous links (for sequential)
- Related content (similar posts, recommendations)
- Related listings sidebar
- Tags and categories (cross-linking)

## User Flows & Task Mapping

**Key User Flows:**
1. First-time visitor → Understand product → Register
2. Browse → Find item → View detail → Contact seller
3. Member → Create listing → Publish → Receive inquiries
4. Join community → Browse threads → Reply → Participate
5. Admin → Moderation queue → Approve/reject → Log action

**Task Mapping:**
For each flow, document:
- Entry point (where does user start?)
- Steps (what pages/interactions?)
- Decision points (if/then branches)
- Exit point (success or failure)
- Alternative paths (errors, shortcuts)

**Example: Create Listing**
```
1. User on Dashboard
2. Click "Create Listing"
3. Form: Title, Description, Price, Category
4. Upload images (optional)
5. Preview
6. Publish or Save as Draft
7. Redirect to listing detail or dashboard
   If error: Show validation error, stay on form
```

## Content Inventory

**Before Designing:**
- List all content types (posts, listings, services, user profiles)
- Count of each (100 posts, 500 listings)
- Update frequency (daily, weekly, rarely)
- Priority for findability

**Organization:**
- By user role (what does each role need?)
- By task (what pages support each goal?)
- By time (what's accessed first, later?)

## Consistency Checklist

- [ ] All sections follow same navigation pattern
- [ ] Labels consistent across product (no synonyms)
- [ ] URL structure follows one pattern
- [ ] Breadcrumbs show actual hierarchy
- [ ] Links go to expected page (no surprises)
- [ ] Search returns relevant results
- [ ] Filter options are clear and grouped
- [ ] Related content visible in detail view
- [ ] Authenticated sections clearly marked
- [ ] Admin functions separated from public
- [ ] Empty states have helpful CTAs
- [ ] Error states guide user to resolution

## IA Document Artifact

**Sitemap Visual:**
```
Home
├── Publikasi
│   ├── All Posts
│   ├── Create Post
│   └── Post Detail
├── Trading Hub
│   ├── Browse Listings
│   ├── Listing Detail
│   └── Create Listing
├── Services
│   ├── Browse Vendors
│   └── Vendor Detail
├── Community
│   ├── Rooms List
│   ├── Room Threads
│   └── Thread Detail
└── Admin
    ├── Moderation Queue
    ├── User Management
    └── Settings
```

**URL Map:**
| Path | Page | Auth | Purpose |
| --- | --- | --- | --- |
| / | Home | No | Entry, discovery |
| /posts | Post List | No | Browse posts |
| /posts/create | Create Post | Yes | User-generated content |
| /listings | Listing Browse | No | Marketplace |
| /listings/{id} | Listing Detail | No | Listing info, contact |
| /dashboard | Dashboard | Yes | Member overview |
| /community | Community | No | Public threads |
| /admin | Admin Panel | Yes/Admin | Governance |

## Maintenance

- Review IA quarterly
- Add new sections explicitly to hierarchy
- Archive unused pages
- Test information scent (can users find things?)
- Gather user feedback on navigation
- Update documentation as structure evolves
- A/B test navigation changes before rollout

---

*Open source — use it wisely.*
