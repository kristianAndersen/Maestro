---
name: delegater
description: Multi-agent coordination patterns, dependency analysis, parallel/sequential execution strategies
applies_to: Multi-agent workflows, task coordination, execution optimization
version: 1.0
---

# Delegater Skill

## Purpose

This skill provides comprehensive guidance for coordinating multi-agent execution. It helps you analyze dependencies, determine optimal execution order (sequential vs parallel), manage data flow between agents, and handle errors in multi-step workflows.

**Core Value:** Transform complex multi-agent workflows into efficient, well-coordinated execution plans.

---

## When This Skill Activates

This skill automatically activates when:
- Coordinating multiple agents in sequence
- Determining if tasks can run in parallel
- Managing data flow between agent calls
- Executing multi-step workflows
- Aggregating results from multiple agents
- Optimizing execution efficiency

**Manual Activation:**
Use Skill tool to activate "delegater" at the start of any coordination task.

---

## Core Principles

### 1. Single Responsibility
Each agent does ONE thing. The delegater coordinates multiple single-purpose agents. Never ask an agent to do work outside its specialty.

### 2. Dependency Analysis First
Understand what depends on what before executing. Improper sequencing breaks workflows and wastes execution time.

### 3. Parallel When Possible
Run independent tasks simultaneously for efficiency. Sequential execution should only be used when dependencies exist.

### 4. Sequential When Required
Run dependent tasks in order, passing data correctly. Never execute a dependent task before its prerequisites complete.

### 5. Data Flow Management
Route outputs from one agent as inputs to the next. Track all data through the pipeline.

---

## Quick Start Pattern

For 80% of coordination tasks, follow this pattern:

```
1. Receive task list from orchestrator/Maestro
2. Identify dependencies (what needs what?)
3. Group independent tasks (can run parallel)
4. Execute in optimal order (parallel first, then sequential levels)
5. Aggregate and return results
```

---

## Coordination Patterns

### Pattern 1: Sequential Chain
**When:** Task B needs output from Task A

**Visual:**
```
A → B → C
```

**Use Case:** "Fetch data, then analyze it, then summarize analysis"

**Implementation:**
```
Step 1: Call Agent A (fetch)
Step 2: Take Agent A's output (data)
Step 3: Call Agent B with data (analyze)
Step 4: Take Agent B's output (analysis)
Step 5: Call Agent C with analysis (summarize)
Step 6: Return Agent C's result
```

**Example:**
```
fetch returns: "Content: API data..."
  ↓
analyze receives: "Analyze this content: API data..."
  ↓
summarize receives: "Summarize this analysis: ..."
```

---

### Pattern 2: Parallel + Aggregate
**When:** Multiple independent tasks, then combine results

**Visual:**
```
A ──┐
    ├──> parallel execution
B ──┘
  ↓
  C (uses both A+B results)
```

**Use Case:** "Fetch from 3 URLs, then compare all"

**Implementation:**
```
Step 1: Call all independent agents in parallel (multiple Task calls in one message)
Step 2: Collect all results
Step 3: Call aggregator agent with combined results
Step 4: Return aggregated result
```

**Example:**
```
Parallel execution (one message):
  fetch(url1) → content1
  fetch(url2) → content2
  ↓
Sequential (after both complete):
  compare(content1, content2) → comparison result
```

---

### Pattern 3: Fan-Out, Fan-In
**When:** One input → multiple processors → one aggregator

**Visual:**
```
         ┌──> Agent A
input  ──┼──> Agent B  (all parallel)
         └──> Agent C
              ↓
         aggregate results
```

**Use Case:** "Analyze this file for security issues, performance issues, and style issues, then create combined report"

**Implementation:**
```
Step 1: Receive initial input
Step 2: Execute A, B, C in parallel with same input
Step 3: Collect all results
Step 4: Aggregate: combine all findings
Step 5: Return combined output
```

**Example:**
```
Parallel (same input to all):
  security_check(file) → security_findings
  performance_check(file) → performance_findings
  style_check(file) → style_findings
  ↓
Sequential:
  aggregate(security, performance, style) → combined_report
```

---

