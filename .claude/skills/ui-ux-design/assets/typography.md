# Typography — Deep Reference

Specific values, ratios, CSS patterns, and implementation for type systems.

---

## Type Scale Ratios — Complete Table

All scales calculated from 1rem (16px) base, showing 9 steps up and 2 down.

### Minor Third — 1.200

Dense, compact. Good for data-heavy UIs, dashboards, small screens.

| Step | Name | rem | px (approx) | Use |
|------|------|-----|-------------|-----|
| -2 | xs | 0.694rem | 11px | captions, overlines |
| -1 | sm | 0.833rem | 13px | secondary labels |
| 0  | base | 1.000rem | 16px | body text |
| +1 | md | 1.200rem | 19px | lead/intro |
| +2 | lg | 1.440rem | 23px | h5 |
| +3 | xl | 1.728rem | 28px | h4 |
| +4 | 2xl | 2.074rem | 33px | h3 |
| +5 | 3xl | 2.488rem | 40px | h2 |
| +6 | 4xl | 2.986rem | 48px | h1 |
| +7 | 5xl | 3.583rem | 57px | display |

### Perfect Fourth — 1.333 (Recommended Default)

Clear hierarchy, widely readable. Best for most web interfaces.

| Step | Name | rem | px (approx) | Use |
|------|------|-----|-------------|-----|
| -2 | xs | 0.563rem | 9px | fine print only |
| -1 | sm | 0.750rem | 12px | captions, labels |
| 0  | base | 1.000rem | 16px | body text |
| +1 | md | 1.333rem | 21px | lead/intro, h5 |
| +2 | lg | 1.777rem | 28px | h4 |
| +3 | xl | 2.369rem | 38px | h3 |
| +4 | 2xl | 3.157rem | 51px | h2 |
| +5 | 3xl | 4.209rem | 67px | h1 |
| +6 | 4xl | 5.610rem | 90px | display/hero |

### Golden Ratio — 1.618

Dramatic hierarchy. Marketing sites, editorial, landing pages.

| Step | Name | rem | px (approx) | Use |
|------|------|-----|-------------|-----|
| -1 | sm | 0.618rem | 10px | fine print |
| 0  | base | 1.000rem | 16px | body text |
| +1 | md | 1.618rem | 26px | lead/h5 |
| +2 | lg | 2.618rem | 42px | h3/h4 |
| +3 | xl | 4.236rem | 68px | h2 |
| +4 | 2xl | 6.854rem | 110px | h1/display |

Golden ratio is very dramatic — rarely use more than 4 levels; the jumps are large.

---

## CSS Type Scale Implementation

### Static Scale (Perfect Fourth)

```css
:root {
  --font-size-xs:   0.563rem;   /*  9px */
  --font-size-sm:   0.750rem;   /* 12px */
  --font-size-base: 1.000rem;   /* 16px */
  --font-size-md:   1.333rem;   /* 21px */
  --font-size-lg:   1.777rem;   /* 28px */
  --font-size-xl:   2.369rem;   /* 38px */
  --font-size-2xl:  3.157rem;   /* 51px */
  --font-size-3xl:  4.209rem;   /* 67px */
  --font-size-4xl:  5.610rem;   /* 90px */
}
```

### Fluid Scale — clamp() Patterns

Fluid typography scales between a minimum viewport (320px) and maximum (1280px) without media queries.

**Formula:**
```
clamp(
  [minimum-size],
  [minimum-size] + ([maximum-size] - [minimum-size]) * ((100vw - [min-viewport]) / ([max-viewport] - [min-viewport])),
  [maximum-size]
)
```

Simplified with vw unit (approximate, close enough for most uses):
```
clamp(min, min + slope * 1vw, max)
slope = (max - min) / (max-viewport-in-px - min-viewport-in-px) * 100
```

**Fluid scale example (320px → 1280px viewport):**

```css
:root {
  /* Base: 14px → 18px */
  --font-size-base: clamp(0.875rem, 0.625rem + 1.25vw, 1.125rem);

  /* SM: 12px → 14px */
  --font-size-sm: clamp(0.75rem, 0.625rem + 0.625vw, 0.875rem);

  /* LG: 18px → 24px */
  --font-size-lg: clamp(1.125rem, 0.75rem + 1.875vw, 1.5rem);

  /* XL: 24px → 36px */
  --font-size-xl: clamp(1.5rem, 0.75rem + 3.75vw, 2.25rem);

  /* 2XL: 30px → 48px */
  --font-size-2xl: clamp(1.875rem, 0.75rem + 5.625vw, 3rem);

  /* 3XL: 36px → 60px */
  --font-size-3xl: clamp(2.25rem, 0.75rem + 7.5vw, 3.75rem);

  /* 4XL: 48px → 80px */
  --font-size-4xl: clamp(3rem, 1rem + 10vw, 5rem);
}
```

