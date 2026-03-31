# Maestro + Agent Teams Hybrid Architecture Spec

**Status:** Draft — for review and phased implementation  
**Requires:** Claude Code v2.1.32+, Agent Teams experimental flag, Bun >= 1.0.0  
**Date:** 2025-03-25

---

## 1. Executive Summary

This spec defines a hybrid architecture combining Maestro's orchestration methodology with Claude Code's native Agent Teams feature. Maestro operates as Team Lead, spawning Teammates with structured 3P prompts and routing outputs through async 4-D quality gates triggered by the TeammateIdle hook. The result is true parallel execution without sacrificing the quality framework that distinguishes Maestro from raw multi-agent systems.

---

## 2. Architecture Overview

```
User Request
     |
     v
+--------------------+
|   MAESTRO           |  <-- Team Lead role
|   (Conductor)       |
|   - Analyzes task   |
|   - Plans delegation|
|   - Routes coaching |
+--------------------+
     |           |
     | spawn     | spawn
     v           v
+----------+ +----------+
| Teammate | | Teammate |  <-- 3P-prompted, skill-loaded
|  Agent A | |  Agent B |
| (working)| | (working)|
+----------+ +----------+
     |           |
     | TeammateIdle hook fires when either goes idle
     v
+---------------------+
|  4-D Evaluation     |  <-- Async background subagent
|  (quality gate)     |
|  Reads task output  |
|  Returns verdict    |
+---------------------+
     |
     +-- EXCELLENT --> Task marked complete, teammate released
     |
     +-- NEEDS REFINEMENT --> Coaching message via mailbox
                               |
                               v
                          Teammate resumes
                          with coaching context
```

**Key Flow Invariants:**
- Every teammate output passes 4-D evaluation before acceptance
- Maestro (Team Lead) never executes work directly
- Refinement coaching is always routed through mailbox, not by re-spawning

---

## 3. Component Mapping

| Maestro Concept | Agent Teams Equivalent | Notes |
|---|---|---|
| Maestro Conductor | Team Lead | Same role, native execution context |
| Task tool delegation | Teammate spawning | 3P prompt becomes teammate system prompt |
| 4-D Evaluation agent | Async subagent triggered by TeammateIdle | Hook-driven, not inline |
| Refinement coaching | Mailbox message to teammate | Teammate resumes from idle |
| Skill discovery | Unchanged — `.claude/skills/` | Teammates load skills same as today |
| Agent registry | Unchanged — `agent-registry.json` | Team Lead uses registry to select right teammate type |
| Delegater agent | Task dependency queue | Native dependency graph replaces Delegater for parallel work |
| Healing loop (max 3) | Mailbox message count | Team Lead tracks iteration count per task |

---

## 4. Async 4-D Evaluation Pattern

This is the core innovation. Today, evaluation is synchronous and blocks the conductor. In the hybrid, TeammateIdle triggers async evaluation.

### Hook: `teammate-idle-evaluator.js`

```javascript
// .claude/hooks/teammate-idle-evaluator.js
// Trigger: TeammateIdle event
// Purpose: Spawn 4-D evaluation for completed teammate work

import { execSync } from 'child_process';

const event = JSON.parse(process.env.CLAUDE_HOOK_EVENT || '{}');
const { teammateId, taskId, completionData } = event;

// Only evaluate if task is marked complete (not mid-work idle)
if (!completionData?.status === 'completed') {
  process.exit(0);
}

// Build evaluation delegation
const evaluationPrompt = `
PRODUCT:
- Task: Evaluate teammate ${teammateId} output for task ${taskId}
- Original Requirement: ${completionData.originalRequirement}
- Expected: Verdict (EXCELLENT or NEEDS REFINEMENT) with coaching
- Done-When: All 4-D gates assessed, verdict issued

PROCESS:
- Activate 4d-evaluation skill
- Evaluate the work product embedded below
- Return structured 4-D evaluation report

PERFORMANCE:
- Cite specific evidence from work product
- If NEEDS REFINEMENT: provide actionable coaching
- Framework-agnostic evaluation

