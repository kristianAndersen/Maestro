---
description: Search Twitter/X for latest Claude/AI agent news and deliver a prioritized digest.
argument-hint: [optional: topic filter]
---

<usage>
/ai-pulse [optional: topic filter]
</usage>

Spawn the **ai-pulse** agent to search Twitter/X for the latest Claude and AI agent news.

**What it does:**
1. Runs curated WebSearch queries against twitter.com/x.com
2. Fetches full content from linked articles and blog posts
3. Deduplicates results across queries
4. Prioritizes content by Maestro relevance (Tier 1 on top)
5. Delivers a structured digest with summaries and links

**Arguments:**
- If `$ARGUMENTS` is provided, pass it as a topic filter to narrow the search focus
- If no arguments, use the default query set (Claude agents, skills, MCP, plugins)

**Invocation:**
Use the Agent tool with `subagent_type: "ai-pulse"` and pass any arguments from the user.
