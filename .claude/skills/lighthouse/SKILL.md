---
name: lighthouse
description: Activates for web performance auditing tasks; provides guidance for running Lighthouse, interpreting audit results across all 5 categories, and applying actionable remediations
---

# Lighthouse Skill

## Purpose

This skill provides comprehensive guidance for optimizing web applications using Google Lighthouse audit results. It helps you run audits, interpret scores across all five categories, understand key metrics, and apply targeted remediations to real-world issues.

## When to Use This Skill

This skill automatically activates when:
- Running or interpreting Lighthouse performance audits
- Investigating Core Web Vitals (LCP, CLS, INP, FCP, TBT, TTI)
- Improving accessibility, SEO, or best-practices scores
- Setting up Lighthouse CI for automated regression tracking
- Diagnosing slow page loads, layout shifts, or interactivity problems

## Quick Start

For 80% of Lighthouse workflows, follow this sequence:

1. **Run audit** - CLI, DevTools, or CI; choose the right surface
2. **Read the score** - Each category is 0-100; treat <50 as critical, 50-89 as needs work, 90+ as good
3. **Focus on opportunities** - Lighthouse separates "diagnostics" from "opportunities"; opportunities have direct score impact
4. **Fix highest-impact items first** - Sort by estimated savings (ms or score points)
5. **Re-audit to verify** - Always re-run after changes; scores can shift from external factors

## The Five Audit Categories

| Category | What It Measures | Score Weight |
|---|---|---|
| Performance | Loading speed, interactivity, visual stability | Weighted metric composite |
| Accessibility | WCAG compliance, screen reader support, contrast | Weighted audit composite |
| Best Practices | Security, modern APIs, console errors | Weighted audit composite |
| SEO | Crawlability, metadata, mobile friendliness | Weighted audit composite |
| PWA | Installability, offline support, manifest | Pass/fail checklist |

Each category score is 0-100. Performance is the most complex — it is a weighted average of six metrics, not a simple pass/fail.

## Running Lighthouse

### Chrome DevTools (quickest)
1. Open Chrome > DevTools (F12) > Lighthouse tab
2. Select categories, device (mobile/desktop), and mode
3. Click "Analyze page load"
4. Results appear inline; export JSON for programmatic use

### CLI (scriptable, reproducible)
```bash
# Install
npm install -g lighthouse

# Basic run — saves HTML report
lighthouse https://example.com --output html --output-path ./report.html

# JSON output for parsing
lighthouse https://example.com --output json --output-path ./report.json

# Mobile simulation (default) vs desktop
lighthouse https://example.com --preset=desktop

# Throttling options
lighthouse https://example.com --throttling-method=devtools   # real network
lighthouse https://example.com --throttling-method=simulate   # default (simulated 4G)
lighthouse https://example.com --throttling-method=provided   # no throttling
```

### Lighthouse CI (automated tracking)
```bash
# Install
npm install -g @lhci/cli

# Run and assert thresholds
lhci autorun

# lhci configuration file: lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://example.com', 'https://example.com/about'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',  // or self-hosted LHCI server
    },
  },
};
```

See `assets/ci.md` for full CI setup, GitHub Actions integration, and baseline management.

## Core Web Vitals: The Six Performance Metrics

Performance score is calculated from these six metrics (weights as of Lighthouse 10):

| Metric | Abbrev | Weight | Good | Needs Work | Poor |
|---|---|---|---|---|---|
| First Contentful Paint | FCP | 10% | <1.8s | 1.8-3s | >3s |
| Largest Contentful Paint | LCP | 25% | <2.5s | 2.5-4s | >4s |
| Total Blocking Time | TBT | 30% | <200ms | 200-600ms | >600ms |
| Cumulative Layout Shift | CLS | 15% | <0.1 | 0.1-0.25 | >0.25 |
| Speed Index | SI | 10% | <3.4s | 3.4-5.8s | >5.8s |
| Time to Interactive | TTI | 10% | <3.8s | 3.8-7.3s | >7.3s |

**INP (Interaction to Next Paint)** replaces FID in field data (CrUX) but is not yet a Lighthouse lab metric. Track it separately via web-vitals.js or CrUX dashboard.

### Reading Each Metric

**LCP** — The render time of the largest image or text block visible in the viewport. Usually a hero image, H1, or above-the-fold block. Fix: preload, optimize images, reduce server response time.

**TBT** — Total time the main thread was blocked (tasks >50ms) between FCP and TTI. TBT is the lab proxy for INP/responsiveness. Fix: code-split JS, defer non-critical scripts.

**CLS** — How much the page layout shifts unexpectedly during load. Each shift is scored by impact fraction x distance fraction. Fix: size images/embeds explicitly, avoid inserting content above existing content.

**FCP** — Time until the first pixel of content is painted. Fix: eliminate render-blocking resources, reduce TTFB.

**TTI** — Time until the page is fully interactive (main thread quiet for 5s). Fix: reduce JS execution time, remove unused JS.

**Speed Index** — How quickly content is visually populated during load (visual completeness over time). Improve by reducing render-blocking resources and critical path length.

## Reading the Audit Report

