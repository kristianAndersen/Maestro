# UI/UX Design Skill

Applied visual design for interfaces. Provides specific values, ratios, standards, and CSS implementation patterns for color, typography, layout, and design systems. Framework-agnostic.

## When to Activate

Load this skill when working on:
- Color palettes, palette generation, dark/light mode
- Typography scales, font pairing, fluid type
- Layout grids, spacing systems, visual hierarchy
- CSS design tokens, custom properties, design system architecture
- WCAG accessibility (contrast, focus, reduced motion)
- Responsive design, container queries, fluid layouts

---

## Quick Reference — The Numbers That Matter

### Color Contrast (WCAG)
| Level | Normal text | Large text (18pt+ or 14pt bold) | UI components |
|-------|-------------|----------------------------------|---------------|
| AA    | 4.5:1       | 3:1                              | 3:1           |
| AAA   | 7:1         | 4.5:1                            | N/A           |

### Type Scale Ratios
| Scale name | Ratio | Use for |
|------------|-------|---------|
| Minor Third | 1.200 | Dense UI, small screens |
| Major Third | 1.250 | Compact but readable |
| Perfect Fourth | 1.333 | Most web interfaces |
| Augmented Fourth | 1.414 | Strong editorial hierarchy |
| Perfect Fifth | 1.500 | Display / marketing |
| Golden Ratio | 1.618 | Maximum drama/impact |

### Spacing Scale (8px base)
`4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96 — 128`

- Related items (within components): 4–16px
- Component internal padding: 8–24px
- Between components in a group: 16–32px
- Between sections: 48–96px
- Major page sections: 64–128px

### Line Length & Line Height
- Optimal reading: **45–75 characters** (measure / ch units)
- Body line height: **1.5**
- Heading line height: **1.2–1.3**
- Small/caption text: **1.7–2.0**

---

## Color Systems

### Building a Palette

1. **Start with primary hue** — choose based on brand/purpose
2. **Generate tints/shades** — 50/100/200/300/400/500/600/700/800/900 (HSL, adjust L)
3. **Define semantic roles** — primary, secondary, accent, neutral, success, warning, error, info
4. **Set surface hierarchy** — background, surface, overlay levels
5. **Verify WCAG** — every text-on-background combination

**Color psychology:**
- Red: urgency, error, danger, energy
- Orange: warmth, creativity, calls-to-action
- Yellow: caution, optimism, highlight
- Green: success, growth, safe, nature
- Blue: trust, calm, professionalism, stability
- Purple: premium, creative, mystical
- Gray: neutral, structure, secondary content

### Token Architecture (3 layers)

```css
/* Layer 1 — Primitive tokens (raw values) */
--color-blue-50:  #eff6ff;
--color-blue-500: #3b82f6;
--color-blue-900: #1e3a5f;
--color-neutral-50: #f9fafb;
--color-neutral-900: #111827;

/* Layer 2 — Semantic tokens (purpose-named) */
--color-primary:        var(--color-blue-500);
--color-primary-hover:  var(--color-blue-600);
--color-text-default:   var(--color-neutral-900);
--color-text-muted:     var(--color-neutral-500);
--color-bg-default:     var(--color-neutral-50);
--color-bg-surface:     #ffffff;
--color-success:        #15803d;  /* green-700, 5.0:1 on white — AA pass */
--color-error:          var(--color-red-500);
--color-warning:        var(--color-amber-400);

/* Layer 3 — Component tokens (scoped to component) */
--button-bg:            var(--color-primary);
--button-bg-hover:      var(--color-primary-hover);
--button-text:          #ffffff;
--input-border:         var(--color-neutral-300);
--input-border-focus:   var(--color-primary);
```

### Dark Mode

**Rule: invert luminance, preserve hue.**

```css
:root {
  --color-bg-default: #ffffff;
  --color-text-default: #111827;
  --color-surface: #f9fafb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-default: #111827;
    --color-text-default: #f9fafb;
    --color-surface: #1f2937;
  }
}

/* Or with data-theme attribute for user toggle: */
[data-theme="dark"] {
  --color-bg-default: #111827;
  --color-text-default: #f9fafb;
}
```

