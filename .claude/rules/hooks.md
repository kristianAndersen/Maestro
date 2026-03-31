---
globs: .claude/hooks/**
---

# Hook Development Rules

## Setup
```bash
curl -fsSL https://bun.sh/install | bash
cd .claude/hooks && bun install
bun run verify
```

**Dependencies:** Bun >= 1.0.0, minimatch ^9.0.0. Bun provides 2.4x faster execution (23ms avg vs 56ms Node.js).

## Hook Catalog

- `maestro-agent-suggester.js`: Suggests specialized agents (UserPromptSubmit)
- `subagent-skill-discovery.js`: Parent-context skill discovery (UserPromptSubmit). Subagent skill delivery uses native frontmatter preloading.
- `intent-classifier.js` (lib): Suppresses false-positive agent suggestions
- `context-tracker.js`: Tracks active domain and last edited files (PostToolUse)
- `work-tracker.sh`: Logs file modifications to `.maestro-work-log.txt` (PostToolUse)
- `evaluation-reminder.js`: Reminds to run 4-D evaluation (Stop)
- `enforce-4d-evaluation.js`: Enforces mandatory 4-D quality gates (Stop)
- `subagent-error-reporter.js`: Captures subagent metadata to `logs/subagent-runs.jsonl` (SubagentStop)
- `delegation-logger.js`: Logs delegation completions to `logs/delegation.jsonl` (PostToolUse)
- `diary-capture.js`: Captures session memory (Stop)
- `pre-delegation-validator.js`: Validates delegation context (PreToolUse)
- `skill-extraction-detector.js`: Detects skill extraction patterns (UserPromptSubmit)
- `statusline.sh`: Updates status line display (PostToolUse)
- `pre-compact-diary.js`: Captures context before compaction (PreCompact)
- `regression-warning.js`: Warns on routing-critical file modifications (PostToolUse)

## Testing

```bash
# Test agent detection
echo "analyze this code for bugs" | bun .claude/hooks/maestro-agent-suggester.js

# Test skill detection
echo "modify the authentication handler" | bun .claude/hooks/subagent-skill-discovery.js

# Test evaluation reminder
echo "SUBAGENT REPORT: Complete" | bun .claude/hooks/evaluation-reminder.js

# Run all hook tests
cd .claude/hooks && bun run test:agent-detection && bun run test:skill-detection
```

## Regression Testing

336-prompt corpus with automated validation:

```bash
bun .claude/hooks/run-regression.js
# Thresholds: FP must be 0%, Precision >= 85%
```

**Current baseline (2026-03-31):** FP 0% | WA 2.6% | FN 2.6% | Precision 97.4% | Recall 97.4%

CI: Git pre-commit hook runs regression when `agent-registry.json` or `maestro-agent-suggester.js` is staged.

See: `.claude/docs/dataset-refresh-protocol.md` for corpus maintenance.

## Debugging

```bash
chmod +x .claude/hooks/*.js .claude/hooks/*.sh
cat .claude/agents/agent-registry.json | jq '.'
cat .claude/skills/skill-rules.json | jq '.'
cd .claude/hooks && bun pm ls minimatch
cd .claude/hooks && bun install --force  # if corrupted
```

## defer_loading Behavior

- **First time in domain:** Full skill descriptions
- **Continuing same domain:** Cached, not re-recommended
- **New domain/session:** Fresh recommendations

```bash
rm .claude/context.json                              # Reset cache
cat .claude/context.json | jq '.skillTracking.recommended'  # View cache
```
