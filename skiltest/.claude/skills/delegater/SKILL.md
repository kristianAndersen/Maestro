---
name: delegater
description: Provides coordination patterns for multi-agent execution, dependency analysis, and parallel/sequential orchestration
permissionMode: acceptAll
tools: Task, Read, TodoWrite
---

# Delegater Skill

## Purpose

This skill provides comprehensive guidance for coordinating multi-agent execution. It helps you analyze dependencies, determine optimal execution order (sequential vs parallel), manage data flow between agents, and handle errors in multi-step workflows.

## When to Use This Skill

This skill automatically activates when:
- Coordinating multiple agents in sequence
- Determining if tasks can run in parallel
- Managing data flow between agent calls
- Executing multi-step workflows
- Aggregating results from multiple agents

## Core Principles

### 1. **Single Responsibility**
Each agent does ONE thing. The delegater coordinates multiple single-purpose agents.

### 2. **Dependency Analysis**
Understand what depends on what before executing.

### 3. **Parallel When Possible**
Run independent tasks simultaneously for efficiency.

### 4. **Sequential When Required**
Run dependent tasks in order, passing data correctly.

### 5. **Data Flow Management**
Route outputs from one agent as inputs to the next.

## Quick Start Pattern

For 80% of coordination tasks:

```
1. Receive task list from orchestrator
2. Identify dependencies (what needs what?)
3. Group independent tasks (can run parallel)
4. Execute in optimal order
5. Aggregate and return results
```

## Coordination Patterns

### Pattern 1: Sequential Chain

**When:** Task B needs output from Task A

```
Step 1: Call Agent A
Step 2: Take Agent A's output
Step 3: Call Agent B with output from A
Step 4: Return Agent B's result
```

**Example:**
```
fetch agent → returns content
  ↓
analyze agent → receives content, returns analysis
```

**Implementation:**
```
1. Call fetch agent, receive content
2. Call analyze agent with: "Analyze this content: {content}"
3. Return analysis
```

### Pattern 2: Parallel + Aggregate

**When:** Multiple independent tasks, then combine results

**Example:**
```
fetch(url1) ──┐
              ├──> parallel
fetch(url2) ──┘
  ↓
combine results
  ↓
compare agent → receives both, returns comparison
```

**Implementation:**
```
1. Call fetch agents in parallel (multiple Task calls in one message)
2. Collect both results
3. Call compare agent with: "Compare: {result1} vs {result2}"
4. Return comparison
```

### Pattern 3: Fan-Out, Fan-In

**When:** One input → multiple processors → one aggregator

**Example:**
```
         ┌──> analyze agent
content ─┼──> summarize agent  (all parallel)
         └──> translate agent
              ↓
         aggregate results
```

**Implementation:**
```
1. Receive initial content
2. Call analyze, summarize, translate in parallel with same content
3. Collect all results
4. Aggregate: "Analysis: {a}, Summary: {s}, Translation: {t}"
5. Return aggregated result
```

### Pattern 4: Pipeline

**When:** A → B → C → D (each depends on previous)

**Example:**
```
fetch → transform → validate → store
```

**Implementation:**
```
1. Call fetch, get raw data
2. Call transform with raw data, get formatted data
3. Call validate with formatted data, get validation result
4. Call store with validated data, get confirmation
5. Return final result
```

## Dependency Analysis

### Ask These Questions:

1. **Does this task need output from another?** → Sequential
2. **Can this task run without waiting?** → Parallel
3. **Do multiple tasks need the same input?** → Fan-out pattern
4. **Do multiple outputs combine into one?** → Fan-in pattern

### Decision Tree

```
For each task pair (A, B):
  Does B need A's output?
    Yes → A must run before B (sequential)
    No → A and B can run in parallel
```

### Examples

**Example 1: "Fetch URL and analyze"**
- fetch needed by analyze → SEQUENTIAL

**Example 2: "Fetch URL1 and URL2"**
- Independent fetches → PARALLEL

**Example 3: "Fetch URL1, URL2, then compare"**
- Fetches independent → PARALLEL
- Compare needs both → SEQUENTIAL after fetches

## Data Flow Management

### Passing Data Between Agents

**Rule:** Agent outputs become next agent's inputs

**Pattern:**
```
Agent A returns: {data}
  ↓
Agent B receives: "Process this: {data}"
```

**Example:**
```
fetch returns: "Website content: Hello World"
  ↓
analyze receives: "Analyze this content: Hello World"
```

### Aggregating Multiple Results

**Pattern:**
```
Agent A returns: {result_a}
Agent B returns: {result_b}
  ↓
Agent C receives: "Compare {result_a} and {result_b}"
```

## Progress Tracking

For multi-step workflows, use TodoWrite:

```
TodoWrite([
  {content: "Fetch data", status: "in_progress"},
  {content: "Transform data", status: "pending"},
  {content: "Validate data", status: "pending"}
])

Execute fetch...

TodoWrite([
  {content: "Fetch data", status: "completed"},
  {content: "Transform data", status: "in_progress"},
  {content: "Validate data", status: "pending"}
])
```

## Error Handling

### When an Agent Fails

**Strategy 1: Fail Fast**
```
If critical step fails → Stop, return error
```

**Strategy 2: Continue with Partial**
```
If optional step fails → Continue, note the failure
```

**Strategy 3: Retry**
```
If transient failure → Retry the agent call
```

### Example

```
fetch(url1) → SUCCESS
fetch(url2) → FAIL
  ↓
Decision: Can we continue with just url1?
  Yes → Continue with partial data
  No → Return error
```

## Resources (Progressive Disclosure)

- **`assets/dependency_analysis.md`** - Advanced dependency detection patterns
- **`assets/parallel_patterns.md`** - When and how to parallelize effectively
- **`assets/data_flow.md`** - Complex data routing between agents
- **`assets/error_handling.md`** - Retry strategies, fallbacks, partial results

## Quick Reference

### Parallel Execution
```
Multiple Task calls in single message → Parallel
```

### Sequential Execution
```
Wait for result → Use result → Next Task call
```

### Dependency Check
```
Does B need A's output? → Sequential
B independent of A? → Parallel
```

### Data Passing
```
Agent output → Include in next agent's prompt
```

## Anti-Patterns

### ❌ Sequential When Parallel Possible
```
BAD: Fetch url1, wait, then fetch url2
GOOD: Fetch both in parallel
```

### ❌ Parallel When Dependencies Exist
```
BAD: Call analyze before fetch completes
GOOD: Wait for fetch, then analyze
```

### ❌ Lost Data Flow
```
BAD: Agent A returns data, Agent B doesn't receive it
GOOD: Pass Agent A's output to Agent B's prompt
```

### ❌ No Progress Tracking
```
BAD: 10-step workflow with no visibility
GOOD: TodoWrite to track progress
```

## Examples

### Example 1: Simple Sequential
```
Task: "Fetch and analyze"
Plan: fetch → analyze
Execute:
  1. fetch returns content
  2. analyze receives content
  3. return analysis
```

### Example 2: Parallel Fetch
```
Task: "Fetch url1 and url2"
Plan: parallel fetch
Execute:
  1. Both fetches in parallel
  2. Collect both results
  3. Return combined
```

### Example 3: Complex Pipeline
```
Task: "Fetch, transform to CSV, validate, store"
Plan: fetch → transform → validate → store
Execute:
  1. fetch → raw data
  2. transform → CSV data
  3. validate → validated CSV
  4. store → confirmation
  5. Return success
```
