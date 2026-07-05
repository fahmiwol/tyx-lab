/**
 * Design Tokens — Single Source of Truth
 *
 * All style decisions codified as data. Exports to:
 * - CSS custom properties (globals.css)
 * - Tailwind config preset
 * - TypeScript types (for programmatic access)
 *
 * Never hardcode hex/size/radius values. Use these exports.
 * When tokens change, all three outputs stay in sync.
 *
 * Open source — use it wisely.
 */

// ---- COLOR PALETTE ----
export const colors = {
  // Canvas: warm, off-white
  canvas: "#F9F4EC",
  canvasElevated: "#FFFFFF",
  canvasSunken: "#F1EBE0",

  // Ink: deep, never pure black
  ink900: "#0F0E0C",
  ink700: "#3A3732",
  ink500: "#6B6860",
  ink300: "#B8B4AA",
  ink100: "#E8E4DA",

  // Widget palette: pastel, muted (non-chromatic)
  widgetYellow: "#F5D96F",
  widgetYellowSoft: "#FAE8A8",
  widgetPink: "#F5C6D6",
  widgetPinkSoft: "#FADCE6",
  widgetGreen: "#B8CFA8",
  widgetGreenSoft: "#D4E2C4",
  widgetBlue: "#B5C4E0",
  widgetBlueSoft: "#D1DAEC",
  widgetLavender: "#D1C4E0",
  widgetCoral: "#F5B8A0",

  // Semantic
  accent: "#0F0E0C",
  accentInverse: "#F9F4EC",
  accentPop: "#F5496B",
  success: "#4A8B5F",
  warning: "#D4941E",
  error: "#B83D3D",
  info: "#4A6B8B",
} as const;

// ---- TYPOGRAPHY ----
export const fonts = {
  display: "\"Fraunces\", \"Instrument Serif\", Georgia, serif",
  sans: "\"Plus Jakarta Sans\", \"Inter\", system-ui, sans-serif",
  mono: "\"JetBrains Mono\", \"Menlo\", monospace",
} as const;

export const fontSize = {
  display2xl: ["72px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
  displayXl: ["56px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
  displayLg: ["44px", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
  h1: ["36px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
  h2: ["28px", { lineHeight: "1.2" }],
  h3: ["22px", { lineHeight: "1.3" }],
  h4: ["18px", { lineHeight: "1.4" }],
  bodyLg: ["18px", { lineHeight: "1.55" }],
  body: ["16px", { lineHeight: "1.6" }],
  bodySm: ["14px", { lineHeight: "1.5" }],
  caption: ["13px", { lineHeight: "1.4" }],
  monoSm: ["13px", { lineHeight: "1.5" }],
} as const;

// ---- SPACING ----
export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

// ---- BORDER RADIUS ----
export const radius = {
  sm: "8px",
  md: "12px",
  lg: "20px",
  xl: "28px",
  "2xl": "36px",
  full: "9999px",
} as const;

// ---- SHADOW ----
export const shadow = {
  none: "none",
  soft: "0 2px 12px rgba(15, 14, 12, 0.04)",
  card: "0 4px 24px rgba(15, 14, 12, 0.06)",
  elevated: "0 12px 40px rgba(15, 14, 12, 0.08)",
  hero: "0 20px 60px rgba(15, 14, 12, 0.10)",
} as const;

/**
 * Tailwind preset — import this in tailwind.config.ts
 * 
 * export default {
 *   presets: [require("@tiranyx/design-tokens-generator/tailwind")],
 * }
 */
export const tailwindPreset = {
  theme: {
    colors,
    fontFamily: fonts,
    fontSize,
    spacing: space,
    borderRadius: radius,
    boxShadow: shadow,
  },
} as const;

/**
 * Type-safe access to any token category
 */
export type TokenCategory = keyof typeof {
  colors;
  fonts;
  fontSize;
  space;
  radius;
  shadow;
};

export function getToken(category: TokenCategory, key: string): any {
  const map = { colors, fonts, fontSize, space, radius, shadow };
  return map[category]?.[key];
}
