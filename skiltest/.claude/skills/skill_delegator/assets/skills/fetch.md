# Fetch Skill - Detailed Profile

## Overview

**Skill Name:** fetch
**Location:** `.claude/skills/fetch/SKILL.md`
**Category:** Data Retrieval
**Complexity:** Medium

## Purpose

Provides comprehensive guidance for retrieving data from external sources including APIs, web pages, files, and remote services. Includes best practices for error handling, retry logic, validation, and caching.

## When to Activate

### Primary Use Cases
- Fetching data from URLs or web pages
- Making API requests (REST, GraphQL, etc.)
- Downloading files or resources
- Web scraping and content extraction
- Retrieving data from external services

### Activation Signals

**High Confidence (activate immediately):**
- Request contains URL (http://, https://)
- Explicit mention of API or endpoint
- Action verbs: "fetch", "get", "download", "retrieve"
- Keywords: "API", "endpoint", "web page", "URL"

**Medium Confidence (likely activate):**
- General data retrieval request
- Mentions "external data" or "remote"
- Context implies external source

**Low Confidence (probably skip):**
- Local file operations
- No indication of external data
- Ambiguous data access request

## Keywords

### Action Verbs
fetch, get, retrieve, download, pull, scrape, crawl, extract

### Data Sources
URL, API, endpoint, website, web page, HTTP, HTTPS, remote, external, online, service

### Operations
request, response, query, call

## Pattern Recognition

### URL Patterns
- Contains `http://` or `https://`
- Domain names or IP addresses
- `/api/` path segments
- Query parameters `?param=value`

### API Patterns
- Mentions "API", "endpoint", "REST", "GraphQL"
- Authentication references (token, key, OAuth)
- HTTP methods (GET, POST, PUT, DELETE)

### Scraping Patterns
- "scrape", "extract", "crawl"
- References to HTML, CSS selectors
- Multiple page operations

## Examples

### Example 1: Direct URL Fetch
**Request:** "Get the content from https://example.com"
**Match:** High - URL + retrieval verb
**Action:** Activate fetch skill

### Example 2: API Call
**Request:** "Fetch user data from the /api/users endpoint"
**Match:** High - "fetch" + "API" + "endpoint"
**Action:** Activate fetch skill

### Example 3: Download
**Request:** "Download the file at https://example.com/file.pdf"
**Match:** High - "download" + URL
**Action:** Activate fetch skill

### Example 4: Web Scraping
**Request:** "Extract all blog titles from https://example.com/blog"
**Match:** High - "extract" + URL + web content
**Action:** Activate fetch skill

### Example 5: Generic Data Request
**Request:** "Get the latest weather data"
**Match:** Medium - "get" + implies external API
**Action:** Consider fetch skill (likely external source)

## What This Skill Provides

### Core Knowledge
- HTTP request patterns and best practices
- Error handling strategies
- Retry logic with exponential backoff
- Response validation techniques
- Timeout management

### Specialized Patterns
- API authentication (Bearer tokens, API keys, Basic auth)
- Caching strategies (time-based, ETag)
- Rate limiting handling
- Pagination handling
- Web scraping techniques

### Assets Available
- `methodology.md` - Advanced strategies, circuit breakers, fallback chains
- `patterns.md` - Concrete code examples for various scenarios
- `troubleshooting.md` - Common issues and solutions

## Tools Required

Agents using this skill should have:
- **WebFetch** - For making HTTP requests
- **Bash** (optional) - For curl-based operations
- **Read** - To read cached data or configuration
- **Write** (optional) - To save fetched data

## Integration Notes

### Works Well With
- **Agents:** general-purpose, orchestrator
- **Other Skills:** None currently (fetch is standalone)

### Decision Logic
```
Does request contain URL?
  Yes + retrieval verb → Activate (HIGH confidence)
  Yes, no clear verb → Activate (MEDIUM confidence)
  No URL → Check for API/external keywords
    Has API keywords → Activate (HIGH confidence)
    General "get" → Activate (MEDIUM confidence)
    No external indicators → Skip (LOW confidence)
```

## Anti-Patterns (When NOT to Use)

❌ **Local file reads** - Use Read tool directly
❌ **Database queries** - Different skill needed
❌ **In-memory data** - No external fetch needed
❌ **Code generation** - Not a data retrieval task

## Success Indicators

After activation, the fetch skill helps with:
- ✅ Proper error handling implemented
- ✅ Retry logic with backoff
- ✅ Response validation
- ✅ Appropriate timeouts set
- ✅ Caching considered when appropriate

## Maintenance

**Add to this file when:**
- New fetch patterns emerge
- Additional use cases discovered
- Common edge cases identified

**Don't modify:**
- The core skill file (`.claude/skills/fetch/SKILL.md`)
- The skill_delegator routing logic

---

**Last Updated:** 2025-11-28
**Skill Version:** 1.0
**Maintained By:** skill_delegator system
