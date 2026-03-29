---
name: write
description: Code and file modification guidance — Edit vs Write tool selection, safety checks, and read-after-write verification. Use whenever creating files, modifying code, fixing bugs, or updating documentation. Always activate before making changes — the read-before-write and verify-after-write patterns prevent subtle breakage that's hard to trace later.
---

# Write Skill

## Quick Start

For 80% of modification operations:

1. **Read before writing** — Always read the file first to understand context
2. **Edit over Write** — Prefer Edit for existing files, Write only for new files
3. **Small, focused changes** — Make one logical change at a time
4. **Verify immediately** — Read the file back after every write; never assume success
5. **Re-Read before every Edit** — File state may have changed since your last read

## Write Modes

**Lite Mode (default):** Write + read-after-write verify. No retry protocol. Used for standard file operations.

**Resilient Mode:** Full retry protocol with ghost write detection. Load `assets/resilience.md`. Used only when delegator flags `high-risk: true` or for critical infrastructure files.

Agents should default to Lite Mode. The resilience asset is a recovery resource, not a pre-flight requirement.

## Tool Selection: Edit vs Write

### Use Edit When:
- Modifying existing files (targeted changes, bug fixes, config updates)
- 1-2 surgical changes to a section

### Use Write When:
- Creating new files that don't exist yet
- Making 3+ changes to an existing file (full replacement avoids Edit uniqueness failures)
- Changing >30% of file content (sequential Edits become fragile)

### Never:
- Use Edit without re-Reading the file immediately before (stale snapshots cause "file modified since read" errors)
- Plan multiple Edits from a single Read snapshot — re-Read before EACH Edit
- Make multiple unrelated changes in one Edit

## Write Reliability Protocol

Hard rules for all subagents — these are not optional:

1. **Re-Read before every Edit** — The file may change between operations (hooks, formatters, other processes). Always re-Read immediately before each Edit call.
2. **Read-after-write verification** — After every Write or Edit, read the file back to confirm content matches intent. No write is successful without verification.
3. **Multi-change threshold** — 3+ edits or >30% content change → use Write (full replacement) instead of sequential Edits.
4. **Changeset fallback** — If write fails after 3 attempts, return a structured changeset to the parent agent for direct application instead of silently failing.
5. **Domain separation** — Hooks own tracking files (context.json, work logs). Subagents own source files. Never cross domains — it causes race conditions.

## Safe Modification Workflow

**Step 1: Read and Understand**
- Read the file to understand its structure and purpose
- Locate the exact section you need to change

**Step 2: Plan the Change**
- What is the minimal change required?
- What could break? How will you verify it works?
- If 3+ edits needed → plan a full Write instead

**Step 3: Make the Change**
- New file → Write tool
- Existing file (1-2 changes) → Edit tool (re-Read immediately before)
- Existing file (3+ changes or >30%) → Write tool (full replacement)

**Step 4: Verify**
- Read the file back immediately
- Check syntax (see verification commands in `assets/patterns.md`)
- Run tests if applicable

## Core Safety Rules

**Preserve formatting:**
- Exact indentation (tabs vs spaces)
- Existing line endings (LF vs CRLF)
- Import organization (don't reorder unnecessarily)

**Before modifying:**
- Confirm file exists if using Edit
- Confirm file does NOT exist if using Write
- Understand what depends on the code you're changing

**After modifying:**
- Syntax check immediately
- Run affected tests
- Verify no side effects in callers

## Quick Reference

**Decision: Edit or Write?**

```
File exists?
  Yes + 1-2 changes  → Edit (re-Read first)
  Yes + 3+ changes   → Write (full replacement)
  No                 → Write (create new)
```

**Modification Checklist**

```
Before:
  ☐ Read file (if exists)
  ☐ Understand context and dependencies
  ☐ Plan minimal change
  ☐ Decide: Edit or Write?

During:
  ☐ Re-Read immediately before each Edit
  ☐ Preserve formatting
  ☐ Make one focused change

After:
  ☐ Read file back (mandatory)
  ☐ Syntax check
  ☐ Run tests
  ☐ Check for side effects
```

## Assets (Load When Needed)

- **`assets/patterns.md`** — Concrete modification patterns (add function, refactor, update config), verification strategy levels (syntax → unit → integration → manual), and pre/post safety check bash commands. Load when you need step-by-step examples or language-specific patterns.
- **`assets/methodology.md`** — Advanced strategies (Red-Green-Refactor, Incremental Change, Parallel Path, Strangler Fig), safety protocols with bash scripts, testing approaches. Load for complex refactoring or high-risk changes.
- **`assets/troubleshooting.md`** — Edit failures (string not found, indentation corruption), breaking changes, test failures, rollback strategies, edge cases, and anti-pattern reference. Load when something goes wrong or to review common mistakes.
- **`assets/resilience.md`** — Retry logic, ghost write detection, read-after-write verification protocol, Bash heredoc fallback. Load ONLY in Resilient Mode or when encountering write errors. Not needed for standard writes.