### Pattern 4: Pipeline
**When:** A → B → C → D (each step depends on previous)

**Visual:**
```
A → B → C → D
```

**Use Case:** "Fetch data, transform to JSON, validate schema, store to database"

**Implementation:**
```
Step 1: Execute A, capture output_A
Step 2: Execute B with output_A, capture output_B
Step 3: Execute C with output_B, capture output_C
Step 4: Execute D with output_C, capture final_result
Step 5: Return final_result
```

**Example:**
```
fetch → raw_data
  ↓
transform(raw_data) → json_data
  ↓
validate(json_data) → validated_data
  ↓
store(validated_data) → confirmation
```

---

### Pattern 5: Conditional Branching
**When:** Next steps depend on results of previous steps

**Visual:**
```
A → check result → B1 (if condition X)
                 → B2 (if condition Y)
```

**Use Case:** "Fetch data, if valid process it, if invalid fetch from backup source"

**Implementation:**
```
Step 1: Execute A, capture result
Step 2: Evaluate result
Step 3a: If condition X met, execute B1
Step 3b: If condition Y met, execute B2
Step 4: Continue with chosen path
```

---

## Dependency Analysis

### The Core Question
For each task pair (A, B), ask:
**"Does B need A's output to execute?"**

- **YES** → A must run before B (sequential dependency)
- **NO** → A and B can run in parallel (independent)

### Decision Matrix

| Scenario | Dependency Type | Execution Strategy |
|----------|----------------|-------------------|
| B needs A's data | Sequential | A → wait → B |
| A and B independent | Parallel | A + B simultaneous |
| C needs both A and B | Fan-in | A+B parallel → C sequential |
| A splits to B and C | Fan-out | A → B+C parallel |
| Conditional on A's result | Conditional | A → evaluate → branch |

### Dependency Analysis Steps

**Step 1: List all tasks**
```
Tasks: fetch(url1), fetch(url2), compare, summarize
```

**Step 2: Map dependencies**
```
- fetch(url1): No dependencies
- fetch(url2): No dependencies  
- compare: Needs fetch(url1) AND fetch(url2)
- summarize: Needs compare
```

**Step 3: Build levels**
```
Level 1 (parallel): fetch(url1), fetch(url2)
Level 2 (sequential): compare (waits for Level 1)
Level 3 (sequential): summarize (waits for Level 2)
```

**Step 4: Create execution plan**
```
Execute Level 1 → Wait for all → Execute Level 2 → Wait → Execute Level 3
```

---

## Data Flow Management

### Core Rule
**Agent outputs become next agent's inputs**

### Pattern: Direct Pass-Through
```
Agent A output: "Result: X"
  ↓ (extract X)
Agent B input: "Process this: X"
```

### Pattern: Multiple Inputs Aggregate
```
Agent A output: result_A
Agent B output: result_B
  ↓ (combine)
Agent C input: "Compare result_A and result_B"
```

### Pattern: Transform Before Passing
```
Agent A output: "Complex data structure..."
  ↓ (extract relevant part)
Agent B input: "Just the core data needed"
```

### Data Flow Tracking

Keep track of data through workflow:

```
Step 1: fetch returns content1, content2
  Data State: {content1: "...", content2: "..."}

Step 2: analyze(content1, content2) returns analysis
  Data State: {content1: "...", content2: "...", analysis: "..."}

Step 3: summarize(analysis) returns summary
  Data State: {content1: "...", content2: "...", analysis: "...", summary: "..."}

Final Return: summary
```

---

## Progress Tracking

### When to Use TodoWrite

Use TodoWrite for workflows with **3 or more steps** to provide visibility.

### TodoWrite Pattern

**Initial State:**
```javascript
TodoWrite([
  {content: "Phase 1: Data collection", status: "in_progress"},
  {content: "Phase 2: Data processing", status: "pending"},
  {content: "Phase 3: Report generation", status: "pending"}
])
```

**After Phase 1:**
```javascript
TodoWrite([
  {content: "Phase 1: Data collection", status: "completed"},
  {content: "Phase 2: Data processing", status: "in_progress"},
  {content: "Phase 3: Report generation", status: "pending"}
])
```