**Surface elevation in dark mode (use opacity, not lighter grays):**
```css
--surface-1: hsl(222, 47%, 11%);               /* base */
--surface-2: color-mix(in srgb, hsl(222 47% 11%) 95%, white);  /* slight lift */
--surface-elevated: color-mix(in srgb, var(--surface-1) 85%, white);
```

### Color Harmony Rules

- **Complementary**: Opposite on color wheel. High contrast, use sparingly as accent.
- **Analogous**: 2–3 adjacent hues. Harmonious, cohesive, low tension.
- **Triadic**: 3 hues equidistant. Vibrant but balanced — use one dominant, others accent.
- **Split-complementary**: Base + two adjacent to its complement. High contrast, less tension than complementary.
- **Tetradic**: 4 hues in rectangle. Rich but complex — keep one dominant, others supporting.

**Max 5–7 colors in primary palette** — beyond that, visual noise increases.

---

## Typography

### Type Scale — Perfect Fourth (1.333) — Default for Web

Starting from base 1rem (16px):

```css
--font-size-xs:   0.563rem;  /* ~9px   — captions, labels */
--font-size-sm:   0.750rem;  /* ~12px  — small body */
--font-size-base: 1.000rem;  /* 16px   — body text */
--font-size-md:   1.333rem;  /* ~21px  — lead/intro */
--font-size-lg:   1.777rem;  /* ~28px  — h5/h4 */
--font-size-xl:   2.369rem;  /* ~38px  — h3 */
--font-size-2xl:  3.157rem;  /* ~51px  — h2 */
--font-size-3xl:  4.209rem;  /* ~67px  — h1 */
--font-size-4xl:  5.610rem;  /* ~90px  — display */
```

### Font Pairing Rules

1. **Contrast principle**: pair a serif with a sans-serif for clear hierarchy
2. **Max 2–3 families**: one for headings, one for body, optionally one for mono/code
3. **Match by x-height**: fonts with similar x-height look intentional together
4. **Avoid similar styles**: two geometric sans-serifs compete; they don't complement

**Proven pairs:**
- Playfair Display + Source Sans Pro (editorial)
- Inter + Merriweather (clean/readable)
- Fraunces + Inter (contemporary contrast)
- Space Grotesk + Georgia (modern/classic)
- Mono fonts for code: JetBrains Mono, Fira Code, Cascadia Code

### Fluid Typography (Responsive)

Use `clamp(min, preferred, max)` to scale type with viewport:

```css
/* Body text: 1rem → 1.25rem between 320px–1280px */
--font-size-base: clamp(1rem, 0.875rem + 0.625vw, 1.25rem);

/* Heading h1: 2rem → 4rem */
--font-size-h1: clamp(2rem, 1rem + 5vw, 4rem);

/* Formula: clamp(min, [min]rem + [slope]vw, max)
   slope = (max - min) / (max-viewport - min-viewport) * 100 */
```

### Hierarchy Through Type

Three levers — use all three together:
1. **Size**: minimum 1.5× contrast between adjacent levels (body:lead, lead:h3, h3:h2, h2:h1)
2. **Weight**: 400 body, 500–600 subheadings, 600–700 headings, 700–800 display
3. **Color**: full contrast for primary content, 60–70% opacity or muted for secondary

```css
/* Hierarchy example */
h1 { font-size: var(--font-size-3xl); font-weight: 700; line-height: 1.2; }
h2 { font-size: var(--font-size-2xl); font-weight: 700; line-height: 1.25; }
h3 { font-size: var(--font-size-xl);  font-weight: 600; line-height: 1.3; }
h4 { font-size: var(--font-size-lg);  font-weight: 600; line-height: 1.35; }
p  { font-size: var(--font-size-base); font-weight: 400; line-height: 1.6; max-width: 65ch; }
```

---

## Layout & Spatial Hierarchy

