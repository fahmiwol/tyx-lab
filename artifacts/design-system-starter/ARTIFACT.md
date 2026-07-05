# Design System Starter Template

## Overview
Lightweight design system framework for digital products. Includes color tokens, typography, components, spacing, patterns, and implementation guide.

## Color Palette

**Primary Colors:**
- Primary Green: #1B3D2A (Navigation, CTAs, primary text)
- Secondary Green: #234D36 (Dark section, hover, panels)
- Accent Orange: #F97316 (Call-to-action, active state, highlight)

**Neutral Background:**
- Background: #F5F1E8 (Warm background, safe default)
- Background Secondary: #FAFAF9 (Subtle separation)
- Background Tertiary: #F3F0EB (Cards, modals)

**Status & Semantic:**
- Success/Mint: #E1F5EE (Success badge, positive action)
- Error/Rose: #FCEBEB (Error, moderation, danger)
- Warning/Amber: #F5A623 (Warning, caution)
- Info/Lavender: #EEEDFE (Research, SaaS, informational)
- Info/Sky: #E6F1FB (Member badge, secondary info)

**Text Colors:**
- Primary Text: #1B3D2A (Main text)
- Secondary Text: #666666 (Secondary info)
- Tertiary Text: #999999 (Placeholder, disabled)

**Border & Divider:**
- Border Primary: #E0E0E0 (Main borders)
- Border Secondary: #F0F0F0 (Subtle borders, dividers)
- Border Hover: #D0D0D0 (Interactive hover)

## Typography

**Font Family:**
- Primary: Plus Jakarta Sans (heading, UI)
- Monospace: JetBrains Mono (code snippets, data)

**Scale:**
- Display: 48px, 700 weight (hero titles)
- Heading 1: 32px, 700 weight (page titles)
- Heading 2: 24px, 700 weight (section titles)
- Heading 3: 20px, 600 weight (subsection)
- Body Large: 16px, 400 weight (main body copy)
- Body Regular: 14px, 400 weight (standard text)
- Body Small: 12px, 500 weight (secondary text, labels)
- Label: 10px, 600 weight (badges, tags)
- Caption: 11px, 400 weight (helper text)

**Line Height:**
- Tight: 1.2 (headings)
- Normal: 1.5 (body copy)
- Relaxed: 1.8 (content-heavy)

**Letter Spacing:**
- Relaxed: 0.05em (headings for emphasis)
- Normal: 0 (body text)
- Tight: -0.01em (tight headlines)

## Spacing

Use 4px base unit:
- 4px (1x)
- 8px (2x)
- 12px (3x)
- 16px (4x) — most common
- 20px (5x)
- 24px (6x)
- 32px (8x)
- 40px (10x)
- 48px (12x)

**Application:**
- Padding: 12px-24px (cards, buttons)
- Margin: 16px-32px (sections, blocks)
- Gap: 8px-16px (flex items, grid)

## Radius (Border Radius)

- xs: 4px (compact, dense UI)
- sm: 8px (buttons, small cards)
- md: 12px (content cards, modals)
- lg: 16px (hero sections, large cards)
- full: 50% (circles, avatars)

## Components

**Buttons**
- Primary: Orange background, white text, 12px radius, 12px padding
- Secondary: Green border, green text, 12px radius, transparent background
- Ghost: No background, border, 12px radius, hover → light green background
- Disabled: Opacity 50%, cursor not-allowed

**Input Fields**
- Border: 1px solid #E0E0E0
- Focus border: 2px solid #1B3D2A
- Padding: 10px 12px
- Font: 14px, Plus Jakarta Sans
- Placeholder: #999999

**Cards**
- Padding: 16px-24px
- Background: white or #F5F1E8
- Border: 1px solid #E0E0E0
- Radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1) (light), 0 4px 12px rgba(0,0,0,0.15) (raised)
- Hover: Subtle shadow increase, transform translateY(-2px)

**Badges**
- Padding: 6px 10px
- Font: 11px, 600 weight
- Radius: 10px (pill-shaped)
- Color by type:
  - Blog: Mint background, green text
  - Research: Lavender background, purple text
  - Member: Sky background, blue text
  - Admin: Rose background, red text