**Using CSS calc for precise fluid type:**
```css
/* body: 16px at 320px, 20px at 1280px */
/* slope = (20-16)/(1280-320) * 100 = 0.4167vw */
--font-size-base: clamp(1rem, 0.583rem + 1.042vw, 1.25rem);
```

---

## Line Height Reference

Line height multiplier values (unitless, relative to font-size):

| Context | Multiplier | Reason |
|---------|------------|--------|
| Display/hero text | 1.0–1.1 | Large text needs no extra breathing room |
| Headings H1/H2 | 1.15–1.25 | Tight but readable |
| Headings H3/H4 | 1.25–1.35 | Some breathing room |
| Large UI labels | 1.3–1.4 | Readable at medium size |
| Body text | 1.5–1.6 | Optimal reading line-height |
| Long-form / articles | 1.65–1.75 | More comfortable for extended reading |
| Captions / small text | 1.7–2.0 | Small text needs more leading |

```css
/* Implementation */
h1, h2 { line-height: 1.2; }
h3, h4 { line-height: 1.3; }
h5, h6 { line-height: 1.4; }
p, li   { line-height: 1.6; }
small, figcaption { line-height: 1.8; }
```

---

## Line Length (Measure)

Optimal reading experience: **45–75 characters** per line.

```css
/* Recommended approach: ch units */
p {
  max-width: 65ch;  /* approximately 65 characters */
}

/* Or rem-based approximation */
p {
  max-width: 38rem;  /* approximate at 16px base */
}

/* For tighter, more editorial feel */
.lead, .intro {
  max-width: 55ch;
}

/* Never restrict headings — they should span full container */
h1, h2, h3 {
  max-width: none;
}
```

When using a grid, the line length constraint is usually handled by the column width. Check that content columns are not too wide at large viewports.

---

## Font Pairing — System

### The Contrast Principle

Successful font pairings create clear contrast between heading and body roles. Conflict happens when two fonts compete rather than complement.

**High contrast pairings (serif headings + sans body — editorial, classic):**
- Playfair Display + Source Sans 3
- Libre Baskerville + Open Sans
- Merriweather + Inter
- Fraunces + DM Sans
- Lora + Nunito Sans

**High contrast pairings (display/geometric sans headings + humanist body):**
- Space Grotesk + Lato
- Syne + IBM Plex Sans
- Clash Display + Outfit
- Archivo Black + Karla

**Minimal / monochromatic (same superfamily, different weights):**
- Inter Regular + Inter SemiBold + Inter Bold
- Roboto 300 + Roboto 400 + Roboto 700
- DM Sans Light + DM Sans Regular + DM Sans Bold

**Clean sans + classic serif (versatile default):**
- Inter + Georgia (modern UI + classic reading experience)
- Inter + Playfair Display (modern body + editorial headings)

**Friendly / informal:**
- Nunito + Open Sans (rounded + neutral)
- Quicksand + Source Serif Pro (playful + readable)

### Rules for Font Pairing

1. **Never pair two serifs** — they compete, rarely complement
2. **Never pair two display fonts** — both want to be the star
3. **Match x-height** — fonts with similar x-height look related; very different x-heights feel accidental
4. **Limit to 2 families** in most UIs; 3 only if one is monospace for code
5. **Use weight to create hierarchy before adding a second family** — often you don't need two fonts at all

### Font Loading — Performance

```html
<!-- Preconnect to font CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Load only weights you use — don't load all 9 weights -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
```

```css
/* font-display for smooth loading */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;  /* shows fallback while loading */
}

/* System font stack fallback (always provide) */
body {
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
}
```

---

## Variable Fonts

Variable fonts encode multiple variations in a single font file. Core axes:

| Axis tag | Meaning | Typical range |
|----------|---------|---------------|
| `wght` | Weight | 100–900 |
| `wdth` | Width (condensed ↔ expanded) | 75–125 |
| `ital` | Italic | 0 or 1 |
| `slnt` | Slant angle | -15 to 0 |
| `opsz` | Optical size (spacing optimized per size) | 8–144 |

```css
/* Variable font — only load one file, use any weight */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;       /* declare full range */
  font-display: swap;
}

/* Optical sizing for headings vs body */
h1 { font-variation-settings: 'opsz' 48; }
p  { font-variation-settings: 'opsz' 16; }

/* Fluid weight (e.g., grow bolder as size increases) */
h2 { font-weight: clamp(600, 500 + 2vw, 800); }
```

