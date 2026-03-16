# Layout & Visual Hierarchy — Deep Reference

Grids, spacing systems, whitespace principles, reading patterns, and visual weight.

---

## Visual Hierarchy — The Perception Stack

The human eye reads visual weight in this order. When in doubt, apply them in this sequence:

1. **Size** — Largest element gets first attention, always
2. **Color** — Warm, saturated, high-chroma colors pull attention
3. **Contrast** — High-contrast elements (dark on light, light on dark) attract the eye
4. **Spacing** — Isolated elements stand out; dense groups read as units
5. **Position** — Top-left has highest attention in LTR cultures; bottom-right is terminal
6. **Shape** — Organic shapes stand out in geometric layouts; sharp shapes stand out in curves
7. **Texture/weight** — Bold type outweighs regular type

**Applying this:**
- Primary action = largest, highest contrast, most saturated color, most isolated
- Secondary content = medium size, muted color, slightly less contrast, closer together
- Tertiary/metadata = smallest, lowest contrast, most muted, densest grouping

---

## Spacing Scale — Full Reference

### The 8px Grid

All spacing values are multiples of 4 (a 4px sub-unit for tight situations):

```
4px   — 0.25rem — --space-1  — tight: icon/text gap, inset indicator
8px   — 0.5rem  — --space-2  — compact: badge padding, chip gap
12px  — 0.75rem — --space-3  — snug: button padding-block, input internal
16px  — 1rem    — --space-4  — default: card padding, list item gap
24px  — 1.5rem  — --space-6  — comfortable: section padding-inline
32px  — 2rem    — --space-8  — loose: between-component gap
48px  — 3rem    — --space-12 — section gap: between related sections
64px  — 4rem    — --space-16 — major section: hero padding, large gap
96px  — 6rem    — --space-24 — page section: top-of-page, major dividers
128px — 8rem    — --space-32 — hero/splash: hero top padding, marketing
```

### Spacing Context Guide

| Situation | Value | Why |
|-----------|-------|-----|
| Icon gap from text label | 4–8px | Tight association |
| Button padding-inline | 12–24px | Depends on size variant |
| Button padding-block | 8–12px | Standard touchable area |
| Input padding | 8–12px all | Comfortable input zone |
| Card internal padding | 16–24px | Breathing room, not cramped |
| Gap between cards | 16–24px | Clear separation |
| Section padding-block | 48–96px | Clear section boundaries |
| Nav height | 48–64px | Accessible touch target (44px min) |
| Footer padding-block | 48–96px | Visual weight at page end |
| Modal padding | 24–32px | Comfortable content container |
| Tooltip padding | 6–12px | Compact informational |

### Don'ts for Spacing

- Never use values between the scale steps (e.g., 14px, 20px, 36px) without a documented reason
- Never mix arbitrary values with scale values in the same component (creates tension)
- Never use `0` for spacing where visual separation is needed (even 1px border is better than nothing)
- Never let components touch the viewport edge — always `padding-inline: var(--space-4)` minimum

---

## Grid Systems

### 12-Column — Standard Workhorse

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

/* Column span helpers */
.col-12 { grid-column: span 12; }  /* full width */
.col-8  { grid-column: span 8; }   /* 2/3 width */
.col-6  { grid-column: span 6; }   /* 1/2 width */
.col-4  { grid-column: span 4; }   /* 1/3 width */
.col-3  { grid-column: span 3; }   /* 1/4 width */

/* Common layouts */
/* Sidebar + main content */
.layout-sidebar {
  grid-template-columns: 260px 1fr;
  gap: var(--space-8);
}

/* Article with aside */
.layout-article {
  grid-column: 2 / span 8;   /* center columns */
}
.layout-aside {
  grid-column: 11 / span 2;  /* right columns */
}
```

### Responsive Grid — No Media Queries

```css
/* Auto-fit: fills row, stretches to fill gaps */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-6);
}

/* Auto-fill: preserves empty column slots (good for fixed-width items) */
.icon-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 64px));
  gap: var(--space-4);
  justify-content: start;
}

/* When to use auto-fit vs auto-fill:
   auto-fit:  Content fills available space — use for cards, articles
   auto-fill: Empty slots preserved — use for avatar rows, icon grids */
```

### Asymmetric / Holy Grail Layouts

```css
/* Full page layout: header, sidebar, main, aside, footer */
.page-layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar main    aside"
    "footer  footer  footer";
  grid-template-columns: 240px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
  gap: 0;
}

.page-header  { grid-area: header; }
.page-sidebar { grid-area: sidebar; }
.page-main    { grid-area: main; }
.page-aside   { grid-area: aside; }
.page-footer  { grid-area: footer; }
```

### Stack Layout Patterns

```css
/* Vertical stack with consistent gap */
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.stack--tight { gap: var(--space-2); }
.stack--loose { gap: var(--space-8); }

/* Horizontal cluster */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

/* Sidebar: one fixed, one fluid */
.with-sidebar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}
.with-sidebar > :first-child {
  flex-basis: 240px;
  flex-grow: 1;
}
.with-sidebar > :last-child {
  flex-basis: 0;
  flex-grow: 999;
  min-inline-size: 50%;  /* wraps when main < 50% */
}
```

### Flexbox Utility Patterns

```css
/* Toolbar: push trailing items to the right */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.toolbar__spacer,
.toolbar :last-child { margin-inline-start: auto; }

/* Card with pinned footer (footer sticks to bottom regardless of content height) */
.card {
  display: flex;
  flex-direction: column;
}
.card__body  { flex: 1; }
.card__footer { margin-block-start: auto; }

