# Maestro v5 — Planning Document

**Status:** Unscoped. Carry-forward items from v4 session (2026-03-29).  
**Context needed to resume:** See "Session context" section below.

---

## v5 Scope Candidates

### 1. Cross-project delegation convention (DESIGN TASK)
**What it is:** A structured task request format that allows Maestro in project A to delegate to an agent in project B via ccchat.

**Current state:** Infrastructure already exists. `chat-ask.js` is technically a functional cross-project delegation primitive. What's missing is a *convention* — a structured message format that receiving agents know to interpret as a task delegation rather than a peer chat message.

**When to start:** Only when someone has a concrete use case. Do not scope speculatively.

**Design questions to answer:**
- What does the structured task request format look like? (analogous to 3P format?)
- How does the receiving agent signal acceptance/rejection?
- How does the sending Maestro wait for completion and receive the result? (chat-ask timeout model vs. polling?)
- How do errors surface back to the conductor?

**Key constraint:** Must not require changes to ccchat's transport layer (SQLite + sentinel files). This is a protocol layer on top of existing infrastructure.

---

### 2. Anti-rationalization compliance validation (OBSERVATIONAL)
**What it is:** Measure whether the wired anti-rationalization table actually changes 4D compliance behavior.

**Current state:** Table is wired and rebuttals display in the warning banner when evaluation is skipped. Not yet tested under adversarial scenarios.

**How to measure:**
1. Baseline: run 5 complex Maestro tasks, record how many skip 4D evaluation (measure via evaluation-history.jsonl count vs delegation.jsonl count)
2. Adversarial: intentionally phrase tasks to trigger common rationalizations ("quick change", "this is simple", etc.)
3. Compare: compliance rate before vs. after with the table wired

**What success looks like:** Compliance rate ≥ 95% (1 in 20 delegations skips evaluation or fewer)

---

### 3. Direct execution fast-path validation (OBSERVATIONAL)
**What it is:** Verify the quality envelope of `complexity: direct` mode on real tasks.

**Current state:** Documented in maestro.md with 4-point caveat. Zero production usage. Quality vs. full delegation is unverified.

**How to validate:**
1. Pick 5 read-only, stateless tasks (file reads, log queries, line counts)
2. Run each twice: once with full delegation, once with `complexity: direct`
3. Compare output quality and wall-clock time
4. Document: does direct execution produce equivalent output? At what task types does quality degrade?

**Expected finding:** Direct execution ≈ full delegation quality for pure read tasks. Unknown for reasoning tasks — should NOT be validated with reasoning tasks in early trials.

---

### 4. ccchat v2 (SEPARATE PROJECT)
**What it is:** Improvements to ccchat itself, not Maestro.

**Deferred items from ccchat debates:**
- SQLite insights table (structured [DECISION] storage, queryable by tag/date)
- Semantic vector search for decision retrieval (LanceDB or SQLite FTS)
- Deferred until: [DECISION] message count crosses ~100 OR grep search becomes a bottleneck

**Current [DECISION] count:** 22 messages as of 2026-03-29. Defer until ~100.

---

## Session Context (what you need to resume)

### Files changed in v1-v4 (current state):

**Maestro hooks:**
- `.claude/hooks/enforce-4d-evaluation.js` — anti-rationalization table wired, rebuttals displaying, taskHash correlation (733 lines)
- `.claude/hooks/delegation-logger.js` — PostToolUse/Agent, writes completion timestamps + taskHash to delegation.jsonl
- `.claude/hooks/context-tracker.js` — atomic writes (renameSync)
- `.claude/hooks/subagent-skill-discovery.js` — atomic writes + isSubagentPrompt() 3P detection
- `.claude/hooks/session-change-detector.js` — atomic writes
- `.claude/hooks/subagent-error-reporter.js` — reads delegation.jsonl for agent name resolution
- `.claude/hooks/delegation-logger.js` — tool matcher is 'Agent' (not 'Task')

**Maestro agents/skills:**
- `.claude/agents/maestro.md` — description trap fixed (WHEN-only), direct-execution-mode section added
- `.claude/skills/ai-pulse/SKILL.md` — description trap fixed (WHEN-only)
- `.claude/skills/ui-ux-design/SKILL.md` — description trap fixed (WHEN-only)
- `.claude/skills/figma/SKILL.md` — frontmatter with WHEN conditions added
- All other skill SKILL.md files — already had WHEN-only descriptions
- `.claude/skills/skill-rules.json` — all short_descriptions already clean (no HOW leakage)

**Maestro schemas:**
- `.claude/schemas/delegation-log.json` — timestamp is COMPLETION not dispatch, agentId always 'unknown'
- `.claude/schemas/subagent-runs-log.json` — 10 fields documented
- `.claude/schemas/evaluation-history-log.json` — taskHash field added, 6 knownLimitations

**Maestro logs (live data):**
- `.claude/logs/delegation.jsonl` — PostToolUse/Agent completions with taskHash
- `.claude/logs/subagent-runs.jsonl` — SubagentStop completions with agentType
- `.claude/memory/evaluation-history.jsonl` — 4D verdicts with taskHash correlation

### Key decisions logged in ccchat #general:
- #1614: JSONL schemas are v3 interface contracts, required before hook refactoring
- #1650: Speed bottleneck = per-delegation overhead (~5-13s), not serial execution
- #1652: v3 logging: PreToolUse dispatch + PostToolUse completion + task hash correlation
- #1663: Direct execution fast-path: declarative tag, 4 caveats, turn-count gate
- #1721: Cross-project delegation deferred — infrastructure exists (chat-ask.js), needs convention spec

### Known limitations to keep in mind:
1. `delegation.jsonl` timestamps are COMPLETION times (PostToolUse), not dispatch times. PreToolUse logs dispatch timestamps separately (item 4).
2. `agentId` is always 'unknown' in delegation.jsonl — Claude Code doesn't expose subagent runtime ID at PostToolUse time.
3. `evaluation-history.jsonl` taskHash correlation uses the most-recent delegation entry — may match wrong agent in parallel dispatch sessions.
4. Context rot: Maestro conductor quality degrades at ~15+ turns. Always delegate in long sessions; avoid `complexity: direct` past turn 15.

### Benchmark results (2026-03-29):
- 3 parallel tasks: 7.3 seconds total wall-clock
- Individual task overhead: 5-13 seconds per delegation (the bottleneck)
- Parallelism: confirmed working (3.5x speedup on independent tasks)
- Optimization ceiling: ~20-30% reduction via lighter ceremony, not 3x

