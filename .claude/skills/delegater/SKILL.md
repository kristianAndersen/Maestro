---
name: delegater
description: Coordination skill for agents that delegate or orchestrate across multiple subagents. Guides parallel vs sequential execution, dependency analysis, and data flow between agents. Load when building execution plans or debugging broken multi-step workflows.
applies_to: Multi-agent workflows, task coordination, execution optimization
version: 1.2
---

# Delegater Skill

## Purpose

This skill provides guidance for coordinating multi-agent execution. It helps you analyze dependencies, determine optimal execution order (sequential vs parallel), manage data flow between agents, and handle errors in multi-step workflows.

**Core Value:** Transform complex multi-agent workflows into efficient, well-coordinated execution plans.

---

## Quick Start

For 80% of coordination tasks, follow this pattern:

```
1. Receive task list from orchestrator/Maestro
2. Identify dependencies (what needs what?)
3. Group independent tasks (can run parallel)
4. Execute in optimal order (parallel first, then sequential levels)
5. Aggregate and return results
```

---

## Core Principles

1. **Single Responsibility** — Each agent does ONE thing. Never ask an agent to work outside its specialty.
2. **Dependency Analysis First** — Understand what depends on what before executing.
3. **Parallel When Possible** — Run independent tasks simultaneously. Sequential only when dependencies exist.
4. **Sequential When Required** — Run dependent tasks in order, passing data correctly.
5. **Data Flow Management** — Route outputs from one agent as inputs to the next.
6. **File-Ownership in Parallel Execution** — No two parallel agents may write to the same file. Build a file-ownership manifest before parallel dispatch. See `assets/file-ownership.md`.

---

## Coordination Patterns

### Pattern 1: Sequential Chain
**When:** Task B needs output from Task A
```
A → B → C
```
**Use Case:** "Fetch data, then analyze it, then summarize"

### Pattern 2: Parallel + Aggregate
**When:** Multiple independent tasks, then combine results
```
A ──┐
    ├──> parallel execution
B ──┘
  ↓
  C (uses both A+B results)
```
**Use Case:** "Fetch from 3 URLs, then compare all"

### Pattern 3: Fan-Out, Fan-In
**When:** One input → multiple processors → one aggregator
```
         ┌──> Agent A
input  ──┼──> Agent B  (all parallel)
         └──> Agent C
              ↓
         aggregate results
```
**Use Case:** "Analyze file for security, performance, and style issues"

### Pattern 4: Pipeline
**When:** A → B → C → D (each step depends on previous)
```
fetch → transform → validate → store
```
**Use Case:** "Fetch data, transform to JSON, validate schema, store"

### Pattern 5: Conditional Branching
**When:** Next steps depend on results of previous steps
```
A → check result → B1 (if condition X)
                 → B2 (if condition Y)
```
**Use Case:** "Fetch data, if valid process it, if invalid fetch from backup"

---

## Dependency Analysis

### The Core Question
For each task pair (A, B): **"Does B need A's output to execute?"**
- YES → A must run before B (sequential)
- NO → A and B can run in parallel

### Decision Matrix

| Scenario | Dependency Type | Execution Strategy |
|----------|----------------|-------------------|
| B needs A's data | Sequential | A → wait → B |
| A and B independent | Parallel | A + B simultaneous |
| C needs both A and B | Fan-in | A+B parallel → C sequential |
| A splits to B and C | Fan-out | A → B+C parallel |
| Conditional on A's result | Conditional | A → evaluate → branch |

For a full worked dependency analysis with execution levels, see `assets/advanced-patterns.md`.

---

## Data Flow Management

**Core Rule:** Agent outputs become next agent's inputs.

```
Agent A output: "Result: X"
  ↓ (extract X)
Agent B input: "Process this: X"
```

**Multiple inputs:**
```
Agent A output: result_A
Agent B output: result_B
  ↓ (combine)
Agent C input: "Compare result_A and result_B"
```

**Rule:** Extract only what the next agent needs. Do not pass entire agent reports as raw input — extract the relevant section.

For detailed data flow tracking patterns, see `assets/advanced-patterns.md`.

---

## Progress Tracking

For workflows with **3 or more steps**, include a phase status summary in each agent return report:

```
Phase 1: Data collection — completed
Phase 2: Data processing — in progress
Phase 3: Report generation — pending
```

State the full plan in the first report, then update status as each phase completes.

---

## Error Handling

| Failure Type | Strategy |
|---|---|
| Critical task fails | Fail fast — stop workflow, report to Maestro |
| Optional task fails | Continue with partial results, note the failure |
| Transient failure | Retry up to 2 times, then apply above strategies |

For full error handling walkthroughs with examples, see `assets/advanced-patterns.md`.

---

## Optimization

- **Maximize parallelism** — Multiple Task calls in one message run in parallel. Use it.
- **Minimize data transfer** — Pass relevant sections, not entire documents.
- **Validate early** — Validate inputs before expensive operations to fail fast.

---

## Anti-Patterns

Brief list — load `assets/anti-patterns.md` for detailed examples and remediation.

| Anti-Pattern | Problem |
|---|---|
| Sequential when parallel possible | Wastes execution time |
| Parallel when dependencies exist | Downstream agent has no data |
| Lost data flow | Passing no data to next agent |
| No progress tracking | Workflow opaque to Maestro and user |
| Over-coordination | Delegater overhead for single-agent tasks |
| Parallel file collision | Silent data loss from concurrent writes |
| Passing full agent output as next input | Context pollution in downstream agent |
| Ignoring partial parallel failures | Silent data loss or unnecessary full stop |

---

## Assets (Load on Demand)

| Asset | When to Load |
|---|---|
| `assets/file-ownership.md` | Parallel dispatch with file writes — need the manifest protocol and conflict resolution strategies |
| `assets/advanced-patterns.md` | Full worked examples, step-by-step dependency analysis, data flow tracking, and error handling walkthroughs |
| `assets/anti-patterns.md` | Detailed anti-pattern pairs with code examples and remediation — when debugging a broken workflow or verifying a coordination plan |

---

## Quick Reference Card

```
Parallel execution:
  Multiple Task calls in ONE message → runs in parallel

Sequential execution:
  Wait for result → extract data → next Task call

Dependency check:
  Does B need A's output? → Sequential
  B independent of A?     → Parallel

Data passing:
  Agent output → extract relevant data → include in next prompt

Progress tracking:
  3+ steps? → phase status summaries in each return report

Error handling:
  Critical fails? → fail fast
  Optional fails? → continue with partial results
  Transient?      → retry up to 2 times
```

---

## Success Metrics

Coordination is successful when:

- All tasks executed in optimal order (parallel when possible)
- Zero broken dependencies (no task ran before prerequisites)
- Data flowed correctly between all agents
- No lost outputs or missing inputs
- Final result properly aggregated and returned
- Progress visible for complex workflows
- Efficient execution (maximum parallelism achieved)
- Errors handled gracefully (fail fast or continue with partial)

---

**Remember:** You are the conductor coordinating the orchestra, not the musicians playing instruments. Analyze, plan, execute optimally, and aggregate results.