/* Stack: lobotomized owl — gap between all siblings without flex */
.stack > * + * {
  margin-block-start: var(--space-4);
}
```

---

## Whitespace Principles

### The 50% Rule

At minimum, 50% of any design should be empty space. Whitespace is not wasted space — it is structural. Whitespace:
- Creates groups (proximity)
- Establishes hierarchy (isolation = importance)
- Directs attention (surrounded elements attract focus)
- Improves readability (breathing room for text)

### Proximity

Elements physically close together are perceived as related. Use proximity intentionally:

```css
/* Form field: label and input are related — tight gap */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);  /* 8px — they belong together */
}

/* Between form fields — more gap to separate them */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);  /* 24px — each field is its own unit */
}

/* Between form sections — even more */
.form-section + .form-section {
  margin-block-start: var(--space-12);  /* 48px — clear section break */
}
```

### Isolation = Importance

An element surrounded by whitespace draws the eye. Use this to create emphasis:

```css
/* Call to action surrounded by space */
.cta-section {
  padding-block: var(--space-24);  /* 96px top/bottom — it breathes */
  text-align: center;
}

/* Stat or metric that should stand out */
.metric {
  padding: var(--space-8);         /* generous internal space */
  margin-inline: auto;
  max-width: 200px;                /* isolate it */
}
```

### Consistent Alignment

Every element should align to something else. Alignment creates invisible connections:

```css
/* Everything aligns to the left edge of the content area */
.content-column {
  padding-inline-start: var(--space-6);
}

/* Grid lines create vertical rhythm */
.card-content {
  padding: var(--space-6);
}
.card-title {
  /* padding-inline-start naturally aligns to grid left edge */
}
```

Break alignment only intentionally — a deliberately misaligned element creates tension and can be used for emphasis.

---

## Reading Patterns

### F-Pattern (Text-heavy pages)

Eye tracks: left edge top → scan across top → scan left edge again → one more scan across

**Apply F-pattern design:**
- Put key information in the first line (horizontal top bar)
- Put secondary info in the second scan line
- Right rail is largely ignored — use it for navigation, not content
- First 2–3 words of each paragraph matter most (left edge scan)
- Use bold, bullets, and headers to make the left edge scannable

### Z-Pattern (Marketing / Landing pages)

Eye tracks: top-left → top-right → diagonal sweep → bottom-left → bottom-right

**Apply Z-pattern design:**
```
[Logo/brand]                [CTA/nav]
        ↘ diagonal ↙
[Headline/value prop]   [Supporting visual]
```
- Logo top-left, main CTA top-right
- Hero headline left, hero image right (or full bleed)
- Bottom-left next key message, bottom-right final CTA

### Gutenberg Diagram (Print / newspaper layout)

Four quadrants:
- **Top-left (Primary Optical Area)**: Highest natural attention — headline, logo
- **Bottom-right (Terminal Area)**: Second highest — CTA, key action
- **Top-right (Fallow Area)**: Low attention — can be used for supporting content
- **Bottom-left (Fallow Area)**: Lowest attention — avoid placing critical info here

---

## Visual Weight

Elements have perceived "weight." Heavier elements dominate compositions.

| Factor | Heavier → Lighter |
|--------|-------------------|
| Size | Large → Small |
| Color | Saturated/warm → Desaturated/cool |
| Value | Dark → Light (on light bg); Light → Dark (on dark bg) |
| Contrast | High contrast → Low contrast |
| Texture | Textured/detailed → Plain/flat |
| Position | Top/left → Bottom/right |
| Isolation | Isolated → Grouped |
| Shape | Complex/irregular → Simple/regular |

**Balancing compositions:**
- One heavy anchor + lighter supporting elements
- Avoid multiple heavy elements competing for attention
- Use asymmetric balance (different elements at different distances from center)

---

## Responsive Layout Patterns

### Standard Breakpoints (2024 convention)

| Name | min-width | Typical target |
|------|-----------|----------------|
| xs | 480px | Large phones landscape |
| sm | 640px | Small tablets / large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops / landscape tablets |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large/wide monitors |

```css
/* Mobile-first — apply base styles, then override up */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile-First Stack → Horizontal

```css
/* Mobile: stacked */
.feature {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* Desktop: side by side */
@media (min-width: 768px) {
  .feature {
    flex-direction: row;
    align-items: center;
  }
  .feature__content { flex: 1; }
  .feature__image { flex: 1; }
}
```

### Container Queries — Component-Level Responsive

```css
/* Define a containment context */
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Card adapts to its container, not the viewport */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: var(--space-4);
  }
  .card__image {
    aspect-ratio: 1;
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

### Intrinsic Web Design Patterns

```css
/* RAM: Repeat, Auto, Minmax */
.grid--ram {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
}

/* Fluid columns without breakpoints */
.columns {
  columns: 300px;  /* creates as many columns as fit at min 300px */
  column-gap: var(--space-6);
}

/* Full bleed within constrained container */
.constrained {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-6);
}

.full-bleed {
  width: 100vw;
  margin-inline: calc(50% - 50vw);
}
```

---

## Z-Index Scale

Define a named z-index system to prevent z-index wars:

```css
:root {
  --z-below:     -1;    /* below default stacking */
  --z-base:       0;    /* default */
  --z-raised:     1;    /* slightly elevated: cards, dropdowns */
  --z-dropdown:  10;    /* dropdown menus */
  --z-sticky:    20;    /* sticky headers */
  --z-fixed:     30;    /* fixed position elements */
  --z-overlay:   40;    /* backdrop/overlay */
  --z-modal:     50;    /* modal dialogs */
  --z-toast:     60;    /* notifications/toasts */
  --z-tooltip:   70;    /* tooltips */
  --z-maximum:  999;    /* emergency — avoid if possible */
}
```

Never use arbitrary z-index values. Never use z-index: 9999 unless you have a documented reason.
