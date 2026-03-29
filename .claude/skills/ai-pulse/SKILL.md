---
name: ai-pulse
description: Use this skill whenever searching for recent AI news on Twitter/X, building a news digest, tracking trending AI topics, or fulfilling a "what's new in AI" request. Activate when the user mentions 'ai-pulse', 'pulse', 'AI news', or asks about recent AI developments.
---

# AI Pulse Skill

## Purpose

This skill guides the ai-pulse agent through searching Twitter/X for Claude and AI agent news, fetching linked articles, deduplicating results, prioritizing Maestro-relevant content, and producing a structured digest.

---

## Core Methodology

The ai-pulse workflow has six phases:

1. **Search** — Run curated queries against Twitter/X using WebSearch with domain restriction
2. **Fetch** — Retrieve full content from external articles linked in tweets
3. **Deduplicate** — Remove duplicate items across query results
4. **Prioritize** — Classify items into three tiers by Maestro relevance
5. **Summarize** — Produce title, summary, source, fetch status, and why-it-matters for each item
6. **Output** — Deliver structured digest with Tier 1 first

---

## Search Strategy

### Domain Restriction

Every query must include `allowed_domains: ["twitter.com", "x.com"]`. Without this restriction, WebSearch will return blog posts and general web results instead of tweets.

### Year Substitution

Include the current year in queries to bias results toward recent content. Replace `{year}` with the actual four-digit year before running.

### Query Volume

Run up to 3 queries per session. Stop early if you already have 10+ unique items after deduplication. The default set covers the primary signal areas; add Maestro-boost queries when framework-specific depth is needed.

### Default Queries

See `assets/search-queries.md` for the full curated query set, including default queries, Maestro-boost queries, topic filter patterns, and customization guidance.

---

## Fetch Heuristics

Not every tweet is worth fetching. Apply these rules:

**Fetch when:**
- Tweet snippet contains `t.co/` followed by a URL that resolves to a non-Twitter domain
- Tweet references a blog post, announcement, GitHub repo, or documentation page
- Tweet text says "thread" or "article" and includes an external link

**Do not fetch when:**
- Link goes to another tweet or Twitter thread
- Link goes to a Twitter profile or search page
- Link goes to a YouTube video (no readable text body)
- WebFetch has already failed for the same domain in this run

**Fetch cap:** Maximum 5 external fetches per run. Prioritize Tier 1 candidates for fetching.

---

## Prioritization Tiers

### Tier 1 — Maestro-Relevant

Content applicable directly to building or improving the Maestro framework:

- Claude Code agents, subagents, custom agents
- Skills for Claude Code (`.claude/skills/`)
- Hooks for Claude Code (`.claude/hooks/`)
- MCP (Model Context Protocol) servers, tools, resources
- Agent orchestration, delegation, multi-agent coordination
- Claude Code plugins or marketplace items
- Subagent quality evaluation patterns
- Prompt engineering for agent systems

**Signal keywords:** agent, subagent, skill, hook, MCP, orchestration, delegation, Claude Code, plugin, workflow, tool use, multi-agent

### Tier 2 — Claude Ecosystem

Important Anthropic/Claude news, not directly a Maestro component:

- Claude API new features, model releases
- Anthropic product announcements
- Claude Agent SDK changes
- Claude Code UI/IDE features
- Claude safety and policy updates with API implications

**Signal keywords:** Anthropic, Claude API, model release, agent SDK, Claude 3, Claude 4, pricing, rate limits

### Tier 3 — Broader AI

Context and competition intelligence:

- Other LLM agent frameworks (LangChain, AutoGen, CrewAI, etc.)
- Non-Anthropic model releases with agent capabilities
- AI infrastructure news (hosting, inference, tooling)
- General industry trends

**Assignment rule:** When in doubt between Tier 1 and Tier 2, ask: "Could this directly become a Maestro component or improve an existing one?" If yes → Tier 1. If it would inform usage but not change the framework → Tier 2.

---

## Output Format Specification

### Digest Header

```
AI PULSE DIGEST
===============
Run date: {YYYY-MM-DD}
Queries executed: {N}
Raw results: {N} tweets
After deduplication: {N} items
Articles fetched: {N} ({N} successful, {N} tweet-only)
```

### Item Format

```
[Item title — one line, descriptive]
Summary: {2-3 sentences combining tweet and article content}
Source: {tweet URL} | {article URL if fetched}
Fetch: Full article fetched | Tweet only
Why it matters: {one line connecting content to Maestro or Claude ecosystem}
```

### Section Headers

```
---

TIER 1: MAESTRO-RELEVANT ({N} items)

[item]
[item]

---

TIER 2: CLAUDE ECOSYSTEM ({N} items)

[item]
[item]

---

TIER 3: BROADER AI ({N} items)

[item]
[item]

---
END OF DIGEST
```

### Empty Tier Handling

If a tier has no items, include the header with "(0 items)" and a single line: "No items found in this tier for this run."

---

## Deduplication Rules

1. **Same tweet URL from multiple queries** → keep one, discard duplicates
2. **Different tweets linking to the same article** → merge into one item; note both tweet sources in the Source field
3. **Near-duplicate content** (same announcement posted by two different accounts) → keep the tweet with the fuller text or the earlier timestamp
4. **Retweets of original content already captured** → discard the retweet, keep the original

---

## Quality Checks

Before delivering the digest, verify:

- [ ] All Tier 1 items genuinely relate to Maestro framework components (not just Claude in general)
- [ ] No fabricated tweet content — summaries based only on actual search results and fetched articles
- [ ] Fetch status accurately recorded for every item
- [ ] Item count in header matches actual items in digest
- [ ] No Twitter profile pages or search result pages counted as articles fetched

---

## Progressive Disclosure

For deep reference on search queries, customization, and domain-specific query patterns:

- **`assets/search-queries.md`** — Full curated query set, Maestro-boost queries, topic filter patterns, customization guide