**After Phase 2:**
```javascript
TodoWrite([
  {content: "Phase 1: Data collection", status: "completed"},
  {content: "Phase 2: Data processing", status: "completed"},
  {content: "Phase 3: Report generation", status: "in_progress"}
])
```

**Final:**
```javascript
TodoWrite([
  {content: "Phase 1: Data collection", status: "completed"},
  {content: "Phase 2: Data processing", status: "completed"},
  {content: "Phase 3: Report generation", status: "completed"}
])
```

---

## Error Handling Strategies

### Strategy 1: Fail Fast (Critical Tasks)
**When:** Task is critical to workflow, cannot proceed without it

**Implementation:**
```
If critical agent fails:
  - Stop execution immediately
  - Return error with details
  - Don't proceed to dependent tasks
  - Report to Maestro for user notification
```

**Example:**
```
fetch(database_credentials) → FAIL
  ↓
STOP: Cannot proceed without credentials
Return error: "Critical task failed: fetch database credentials"
```

---

### Strategy 2: Continue with Partial Results (Optional Tasks)
**When:** Task is optional, workflow can proceed without it

**Implementation:**
```
If optional agent fails:
  - Note the failure
  - Continue with available data
  - Include failure note in final result
  - Proceed with remaining tasks
```

**Example:**
```
fetch(url1) → SUCCESS: content1
fetch(url2) → FAIL: timeout
  ↓
CONTINUE: Proceed with content1 only
analyze(content1) → analysis
Return: analysis + note("url2 fetch failed")
```

---

### Strategy 3: Retry (Transient Failures)
**When:** Failure appears transient (network timeout, temporary unavailability)

**Implementation:**
```
If agent fails with transient error:
  - Retry up to 2 times with brief delay
  - If succeeds, continue normally
  - If still failing after 2 retries, apply Strategy 1 or 2
```

**Example:**
```
fetch(url) → FAIL: timeout
  ↓
Retry 1: fetch(url) → FAIL: timeout
  ↓
Retry 2: fetch(url) → SUCCESS: content
  ↓
Continue with content
```

---

## Optimization Techniques

### Technique 1: Maximize Parallelism
**Always ask:** "Can these tasks run simultaneously?"

**Example:**
```
❌ Bad (unnecessary sequencing):
fetch(url1) → wait → fetch(url2) → wait → fetch(url3)
Total time: 3x fetch time

✅ Good (parallel when possible):
fetch(url1) + fetch(url2) + fetch(url3) simultaneously
Total time: 1x fetch time
```

---

### Technique 2: Minimize Data Transfer
**Pass only what's needed** to next agent

**Example:**
```
❌ Bad (passing everything):
analyze receives: "Analyze this 10MB document: [entire document]"

✅ Good (passing relevant parts):
analyze receives: "Analyze these key sections: [relevant 100KB]"
```

---

### Technique 3: Early Validation
**Validate inputs before expensive operations**

**Example:**
```
✅ Good flow:
validate_input → (if valid) → expensive_processing
                 (if invalid) → fail fast

❌ Bad flow:
expensive_processing → discover invalid input → wasted work
```

---

## Anti-Patterns (What NOT to Do)

### ❌ Anti-Pattern 1: Sequential When Parallel Possible
```
BAD:
  Fetch url1
  Wait
  Fetch url2
  Wait
  Fetch url3

GOOD:
  Fetch url1, url2, url3 in parallel
  Wait for all
  Continue
```

---

### ❌ Anti-Pattern 2: Parallel When Dependencies Exist
```
BAD:
  Call analyze() before fetch() completes
  → analyze has no data to work with

GOOD:
  Call fetch() first
  Wait for result
  Call analyze() with fetch result
```

---

### ❌ Anti-Pattern 3: Lost Data Flow
```
BAD:
  Agent A returns: "Result: important_data"
  Agent B receives: "Do your thing" (no data!)
  → B has no input to work with

GOOD:
  Agent A returns: "Result: important_data"
  Agent B receives: "Process this: important_data"
```

---