**Navigation Bar**
- Background: #1B3D2A
- Padding: 12px 16px (height: 56px)
- Logo: 32px, bold, white text
- Menu items: 14px, white text, hover → opacity 80%
- Mobile: Hamburger icon, full-width dropdown

**Sidebar**
- Width: 240px (desktop)
- Background: #F5F1E8
- Menu items: 14px, padding 12px 16px
- Active: left border 4px #F97316, bold text
- Hover: background #E8E5DC

**Modals**
- Background: white
- Padding: 32px
- Radius: 16px
- Shadow: 0 10px 40px rgba(0,0,0,0.2)
- Close button: top-right corner
- Backdrop: rgba(0,0,0,0.4)

**Tooltips**
- Background: #1B3D2A
- Text: white, 12px
- Padding: 8px 12px
- Radius: 6px
- Appear on hover, 200ms delay

## Interaction & Animation

**Transitions:**
- Fast: 100ms (hover, focus states)
- Normal: 200ms (modal open/close)
- Slow: 300ms (page transitions)

**Common Animations:**
- Fade-in: opacity 0 → 1
- Slide-up: translateY(10px) → 0
- Scale: scale(0.95) → 1 (press effect)

**Hover States:**
- Buttons: opacity +10%, shadow increase
- Links: underline or color change
- Cards: shadow increase, translateY(-2px)
- Interactive: cursor pointer, slight color shift

**Focus States:**
- 2px outline of primary color
- Accessible by keyboard (Tab key)
- Not removed on mouse (persistent)

## Responsive Design

**Breakpoints:**
- Mobile: 320px-480px
- Tablet: 481px-768px
- Desktop: 769px+

**Mobile-First Approach:**
- Base styles for mobile (100% width, single column)
- Tablet: 2 columns, wider padding
- Desktop: Multi-column, max-width 1200px

**Touch-Friendly:**
- Minimum tap target: 44x44px
- Spacing: 8px between interactive elements

## Accessibility (WCAG 2.1 AA)

- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: visible and clear (not just outline: none)
- Semantic HTML: use <button>, <nav>, <main>, <section>
- ARIA labels: for icons, form inputs, dynamic content
- Keyboard navigation: all interactive elements accessible
- Reduced motion: respect prefers-reduced-motion
- Form labels: associated with inputs (for attribute)
- Error messages: linked to form fields

## Implementation Guide

**CSS-in-JS (Tailwind, emotion, styled-components):**
```
const colors = { primary: '#1B3D2A', accent: '#F97316' };
const spacing = [0, 4, 8, 12, 16, 20, 24, 32];
const radius = { xs: '4px', sm: '8px', md: '12px' };
```

**Design Tokens File (JSON):**
```
{
  "color": {
    "primary": "#1B3D2A",
    "secondary": "#234D36",
    "accent": "#F97316"
  },
  "spacing": [0, 4, 8, 12, 16, 20, 24, 32],
  "radius": { "xs": "4px", "sm": "8px", "md": "12px" }
}
```

**Figma:**
- Create component library (Button, Card, Input, etc.)
- Link to dev tokens (Figma plugins: Tokens Studio)
- Document usage per component
- Sync design changes weekly

**Documentation:**
- Storybook (React/Vue)
- Zeroheight (design docs)
- Living style guide in product

## Usage Guidelines

**When to Create New Components:**
- Reused 3+ times
- Has clear semantic meaning
- Distinct interaction pattern

**When to Extend Existing:**
- Variant of existing (e.g., Button with icon)
- Same base, different props
- Reuses logic and styles

**Naming:**
- PascalCase for components (Button, Card)
- camelCase for utilities (spacingMedium, colorPrimary)
- Descriptive: what is it, not where/when used

## Maintenance

- Review design system quarterly
- Archive deprecated components
- Document breaking changes
- Update component libraries
- Sync Figma with implementation
- Gather feedback from designers and developers

---

*Open source — use it wisely.*
