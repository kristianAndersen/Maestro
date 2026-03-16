# Lighthouse CI Deep Dive

## Purpose

Lighthouse CI (LHCI) automates Lighthouse audits in your build pipeline, tracks score history over time, and blocks deployments when scores regress below thresholds.

---

## Setup: Lighthouse CI

### Install

```bash
npm install -g @lhci/cli
# or as a dev dependency
npm install --save-dev @lhci/cli
```

### Configuration file

Create `lighthouserc.js` (or `.lighthouserc.json`) in project root:

```javascript
// lighthouserc.js — full configuration example
module.exports = {
  ci: {
    collect: {
      // What to audit
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/products',
      ],
      numberOfRuns: 3,          // Run each URL 3 times, use median
      startServerCommand: 'npm run start',   // Start dev server
      startServerReadyPattern: 'Listening on',  // Wait for this in stdout

      // Lighthouse CLI flags
      settings: {
        preset: 'desktop',      // 'desktop' | omit for mobile
        throttlingMethod: 'devtools',  // Real network throttling
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
      },
    },

    assert: {
      preset: 'lighthouse:recommended',  // Start with recommended baseline
      assertions: {
        // Override specific assertions
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // Specific metric assertions
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],

        // Specific audit assertions
        'uses-responsive-images': ['warn', {}],
        'uses-webp-images': ['warn', {}],
        'render-blocking-resources': ['warn', {}],
      },
    },

    upload: {
      target: 'temporary-public-storage',  // Public LHCI server (no auth, 7 days)
      // target: 'lhci',                  // Self-hosted LHCI server
      // serverBaseUrl: 'https://lhci.mycompany.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
```

### Assertion levels

```
'error'  → CI fails; blocks merge/deploy
'warn'   → CI passes but prints warning
'off'    → Assertion disabled
```

---

## GitHub Actions Integration

### Basic workflow

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Using the official Lighthouse CI GitHub Action

```yaml
# More control with the official action
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      https://example.com/
      https://example.com/about
    budgetPath: ./budget.json      # Alternative to lighthouserc assertions
    uploadArtifacts: true          # Save HTML reports as GitHub artifacts
    temporaryPublicStorage: true   # Publish to LHCI public storage
```

### Performance budgets file (alternative to lighthouserc assertions)

```json
// budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "total-blocking-time", "budget": 200 },
      { "metric": "cumulative-layout-shift", "budget": 0.1 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 200 },
      { "resourceType": "image", "budget": 500 },
      { "resourceType": "total", "budget": 1000 }
    ],
    "resourceCounts": [
      { "resourceType": "third-party", "budget": 10 }
    ]
  }
]
```

---

## Self-Hosted LHCI Server

The self-hosted server provides persistent history, trend graphs, and PR comparison diffs.

### Docker setup

```bash
# Run LHCI server
docker run -d \
  -p 9001:9001 \
  -e LHCI_BASIC_AUTH_USERNAME=admin \
  -e LHCI_BASIC_AUTH_PASSWORD=yourpassword \
  patrickhulce/lhci-server

# Or with Docker Compose
```

```yaml
# docker-compose.yml
version: '3'
services:
  lhci-server:
    image: patrickhulce/lhci-server
    ports:
      - "9001:9001"
    environment:
      - LHCI_BASIC_AUTH_USERNAME=admin
      - LHCI_BASIC_AUTH_PASSWORD=yourpassword
    volumes:
      - lhci-data:/data/lhci.db
volumes:
  lhci-data:
```

### Create a project and get a token

```bash
lhci wizard
# Follow prompts to create project
# Save the build token — add to CI secrets as LHCI_TOKEN
```

```javascript
// lighthouserc.js for self-hosted server
module.exports = {
  ci: {
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://lhci.yourcompany.com',
      token: process.env.LHCI_TOKEN,
    },
  },
};
```

---

## Strategies for Stable CI Scores

Performance scores vary run-to-run due to CPU/network variability. Use these strategies:

### 1. Multiple runs, take median

```javascript
// lighthouserc.js
collect: {
  numberOfRuns: 5,  // Run 5 times, LHCI uses median automatically
}
```

### 2. Use devtools throttling for real network conditions

```javascript
settings: {
  throttlingMethod: 'devtools',  // Real network/CPU throttling
  // vs 'simulate' (default) — synthetic simulation, more variable
}
```

### 3. Separate mobile and desktop audits

```yaml
# Two separate jobs in GitHub Actions
jobs:
  lighthouse-mobile:
    steps:
      - run: lhci autorun --config=lighthouserc.mobile.js

  lighthouse-desktop:
    steps:
      - run: lhci autorun --config=lighthouserc.desktop.js
```

### 4. Set sensible thresholds (not 100)

```javascript
// Aim for achievable, meaningful thresholds
assertions: {
  'categories:performance': ['error', { minScore: 0.75 }],  // 75+ blocks CI
  'categories:accessibility': ['error', { minScore: 0.95 }], // 95+ blocks CI
}
```

### 5. Exclude flaky audits

```javascript
assertions: {
  // Disable audits that frequently false-positive in CI
  'uses-http2': 'off',       // May fail if tested on localhost
  'uses-long-cache-ttl': 'off',  // Local server won't have cache headers
}
```

---

## Interpreting LHCI Comparison Reports

When LHCI runs on a PR, it compares against the base branch:

```
Before: Performance 78
After:  Performance 82
Delta:  +4 (improvement)

Audit: largest-contentful-paint
  Before: 3200ms (red)
  After:  2100ms (green)
  Delta:  -1100ms
```

**Regression policy recommendations:**

| Score Change | Category | Action |
|---|---|---|
| Any drop > 5 | Performance | Block PR, investigate |
| Any drop > 2 | Accessibility | Block PR, fix before merge |
| Any drop > 5 | SEO | Warn, document reason |
| Any drop | Best Practices | Warn |

---

## Running LHCI Locally

```bash
# Full autorun (collect + assert + upload)
lhci autorun

# Just collect (saves results locally)
lhci collect --url https://example.com

# Just assert (against local results)
lhci assert --config lighthouserc.js

# Open a report
lhci open

# Compare two runs
lhci compare --base ./lhci-base --compare ./lhci-compare
```

---

## Integrating with Monitoring (Field Data)

LHCI gives you lab data. For field data (real users), pair with:

```javascript
// web-vitals.js — measure real user metrics
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  // Send to your analytics platform
  gtag('event', name, {
    event_category: 'Web Vitals',
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    event_label: id,
    non_interaction: true,
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Field data sources:**
- Google Search Console: Core Web Vitals report (28-day rolling)
- CrUX API: `https://chromeuxreport.googleapis.com/v1/records:queryRecord`
- PageSpeed Insights API: Returns both lab (Lighthouse) and field (CrUX) data
- Real User Monitoring (RUM) tools: Datadog, New Relic, SpeedCurve, Calibre
