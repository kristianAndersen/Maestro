# Lighthouse Performance Deep Dive

## Metric-by-Metric Remediation

### LCP — Largest Contentful Paint

**Goal:** < 2.5s

LCP measures when the largest visible content element finishes rendering. The LCP element is typically: hero image, above-fold `<img>`, CSS background image on a large element, or a large text block.

**Step 1: Identify your LCP element**
```javascript
// In browser console — observe LCP candidates
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('LCP candidate:', entry.element, entry.startTime);
  });
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

**Step 2: Optimize the LCP element**

If LCP is an image:
```html
<!-- Preload above-fold LCP image -->
<link rel="preload" as="image" href="/hero.webp"
      imagesrcset="/hero-400.webp 400w, /hero-800.webp 800w"
      imagesizes="(max-width: 600px) 400px, 800px">

<!-- Mark the image as high priority — do NOT lazy load -->
<img src="/hero.webp" alt="Hero" width="800" height="450"
     fetchpriority="high" decoding="sync">
```

If LCP is text:
```html
<!-- Preload fonts used by LCP text -->
<link rel="preload" as="font" href="/fonts/main.woff2"
      crossorigin type="font/woff2">
```

**LCP sub-part breakdown (from Chrome DevTools Timeline):**

```
Total LCP = TTFB + Resource Load Delay + Resource Load Time + Element Render Delay
```

- **TTFB high (>600ms)** → Fix server response time: CDN, caching, DB query optimization
- **Resource Load Delay high** → Fix: preload the LCP resource
- **Resource Load Time high** → Fix: compress/resize image, use WebP/AVIF
- **Element Render Delay high** → Fix: reduce render-blocking CSS/JS above the fold

**Image format and compression:**
```bash
# Convert to WebP (use cwebp or sharp)
cwebp -q 80 input.jpg -o output.webp

# Convert to AVIF (use avifenc or squoosh)
avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 input.jpg output.avif

# Use responsive images
<img
  srcset="/img/hero-400.webp 400w,
          /img/hero-800.webp 800w,
          /img/hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  src="/img/hero-800.webp"
  width="800" height="450"
  alt="Hero image">
```

---

### TBT — Total Blocking Time

**Goal:** < 200ms (lab) | Monitor INP < 200ms (field)

TBT sums all time beyond 50ms from long tasks between FCP and TTI. It is the lab proxy for real-world responsiveness (INP).

**Identify long tasks:**
```javascript
// Observer long tasks in DevTools Performance panel
// Or programmatically:
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    if (entry.duration > 50) {
      console.log('Long task:', entry.duration, 'ms', entry);
    }
  });
}).observe({ type: 'longtask', buffered: true });
```

**Common causes and fixes:**

1. **Large JS bundles executing on load**
```javascript
// BAD: Everything loads at once
import HeavyComponent from './HeavyComponent';

// GOOD: Code-split with dynamic import
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
// or
const module = await import('./heavy-module.js');
```

2. **Unused JavaScript**
```bash
# Find unused code with Coverage tab in DevTools
# Or use Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
# Add to webpack config:
# const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
# plugins: [new BundleAnalyzerPlugin()]
```

3. **Third-party scripts blocking main thread**
```html
<!-- Load non-critical third-party scripts after page load -->
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'https://third-party.com/widget.js';
    document.body.appendChild(script);
  });
</script>

<!-- Or use defer/async -->
<script src="analytics.js" defer></script>
<script src="widget.js" async></script>
```

4. **Long-running event handlers**
```javascript
// BAD: Synchronous heavy computation on user interaction
button.addEventListener('click', () => {
  const result = heavyComputation(data); // blocks for 200ms
  update(result);
});

// GOOD: Break work into chunks using scheduler or setTimeout
button.addEventListener('click', () => {
  // Yield to browser between chunks
  scheduler.postTask(() => heavyComputation(data), { priority: 'background' })
    .then(result => update(result));
});
```

---

### CLS — Cumulative Layout Shift

**Goal:** < 0.1

CLS measures unexpected layout shifts. Each shift is scored: `impact_fraction * distance_fraction`. Avoid any shift above 0.1 total.

**Most common causes:**

1. **Images without explicit dimensions**
```html
<!-- BAD: No dimensions — browser doesn't know space to reserve -->
<img src="photo.jpg" alt="Photo">

<!-- GOOD: Explicit dimensions prevent layout shift -->
<img src="photo.jpg" alt="Photo" width="800" height="450">

<!-- CSS approach (aspect-ratio) -->
<style>
  img { aspect-ratio: 16/9; width: 100%; }
