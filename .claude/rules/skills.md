---
globs: .claude/skills/**
---

# Skill Development Rules

## Creating/Modifying Skills

- Main file: `SKILL.md` (overview, <500 lines)
- Deep dives: `assets/*.md` (detailed patterns, <500 lines each)
- Register in `skill-rules.json` with triggers (promptTriggers, fileTriggers)
- Use progressive disclosure: overview first, load assets on-demand
- Provide concrete examples and anti-patterns
- Write `description` as a trigger condition ("when should I fire?"), not a summary

## Skill Domains

list, open, read, write, fetch, base-research, base-analysis, 4d-evaluation, hallucination-detection, maestro-orchestration, delegater, ui-ux-design, ai-pulse, excel, figma, lighthouse, ccchat, agent-creator

## Skill Delivery

- **Subagents:** Native frontmatter preloading (`skills: [X]` in agent .md). The skill discovery hook does NOT fire in subagent contexts.
- **Parent context:** Hook-based discovery via `subagent-skill-discovery.js`
- **Both:** One-line activation instruction in agent file triggers explicit `Skill()` invocation.
