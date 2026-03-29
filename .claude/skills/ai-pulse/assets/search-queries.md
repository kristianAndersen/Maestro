# Search Queries Reference

## Default Query Set

These queries are proven to return high-quality results when run with `allowed_domains: ["twitter.com", "x.com"]`.

### Query 1: Claude Code Agents & Plugins
```
"Claude Code agents MCP plugins skills {year}"
```
**Covers:** Plugin announcements, agent releases, skills guides, MCP integrations

### Query 2: Anthropic Official News
```
"Anthropic Claude skills MCP server news"
```
**Covers:** Official Anthropic announcements, MCP protocol updates, Claude feature launches

### Query 3: Hooks & Subagents
```
"Claude Code hooks subagents {year}"
```
**Covers:** Hook patterns, subagent configurations, automation workflows

### Query 4: Agent SDK & Tools
```
"Claude agent SDK MCP tools {year}"
```
**Covers:** SDK releases, tool use patterns, developer tooling

### Query 5: Plugin Marketplace
```
"Claude Code plugins marketplace {year}"
```
**Covers:** Plugin ecosystem, marketplace additions, community contributions

---

## Maestro-Boost Queries

Run these when deeper framework-specific coverage is needed:

### Boost 1: Orchestration Patterns
```
"Claude Code orchestration delegation agents {year}"
```
**Covers:** Multi-agent patterns, delegation workflows, conductor architectures

### Boost 2: Automation Workflows
```
"MCP server Claude Code automation workflow {year}"
```
**Covers:** MCP-driven automation, workflow tooling, integration patterns

---

## Topic Filter Modifications

When the user provides a topic filter, modify queries as follows:

- **Replace the focus term**, not the structural terms. Keep "Claude Code" and `{year}` in place.
- Example: topic filter "voice agents" transforms Query 1 into: `"Claude Code voice agents MCP {year}"`

### Common Topic Filters

| Filter | Replaces | Example Query |
|--------|----------|---------------|
| MCP servers | "agents MCP plugins skills" | `"Claude Code MCP servers {year}"` |
| voice agents | "agents MCP plugins skills" | `"Claude Code voice agents MCP {year}"` |
| Claude API | "agents MCP plugins skills" | `"Claude API new features {year}"` |
| security | "agents MCP plugins skills" | `"Claude Code security permissions {year}"` |

---

## Year Substitution

Always replace `{year}` with the current four-digit year. This biases search results toward recent content. Example for 2026:

```
"Claude Code agents MCP plugins skills 2026"
```

---

## High-Signal Accounts

These X/Twitter accounts frequently post Maestro-relevant content. When their tweets appear in results, they are likely high-quality:

- `@claudeai` — Official Claude account
- `@AnthropicAI` — Official Anthropic account
- `@bcherny` — Boris Cherny (Claude Code team)
- `@omarsar0` — Elvis (AI engineering, Claude Code power user)
- `@dani_avila7` — Daniel San (Claude Code, MCP, agents)
- `@ClaudeCodeLog` — Claude Code changelog bot

These are not filters — they are signal boosters. If a search result comes from one of these accounts, it is more likely to be Tier 1 or Tier 2.
