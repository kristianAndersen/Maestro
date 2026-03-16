# Lighthouse SEO Deep Dive

## How Lighthouse Scores SEO

Lighthouse SEO audits focus on technical SEO: whether search engines can discover, crawl, and understand your pages. It does not audit content quality, backlinks, or keyword strategy.

**Score target:** >= 90 (most technical issues fully automatable)

---

## Priority 1: Crawlability

### Page blocked from indexing

```html
<!-- BAD: Blocks all crawlers from indexing -->
<meta name="robots" content="noindex">

<!-- BAD: Only allow specific pages to be crawled/indexed -->
<!-- Check that important pages are NOT noindex -->

<!-- GOOD: Default (allow indexing) -->
<!-- Absence of robots meta tag = allow indexing -->

<!-- GOOD: Block staging but not production -->
<!-- Use robots.txt for crawler access, robots meta for indexing -->
```

**robots.txt — allow vs. block:**
```
# Allow all crawlers everywhere
User-agent: *
Allow: /

# Block staging subdirectory
User-agent: *
Disallow: /staging/

# Block specific bots
User-agent: AhrefsBot
Disallow: /
```

**Important:** `robots.txt` blocks crawling; `noindex` blocks indexing. They are not interchangeable.

### Broken links and crawl errors

```bash
# Find broken links with CLI tools
npx broken-link-checker https://example.com --recursive --ordered

# Or with Screaming Frog SEO Spider (GUI tool)
# Or with wget mirror
wget --spider -r --level=3 https://example.com 2>&1 | grep '404\|403\|broken'
```

---

## Priority 2: Core Metadata

### Missing or duplicate page title

```html
<!-- BAD: Missing title -->
<head></head>

<!-- BAD: Generic title -->
<title>Home | Site</title>

<!-- GOOD: Descriptive, unique, includes primary keyword -->
<title>Buy Red Wool Sweaters — Free Shipping | MyStore</title>

<!-- Title best practices:
  - 50-60 characters (longer gets truncated in SERPs)
  - Include primary keyword near the beginning
  - Unique per page
  - Brand name at end (not start, unless branded query)
-->
```

### Missing meta description

```html
<!-- GOOD: Compelling description, 140-160 characters -->
<meta name="description"
      content="Shop our collection of premium wool sweaters. Free shipping on orders over $50. Available in 12 colors, sizes XS–3XL.">

<!-- Note: Meta description does not directly affect ranking,
     but a good description improves click-through rate from SERPs.
     Google often ignores it and generates its own — write it anyway. -->
```

### Missing viewport meta tag (mobile)

```html
<!-- GOOD: Required for mobile-friendly rendering -->
<meta name="viewport" content="width=device-width, initial-scale=1">

<!-- Do NOT use maximum-scale=1 or user-scalable=no — these
     prevent users from zooming and fail accessibility audits -->
```

---

## Priority 3: Content Structure

### Links have descriptive text

```html
<!-- BAD: Non-descriptive link text -->
<a href="/about">Click here</a>
<a href="/report.pdf">Read more</a>

<!-- GOOD: Descriptive link text -->
<a href="/about">Learn about our company</a>
<a href="/report.pdf">Download Q4 2025 Annual Report (PDF)</a>

<!-- GOOD: When visual design requires short text, use aria-label -->
<a href="/products/sweater-123" aria-label="View Red Wool Sweater product page">
  View
</a>
```

### Images have alt text (SEO + accessibility)

```html
<!-- For SEO: alt text describes image content for crawlers -->
<img src="red-sweater.jpg" alt="Red wool V-neck sweater with ribbed cuffs">

<!-- For decorative images: empty alt, no indexable content -->
<img src="divider.png" alt="">
```

### Legible font sizes on mobile

Lighthouse checks that the majority of text is at least 12px on mobile (Lighthouse tests at 360px viewport width with 1x DPR).

```css
/* Use relative font sizes that scale well */
body { font-size: 16px; }  /* Base 16px */
p { font-size: 1rem; }     /* 16px */
small { font-size: 0.875rem; }  /* 14px */

/* Avoid absolute small sizes */
/* BAD: */
.footnote { font-size: 10px; }
/* GOOD: */
.footnote { font-size: 0.75rem; }  /* 12px minimum */
```

### Tap targets are sized appropriately

Touch targets should be at least 48x48px CSS pixels with 8px spacing.

```css
/* BAD: Tiny tap targets on mobile */
.nav-link { font-size: 12px; padding: 2px; }

/* GOOD: Adequate tap target size */
.nav-link {
  font-size: 16px;
  padding: 12px 16px;
  min-height: 48px;
  display: flex;
  align-items: center;
}
```

---

## Priority 4: Structured Data

Structured data is not directly audited by Lighthouse but is validated by the Best Practices category and heavily impacts rich results in Google Search.

### JSON-LD examples by content type

```html
<!-- Article -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Care for Wool Sweaters",
  "author": { "@type": "Person", "name": "Jane Smith" },
  "datePublished": "2025-01-15",
  "image": "https://example.com/article-hero.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "MyStore",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  }
}
</script>

<!-- Product -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Red Wool Sweater",
  "image": ["https://example.com/sweater-1.jpg"],
  "description": "Premium merino wool sweater",
  "brand": { "@type": "Brand", "name": "MyBrand" },
  "offers": {
    "@type": "Offer",
    "price": "89.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "143"
  }
}
</script>

<!-- Breadcrumbs (triggers breadcrumb rich results) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com" },
    { "@type": "ListItem", "position": 2, "name": "Sweaters", "item": "https://example.com/sweaters" },
    { "@type": "ListItem", "position": 3, "name": "Red Wool Sweater" }
  ]
}
</script>
```

```bash
# Validate structured data
# Google Rich Results Test: https://search.google.com/test/rich-results
# Schema.org validator: https://validator.schema.org/
```

---

## Priority 5: Internationalization

```html
<!-- hreflang for multilingual sites -->
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page">
<link rel="alternate" hreflang="de" href="https://example.com/de/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">

<!-- Rules:
  - Every URL in hreflang set must reference all others
  - x-default is the fallback for unmatched locales
  - Use BCP 47 language tags (en-US, fr-CA, etc.)
-->
```

---

## Common Lighthouse SEO Audits Reference

| Audit | Fix |
|---|---|
| Document does not have a meta description | Add `<meta name="description">` |
| Document title element is not descriptive | Make `<title>` unique and keyword-relevant |
| Page is blocked from indexing | Remove `noindex` from important pages |
| Links are not crawlable | Use `<a href="">` not JS-only navigation |
| Link text is not descriptive | Replace "click here" with descriptive text |
| Image elements do not have alt attributes | Add meaningful alt text |
| Document does not have a valid hreflang | Fix hreflang format and bidirectional references |
| Tap targets are not sized appropriately | Make touch targets >= 48x48px |
| Robots.txt is not valid | Fix robots.txt syntax errors |
| Page has unsuccessful HTTP status code | Fix redirects and broken pages |
