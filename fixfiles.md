# Plan to Fix Configuration and Agent Files

This document outlines the steps to resolve the "Invalid Settings" and "Agent Parse Errors" reported by the Claude Code diagnostics. The fixes are based on the best practices found in the `@taches-cc-resources-main` directory.

## 1. Fix Invalid Settings in `.claude/settings.json`

The `settings.json` file has an outdated format for hooks, causing the "Expected array, but received undefined" error.

**Best Practice Reference:** `@taches-cc-resources-main/skills/create-hooks/SKILL.md` and its `references/` files.

### Analysis of the Issue

The current `hooks.json` seems to be using an old format. The new format requires hooks to be nested under specific event keys (e.g., `PreToolUse`, `PostToolUse`, `SessionStart`). Each hook definition must be an object containing a `matcher` (to specify which tools trigger the hook) and a `hooks` array (listing the actions to take).

### Plan for Remediation

The `.claude/settings.json` file needs to be read and its `hooks` structure must be migrated to the new format.

**Example of the new format:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'A bash command is about to be run'"
          }
        ]
      }
    ],
    "PostToolUse": [],
    "UserPromptSubmit": [],
    "Stop": [],
    "SubagentStop": [],
    "SessionStart": [],
    "SessionEnd": [],
    "PreCompact": [],
    "Notification": []
  }
}
```

**Action:**
1.  Read the current content of `.claude/settings.json`.
2.  Identify the intended purpose of the existing hooks.
3.  Rewrite the `hooks` object to conform to the new structure, placing the old hook configurations under the correct event keys and adding appropriate matchers. If the original intent isn't clear, a basic structure with empty arrays for each event will be created as a safe starting point.

## 2. Fix Agent Parse Errors in `.claude/agents/`

Eight agent files are missing the required `name` field in their YAML frontmatter.

**Best Practice Reference:** `@taches-cc-resources-main/skills/create-subagents/SKILL.md` and `references/subagents.md`.

### Analysis of the Issue

The subagent specification requires a `name` field in the frontmatter. This name should be unique, lowercase, and use hyphens for spaces. It should also match the filename (without the `.md` extension).

### Plan for Remediation

For each of the 8 agent files listed below, I will add a `name` field to the YAML frontmatter. The name will be derived from the filename.

**Files to Fix:**

1.  `.claude/agents/4d-evaluation.md`
2.  `.claude/agents/base-analysis.md`
3.  `.claude/agents/base-research.md`
4.  `.claude/agents/fetch.md`
5.  `.claude/agents/list.md`
6.  `.claude/agents/open.md`
7.  `.claude/agents/read.md`
8.  `.claude/agents/write.md`

**Action:**
For each file, I will read its content and add the `name` field. For example, for `.claude/agents/base-analysis.md`:

**Current (example):**
```yaml
---
description: An agent for base analysis.
---
...
```

**Proposed Fix:**
```yaml
---
name: base-analysis
description: An agent for base analysis.
---
...
```

This will be applied to all 8 files.
