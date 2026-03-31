# Skill Slimming Plan

**Status:** Ready to execute
**Created:** 2026-03-26
**Context:** Reduce token overhead of 5 bloated skills using progressive disclosure

## Background

Audited 11 skills loaded into system prompt. 5 are bloated and need slimming. 6 are already clean (hallucination-detection, ccchat, agent-creator, 4d-evaluation, fetch, open).

**Official Anthropic guidance confirms:**
- SKILL.md must stay under 500 lines
- Progressive disclosure: Metadata (~100 words) → SKILL.md body (<500 lines) → assets/ (unlimited)
- Description field: 2-3 sentences, conversational, include "when to use" triggers
- Token budget for skills: 2% of context window (~16k chars fallback)

**Skill-creator best practices:**
- Keep it lean — remove things that aren't pulling their weight
- Explain the why, not heavy-handed MUSTs
- Reference assets clearly with guidance on when to read them
- For large reference files (>300 lines), include a table of contents

## Targets

### 1. delegater (CRITICAL — 699 lines, violates 500-line limit)
- **Target:** ~420 lines
- **Has assets/:** Yes — `assets/file-ownership.md` (preserve this)
- **KEEP in SKILL.md:** Quick Start, Core Principles, Coordination Pattern summaries (brief), Dependency Analysis decision matrix, Quick Reference Card
- **MOVE to `assets/advanced-patterns.md`:** Full worked real-world examples (~82 lines), full error handling strategy walkthroughs (~69 lines), optimization technique expansions with bad/good examples (~45 lines)
- **MOVE to `assets/anti-patterns.md`:** Detailed anti-pattern pairs with code examples (~88 lines) — keep only a brief bullet list in SKILL.md
- **Description target:** "Multi-agent coordination patterns for Maestro and agents that delegate work. Use whenever coordinating multiple agents, deciding parallel vs sequential execution, passing data between agents, or building multi-step workflows."

### 2. read (478 lines, borderline)
- **Target:** ~220 lines
- **Has assets/:** Yes — `methodology.md`, `patterns.md`, `troubleshooting.md`
- **KEEP in SKILL.md:** Quick Start, Tool Selection Guide (Read vs Grep vs Glob table), Core Principles (brief), Quick Reference
- **MOVE to `assets/methodology.md`** (append/merge if content exists): 4-phase analysis methodology with bash blocks, analysis strategies with bash blocks
- **MOVE to `assets/patterns.md`** (append/merge if content exists): Pattern Recognition Guide (design patterns table, Python/JS/architecture idioms), comprehension techniques with mental trace examples
- **IMPORTANT:** Read existing assets first — don't duplicate content already there
- **Description target:** "Deep file reading and codebase comprehension. Use whenever reading files to understand how they work, investigating architecture, tracing data flows, or doing multi-file analysis where building a mental model matters."

### 3. write (438 lines)
- **Target:** ~280 lines
- **Has assets/:** Yes — `methodology.md`, `patterns.md`, `troubleshooting.md`, `resilience.md`
- **KEEP in SKILL.md:** Quick Start, Write Reliability Protocol (6-point — high signal), Tool Selection Guide (Edit vs Write decision), Core Safety Rules, Quick Reference
- **MOVE to `assets/patterns.md`** (create or merge): 5 common modification patterns with bash blocks, verification strategy levels with bash blocks
- **MOVE to `assets/troubleshooting.md`** (create if needed): Edge cases, anti-pattern pairs with bad/good examples
- **Description target:** "Code and file modification guidance — Edit vs Write tool selection, safety checks, and read-after-write verification. Use whenever creating files, modifying code, fixing bugs, or updating documentation."

### 4. base-research (335 lines)
- **Target:** ~180 lines
- **Has assets/:** Yes — `methodology.md`, `patterns.md`, `troubleshooting.md`
- **KEEP in SKILL.md:** Quick Start, Core Principles, Source Evaluation Hierarchy (brief), Quick Reference, Inter-Agent Delegation section (brief)
- **MOVE to `assets/methodology.md`** (append/merge): 4-phase methodology walkthrough with bash blocks
- **MOVE to `assets/patterns.md`** (append/merge): 3 research patterns with command examples, documentation practice templates
- **IMPORTANT:** Read existing assets first — methodology content may already be there
- **Description target:** "Information gathering and research methodology. Use whenever investigating unfamiliar topics, finding documentation, researching best practices, or systematically exploring how a system works."

### 5. base-analysis (348 lines)
- **Target:** ~200 lines
- **Has assets/:** Yes — `methodology.md`, `patterns.md`, `troubleshooting.md`
- **KEEP in SKILL.md:** Quick Start, Quality Dimensions framework (brief), 3-Pass Iterative Refinement overview, Code Review Checklist headers, Quick Reference, Inter-Agent Delegation section (brief)
- **MOVE to `assets/methodology.md`** (append/merge): Full OWASP Top 10 list, 3 bash script pattern blocks (Code Quality, Security, Architecture analysis)
- **MOVE to `assets/patterns.md`** (append/merge): 4-tier scoring rubric, Assessment Template, detailed analysis pattern examples
- **Description target:** "Evaluation and quality assessment methodology. Use whenever evaluating code quality, performing security assessments, reviewing architecture, analyzing performance, or assessing technical debt."

## Execution Instructions

For each skill (run sequentially):
1. Read the current SKILL.md fully
2. Read ALL existing assets/ files (don't duplicate)
3. Write new assets files first (or append to existing)
4. Rewrite SKILL.md with slimmed content + clear pointers to assets
5. Verify: re-read SKILL.md, confirm line count under target
6. Verify: re-read assets, confirm content preserved

## Other Fixes Applied This Session

- **m-file-writer permissionMode:** Added `permissionMode: bypassPermissions` to `.claude/agents/m-file-writer.md` frontmatter — subagents no longer need manual approval for writes
- **Other agents to consider:** file-writer, agent-refactorer, harry — all write files but lack permissionMode

## Expected Savings

| Skill | Before | After | Saved |
|---|---|---|---|
| delegater | 699 | ~420 | ~280 lines |
| read | 478 | ~220 | ~258 lines |
| write | 438 | ~280 | ~158 lines |
| base-research | 335 | ~180 | ~155 lines |
| base-analysis | 348 | ~200 | ~148 lines |
| **Total** | **2,298** | **~1,300** | **~999 lines (~43% reduction)** |