**Support:** Variable fonts have 97%+ browser support (2024). Use them — they cut font payload by 60–80% vs loading 4–5 separate weight files.

---

## Typographic Hierarchy Implementation

### Weight Scale

```css
--font-weight-thin:       100;
--font-weight-light:      300;
--font-weight-normal:     400;  /* body text */
--font-weight-medium:     500;  /* labels, emphasis */
--font-weight-semibold:   600;  /* subheadings, buttons */
--font-weight-bold:       700;  /* headings */
--font-weight-extrabold:  800;  /* display, marketing */
--font-weight-black:      900;  /* maximum impact */
```

### Complete Heading System

```css
/* Heading system with Perfect Fourth scale */
h1 {
  font-size: var(--font-size-4xl);   /* ~67px or fluid */
  font-weight: var(--font-weight-bold);
  line-height: 1.1;
  letter-spacing: -0.025em;          /* tight for large text */
  color: var(--color-text-primary);
}

h2 {
  font-size: var(--font-size-3xl);   /* ~51px or fluid */
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}

h3 {
  font-size: var(--font-size-2xl);   /* ~38px or fluid */
  font-weight: var(--font-weight-semibold);
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--color-text-primary);
}

h4 {
  font-size: var(--font-size-xl);    /* ~28px or fluid */
  font-weight: var(--font-weight-semibold);
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--color-text-primary);
}

h5 {
  font-size: var(--font-size-lg);    /* ~21px */
  font-weight: var(--font-weight-semibold);
  line-height: 1.4;
  color: var(--color-text-primary);
}

h6 {
  font-size: var(--font-size-base);  /* 16px */
  font-weight: var(--font-weight-semibold);
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;           /* uppercase needs tracking */
  color: var(--color-text-secondary);
}

/* Body text */
p {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: 1.6;
  color: var(--color-text-primary);
  max-width: 65ch;
}

/* Lead / intro paragraph */
.lead {
  font-size: var(--font-size-md);    /* ~21px */
  font-weight: var(--font-weight-normal);
  line-height: 1.5;
  color: var(--color-text-secondary);
  max-width: 55ch;
}

/* Small / caption */
small, .caption {
  font-size: var(--font-size-sm);    /* 12px */
  line-height: 1.8;
  color: var(--color-text-tertiary);
}
```

### Letter Spacing (Tracking)

Standard tracking values by size range:

| Size range | letter-spacing value | Context |
|------------|----------------------|---------|
| Display ≥ 48px | -0.05em | Hero, splash, giant numerals |
| Large heading 32–48px | -0.025em | h1 at most viewport sizes |
| Medium heading 24–32px | -0.01em to -0.015em | h2/h3 |
| Body text 14–20px | 0 | Paragraphs, UI labels |
| Small labels / uppercase | 0.025em – 0.1em | Overlines, badges, caps |

Large text needs tighter tracking; small uppercase needs wider:

```css
/* Loose: uppercase labels, small caps, overlines */
.label, .overline {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--font-weight-semibold);
}

/* Normal: body text */
p { letter-spacing: 0; }  /* or 0.01em if font feels tight */

/* Tight: large headings */
h1 { letter-spacing: -0.025em; }
h2 { letter-spacing: -0.02em; }
h3 { letter-spacing: -0.01em; }
```

---

## Anti-Patterns in Typography

**Same size, same weight, same color for everything:**
The single most common failure. Use size + weight + color together to create hierarchy.

**Too many font families:**
Three or more unrelated families creates visual noise. Establish a maximum of two (plus optional mono for code).

**Ignoring line length:**
Text that spans full-width on large screens becomes unreadable. Always constrain with `max-width` on prose elements.

**Line height too tight for body text:**
A line-height of 1.2 on body copy causes lines to feel cramped. Use 1.5–1.6 for body.

**No spacing between paragraphs:**
Use `margin-block-end: 1em` or `margin-block-end: var(--space-4)` on paragraphs.

**Justified text without hyphenation:**
Justified text creates "rivers" of whitespace. If you must use it: `hyphens: auto; text-align: justify;`

**Italic for everything:**
Italics are a subtle emphasis tool — reserve for citations, technical terms, or gentle emphasis. Not for whole paragraphs.

**Font size below 12px:**
Anything below 12px (0.75rem) is inaccessible to many users. Even labels and captions should stay at 12px minimum.

**font-weight: 300 on non-retina displays:**
Light weight (300) renders poorly on standard-density (1x) screens — strokes become too thin for sub-pixel rendering. Use 400 as the minimum weight for body text. Light weight is safe only for display text ≥32px or on retina/high-DPI screens.