</style>
```

2. **Ads, embeds, iframes without reserved space**
```css
/* Reserve space for ad slots */
.ad-slot {
  min-height: 250px;  /* Match expected ad height */
  width: 300px;
}

/* Reserve space for iframes */
.video-embed {
  aspect-ratio: 16/9;
  width: 100%;
}
```

3. **Dynamically injected content above existing content**
```javascript
// BAD: Prepend notification above content — causes CLS
document.body.prepend(notificationBanner);

// GOOD: Use fixed/sticky positioning, or pre-reserve space
// Option A: Fixed banner that doesn't affect layout
notification.style.position = 'fixed';
notification.style.top = '0';

// Option B: Pre-reserve space in HTML (banner is hidden initially)
// <div class="notification-slot" aria-hidden="true"></div>
document.querySelector('.notification-slot').appendChild(notificationBanner);
```

4. **Web fonts causing FOUT/FOIT**
```css
/* Use font-display: swap to avoid invisible text */
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/myfont.woff2') format('woff2');
  font-display: swap;  /* Shows fallback until font loads */
}

/* Use font-display: optional for non-critical fonts */
@font-face {
  font-family: 'Decorative';
  font-display: optional;  /* Uses fallback if font not cached */
}
```

5. **Animations that trigger layout**
```css
/* BAD: top/left/width/height animations trigger layout */
.element { transition: top 0.3s, width 0.3s; }

/* GOOD: transform and opacity are compositor-only (no layout) */
.element { transition: transform 0.3s, opacity 0.3s; }
```

---

### FCP — First Contentful Paint

**Goal:** < 1.8s

FCP measures when the first text or image is painted. Improving FCP improves perceived load speed.

**Key fixes:**

```html
<!-- 1. Eliminate render-blocking CSS -->
<!-- Inline critical CSS -->
<style>
  /* Only styles needed for above-fold content */
  body { margin: 0; font-family: sans-serif; }
  .hero { ... }
</style>

<!-- Load non-critical CSS asynchronously -->
<link rel="preload" href="non-critical.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">

<!-- 2. Eliminate render-blocking JS -->
<script src="app.js" defer></script>
```

```nginx
# 3. Reduce TTFB with server-side caching
# Nginx cache example
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m;

location / {
  proxy_cache my_cache;
  proxy_cache_valid 200 1d;
  proxy_pass http://app;
}
```

---

### Speed Index and TTI

**Speed Index goal:** < 3.4s
**TTI goal:** < 3.8s

These improve as a side-effect of fixing LCP, TBT, and FCP. Direct fixes:

- Remove unused CSS (reduces parse time)
- Preconnect to required origins
- Use a service worker for repeat visits

```html
<!-- Preconnect to critical third parties -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
<link rel="dns-prefetch" href="https://analytics.example.com">
```

---

## Critical Rendering Path

```
HTML → DOM
CSS  → CSSOM   → Render Tree → Layout → Paint → Composite
JS   → (may block DOM/CSSOM construction)
```

**Minimize critical path length:**
1. Minimize critical resource count (only load what's needed above fold)
2. Minimize critical bytes (compress, minify)
3. Minimize critical path length (reduce serial round trips)

---

## Caching Strategy

```
Static assets (JS/CSS/images with hashed filenames):
  Cache-Control: public, max-age=31536000, immutable

HTML documents:
  Cache-Control: no-cache  (revalidate on each request)

API responses:
  Cache-Control: private, max-age=60, stale-while-revalidate=300
```

---

## Common Lighthouse Performance Audits and Fixes

| Audit | What to Do |
|---|---|
| Render-blocking resources | Add `defer`/`async` to scripts; inline critical CSS |
| Unused JavaScript | Code-split; remove unused dependencies |
| Unused CSS | PurgeCSS / tree-shake; split CSS bundles |
| Properly size images | Serve correct dimensions; use srcset |
| Efficiently encode images | Convert to WebP/AVIF; compress with quality 75-85 |
| Serve images in modern format | Use `<picture>` with WebP/AVIF fallback |
| Enable text compression | Enable gzip/brotli on server |
| Preconnect to required origins | Add `<link rel="preconnect">` for critical domains |
| Avoid enormous network payloads | Lazy load below-fold resources |
| Minimize main-thread work | Code-split; defer non-critical JS |
| Reduce JavaScript execution time | Remove unused code; split bundles |
| Avoid long main-thread tasks | Break into smaller tasks; use scheduler API |
| Keep request counts low | Bundle; use HTTP/2 push or preload |
| Avoid large layout shifts | Explicit image dimensions; stable layout |
