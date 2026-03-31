## Session Bootstrap

The Maestro conductor persona is loaded automatically via `"agent": "maestro"` in `.claude/settings.json`. This loads `.claude/agents/maestro.md` as a system-level instruction — that file is the single source of truth for conductor identity and behavior.

**CLAUDE.md is a reference manual, not a persona definition.** It documents the framework architecture, agent catalog, workflows, and configuration — but does not define who Maestro is or how it should behave. That responsibility belongs solely to `maestro.md`.

## Repository Overview

**Maestro** is an AI orchestration framework that implements Anthropic's 4-D methodology (Delegation, Description, Discernment, Diligence). It enables Claude to operate as a conductor that delegates work to specialized subagents, evaluates outputs through quality gates, and iterates until excellence is achieved.

**Core Principle:** Maestro orchestrates through delegation, not direct execution. All work is done by specialized subagents guided by progressive skills. Framework-agnostic — zero bias toward any language, framework, or methodology.

## Key Principles

1. **Delegation First**: All work flows through specialized agents, never direct execution
2. **Native Skill Delivery**: Agents declare skills in frontmatter (`skills: [X]`) for deterministic preloading. One-line activation instruction triggers invocation. The skill discovery hook serves parent-context only.
3. **Quality Gates**: Every output evaluated through 4-D framework before acceptance
4. **Iterative Refinement**: Iterate until excellence achieved, never settle for "good enough"
5. **Evidence-Based**: All claims must include proof with specific file paths and line numbers
6. **Resilient Writes**: Always delegate file writes to m-file-writer (not file-writer)
7. **Observability**: All delegations, evaluations, and subagent runs logged with taskHash correlation

## File Locations

- **Framework Core**: `.claude/` (agents, skills, hooks, commands, rules)
- **Rules**: `.claude/rules/` (path-scoped rules for hooks, agents, skills, framework)
- **Documentation**: `.claude/README.md` (quick start), root `CLAUDE.md` (this file)
- **Work Logs**: `.maestro-work-log.txt` (git-ignored)
- **Context Tracking**: `.claude/context.json` (runtime state, skill cache)
- **Observability**: `.claude/schemas/` (log contracts), `.claude/logs/` (event streams)
- **Session Memory**: `.claude/memory/diary/` (episodic capture)
- **Regression Testing**: `.claude/hooks/test-prompts.json`, `.claude/hooks/run-regression.js`

## Maestro Emoji Protocol

- 🎼 Analyzing request
- 📋 Planning delegation
- 📤 Delegating to agent
- 🔍 Evaluating output
- 🔄 Refining (iteration needed)
- ✅ Complete (excellent)

## Important Notes

- Hooks run automatically on events (UserPromptSubmit, PostToolUse, Stop)
- Agent suggestions are informational, not mandatory
- Skill activation uses native frontmatter preloading + one-line instructions
- All agent work must return to Maestro for 4-D evaluation
- The framework is self-modifying: use `harry` agent to create/update components
- Domain-specific rules are in `.claude/rules/` (loaded by path glob)
