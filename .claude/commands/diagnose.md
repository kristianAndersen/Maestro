---
description: Query subagent error logs to diagnose failures — filter by status, agent type, or show recent runs.
argument-hint: [errors|all|<agent-type>] [count]
---

<usage>
/diagnose [filter] [count]
</usage>

You are now querying the subagent error log at `.claude/logs/subagent-runs.jsonl` to help diagnose subagent failures.

**Arguments:**

- **No argument**: Show the 10 most recent errors (status="error" or "empty")
- **`errors`**: Show all errors (same as no argument)
- **`all`**: Show all runs regardless of status (success, error, recovered, empty)
- **`recovered`**: Show runs where errors occurred but the agent recovered
- **`<agent-type>`**: Filter by agent type (e.g., `base-research`, `file-writer`, `Explore`)
- **`[count]`**: Optional number of entries to show (default: 10)

**Examples:**
- `/diagnose` — last 10 errors
- `/diagnose all 20` — last 20 runs of any status
- `/diagnose base-research` — last 10 base-research runs
- `/diagnose recovered` — last 10 recovered errors

**How to execute:**

1. Read the log file at `.claude/logs/subagent-runs.jsonl`
2. Parse the arguments to determine filter and count
3. Filter and sort entries by timestamp (most recent first)
4. For each matching entry, display a summary table with:
   - Timestamp (relative, e.g., "2h ago")
   - Agent type
   - Status (with visual indicator)
   - Error count
   - First error snippet (truncated to 80 chars)
   - Transcript path (if available, for deep investigation)

**Status indicators:**
- `error` — subagent failed, errors detected in output
- `empty` — subagent returned nothing (possible crash or context limit)
- `recovered` — errors occurred but agent self-recovered
- `success` — clean completion

**If the log file doesn't exist or is empty**, tell the user:
> No subagent runs logged yet. The error reporter hook fires on SubagentStop — run some subagents and check back.

**For deep investigation**, suggest the user read the transcript file:
> To see the full subagent conversation, I can read the transcript at `<path>`.

**Argument parsing:**

```
$ARGUMENTS = the raw argument string

Parse as: [filter] [count]
- If argument is a number, treat as count with filter="errors"
- If argument is "errors", "all", "recovered", "empty", treat as status filter
- Otherwise treat as agent-type filter
- Second argument (if present and numeric) is count
```
