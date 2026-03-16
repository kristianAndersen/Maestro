# CSS Patterns — Deep Reference

Design token architecture, modern CSS implementation, accessibility, and component patterns.

---

## CSS Cascade Layers

Cascade layers (`@layer`) give explicit, ordered specificity control. Styles in later layers win over earlier ones, regardless of selector specificity.

```css
/* Declare layer order first — order determines priority (last wins) */
@layer reset, base, tokens, layout, components, utilities, overrides;

@layer reset     { *, *::before, *::after { box-sizing: border-box; margin: 0; } }
@layer tokens    { :root { --color-primary: #2563eb; /* ... */ } }
@layer base      { body { font-family: var(--font-family-sans); line-height: 1.5; } }
@layer components { .btn { /* component styles */ } }
@layer utilities { .sr-only { /* utility overrides */ } }
@layer overrides { /* emergency one-offs — prefer not to use */ }
```

**Key rule:** Unlayered styles beat all layers. Always layer your own code; unlayered third-party CSS will override everything.

---

## Design Token Architecture

### Three-Layer Token System

Tokens flow from primitive → semantic → component. Never skip layers.

**Layer 1 — Primitive Tokens**
Raw values with no semantic meaning. Named by category + scale:

```css
/* Color primitives */
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-200: #bfdbfe;
--blue-300: #93c5fd;
--blue-400: #60a5fa;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;
--blue-800: #1e40af;
--blue-900: #1e3a8a;

--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Spacing primitives */
--space-raw-4: 0.25rem;
--space-raw-8: 0.5rem;
--space-raw-12: 0.75rem;
--space-raw-16: 1rem;
--space-raw-24: 1.5rem;
--space-raw-32: 2rem;
--space-raw-48: 3rem;
--space-raw-64: 4rem;
--space-raw-96: 6rem;
--space-raw-128: 8rem;

/* Typography primitives */
--font-size-raw-xs: 0.563rem;
--font-size-raw-sm: 0.75rem;
--font-size-raw-base: 1rem;
--font-size-raw-lg: 1.333rem;
--font-size-raw-xl: 1.777rem;
--font-size-raw-2xl: 2.369rem;
--font-size-raw-3xl: 3.157rem;
```

**Layer 2 — Semantic Tokens**
Meaningful names that describe purpose, not value:

```css
:root {
  /* Color — semantic */
  --color-primary: var(--blue-600);
  --color-primary-hover: var(--blue-700);
  --color-primary-active: var(--blue-800);
  --color-primary-subtle: var(--blue-50);
  --color-primary-text: #ffffff;

  --color-secondary: var(--gray-600);
  --color-secondary-hover: var(--gray-700);

  --color-text: var(--gray-900);
  --color-text-secondary: var(--gray-600);
  --color-text-tertiary: var(--gray-400);
  --color-text-inverse: #ffffff;
  --color-text-disabled: var(--gray-300);

  --color-bg: #ffffff;
  --color-bg-subtle: var(--gray-50);
  --color-bg-muted: var(--gray-100);
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;

  --color-border: var(--gray-200);
  --color-border-strong: var(--gray-400);
  --color-border-focus: var(--blue-500);

  --color-success: #16a34a;
  --color-success-subtle: #f0fdf4;
  --color-warning: #b45309;
  --color-warning-subtle: #fffbeb;
  --color-error: #dc2626;
  --color-error-subtle: #fef2f2;
  --color-info: var(--blue-600);
  --color-info-subtle: var(--blue-50);

  /* Spacing — semantic */
  --space-1: var(--space-raw-4);
  --space-2: var(--space-raw-8);
  --space-3: var(--space-raw-12);
  --space-4: var(--space-raw-16);
  --space-6: var(--space-raw-24);
  --space-8: var(--space-raw-32);
  --space-12: var(--space-raw-48);
  --space-16: var(--space-raw-64);
  --space-24: var(--space-raw-96);
  --space-32: var(--space-raw-128);

  /* Typography — semantic */
  --font-size-xs: var(--font-size-raw-xs);
  --font-size-sm: var(--font-size-raw-sm);
  --font-size-base: var(--font-size-raw-base);
  --font-size-lg: var(--font-size-raw-lg);
  --font-size-xl: var(--font-size-raw-xl);
  --font-size-2xl: var(--font-size-raw-2xl);
  --font-size-3xl: var(--font-size-raw-3xl);

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  --font-family-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', Consolas, monospace;

  /* Border radius — semantic */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadow — semantic */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transition */
  --transition-fast: 100ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* Z-index */
  --z-base: 0;
  --z-raised: 1;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-overlay: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-tooltip: 70;
}
```

**Layer 3 — Component Tokens**
Scoped to specific components. Reference semantic tokens:

