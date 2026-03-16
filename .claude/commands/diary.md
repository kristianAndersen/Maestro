---
description: Captures episodic memory from current or specified session into structured diary entry for continual learning.
argument-hint: [session-id or "current"]
---

<usage>
/diary [session-id or "current"]
</usage>

You are now delegating to the **diary-writer** agent to capture episodic memory from a Maestro session.

**What This Command Does:**

The diary-writer agent will:
1. Read session artifacts (backup file, work log, context tracking, evaluation history)
2. Analyze session content for accomplishments, delegation patterns, design decisions
3. Identify challenges, solutions, user preferences, and evaluation outcomes
4. Create structured markdown diary entry at `.claude/memory/diary/YYYY-MM-DD-session-N.md`

**Arguments:**

- **No argument or "current"**: Document the most recent session
- **[session-id]**: Document specific session by ID (e.g., "3a2fc1d7-9eb7-4a8e-a8c6-3437f7bb5a09")

**Delegation to DiaryWriter:**

Use the Task tool with `subagent_type='diary-writer'` and provide:

```
PRODUCT:
- Task: Capture episodic memory from session
- Target: $ARGUMENTS (or "current" if not provided)
- Expected: Structured diary entry with accomplishments, patterns, insights, evaluation outcomes
- Acceptance: Complete diary entry with concrete evidence (file paths, line numbers)

PROCESS:
- Step 1: Locate session backup (`.claude/sessions/[id].backup.json`)
- Step 2: Read work log entries (`.maestro-work-log.txt`)
- Step 3: Read context tracking (`.claude/context.json`)
- Step 4: Read evaluation history (`.claude/memory/evaluation-history.jsonl` if exists)
- Step 5: Analyze for accomplishments, delegation patterns, design decisions
- Step 6: Extract challenges, solutions, user preferences, evaluation outcomes
- Step 7: Structure diary entry using standard template
- Step 8: Write to `.claude/memory/diary/YYYY-MM-DD-session-N.md`

PERFORMANCE:
- Comprehensive: All session aspects documented with evidence
- Insightful: Patterns identified, not just facts listed
- Evidence-based: File paths, line numbers, concrete examples
- Structured: Standard format for future parsing by reflection agents
- Learning-oriented: Captures knowledge for continual improvement
```

**After DiaryWriter Returns:**

Review the diary entry summary and confirm:
- Diary file was created at `.claude/memory/diary/[filename]`
- All required sections are present
- Evidence and patterns are captured
- User is informed of successful memory capture

**Example Usage:**

```
User: /diary current
→ Captures memory from most recent session

User: /diary 3a2fc1d7-9eb7-4a8e-a8c6-3437f7bb5a09
→ Captures memory from specified session
```

**Why This Matters:**

Diary entries enable continual learning by preserving episodic memory. Future reflection agents will analyze patterns across sessions to:
- Identify delegation effectiveness trends
- Discover skill utilization patterns
- Extract quality improvement insights
- Understand user preferences evolution
- Optimize framework performance

The diary system is Phase 1 of Maestro's learning capability, implementing the Claude Diary methodology for AI continual learning.