WORK PRODUCT:
${completionData.report}
`;

// ASSUMPTION: TeammateIdle hooks can spawn subagents via Task tool
// This is UNVERIFIED — needs testing in Agent Teams experimental build
// Fallback: Hook writes evaluation request to a queue file,
// Team Lead polls queue on TaskCompleted hook instead

// Notify Team Lead with evaluation result via mailbox
// (exact API TBD — depends on Agent Teams hook capabilities)
```

### Evaluation Routing Logic

```
TeammateIdle fires
       |
       v
Is task status = completed?
  No  --> exit (normal idle, no action)
  Yes --> spawn 4-D evaluation subagent
              |
              v
         Evaluate work product
              |
         +----+----+
         |         |
     EXCELLENT  NEEDS REFINEMENT
         |         |
    Mark task    Send coaching
    complete     to teammate mailbox
    Release      (iteration N of 3)
    teammate         |
                 Teammate resumes
```

---

## 5. Selective Async Strategy

Not everything should be parallelized. Use this decision table:

| Scenario | Strategy | Rationale |
|---|---|---|
| Independent research tasks (A and B with no shared output) | Async teammates | No dependency, full parallelism |
| Sequential pipeline (research → analyze → write) | Task dependency queue | B cannot start until A completes |
| Evaluation | Always async | Terminal read-only step, never blocks |
| Refinement routing | Sync (Team Lead decides) | Team Lead must read coaching and route it |
| Tasks with shared file writes | Sequential with dependency | Race condition risk on concurrent writes |
| Single-step tasks under 30s estimated | Inline (no teammate) | Teammate spawn overhead not worth it |

**Rule of thumb:** Spawn a teammate when work is independently parallelizable AND long-running enough to justify the spawn overhead. For trivial tasks, the Team Lead can inline via existing Task tool.

---

## 6. What Maestro Keeps

These are the advantages Maestro brings that raw Agent Teams lacks:

- **3P delegation format** — Structured PRODUCT/PROCESS/PERFORMANCE prompts give teammates clear success criteria, acceptance conditions, and verification steps. Raw Agent Teams has no equivalent prompt structure.
- **4-D quality gates** — Agent Teams has no built-in evaluation. EXCELLENT/NEEDS REFINEMENT verdict + coaching loop is entirely Maestro's contribution.
- **Skill-based progressive guidance** — `.claude/skills/` system loads domain expertise into teammates without polluting the Team Lead context.
- **Agent registry** — Intelligent teammate selection based on task type, not generic spawning.
- **Iterative refinement with coaching** — Structured healing loop (max 3 iterations) with specific coaching rather than brute-force retry.
- **Evidence requirements** — Teammates must return file:line references, not narrative summaries. Enforced by 3P PERFORMANCE section.

---

## 7. What Agent Teams Adds

These are gaps in current Maestro that Agent Teams resolves:

- **True parallel execution** — Current Maestro blocks the conductor context during each Task tool call. Agent Teams runs teammates genuinely concurrently.
- **Peer-to-peer teammate communication** — Teammates can message each other directly without routing through Team Lead. Useful for handoff patterns (research teammate hands off to analysis teammate).
- **Self-claiming task queues** — Team Lead can post a task list; teammates claim tasks autonomously, reducing bottleneck on coordinator.
- **Native governance hooks** — TeammateIdle and TaskCompleted provide events Maestro's current hooks cannot observe (today's hooks observe Claude Code tool calls, not subagent lifecycle).
- **Split-pane visibility** — tmux/iTerm2 integration shows teammate work in parallel panes, improving debuggability.

---

## 8. Migration Path

### Phase 1 — Baseline (1-2 days)
Enable Agent Teams experimental flag. Spawn a single teammate manually with a 3P prompt. Verify: teammate receives prompt, executes work, returns output. No evaluation yet.

```bash
# Verify Agent Teams is available
claude --version  # Must be v2.1.32+
# Enable experimental flag (exact flag TBD from Claude Code docs)
```

