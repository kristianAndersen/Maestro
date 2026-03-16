---
name: fetch
description: Activates for external data retrieval operations; provides guidance on using WebFetch and WebSearch tools, knowing when to use each, handling failures gracefully, and validating responses. Use this skill whenever you need to fetch a URL, search the web for current information, retrieve documentation, verify an API signature, or get data from external sources — even if the user just says "look it up" or "check the docs".
tools: WebFetch, WebSearch
---

# Fetch Skill

## Purpose

This skill provides guidance for retrieving external data using Claude Code's WebFetch and WebSearch tools. It helps you choose the right tool, extract targeted information, handle failures gracefully, and verify that what you retrieved is accurate and current.

## When to Use This Skill

- Fetching a specific URL for documentation, API references, or content
- Searching the web for current information, library versions, or best practices
- Retrieving external documentation to verify API usage or method signatures
- Getting data from public web pages or APIs

## Quick Start

1. **URL known? → WebFetch** — Give it the exact URL and a specific extraction prompt
2. **Topic known, URL unknown? → WebSearch first** — Search to find the right URL, then WebFetch
3. **Always include a prompt with WebFetch** — it directs extraction, otherwise you get a dump
4. **Validate the source** — official docs beat third-party blogs, always

## WebFetch vs WebSearch

| Situation | Tool | Why |
|---|---|---|
| Have a specific URL | WebFetch | Direct and efficient |
| Know the topic, not the URL | WebSearch | Finds the right URL first |
| API documentation | WebFetch | Go directly to the docs URL |
| Current events, latest versions | WebSearch | Better for discovery |
| Package docs (specific version) | WebSearch then WebFetch | Search finds the right version page |
| GitHub README or raw file | WebFetch | Direct URL available |
| "Is this API still the right way?" | WebSearch | Finds recent discussions and changelogs |

## Core Patterns

### Pattern 1: Direct Documentation Fetch

```
WebFetch(
  url="https://docs.anthropic.com/en/api/messages",
  prompt="What are the required and optional parameters for messages.create? Show the full signature."
)
```

Always provide a specific `prompt` — it directs the tool to extract the relevant information rather than returning the whole page.

### Pattern 2: Search Then Fetch

```
# Step 1: Find the right URL
WebSearch(query="prisma 5 findUnique documentation site:prisma.io")

# Step 2: Fetch the most relevant result
WebFetch(
  url="<best result URL>",
  prompt="What is the findUnique method signature and what parameters does it accept?"
)
```

### Pattern 3: Version-Specific Documentation

```
# Search with version constraint
WebSearch(query="express 4.x Router params documentation")

# Fetch the versioned docs
WebFetch(
  url="<versioned URL>",
  prompt="How do I define route parameters? Show the syntax."
)
```

### Pattern 4: API Signature Verification

When verifying that a method exists and has the right signature before using it:

```
WebFetch(
  url="https://docs.example.com/api/reference",
  prompt="Does the POST /users endpoint accept a 'role' field in the request body? What are valid values?"
)
```

### Pattern 5: Cross-Referencing Sources

For important claims, verify with at least two sources:

```
# Official docs first
WebFetch(url="<official docs>", prompt="What does jwt.sign() return?")

# Then cross-check with the package README
WebFetch(url="https://github.com/auth0/node-jsonwebtoken", prompt="What does sign() return? Show the return type.")
```

## Handling Fetch Failures

### Page Not Found / Access Denied

- Try the parent URL (drop the last path segment)
- Search for the content instead: `WebSearch("site:docs.example.com <topic>")`
- Look for the GitHub repo README as an alternative

### Response Too Large or Vague

When WebFetch returns a high-level summary instead of detail:

- Add a more specific `prompt` to guide extraction
- Fetch a more specific sub-page URL (e.g., the specific method's page vs. the full API reference)
- Use WebSearch to find a more targeted resource

### Outdated or Wrong Content

- Check the URL for version indicators (`/v1/`, `/v2/`, `/5.x/`)
- Search for the specific version: `WebSearch("library X version Y docs")`
- Cross-reference with the project's `package.json`/`requirements.txt` to confirm which version is installed

## Validation Checklist

Before using fetched data:

- [ ] Is the source authoritative? (official docs > maintained READMEs > third-party blogs)
- [ ] Is the content current? (check version numbers, dates)
- [ ] Does it actually answer your question? (don't assume partial answers are complete)
- [ ] Does it match the version in the project's dependencies?

## What to Extract vs What to Ignore

**Extract:**
- Method signatures and parameter names
- Required vs optional fields
- Return shapes and type information
- Error codes and their meanings
- Version-specific behavior changes

**Ignore:**
- Marketing copy and introductory text
- Examples unrelated to your specific question
- Deprecated API docs (unless debugging legacy behavior)

## Context Efficiency

Web content can be large. Be specific with prompts:

```
# BAD: Returns entire page with minimal filtering
WebFetch(url="https://docs.stripe.com/api", prompt="get the docs")

# GOOD: Targeted extraction
WebFetch(
  url="https://docs.stripe.com/api/charges/create",
  prompt="What parameters does charges.create require? What does the response object look like?"
)
```

## Anti-Patterns

### Fetching Without a Specific Prompt

```
# BAD: No direction, returns too much
WebFetch(url="https://docs.example.com/api")

# GOOD: Focused extraction
WebFetch(url="https://docs.example.com/api", prompt="How do I authenticate requests?")
```

### Using WebSearch When You Have the URL

```
# BAD: Unnecessary search step when URL is known
WebSearch("express.js router documentation")

# GOOD: Direct fetch when URL is known
WebFetch(url="https://expressjs.com/en/guide/routing.html", prompt="How do I define route parameters?")

# WebSearch is correct when: you don't know the URL, need current info, or are unsure of the right page
```

### Trusting One Source Uncritically

```
# BAD: One fetch, take it as truth
WebFetch(url="some-blog.com/how-to-use-jwt")  → take as authoritative

# GOOD: Use official sources, verify signatures
WebFetch(url="https://github.com/auth0/node-jsonwebtoken#readme", prompt="What is the sign() function signature?")
```

### Ignoring Version Alignment

```
# BAD: Fetching latest docs when project uses an older version
# GOOD: Check package.json first, then fetch version-specific docs
```

## Resources (Progressive Disclosure)

- **`assets/methodology.md`** — Advanced fetch strategies, multi-page documentation navigation, dealing with paywalled or rate-limited content
- **`assets/patterns.md`** — Concrete examples: API verification workflows, documentation research patterns, cross-referencing multiple sources
- **`assets/troubleshooting.md`** — Network errors, access denied, stale content, large page handling, conflicting information from different sources