A Lighthouse JSON report has this structure:

```
lhr.categories[category].score     → 0-1 (multiply by 100 for display)
lhr.audits[audit-id].score         → 0-1 | null (informational)
lhr.audits[audit-id].numericValue  → raw measurement (ms, bytes, etc.)
lhr.audits[audit-id].details       → structured breakdown (table, list, etc.)
```

### Parsing a JSON report
```bash
# Extract performance score
cat report.json | jq '.categories.performance.score * 100'

# List all failed audits with scores
cat report.json | jq '.audits | to_entries[] | select(.value.score != null and .value.score < 1) | {id: .key, score: .value.score, title: .value.title}'

# Get LCP value in ms
cat report.json | jq '.audits["largest-contentful-paint"].numericValue'

# List render-blocking resources
cat report.json | jq '.audits["render-blocking-resources"].details.items[].url'
```

## Category Remediation Overview

Each category has a dedicated deep-dive asset file:

| Category | Deep Dive |
|---|---|
| Performance (metrics, loading, JS) | `assets/performance.md` |
| Accessibility (WCAG, ARIA, contrast) | `assets/accessibility.md` |
| SEO (crawlability, metadata, structured data) | `assets/seo.md` |
| Best Practices (security, APIs, console) | `assets/best-practices.md` |
| CI setup and regression tracking | `assets/ci.md` |

### Quick Fix Reference by Category

**Performance — highest-impact actions:**
- Add `loading="lazy"` to below-fold images
- Serve images in WebP/AVIF with correct `width`/`height` attributes
- Add `<link rel="preload">` for LCP image
- Remove unused JavaScript (`coverage` tab in DevTools)
- Enable text compression (gzip/brotli) on server
- Add `Cache-Control` headers for static assets

**Accessibility — highest-impact actions:**
- Add `alt` text to all meaningful images
- Ensure all form inputs have associated `<label>` elements
- Fix color contrast ratios (4.5:1 for normal text, 3:1 for large)
- Add `lang` attribute to `<html>` element
- Ensure all interactive elements are keyboard-reachable

**SEO — highest-impact actions:**
- Add `<meta name="description">` to every page
- Ensure `<title>` tags are descriptive and unique
- Add `<meta name="viewport" content="width=device-width">` for mobile
- Fix broken links and ensure pages are crawlable (no `noindex` on important pages)
- Add structured data (JSON-LD) for key content types

**Best Practices — highest-impact actions:**
- Serve all resources over HTTPS
- Fix console errors (JavaScript exceptions lower the score)
- Remove deprecated APIs (`document.write`, synchronous XHR)
- Set correct image aspect ratios to avoid distortion
- Use HTTPS for all third-party embeds

## Score Interpretation Guide

```
90-100  Good       No blocking issues. Optimize incrementally.
50-89   Needs Work  Measurable user impact. Prioritize before launch.
0-49    Poor        Significant user-facing problems. Fix immediately.
```

**Important caveats:**
- Performance scores vary run-to-run (network, CPU variability). Run 3+ times and use the median.
- Lab scores (Lighthouse) differ from field scores (CrUX). Field data reflects real user conditions.
- Mobile scores are almost always lower than desktop — Lighthouse simulates mid-tier mobile CPU.
- A score of 100 does not mean "perfect." It means no automated issues detected.

## Anti-Patterns

### Optimizing for score instead of users
```
BAD:  Inline all CSS to eliminate render-blocking resources audit
GOOD: Split critical from non-critical CSS; inline only critical path
```

### Ignoring field data
```
BAD:  Fix Lighthouse lab score without checking CrUX / real user data
GOOD: Cross-reference with Search Console Core Web Vitals report and web-vitals.js
```

### Running Lighthouse with extensions active
```
BAD:  Run in normal Chrome window with ad blockers / React DevTools active
GOOD: Run in incognito or use --disable-extensions flag in CLI
```

### Treating all audits equally
```
BAD:  Fix every amber/red audit in order
GOOD: Focus on "Opportunities" with largest estimated savings first
```

## Quick Reference

```bash
# Run CLI audit, save HTML report
lighthouse https://example.com --output html --output-path report.html

# Run desktop preset
lighthouse https://example.com --preset=desktop --output json --output-path report.json

# Parse score from JSON
cat report.json | jq '.categories.performance.score * 100'

# Find all failed audits
cat report.json | jq '[.audits | to_entries[] | select(.value.score != null and .value.score < 1) | {id: .key, title: .value.title, score: .value.score}]'

# Run LHCI with assertions
lhci autorun --config=lighthouserc.js
```

## Resources (Progressive Disclosure)

- **`assets/performance.md`** - LCP/TBT/CLS deep dives, image optimization, JS splitting, critical path, caching strategies
- **`assets/accessibility.md`** - WCAG mapping, ARIA patterns, keyboard navigation, contrast tooling
- **`assets/seo.md`** - Crawlability, metadata, structured data, mobile SEO, international
- **`assets/best-practices.md`** - HTTPS migration, console error triage, deprecated APIs, security headers
- **`assets/ci.md`** - Lighthouse CI setup, GitHub Actions, baseline budgets, LHCI server
