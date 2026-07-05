# Wireframe to Prototype Method

## Overview
Structured methodology for converting wireframes into interactive prototypes. Bridges design and development, focusing on information architecture, component hierarchy, interaction patterns, and rapid iteration.

## Phase 1: Wireframe Analysis

Inventory the wireframe:
- List all unique page/screen types
- Identify repeated layout patterns
- Map content sections per page
- Note interactive elements (buttons, forms, modals)
- Identify data states (empty, loading, error, success)

Annotation:
- Label each component or section
- Mark authentication gates
- Note conditional content
- Call out data dependencies

Create sitemap/map:
- List all pages and relationships
- Document URL patterns
- Identify entry points

## Phase 2: Component Hierarchy

Break into components:
1. Atomic level: Button, Input, Badge, Icon
2. Molecular level: SearchBar, FormGroup, Card
3. Organism level: Navigation Bar, Hero, ListingCard
4. Template level: Page layouts
5. Page level: Specific route implementation

Create component inventory with variants, sizes, states.

## Phase 3: Data Structure & Props

Define props per component:
- Input props (what it receives)
- Output props (what it emits)
- State (if local state)
- Default values
- Type signature (TypeScript)

Create data models:
- User, Post, Listing, Message
- Fields, types, required vs optional
- Timestamp fields, status enums
- Relationships

## Phase 4: Interaction Patterns

List all interactions:
- Click: button, link, card
- Form submit: validation, loading, success/error
- Modal: open/close, overlay, focus trap
- Hover: tooltip, highlight, state change
- Scroll: lazy load, infinite scroll, sticky header
- Filter/search: debounced input, results update
- Upload: file selection, progress, preview

Define state transitions:
- Start state
- Action taken
- End state
- Side effects

## Phase 5: Build Prototype Structure

Choose technology stack:
- Low-fidelity: Figma, InVision
- Medium-fidelity: React/Vue with mock data
- High-fidelity: Full app with API

Scaffold project:
- src/components/ (atoms, molecules, organisms)
- src/pages/
- src/layouts/
- src/hooks/
- src/utils/
- src/data/ (mock data)

Create mock data:
- users, listings, posts with realistic structure

## Phase 6: Implement Pages

Start with key user flow:
1. Home (entry point)
2. Browse/search (core feature)
3. Detail (drill-down)
4. Create/edit (user action)
5. Dashboard (member area)

Per page:
- Create layout wrapper
- Import and compose components
- Wire up state (useState, hooks)
- Add mock data fetching (useEffect)
- Connect interactions (onClick, onChange, onSubmit)
- Show loading and error states

## Phase 7: Add Interactions & States

Implement common patterns:
- Loading states (skeleton, spinner)
- Error handling (error boundary, fallback)
- Empty states (messaging, CTA)
- Form validation (real-time feedback)
- Success feedback (toast, modal, redirect)

## Phase 8: Navigation & Routing

Define routes:
- / → Home
- /listings → Listing browse
- /listings/{id} → Detail
- /listings/create → Create
- /user/{id} → Public profile
- /dashboard → Member dashboard
- /admin → Admin panel
- /login → Auth

Implement navigation:
- Link components (no full page reload)
- Breadcrumbs
- Sidebar navigation with active state
- Back button context awareness

## Phase 9: Responsive & Mobile

Test responsive:
- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (320px-767px)

Mobile-specific:
- Full-width layout
- Hamburger menu
- Touch-friendly button sizes (44x44px)
- Simplified modals
- Bottom sheet for actions

## Phase 10: Performance & Polish

Optimize:
- Code split pages
- Lazy load images
- Debounce search/filter
- Memoize components
- Remove unused dependencies

Polish:
- Smooth transitions and animations
- Micro-interactions
- Loading skeletons
- Consistent spacing
- Accessible focus states

Test:
- Browser compatibility
- Touch interactions
- Keyboard navigation
- Screen reader accessibility
- Performance (Lighthouse)

## Handoff to Development

Deliverables:
1. Component library (Storybook)
2. Design tokens
3. API contract
4. User flow diagrams
5. State machine diagrams
6. Accessibility checklist
7. Performance baseline

Documentation:
- How to run prototype locally
- How to add new pages/components
- Mock API data structure
- Component usage examples
- Known limitations

Feedback collection:
- Screenshot annotations
- User testing sessions
- Issue tracker
- Design/dev sync schedule

---

*Open source — use it wisely.*
