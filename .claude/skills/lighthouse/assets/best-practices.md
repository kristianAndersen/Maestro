# Lighthouse Best Practices Deep Dive

## How Lighthouse Scores Best Practices

Best Practices audits check for modern web hygiene: security, use of current APIs, absence of deprecated patterns, and console health. These are largely binary pass/fail audits.

**Score target:** >= 90

---

## Priority 1: HTTPS and Security

### All resources served over HTTPS

```
Lighthouse fails Best Practices if:
- The page itself loads over HTTP
- Any subresource (image, script, CSS, font, iframe) loads over HTTP (mixed content)
```

**Fixing mixed content:**
```html
<!-- BAD: HTTP image on HTTPS page -->
<img src="http://cdn.example.com/image.jpg">

<!-- GOOD: HTTPS -->
<img src="https://cdn.example.com/image.jpg">

<!-- GOOD: Protocol-relative (inherits page protocol) -->
<img src="//cdn.example.com/image.jpg">
```

```javascript
// Find mixed content in browser console:
// Chrome shows "Mixed Content" warnings with source file:line

// Or scan with CLI
npx mixed-content-scanner https://example.com
```

**HTTP Strict Transport Security (HSTS):**
```nginx
# Nginx — add after enabling HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### Content Security Policy (CSP)

Lighthouse does not score CSP directly but flags pages without one in security recommendations.

```html
<!-- HTTP header (preferred) -->
<!-- Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; -->

<!-- Meta tag fallback (limited — cannot set all directives) -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; img-src 'self' data: https:">
```

```
CSP starter policy:
  default-src 'self'
  script-src 'self' https://trusted-cdn.com
  style-src 'self' 'unsafe-inline'     ← unsafe-inline needed if you have inline styles
  img-src 'self' data: https:
  font-src 'self' https://fonts.gstatic.com
  connect-src 'self' https://api.example.com
  frame-ancestors 'none'               ← prevents clickjacking
```

---

## Priority 2: Console Errors

### JavaScript errors in the console

Lighthouse captures console errors during page load. Each error reduces the Best Practices score.

**Common sources:**

1. Uncaught promise rejections
```javascript
// BAD: Unhandled rejection
fetch('/api/data').then(r => r.json()); // If this fails, it's an unhandled rejection

// GOOD: Handle all rejections
fetch('/api/data')
  .then(r => r.json())
  .catch(err => console.error('Fetch failed:', err));

// Or with async/await
async function loadData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (err) {
    console.error('Failed to load data:', err);
    return null;
  }
}
```

2. TypeError on null/undefined
```javascript
// BAD: Assumes element always exists
document.querySelector('.nav').classList.add('active');

// GOOD: Guard against null
document.querySelector('.nav')?.classList.add('active');
```

3. Missing resources (404s for scripts/images)
```bash
# Find 404s in Network tab of DevTools
# Or use lighthouse's network-requests audit:
cat report.json | jq '.audits["network-requests"].details.items[] | select(.statusCode == 404)'
```

---

## Priority 3: Deprecated APIs

### Deprecated browser APIs

Lighthouse flags use of deprecated APIs that will be removed in future Chrome versions.

**Common deprecated patterns:**

```javascript
// BAD: document.write (blocks parsing, flagged as deprecated)
document.write('<script src="legacy.js"><\/script>');

// GOOD: Dynamic script injection
const script = document.createElement('script');
script.src = 'legacy.js';
document.head.appendChild(script);
```

```javascript
// BAD: Synchronous XMLHttpRequest (deprecated on main thread)
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data', false);  // false = synchronous
xhr.send();

// GOOD: Async fetch
const response = await fetch('/api/data');
const data = await response.json();
```

```javascript
// BAD: navigator.webkitGetUserMedia (vendor-prefixed, deprecated)
navigator.webkitGetUserMedia({ video: true }, ... );

// GOOD: Standard API
navigator.mediaDevices.getUserMedia({ video: true }).then(...);
```

### Deprecated HTML/CSS

```html
<!-- BAD: Deprecated HTML attributes -->
<table border="1" cellpadding="5">
<font color="red">Text</font>
<b>Bold</b>  <!-- Use <strong> for semantic meaning -->

<!-- GOOD: CSS for presentation -->
<table style="border: 1px solid; border-collapse: collapse;">
<span style="color: red;">Text</span>
<strong>Important text</strong>
```

---

## Priority 4: Image Issues

### Images with incorrect aspect ratios

Lighthouse flags images displayed at a different aspect ratio than their natural dimensions.

```html
<!-- BAD: Image is 800x600 (4:3) but displayed at 800x400 (2:1) -->
<img src="photo.jpg" width="800" height="400">

<!-- GOOD: Explicit correct dimensions -->
<img src="photo.jpg" width="800" height="600">

<!-- GOOD: Use CSS for flexible sizing while preserving ratio -->
<style>
  img { width: 100%; height: auto; }
</style>
<img src="photo.jpg" width="800" height="600" style="max-width: 100%;">
```

### Serving images with appropriate resolution

Lighthouse flags images served at 2x+ the display resolution (wasted bytes) and images served at too low a resolution (blurry on high-DPI).

```html
<!-- GOOD: Serve 2x images for high-DPI displays -->
<img src="logo.png"
     srcset="logo.png 1x, logo@2x.png 2x"
     width="200" height="50">

<!-- GOOD: Responsive images for different viewport widths -->
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1600px"
     width="800" height="450">
```

---

## Priority 5: Browser Compatibility

### Uses passive event listeners

Passive event listeners improve scroll performance. Lighthouse flags scroll/touch listeners without `{ passive: true }`.

```javascript
// BAD: Default listener blocks scroll
document.addEventListener('touchstart', handler);
document.addEventListener('wheel', handler);

// GOOD: Passive listener — cannot call preventDefault(), but doesn't block scroll
document.addEventListener('touchstart', handler, { passive: true });
document.addEventListener('wheel', handler, { passive: true });

// GOOD: If you need preventDefault() (e.g., custom scroll):
document.addEventListener('touchstart', handler, { passive: false });
// But annotate why: prevents scroll performance warning
```

### Avoid document.cookie for sensitive data

```javascript
// BAD: Sensitive data in non-secure cookie
document.cookie = 'sessionToken=abc123';

// GOOD: Use httpOnly + secure + SameSite cookies (server-set)
// Set-Cookie: sessionToken=abc123; HttpOnly; Secure; SameSite=Strict

// For non-sensitive client-side storage:
localStorage.setItem('ui_preference', 'dark');
sessionStorage.setItem('temp_state', JSON.stringify(data));
```

---

## Common Lighthouse Best Practices Audits Reference

| Audit | Fix |
|---|---|
| Does not use HTTPS | Migrate all resources to HTTPS |
| Browser errors were logged | Fix all console errors before auditing |
| Displays images with incorrect aspect ratio | Match width/height to natural image dimensions |
| Does not use HTTP/2 | Enable HTTP/2 on server |
| Uses deprecated APIs | Replace with modern equivalents |
| JavaScript libraries with known vulnerabilities | Run `npm audit`; update/replace vulnerable packages |
| Missing source maps | Generate and serve source maps for production debugging |
| Detected JavaScript libraries | Ensure loaded libraries are intentional |
| Page prevented back/forward cache restoration | Avoid `unload` event listener; check bfcache eligibility |
| Uses `document.write()` | Replace with DOM manipulation |
| Uses passive event listeners | Add `{ passive: true }` to scroll/touch listeners |