### ❌ Anti-Pattern 4: No Progress Tracking
```
BAD:
  10-step workflow with no visibility
  User/Maestro has no idea what's happening

GOOD:
  TodoWrite tracking at each major phase
  Clear progress visibility
```

---

### ❌ Anti-Pattern 5: Over-Coordination
```
BAD:
  Use delegater for single-agent task
  Unnecessary coordination overhead

GOOD:
  Delegater for multi-agent workflows only
  Single agents execute directly
```

---

## Real-World Examples

### Example 1: Research Multiple Files and Synthesize

**Task:** "Research authentication patterns in auth.py, middleware.py, and routes.py, then synthesize findings"

**Dependency Analysis:**
- Research auth.py: Independent
- Research middleware.py: Independent
- Research routes.py: Independent
- Synthesize: Depends on ALL research tasks

**Execution Plan:**
```
Level 1 (parallel): Research all 3 files simultaneously
Level 2 (sequential): Synthesize findings from all 3
```

**Implementation:**
```
Step 1: TodoWrite([
  {content: "Research 3 files", status: "in_progress"},
  {content: "Synthesize findings", status: "pending"}
])

Step 2: Parallel execution (one message, 3 Task calls):
  base-research(auth.py) → findings1
  base-research(middleware.py) → findings2
  base-research(routes.py) → findings3

Step 3: Collect results

Step 4: TodoWrite update (research completed)

Step 5: Sequential execution:
  base-analysis("Synthesize: findings1, findings2, findings3") → synthesis

Step 6: TodoWrite update (synthesis completed)

Step 7: Return synthesis result
```

---

### Example 2: Fetch External Data and Process

**Task:** "Fetch data from API endpoint, validate schema, transform to CSV, store to file"

**Dependency Analysis:**
- Fetch: No dependencies
- Validate: Needs fetch output
- Transform: Needs validated data
- Store: Needs transformed data

**Execution Plan:**
```
Pipeline: fetch → validate → transform → store
(All sequential due to dependencies)
```

**Implementation:**
```
Step 1: TodoWrite([
  {content: "Fetch from API", status: "in_progress"},
  {content: "Validate and transform", status: "pending"},
  {content: "Store to file", status: "pending"}
])

Step 2: fetch agent → raw_data

Step 3: TodoWrite update (fetch completed)

Step 4: validate agent with raw_data → validated_data

Step 5: transform agent with validated_data → csv_data

Step 6: TodoWrite update (validate+transform completed)

Step 7: file-writer agent with csv_data → confirmation

Step 8: TodoWrite update (all completed)

Step 9: Return confirmation
```

---

## Advanced Topics (Progressive Disclosure)

For complex coordination scenarios, see:

- **`assets/dependency-analysis.md`** - Advanced dependency detection algorithms
- **`assets/parallel-optimization.md`** - Maximizing parallel execution efficiency
- **`assets/data-flow-patterns.md`** - Complex data routing between agents
- **`assets/error-recovery.md`** - Sophisticated error handling and retry strategies

---

## Quick Reference Card

### Parallel Execution
```
Multiple Task calls in ONE message → Parallel execution
```

### Sequential Execution
```
Wait for result → Extract data → Next Task call → Sequential
```

### Dependency Check
```
Does B need A's output? → Sequential
B independent of A? → Parallel
```

### Data Passing
```
Agent output → Extract relevant data → Include in next agent's prompt
```

### Progress Tracking
```
3+ steps? → Use TodoWrite to show progress
```

### Error Handling
```
Critical task fails? → Fail fast, stop workflow
Optional task fails? → Continue with partial results
Transient failure? → Retry up to 2 times
```

---

## Success Metrics

Coordination is successful when:

✅ All tasks executed in optimal order (parallel when possible)
✅ Zero broken dependencies (no task ran before prerequisites)
✅ Data flowed correctly between all agents
✅ No lost outputs or missing inputs
✅ Final result properly aggregated and returned
✅ Progress visible for complex workflows (TodoWrite)
✅ Efficient execution (maximum parallelism achieved)
✅ Errors handled gracefully (fail fast or continue with partial)

---

**Remember:** You are the conductor coordinating the orchestra, not the musicians playing instruments. Analyze, plan, execute optimally, and aggregate results.