### Phase 2 — TeammateIdle Hook (2-3 days)
Implement `teammate-idle-evaluator.js`. Wire it to TeammateIdle event in `.claude/settings.json`. Test: teammate completes work → hook fires → evaluation subagent spawns → verdict returned. **Critical unknown here — see Risks section.**

### Phase 3 — Coaching Routing (2-3 days)
Build the mailbox messaging path from 4-D evaluation result back to teammate. Implement iteration counter per task (max 3). Test full loop: work → evaluate → NEEDS REFINEMENT → coaching → teammate resumes → re-evaluate → EXCELLENT.

### Phase 4 — Team Lead Mode (3-5 days)
Convert Maestro conductor to operate as Team Lead. Replace Task tool spawning with teammate spawning for parallel-eligible tasks. Keep Task tool for sequential dependencies. Update agent-registry.json with teammate-compatible spawn patterns.

### Phase 5 — Production Tuning (ongoing)
Run real workflows through hybrid. Measure: parallel throughput gain vs. token cost overhead. Tune async/sync boundaries in decision table (Section 5). Identify which task types see the most benefit.

---

## 9. Risks and Open Questions

**Critical unknowns (must resolve before Phase 2):**

| Risk | Severity | Status |
|---|---|---|
| Can TeammateIdle hooks spawn subagents via Task tool? | Critical | Unverified — if NO, evaluation must use queue+poll pattern instead |
| Agent Teams experimental API stability | High | May change between Claude Code releases; pin version |
| Session resume doesn't restore teammates | High | If session interrupted mid-task, teammates are lost; Team Lead must detect and re-spawn |
| No nested teams | Medium | Limits delegation depth — Delegater agent pattern cannot be used within a teammate |
| Token cost ~3-4x with teammates | Medium | Each teammate has its own context; budget accordingly for long workflows |
| Hook reliability at evaluation trigger point | Medium | If TeammateIdle fires before work product is written, evaluation reads incomplete output |
| Race conditions on shared file writes | Medium | Two teammates writing the same file concurrently will corrupt output; must enforce sequential writes via dependency queue |

**Open architectural questions:**
- How does Team Lead receive the 4-D evaluation verdict? Via mailbox? Via a shared task status field? API is unspecified.
- What is the TeammateIdle event payload structure? Does it include task completion data or just teammate ID?
- Can a teammate spawn its own sub-teammates? (Nested teams) If not, complex fan-out patterns need redesign.

---

## 10. Prerequisites

- Agent Teams must exit experimental status, or team accepts API instability risk
- Claude Code v2.1.32+ (verify with `claude --version`)
- Bun >= 1.0.0 (hooks runtime — `bun --version`)
- tmux recommended for parallel teammate visibility (`brew install tmux`)
- Existing Maestro framework intact at `.claude/` (agents, skills, hooks)
- `.claude/settings.json` must support TeammateIdle event binding

---

## Appendix: Example 3P Teammate Prompt

This is what a Maestro Team Lead sends when spawning a research teammate:

```markdown
PRODUCT:
- Task: Research authentication patterns for [target system]
- Target: Codebase at /path/to/src/auth/
- Expected: Analysis of current patterns with security gaps identified
- Acceptance: Every finding has file:line reference and severity rating
- Verify: Grep to confirm all auth handlers found; cross-check against OWASP Top 10
- Done-When: Report written to task output, all handlers covered, gaps ranked by severity

PROCESS:
- Step 1: Activate base-research skill
- Step 2: Map all authentication entry points via Grep
- Step 3: Read each handler for pattern analysis
- Step 4: Cross-reference against known vulnerability patterns
- Step 5: Return structured findings report

PERFORMANCE:
- Evidence required: file:line for every finding
- No vague statements — specific, verifiable claims only
- Return report in base-research standard format
```

---

*Assumptions flagged throughout: TeammateIdle hook spawn capability (Section 4, Section 9), mailbox API shape (Section 4), event payload structure (Section 9). All require verification against Agent Teams experimental documentation before Phase 2.*
