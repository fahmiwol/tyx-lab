# Design Tokens Generator

Complete design token system (colors, typography, spacing, radius, shadow). Exports to CSS custom properties, Tailwind config, and TypeScript types.

## What It Does

Centralizes all style decisions as machine-readable data:
- **Colors**: Canvas (warm off-white), ink (deep blacks), widget palette (pastels), semantic (success/error/warning)
- **Typography**: Display serif, body sans, mono; 9 font size scales
- **Spacing**: 12-step scale from 4px to 96px
- **Border radius**: 6 presets from 8px (sm) to 9999px (full)
- **Shadow**: 4 depth levels (soft, card, elevated, hero)

## Input

- Token category (colors | fonts | fontSize | space | radius | shadow)
- Token key within that category

## Output

- Raw token value (string or array)
- Full Tailwind preset (use as theme extension)
- CSS custom properties (compile to globals.css)

## Usage

```typescript
import { 
  colors, 
  fontSize, 
  space,
  getToken 
} from "@tiranyx/design-tokens-generator";

// Direct access
const accentColor = colors.accent; // "#0F0E0C"
const bodyFontSize = fontSize.body; // ["16px", { lineHeight: "1.6" }]

// Type-safe query
const padding = getToken("space", "4"); // "16px"

// Tailwind preset
// tailwind.config.ts:
import { tailwindPreset } from "@tiranyx/design-tokens-generator";
export default { presets: [tailwindPreset] };
```

## CSS Variables (Compile Step)

Generate globals.css from this module:

```css
:root {
  --color-canvas: #F9F4EC;
  --color-ink-900: #0F0E0C;
  --space-4: 16px;
  --radius-md: 12px;
  --shadow-card: 0 4px 24px rgba(15, 14, 12, 0.06);
  /* ... */
}
```

## Dependencies

- Tailwind CSS 4+ (for preset consumption)
- TypeScript 5+ (optional, for type inference)

## Why This Exists

Design systems require a single source of truth. Hardcoding hex/size values leads to:
- Drift (values diverge across files)
- Maintenance tax (updating one value requires find-replace)
- Type unsafety (strings break silently)

This module makes tokens **data**, so:
1. Same token exports to CSS vars, Tailwind, and TS types
2. Updates propagate everywhere automatically
3. Type safety catches misuse at build time
4. Team stays aligned on aesthetic decisions

The palette is warm and editorial (cream canvas, soft pastels, humanist serif). Adapt to your brand by modifying the hex values; the structure stays constant.

## Related Atoms

- `brand-identity-framework` — outputs color palettes generated per brand alternative

Open source — use it wisely.
