# Framework Architecture

## Three-Layer System

1. **Hooks** (`.claude/hooks/*.{js,sh}`) — Event-driven automation on UserPromptSubmit, PostToolUse, Stop, SubagentStop, PreToolUse, PreCompact
2. **Agents** (`.claude/agents/*.md`) — Specialized subagents with frontmatter config (name, tools, model, skills)
3. **Skills** (`.claude/skills/*/SKILL.md`) — Progressive guidance activated by context

## Configuration Files

- `agent-registry.json`: Agent metadata with triggers, keywords, intent patterns
- `skill-rules.json`: Skill activation rules with prompt/file triggers
- `context.json`: Runtime state (active domain, skill cache)
- `settings.json`: Hook configuration and event bindings

## Observability

**Schemas** (`.claude/schemas/*.json`): delegation-log, subagent-runs-log, evaluation-history-log
**Logs** (`.claude/logs/*.jsonl`): delegation, subagent-runs, skill-matches
**Evaluation** (`.claude/memory/evaluation-history.jsonl`): 4-D verdicts with taskHash

## Workflows

### Delegation Flow
```
User Request → Maestro → Agent (with skill) → 4-D Evaluation → EXCELLENT or NEEDS REFINEMENT
```

### 3P Format
- **PRODUCT:** What to deliver, acceptance criteria
- **PROCESS:** Steps, skills, constraints
- **PERFORMANCE:** Evidence requirements, return format

### 4-D Evaluation
1. Delegation — right agent/approach?
2. Description — complete and well-explained?
3. Product Discernment — correct, elegant, complete?
4. Process Discernment — sound reasoning?
5. Performance Discernment — meets excellence bar?

Verdict: `EXCELLENT` (accept) or `NEEDS REFINEMENT` (iterate with coaching)

## Activation

- **Explicit:** `/maestro <request>`
- **Auto-detection:** Hooks suggest agents via keyword scoring (+3), intent patterns (+15), operations (+8). Intent classifier suppresses informational queries.

## Performance

- **defer_loading:** 74% token reduction via session-aware skill caching
- **Bun runtime:** 2.4x faster hooks (23ms vs 56ms Node.js)
