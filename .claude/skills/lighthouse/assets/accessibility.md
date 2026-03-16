# Lighthouse Accessibility Deep Dive

## How Lighthouse Scores Accessibility

Lighthouse accessibility audits test a subset of WCAG 2.1 guidelines (primarily Level AA). Each audit is weighted — fixing high-weight audits has the biggest score impact.

**Important:** A Lighthouse accessibility score of 100 does not mean fully WCAG-compliant. Lighthouse only catches automatable issues. Manual testing with a screen reader is always required for true accessibility.

**Score breakdown:** Lighthouse uses axe-core under the hood. Each audit passes (1.0), fails (0), or is not applicable. Weighted average produces the 0-100 score.

---

## Priority 1: High-Impact Audits (fix first)

### Missing or empty alt text on images

```html
<!-- BAD: Missing alt -->
<img src="product.jpg">

<!-- BAD: Non-descriptive alt -->
<img src="product.jpg" alt="image">

<!-- GOOD: Descriptive alt -->
<img src="product.jpg" alt="Red wool sweater with V-neck, size M">

<!-- GOOD: Decorative image gets empty alt (screen reader skips it) -->
<img src="divider.png" alt="" role="presentation">

<!-- GOOD: Functional image (button/link) describes action -->
<a href="/cart"><img src="cart-icon.svg" alt="View shopping cart"></a>
```

### Form inputs without labels

```html
<!-- BAD: Placeholder is not a label -->
<input type="email" placeholder="Email address">

<!-- GOOD: Explicit label -->
<label for="email">Email address</label>
<input type="email" id="email" name="email" autocomplete="email">

<!-- GOOD: aria-label for icon-only inputs -->
<input type="search" aria-label="Search products">

<!-- GOOD: Visually hidden label (shows to screen readers) -->
<label for="search" class="sr-only">Search</label>
<input type="search" id="search">

<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
</style>
```

### Color contrast failures

WCAG AA requires:
- **4.5:1** minimum for normal text (< 18pt or < 14pt bold)
- **3:1** minimum for large text (>= 18pt or >= 14pt bold)
- **3:1** minimum for UI components and graphical objects

```css
/* BAD: Light gray on white — fails 4.5:1 */
.text { color: #aaaaaa; background: #ffffff; }  /* ~2.3:1 */

/* GOOD: Dark gray on white — passes 4.5:1 */
.text { color: #595959; background: #ffffff; }  /* ~7.0:1 */

/* Check ratios with browser DevTools or tooling: */
/* Chrome DevTools > Elements > Computed > color swatch */
/* Or use: https://webaim.org/resources/contrastchecker/ */
```

```bash
# CLI contrast checking
npx @accessibility-checker/core --url https://example.com
```

### Interactive elements not focusable / keyboard navigation broken

```html
<!-- BAD: div used as button — not keyboard accessible -->
<div class="btn" onclick="submit()">Submit</div>

<!-- GOOD: Semantic button -->
<button type="submit">Submit</button>

<!-- GOOD: If you MUST use a div (e.g., custom component) -->
<div role="button" tabindex="0"
     onkeydown="if(event.key==='Enter'||event.key===' ')submit()"
     onclick="submit()">Submit</div>
```

```css
/* Never remove focus indicator without replacement */
/* BAD */
:focus { outline: none; }

/* GOOD: Custom visible focus indicator */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

---

## Priority 2: Document Structure

### Missing lang attribute on html element

```html
<!-- BAD -->
<html>

<!-- GOOD -->
<html lang="en">

<!-- International pages -->
<html lang="fr">   <!-- French -->
<html lang="de">   <!-- German -->
<html lang="zh-Hant">  <!-- Traditional Chinese -->
```

### Missing or duplicate page title

```html
<!-- BAD: Missing or generic -->
<title>Home</title>
<title>Untitled</title>

<!-- GOOD: Descriptive and unique per page -->
<title>Shopping Cart (3 items) — MyStore</title>
<title>Product: Red Wool Sweater — MyStore</title>
```

### Heading hierarchy

```html
<!-- BAD: Skipped levels -->
<h1>Page Title</h1>
<h3>Section</h3>  <!-- Skipped h2 -->

<!-- GOOD: Sequential hierarchy -->
<h1>Page Title</h1>
  <h2>Main Section</h2>
    <h3>Sub-section</h3>
  <h2>Another Section</h2>
```

---

## Priority 3: ARIA Usage

### Rules for ARIA

1. **No ARIA is better than bad ARIA** — broken ARIA is worse than no ARIA
2. **Use semantic HTML first** — `<button>` > `<div role="button">`
3. **Do not add ARIA to native semantic elements redundantly**

```html
<!-- BAD: Redundant ARIA on semantic elements -->
<button role="button">Submit</button>
<nav role="navigation">...</nav>

<!-- GOOD: Let native semantics work -->
<button>Submit</button>
<nav>...</nav>

<!-- GOOD: ARIA only where semantics are insufficient -->
<div role="tabpanel" aria-labelledby="tab1">...</div>
```

### Live regions for dynamic content

```html
<!-- Announce dynamic status messages (e.g., form submit result) -->
<div role="status" aria-live="polite" aria-atomic="true">
  <!-- Content injected here is announced by screen reader -->
</div>

<!-- Announce urgent alerts -->
<div role="alert" aria-live="assertive">
  <!-- Only for errors or critical information -->
</div>
```

### Modal dialogs

```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm deletion</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <button autofocus>Cancel</button>
  <button>Delete</button>
</div>
```

```javascript
// Trap focus inside modal
const modal = document.querySelector('[role="dialog"]');
const focusableElements = modal.querySelectorAll(
  'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
);
const first = focusableElements[0];
const last = focusableElements[focusableElements.length - 1];

modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  if (e.key === 'Escape') closeModal();
});
```

---

## Priority 4: Tables, Lists, and Landmarks

### Data tables require headers

```html
<!-- BAD: No headers -->
<table>
  <tr><td>Alice</td><td>Manager</td><td>Engineering</td></tr>
</table>

<!-- GOOD: Proper headers -->
<table>
  <caption>Employee Directory</caption>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Role</th>
      <th scope="col">Department</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>Manager</td>
      <td>Engineering</td>
    </tr>
  </tbody>
</table>
```

### Landmark regions

```html
<!-- Proper landmark structure helps screen reader navigation -->
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main>
  <article>...</article>
  <aside aria-label="Related articles">...</aside>
</main>
<footer>...</footer>

<!-- Multiple navs must be distinguishable -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
<nav aria-label="Footer links">...</nav>
```

---

## Testing Beyond Lighthouse

Lighthouse catches ~30% of WCAG issues. For thorough testing:

```bash
# axe DevTools browser extension (free tier covers most issues)
# Install from Chrome Web Store

# CLI with axe-core
npx axe https://example.com --tags wcag2a,wcag2aa

# Pa11y for CI
npm install -g pa11y
pa11y https://example.com --standard WCAG2AA

# Pa11y CI config
# .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "ignore": ["notice"]
  },
  "urls": [
    "https://example.com",
    "https://example.com/about"
  ]
}
```

**Manual testing checklist:**
- [ ] Tab through the entire page with keyboard only — can you reach and activate everything?
- [ ] Test with screen reader (NVDA + Firefox on Windows; VoiceOver + Safari on Mac)
- [ ] Zoom to 200% — does layout break?
- [ ] Disable CSS — is content still readable and in logical order?
- [ ] Test with Windows High Contrast mode
