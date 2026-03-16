---
description: Analyzes diary entries to extract patterns and propose CLAUDE.md improvements for continual framework learning.
argument-hint: ["all" | "last N days" | "YYYY-MM-DD to YYYY-MM-DD"]
---

<usage>
/reflect [all | last N days | YYYY-MM-DD to YYYY-MM-DD]
</usage>

You are now delegating to the **reflector** agent to analyze episodic memory and propose framework improvements.

**What This Command Does:**

The reflector agent will:
1. Read unprocessed diary entries from `.claude/memory/diary/`
2. Analyze CLAUDE.md for current directives
3. Read evaluation history (if available) for quantitative data
4. Identify 4 pattern types:
   - Rule Violations (failures despite following instructions)
   - Weak Directives (recurring issues from unclear guidance)
   - Recurring Successful Patterns (strategies that consistently work)
   - User Preference Patterns (communication/working style trends)
5. Propose specific CLAUDE.md updates (section, line, exact text)
6. Update context.json with user preferences
7. Update processed.log to prevent duplicate analysis
8. Create reflection report at `.claude/memory/reflections/YYYY-MM-reflection-N.md`

**Arguments:**

- **No argument or "all"**: Analyze all unprocessed diary entries (recommended)
- **"last N days"**: Analyze only unprocessed diaries from last N days (e.g., "last 7 days")
- **"YYYY-MM-DD to YYYY-MM-DD"**: Analyze diaries within specific date range

**Examples:**

```
/reflect
→ Analyzes all unprocessed diary entries

/reflect all
→ Same as above (explicit "all")

/reflect last 7 days
→ Analyzes unprocessed diaries from last week only

/reflect 2025-12-01 to 2025-12-07
→ Analyzes unprocessed diaries from Dec 1-7, 2025
```

**Delegation to Reflector:**

Use the Task tool with `subagent_type='reflector'` and provide:

```
PRODUCT:
- Task: Analyze diary entries for patterns and propose CLAUDE.md improvements
- Target: $ARGUMENTS (or "all unprocessed" if not provided)
- Expected: Structured reflection report with:
  * 4 pattern types analyzed (Rule Violations, Weak Directives, Successful Patterns, User Preferences)
  * Specific CLAUDE.md proposals (section, line, exact text, rationale, expected benefit)
  * User preferences updated in context.json
  * Processed.log updated with analyzed diaries
- Acceptance: Complete reflection with evidence-based patterns and actionable proposals

PROCESS:
- Step 1: Read `.claude/memory/processed.log` to identify unprocessed diaries
- Step 2: Discover available diaries with Glob pattern `.claude/memory/diary/*.md`
- Step 3: Filter to unprocessed diaries (not in processed.log)
- Step 4: Apply date range filter if specified in arguments
- Step 5: Read all target diary entries
- Step 6: Read `/Users/awesome/dev/devtest/Maestro/CLAUDE.md` for current directives
- Step 7: Read `.claude/memory/evaluation-history.jsonl` (if exists)
- Step 8: Read `.claude/context.json` for existing user preferences
- Step 9: Analyze for Pattern Type 1 (Rule Violations - failures despite following instructions)
- Step 10: Analyze for Pattern Type 2 (Weak Directives - recurring issues from unclear guidance)
- Step 11: Analyze for Pattern Type 3 (Successful Patterns - strategies that consistently work)
- Step 12: Analyze for Pattern Type 4 (User Preferences - communication/working style trends)
- Step 13: Generate specific CLAUDE.md proposals with location, text, rationale, benefit
- Step 14: Update context.json with merged user preferences
- Step 15: Update processed.log with analyzed diary filenames
- Step 16: Write reflection report to `.claude/memory/reflections/YYYY-MM-reflection-N.md`

PERFORMANCE:
- Comprehensive: All unprocessed diaries analyzed, all 4 pattern types addressed
- Specific: CLAUDE.md proposals include section, line number, exact text (not vague)
- Evidence-based: Every pattern supported by specific diary references (filename, section)
- Actionable: Proposals are concrete and user-reviewable (non-destructive)
- Traceable: Complete references to source data (diaries, CLAUDE.md lines, eval history)
- Persistent: processed.log prevents duplicate analysis, context.json preserves preferences
```

**After Reflector Returns:**

Review the reflection summary and inform user:

1. **Pattern Summary:**
   - Number of rule violations detected
   - Number of weak directives identified
   - Number of successful patterns found
   - User preferences extracted/updated

2. **CLAUDE.md Proposals:**
   - Number of proposals generated
   - Brief description of key proposals
   - Location of full reflection report

3. **Next Steps:**
   - User should review reflection report: `.claude/memory/reflections/[filename]`
   - User evaluates each CLAUDE.md proposal
   - User decides which proposals to approve/modify/reject
   - User implements approved changes (manually or via file-writer agent)

**Important Notes:**

- **Non-Destructive:** Reflector NEVER modifies CLAUDE.md automatically. All proposals require user review and approval.
- **Deduplication:** processed.log tracks analyzed diaries to prevent duplicate analysis across reflection runs
- **User Preferences:** context.json userPreferences object persists across sessions (preserved by session-finalizer.js)
- **Frequency:** Run reflection weekly or after accumulating 5-10 new diary entries for best pattern detection

**Why This Matters:**

Reflection is the "learning loop" of Maestro's continual learning system:
- **Diary entries** = Episodic memory (what happened)
- **Reflection** = Pattern extraction (what it means)
- **CLAUDE.md updates** = Procedural memory (how to improve)

This implements the Claude Diary methodology:
1. Capture experience (diary-writer)
2. Reflect on patterns (reflector)
3. Update instructions (user reviews and approves CLAUDE.md changes)
4. Iterate and improve (framework evolves based on evidence)

**Expected Output Location:**

Reflection report: `.claude/memory/reflections/YYYY-MM-reflection-N.md`

Structure:
- Analyzed diaries list
- Rule Violations section
- Weak Directives section
- Recurring Successful Patterns section
- User Preference Patterns section
- Proposed CLAUDE.md Updates section
- User Preferences Update summary
- Reflection metadata
- Raw data references

**Example Workflow:**

```
# After several sessions documented with /diary

User: /reflect
→ Reflector analyzes all unprocessed diaries
→ Generates reflection report with patterns and proposals
→ User reviews proposals in reflection report
→ User approves specific CLAUDE.md updates
→ User implements approved changes

# Future sessions benefit from improved CLAUDE.md
# Repeat cycle: diary → reflect → improve
```
