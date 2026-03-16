# Color Theory — Deep Reference

Specific values, formulas, and implementation patterns for color work.

---

## WCAG Contrast Ratios — Complete Reference

### The Formula

Contrast ratio = (L1 + 0.05) / (L2 + 0.05)

Where L1 is the relative luminance of the lighter color and L2 is the darker.

Relative luminance of a color:
1. Convert hex to linear RGB: `R = (sRGB / 255) ^ 2.2` (simplified; precise formula uses piecewise)
2. L = 0.2126 × R + 0.7152 × G + 0.0722 × B

**Tools for calculation:**
- `color-contrast()` in CSS (draft spec, limited support)
- WebAIM Contrast Checker: webaim.org/resources/contrastchecker
- Figma Contrast plugin
- CLI: `npx wcag-contrast #foreground #background`

### Pass/Fail Thresholds

| Situation | AA (minimum) | AAA (enhanced) |
|-----------|-------------|----------------|
| Normal text (< 18pt / 14pt bold) | 4.5:1 | 7:1 |
| Large text (≥ 18pt or ≥ 14pt bold) | 3:1 | 4.5:1 |
| UI components, icons, focus indicators | 3:1 | N/A |
| Decorative elements | No requirement | No requirement |
| Disabled controls | No requirement | No requirement |
| Logos/brand | No requirement | No requirement |

**18pt = 24px. 14pt bold = ~18.67px bold.**

### Common Color Pairs — Contrast Reference

| Foreground | Background | Ratio | AA Normal | AA Large |
|------------|------------|-------|-----------|----------|
| #000000 (black) | #ffffff (white) | 21:1 | PASS | PASS |
| #111827 (gray-900) | #ffffff | 16.1:1 | PASS | PASS |
| #374151 (gray-700) | #ffffff | 9.7:1 | PASS | PASS |
| #6b7280 (gray-500) | #ffffff | 4.6:1 | PASS | PASS |
| #9ca3af (gray-400) | #ffffff | 2.6:1 | FAIL | FAIL |
| #2563eb (blue-600) | #ffffff | 5.9:1 | PASS | PASS |
| #3b82f6 (blue-500) | #ffffff | 3.9:1 | FAIL | PASS |
| #1d4ed8 (blue-700) | #ffffff | 8.1:1 | PASS | PASS |
| #dc2626 (red-600) | #ffffff | 5.3:1 | PASS | PASS |
| #ef4444 (red-500) | #ffffff | 4.1:1 | FAIL | PASS |
| #16a34a (green-600) | #ffffff | 3.30:1 | FAIL | PASS |
| #f59e0b (amber-500) | #ffffff | 2.9:1 | FAIL | FAIL |
| #f59e0b (amber-500) | #000000 | 7.3:1 | PASS | PASS |
| #ffffff (white) | #111827 | 16.1:1 | PASS | PASS |

**Key insight:** Yellow/orange on white almost always fails. Use on dark backgrounds or darken significantly.