```css
/* Button component tokens */
.button {
  --btn-bg: var(--color-primary);
  --btn-bg-hover: var(--color-primary-hover);
  --btn-bg-active: var(--color-primary-active);
  --btn-text: var(--color-primary-text);
  --btn-border: transparent;
  --btn-radius: var(--radius-md);
  --btn-padding-block: var(--space-2);
  --btn-padding-inline: var(--space-4);
  --btn-font-size: var(--font-size-base);
  --btn-font-weight: var(--font-weight-semibold);

  background-color: var(--btn-bg);
  color: var(--btn-text);
  border: 1px solid var(--btn-border);
  border-radius: var(--btn-radius);
  padding: var(--btn-padding-block) var(--btn-padding-inline);
  font-size: var(--btn-font-size);
  font-weight: var(--btn-font-weight);
  transition: background-color var(--transition-fast);
  cursor: pointer;
}

.button:hover { --btn-bg: var(--btn-bg-hover); }
.button:active { --btn-bg: var(--btn-bg-active); }

/* Secondary variant — only override what changes */
.button--secondary {
  --btn-bg: transparent;
  --btn-bg-hover: var(--color-bg-muted);
  --btn-bg-active: var(--color-bg-subtle);
  --btn-text: var(--color-text);
  --btn-border: var(--color-border-strong);
}

/* Danger variant */
.button--danger {
  --btn-bg: var(--color-error);
  --btn-bg-hover: #b91c1c;  /* red-700 */
  --btn-text: #ffffff;
}

/* Size variants */
.button--sm {
  --btn-padding-block: var(--space-1);
  --btn-padding-inline: var(--space-3);
  --btn-font-size: var(--font-size-sm);
}

.button--lg {
  --btn-padding-block: var(--space-3);
  --btn-padding-inline: var(--space-6);
  --btn-font-size: var(--font-size-lg);
}
```

---

## Accessibility CSS

### Focus Management (Critical)

```css
/* 1. Remove default outline (we replace it, never just remove) */
*, *:focus { outline: none; }

/* 2. Add visible focus ring for keyboard navigation */
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* 3. For elements that are interactable but not input-like */
button:focus-visible,
[role="button"]:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 3px;
}

/* 4. Inverted focus for dark backgrounds */
.dark-bg :focus-visible {
  outline-color: #ffffff;
}
```

**Never:**
```css
/* WRONG — removes focus without replacement */
* { outline: none; }
button:focus { outline: none; }
```

### Motion Preferences

```css
/* Respect user's system preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Option 1: Kill all animation */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Option 2: Define animations conditionally (preferred) */
.spinner {
  animation: none;  /* off by default */
}

@media (prefers-reduced-motion: no-preference) {
  .spinner {
    animation: spin 1s linear infinite;
  }
}

/* For transforms/slides — provide instant alternative */
.slide-in {
  transform: translateY(0);  /* final state, no animation */
}

@media (prefers-reduced-motion: no-preference) {
  .slide-in {
    animation: slideIn 300ms ease forwards;
  }
}
```
### Screen Reader Utilities

```css
/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (skip links) */
.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: var(--space-2) var(--space-4);
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Modern CSS Layout Patterns

### Flexbox — 1D Layout

```css
/* Horizontal nav */
.nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.nav__brand { margin-inline-end: auto; }  /* push rest to right */

/* Vertical centering */
.centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
}

/* Equal-height cards */
.card-row {
  display: flex;
  gap: var(--space-6);
  align-items: stretch;
}
.card-row .card { flex: 1; }

/* Flexible list that wraps */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
```
### Logical Properties (RTL/LTR support)

```css
/* Instead of directional properties, use logical ones */

/* BAD (directional): */
.card { padding-left: 1rem; padding-right: 1rem; }
.text { text-align: left; margin-left: auto; }

/* GOOD (logical): */
.card { padding-inline: var(--space-4); }   /* handles both LTR and RTL */
.text { text-align: start; margin-inline-start: auto; }

/* Full mapping: */
/* left/right padding  → padding-inline-start / padding-inline-end */
/* left/right margin   → margin-inline-start / margin-inline-end */
/* top/bottom padding  → padding-block-start / padding-block-end */
/* left/right padding  → padding-inline */
/* top/bottom padding  → padding-block */
/* width               → inline-size */
/* height              → block-size */
/* left                → inset-inline-start */
/* right               → inset-inline-end */
/* top                 → inset-block-start */
/* bottom              → inset-block-end */
```
### Custom Property Tricks

Two powerful patterns with custom properties:

**Variant system** — override component-scoped tokens to create variants without extra selectors. See the Alert component in `assets/component-patterns.md` for a full example.

**Boolean toggle** — use a `0`/`1` variable as a CSS boolean for state-driven styles:

```css
.element {
  --is-visible: 0;
  opacity: var(--is-visible);
  pointer-events: none;
}

.element.is-visible {
  --is-visible: 1;
  pointer-events: auto;
}
```

## Anti-Patterns in CSS

**Magic numbers everywhere:**
```css
/* BAD */
.card { padding: 17px 23px; margin-top: 13px; }

/* GOOD */
.card { padding: var(--space-4) var(--space-6); margin-block-start: var(--space-4); }
```

**Removing focus without replacement:**
```css
/* BAD — breaks keyboard navigation */
*:focus { outline: none; }

/* GOOD — keep visible focus for keyboard users */
*:focus-visible { outline: 2px solid var(--color-border-focus); }
```

**Overusing important:**
```css
/* BAD — creates specificity debt */
.text { color: red !important; }

/* GOOD — fix specificity at the source */
.alert .text { color: var(--color-error); }
```

**Directional properties instead of logical:**
```css
/* BAD — breaks in RTL languages */
.item { margin-left: 1rem; text-align: left; }

/* GOOD */
.item { margin-inline-start: var(--space-4); text-align: start; }
```

**Not accounting for content overflow:**
```css
/* BAD — text overflows without wrapping */
.title { white-space: nowrap; }

/* GOOD — handle overflow explicitly */
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* OR for multiline: */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```