### Visual Hierarchy Principle

Perception ranks visual elements in this order:
**Size > Color > Contrast > Spacing > Position**

Design decisions should deliberately use this order. If something must be important, make it large first, then bold, then high-contrast.

### Spacing Scale Application

```css
:root {
  --space-1:  0.25rem;  /* 4px  — tight: icon gap, inset label */
  --space-2:  0.5rem;   /* 8px  — compact: button padding-x */
  --space-3:  0.75rem;  /* 12px — snug: input padding */
  --space-4:  1rem;     /* 16px — default: card padding, stack gap */
  --space-6:  1.5rem;   /* 24px — comfortable: section padding */
  --space-8:  2rem;     /* 32px — loose: between components */
  --space-12: 3rem;     /* 48px — section gap */
  --space-16: 4rem;     /* 64px — major section gap */
  --space-24: 6rem;     /* 96px — page section gap */
  --space-32: 8rem;     /* 128px — hero/splash spacing */
}
```

### Grid Systems

```css
/* 12-column grid */
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

/* Auto-fit responsive grid (no media queries) */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

/* Auto-fill (keeps empty columns, preserves alignment) */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--space-4);
}
```

### Reading Patterns

- **F-pattern**: Users scan left edge, then scan across top, then scan left edge again. Used in text-heavy pages. Put key info in the F-path.
- **Z-pattern**: Top-left → top-right → diagonal → bottom-left → bottom-right. Used in marketing/landing pages.
- **Gutenberg diagram**: High attention in top-left (primary optical area) and bottom-right (terminal area). Low attention top-right, bottom-left.

### Whitespace Rules

- Minimum 50% of design should be whitespace
- Proximity: related items close together; unrelated items separated
- Consistent alignment creates visual connection across elements
- Asymmetric whitespace adds dynamism; symmetric creates formality

---

## CSS Implementation Patterns

### Custom Properties Foundation

```css
/* tokens.css — complete minimal system */
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-bg: #ffffff;
  --color-surface: #f9fafb;
  --color-border: #e5e7eb;
  --color-error: #ef4444;
  --color-success: #15803d;  /* 5.0:1 on white — AA pass */
  --color-warning: #f59e0b;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;
  --font-size-base: 1rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
```

### Accessibility CSS

```css
/* Focus visible — keyboard users */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Reduced motion — respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --color-text: #000000;
    --color-bg: #ffffff;
    --color-primary: #0000cc;
    --color-border: #000000;
  }
}

/* Color scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f9fafb;
    --color-bg: #111827;
    --color-surface: #1f2937;
    --color-border: #374151;
  }
}
```

---

## Anti-Patterns

- Using more than 5–7 colors in the primary palette (visual noise)
- Arbitrary spacing values (mixing 13px, 17px, 22px — use the 8px scale)
- No typographic hierarchy (same size and weight everywhere)
- Text below WCAG AA contrast ratio
- Missing `:focus-visible` styles (keyboard navigation broken)
- Using color alone to convey meaning (colorblind users excluded)
- Line lengths beyond 75 characters (readability degrades)
- No whitespace (visual clutter, content feels overwhelming)
- Breaking alignment grid without intention (creates visual chaos)
- Inconsistent border-radius (mixing 3px, 6px, 10px arbitrarily)

---

## Deep Reference Assets

Load these for specific, detailed guidance:

- **`assets/color-theory.md`** — Color harmony, palette generation, WCAG calculation, dark mode deep dive, color tokens
- **`assets/typography.md`** — All scale ratios with values, fluid type formulas, font pairing, hierarchy implementation
- **`assets/layout-hierarchy.md`** — Visual hierarchy, grid patterns, spacing application, reading patterns, whitespace
- **`assets/css-patterns.md`** — Design token architecture, modern CSS, container queries, logical properties, accessibility CSS
- **`assets/component-patterns.md`** — Ready-to-use CSS for Button, Form Field, Card, Alert, Badge, Nav, Modal — all using design tokens