**Halation:** Pure black (#000000) on pure white (#ffffff) creates halation — the text appears to vibrate. Use #1a1a1a for body text on white; perceptually softer and still 19.6:1 contrast.

**AA border case:** #767676 on #ffffff = exactly 4.54:1 — the minimum passing value for AA normal text. Any gray lighter than this fails.

---

## Color Harmony — Detailed Rules

### Angular Values — Quick Reference

| Harmony | Hue angle relationship | Example (base blue = 221°) |
|---------|------------------------|----------------------------|
| Complementary | base ±180° | blue (221°) + orange (41°) |
| Analogous | base ±30° steps | blue (221°) + teal (191°) + indigo (251°) |
| Triadic | base ±120° | blue (221°) + red (341°) + yellow-green (101°) |
| Split-complementary | base +150° and +210° | blue + yellow-orange + red-orange |
| Tetradic | base ±90° rectangle | blue (221°) + green (131°) + orange (41°) + violet (311°) |

### How to Apply Each Harmony Type

**Complementary (180° apart)**
- Example: Blue (#2563eb) + Orange (#ea6a2e)
- Use: One color dominant (60–70%), complement as accent (10–20%)
- Best for: Calls to action, highlighting, strong contrast
- Pitfall: Equal weight of complements creates visual vibration — always make one dominant

**Analogous (30–60° apart, 2–4 colors)**
- Example: Blue (#2563eb) + Blue-Green (#0891b2) + Green (#16a34a)
- Use: All colors at similar weight — they naturally harmonize
- Best for: Calm, cohesive, nature-inspired designs
- Pitfall: Lacks energy unless you add a pop of contrast somewhere

**Triadic (120° apart)**
- Example: Red (#dc2626) + Yellow (#ca8a04) + Blue (#2563eb)
- Use: One dominant (60%), one secondary (30%), one accent (10%)
- Best for: Vibrant, playful designs with good balance
- Pitfall: Hard to balance; resist making all three equal weight

**Split-complementary**
- Example: Blue (#2563eb) + Yellow-Orange (#d97706) + Red-Orange (#b45309)
- Use: Blue as dominant, the two splits as accents
- Best for: High contrast with more nuance than straight complementary
- Pitfall: Visually similar split colors can read as a mistake — ensure they're distinct

**Tetradic / Double-complementary (4 colors in rectangle)**
- Example: Blue (#2563eb) + Orange (#ea580c) + Green (#16a34a) + Red (#dc2626)
- Use: One dominant, others supporting; never equal weight
- Best for: Rich, complex designs with many elements
- Pitfall: Most difficult to balance — start with simpler harmony if unsure

---

## Building a Production Palette

### Step 1 — Choose Primary Hue
Select based on brand/purpose. Use HSL to think in terms of hue (0–360°), saturation (0–100%), lightness (0–100%).

### Step 2 — Generate Shade Scale
Standard 10-step scale (50 through 900):

```
50:  Very light tint    — L ~96–97%
100: Light tint          — L ~92–94%
200: Lighter            — L ~85–88%
300: Light              — L ~75–80%
400: Medium light       — L ~60–68%
500: Base/mid           — L ~50–55%
600: Medium dark        — L ~42–48%
700: Dark               — L ~35–40%
800: Darker             — L ~25–30%
900: Very dark          — L ~15–20%
```

Example (generating blue scale from base hsl(221, 83%, 53%)):
```css
--blue-50:  hsl(214, 100%, 97%);
--blue-100: hsl(214, 95%, 93%);
--blue-200: hsl(213, 97%, 87%);
--blue-300: hsl(212, 96%, 78%);
--blue-400: hsl(213, 94%, 68%);
--blue-500: hsl(217, 91%, 60%);  /* base */
--blue-600: hsl(221, 83%, 53%);
--blue-700: hsl(224, 76%, 48%);
--blue-800: hsl(226, 71%, 40%);
--blue-900: hsl(224, 64%, 33%);
```

### Step 3 — Define Semantic Palette
Map primitive tokens to semantic roles:

```css
/* Semantic mapping */
--color-primary:           var(--blue-600);   /* main brand color */
--color-primary-light:     var(--blue-100);   /* tinted backgrounds */
--color-primary-dark:      var(--blue-800);   /* hover states, dark mode */
--color-secondary:         var(--indigo-600); /* secondary brand */
--color-accent:            var(--amber-500);  /* calls to action, highlights */

/* Surfaces */
--color-bg:                #ffffff;
--color-bg-subtle:         var(--gray-50);
--color-surface:           var(--gray-100);
--color-surface-raised:    #ffffff;
--color-overlay:           rgba(0, 0, 0, 0.5);

/* Text */
--color-text-primary:      var(--gray-900);
--color-text-secondary:    var(--gray-600);
--color-text-tertiary:     var(--gray-400);
--color-text-inverse:      #ffffff;
--color-text-on-primary:   #ffffff;

/* Semantic status */
--color-success:           var(--green-600);
--color-success-bg:        var(--green-50);
--color-warning:           var(--amber-500);
--color-warning-bg:        var(--amber-50);
--color-error:             var(--red-600);
--color-error-bg:          var(--red-50);
--color-info:              var(--blue-600);
--color-info-bg:           var(--blue-50);

/* Borders */
--color-border:            var(--gray-200);
--color-border-strong:     var(--gray-400);
--color-border-focus:      var(--blue-500);
```

### Step 4 — Verify WCAG Compliance

Check every text-on-background pairing you intend to use:

Priority pairings to always check:
- `--color-text-primary` on `--color-bg` (main body text)
- `--color-text-secondary` on `--color-bg` (secondary text — often fails)
- `--color-text-on-primary` on `--color-primary` (button text)
- Status text on status background (`--color-success` on `--color-success-bg`)
- Link color on `--color-bg`

**Common failure:** Semantic status colors on their light backgrounds.
- green-600 (#16a34a) on green-50 (#f0fdf4): ratio = 3.30:1 — FAIL for AA Normal text
- amber-500 (#f59e0b) on amber-50 (#fffbeb): ratio = 2.7:1 — FAIL
- Fix: darken to amber-700 (#b45309) on amber-50: ratio = 5.6:1 — PASS

**Note:** For green text on white, green-600 (#16a34a) at 3.30:1 only passes AA Large text. Use green-700 (#15803d, ~5.0:1) for AA Normal text pass, or green-800 (#166534, ~7.1:1) for AAA Large.

---

## Dark Mode — Complete Implementation

### Principle: Invert Luminance, Preserve Hue

**Brand color rule in dark mode:** Brand colors must shift to a lighter shade to maintain contrast on dark surfaces. A color like blue-600 (#2563eb, contrast 5.9:1 on white) drops to ~1.4:1 on a dark background — shift to blue-400 (#60a5fa) which achieves ~5.2:1 on a dark surface.

Wrong approach:
```css
/* BAD — just inverting everything looks uncanny */
@media (prefers-color-scheme: dark) {
  filter: invert(1);
}
```

Correct approach:
```css
:root {
  /* Light mode — the defaults */
  --color-bg: #ffffff;
  --color-bg-subtle: #f9fafb;
  --color-surface: #f3f4f6;
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-tertiary: #9ca3af;
  --color-border: #e5e7eb;
  --color-primary: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;       /* very dark navy, not pure black */
    --color-bg-subtle: #1e293b; /* slightly lighter */
    --color-surface: #1e293b;  /* card/panel surface */
    --color-text-primary: #f1f5f9;  /* near white, not pure */
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #475569;
    --color-border: #334155;
    --color-primary: #3b82f6;  /* same hue, lighter shade in dark */
  }
}
```

### Surface Elevation in Dark Mode

Avoid pure black. Use progressive lightening to show depth:

```css
/* Layer system using color-mix or manual values */
--surface-base:     hsl(222, 47%, 7%);   /* deepest — page bg */
--surface-1:        hsl(222, 47%, 10%);  /* card bg */
--surface-2:        hsl(222, 47%, 13%);  /* input bg, nested card */
--surface-3:        hsl(222, 47%, 16%);  /* hover states, tooltips */
--surface-overlay:  hsl(222, 47%, 20%);  /* modals, dropdowns */

/* Or with color-mix: */
--surface-1: color-mix(in oklch, var(--surface-base) 90%, white);
--surface-2: color-mix(in oklch, var(--surface-base) 80%, white);
```

### Checking Dark Mode Contrast

All contrast rules apply equally in dark mode. Re-verify:
- Light text on dark backgrounds (most will pass, but check)
- Status colors on dark surfaces (e.g., green-400 on dark surface)
- Colored borders on dark backgrounds

Typical dark mode failures:
- `--color-text-tertiary` on `--color-bg` (very muted text)
- Colorful accent on dark surface at small size

---

## Color Psychology — Reference

Use these associations deliberately in UI context:

| Color | Associations | Best for | Avoid for |
|-------|-------------|----------|-----------|
| Red | Urgency, danger, error, passion | Error states, alerts, delete/destructive actions, sales badges | Primary actions (creates anxiety), success states |
| Orange | Energy, warmth, creativity, enthusiasm | CTAs, pricing highlights, warm brands | Error states (confused with warning) |
| Yellow | Caution, optimism, attention, intellect | Warning states, highlights, notes | Body text (contrast fails on white) |
| Green | Success, growth, permission, health | Success states, confirmation, nature/eco brands | Error or warning states |
| Blue | Trust, calm, stability, professionalism | Primary brand, links, informational states, SaaS | Warning or error states |
| Purple | Premium, creativity, royalty, wisdom | Premium/pro tiers, creative tools, luxury brands | Overuse (loses premium feel) |
| Pink | Warmth, femininity, playfulness | Lifestyle, beauty, social | Technical/enterprise contexts unless intentional |
| Brown/Beige | Natural, warm, organic | Food, nature, earthy brands | Tech interfaces (reads as dated) |
| Black | Sophistication, power, formality | Luxury, editorial, high contrast | Overuse (oppressive) |
| White | Clean, pure, space | Backgrounds, breathing room | Text on light backgrounds |
| Gray | Neutral, structure, secondary | Secondary text, borders, disabled states, backgrounds | Primary brand color |

---

## Accessibility Beyond Contrast

**Never use color alone to convey meaning:**

```html
<!-- BAD — color-only status -->
<span style="color: red">Error</span>

<!-- GOOD — color + icon + text -->
<span class="error-message">
  <svg aria-hidden="true"><!-- error icon --></svg>
  <span>Error: Field is required</span>
</span>
```

**Support for color blindness:**
- ~8% of males have some form of color blindness
- Deuteranopia (green-deficient) affects ~6% of males specifically — never rely on red/green alone
- Most common: red-green (deuteranopia/protanopia)
- Test: Use Sim Daltonism, Chrome DevTools Rendering panel, or Figma plugin
- Fix: Pair color with shape, pattern, or label; ensure sufficient lightness difference

**Pattern: Accessible status indicators**
```css
.status-success {
  color: var(--color-success);
  /* Also add: icon, bold weight, or checkmark */
}
.status-error {
  color: var(--color-error);
  /* Also add: icon or X symbol */
}

/* For backgrounds: ensure pattern/icon too */
.alert-warning {
  background: var(--color-warning-bg);
  border-left: 4px solid var(--color-warning);
  /* The border reinforces meaning beyond color alone */
}
```
