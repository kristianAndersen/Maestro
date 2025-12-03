# Skill Registry (Index)

This is a lightweight index of all available skills. The skill_delegator reads this index first, then loads detail files only when needed for true progressive disclosure.

## How to Add New Skills

1. Create the skill directory under `.claude/skills/`
2. Create a detail file: `assets/skills/{skill_name}.md`
3. Add one line to the registry below
4. Done!

---

## Available Skills

| Skill | Description | Keywords | Detail File |
|-------|-------------|----------|-------------|
| **fetch** | External data retrieval (APIs, web scraping, downloads) | fetch, get, download, URL, API, HTTP | [fetch.md](skills/fetch.md) |
| **delegater** | Multi-agent coordination, dependency analysis, parallel/sequential execution | coordinate, multiple agents, pipeline, parallel, sequential, workflow | [delegater.md](skills/delegater.md) |
| **intent_discovery** | Domain-agnostic user intent and requirement gathering through adaptive questioning | intent, requirements, create agent, create skill, what do you need, understand, clarify | [intent_discovery.md](skills/intent_discovery.md) |
| **4d_evaluation** | Universal quality assessment using 4D framework (Product, Process, Performance) | evaluate, quality, assessment, review, excellent, refinement, coaching | [4d_evaluation.md](skills/4d_evaluation.md) |

---

## Quick Match Guide

**How skill_delegator uses this index:**

1. **Read this index** - Fast scan of all available skills
2. **Match keywords** - Does request contain skill keywords?
3. **Check confidence** - Is this a clear match?
4. **Load detail file** - Read full details only if needed
5. **Activate skill** - Use Skill tool to activate

**Confidence Levels:**
- **High** - Multiple keyword matches + clear pattern → Activate immediately
- **Medium** - Some keyword matches → Read detail file for confirmation
- **Low** - Few/no matches → Skip this skill

---

## Adding New Skills Template

```markdown
| **skill_name** | One-line description | keyword1, keyword2, keyword3 | [skill_name.md](skills/skill_name.md) |
```

Example:
```markdown
| **transform** | Data transformation and format conversion | transform, convert, parse, format, JSON, CSV | [transform.md](skills/transform.md) |
```

---

## Registry Metadata

**Last Updated:** 2025-11-28
**Total Skills:** 4
**Architecture:** Progressive disclosure (index → detail files)
**Maintained By:** skill_delegator system
