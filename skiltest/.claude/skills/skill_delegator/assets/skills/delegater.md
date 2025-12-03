# Delegater Skill - Detailed Profile

## Overview

**Skill Name:** delegater
**Location:** `.claude/skills/delegater/SKILL.md`
**Category:** Coordination & Orchestration
**Complexity:** High

## Purpose

Provides comprehensive patterns and strategies for coordinating multi-agent execution. Handles dependency analysis, parallel/sequential execution planning, data flow management, and error handling in complex multi-step workflows.

## When to Activate

### Primary Use Cases
- Coordinating multiple specialized agents
- Managing complex multi-step workflows
- Determining optimal execution order (parallel vs sequential)
- Passing data between agent calls
- Aggregating results from multiple agents
- Pipeline orchestration

### Activation Signals

**High Confidence (activate immediately):**
- "Fetch X AND Y, then Z" (multi-step with dependencies)
- "Do A, B, C in sequence"
- Coordinating multiple agents mentioned
- Keywords: "pipeline", "workflow", "coordinate", "orchestrate"

**Medium Confidence (likely activate):**
- Multiple distinct tasks in one request
- Implies sequential or parallel execution
- Data needs to flow between tasks

**Low Confidence (probably skip):**
- Single simple task
- No coordination needed
- Just one agent call

## Keywords

### Coordination Terms
coordinate, orchestrate, manage, pipeline, workflow, multi-step, chain

### Execution Terms
parallel, sequential, series, simultaneously, one after another, then

### Agent Terms
multiple agents, several tasks, various steps, different agents

## Pattern Recognition

### Multi-Step Patterns
- "Fetch, then analyze" → Sequential
- "Fetch X and Y" → Parallel
- "Do A, B, C" → Pipeline

### Dependency Patterns
- "using the result" → Sequential dependency
- "based on" → Data dependency
- "after" → Ordering dependency

### Parallel Patterns
- "and" between independent tasks
- "both", "all" → Multiple simultaneous
- "at the same time" → Explicit parallel

## Examples

### Example 1: Sequential Pipeline
**Request:** "Fetch https://example.com, then analyze the content"
**Match:** High - "then" indicates sequence
**Action:** Activate delegater skill
**Pattern:** Sequential chain (fetch → analyze)

### Example 2: Parallel Fetch
**Request:** "Fetch data from url1 and url2"
**Match:** High - "and" between independent fetches
**Action:** Activate delegater skill
**Pattern:** Parallel execution

### Example 3: Complex Workflow
**Request:** "Get data from API1 and API2, combine them, then analyze"
**Match:** High - Multi-step with dependencies
**Action:** Activate delegater skill
**Pattern:** Parallel (fetches) → Sequential (combine → analyze)

### Example 4: Fan-Out Pattern
**Request:** "Fetch the page and analyze, summarize, and translate it"
**Match:** High - One input, multiple processors
**Action:** Activate delegater skill
**Pattern:** Fetch → [analyze, summarize, translate] in parallel

### Example 5: Single Task
**Request:** "Fetch https://example.com"
**Match:** Low - Single task, no coordination needed
**Action:** Skip delegater skill
**Reason:** No multi-agent coordination required

## What This Skill Provides

### Core Knowledge
- Dependency analysis algorithms
- Sequential vs parallel decision logic
- Data flow management patterns
- Error handling in multi-step workflows
- Progress tracking strategies

### Coordination Patterns
1. **Sequential Chain** - A → B → C
2. **Parallel + Aggregate** - [A, B] parallel → C
3. **Fan-Out, Fan-In** - A → [B, C, D] → E
4. **Pipeline** - A → B → C → D

### Assets Available
- `dependency_analysis.md` - Advanced dependency detection
- `data_flow.md` - Complex data routing patterns

## Tools Required

Agents using this skill should have:
- **Task** - To delegate to other agents
- **Read** - To read coordination patterns
- **TodoWrite** (optional) - For progress tracking in long workflows

## Integration Notes

### Works Well With
- **delegater agent** - Primary user of this skill
- **orchestrator agent** - May use for complex coordination
- **Any agent** - That needs to coordinate multiple sub-agents

### Decision Logic
```
Request has multiple steps?
  No → Skip delegater skill
  Yes → Check dependencies
    All independent → Parallel pattern
    Sequential → Chain pattern
    Mixed → Complex workflow pattern
```

## Single-Purpose Agent Philosophy

**IMPORTANT:** This skill respects single-purpose agents!

Each agent does ONE thing:
- **fetch agent** → ONLY fetches, returns raw content
- **analyze agent** → ONLY analyzes content
- **transform agent** → ONLY transforms data

The delegater skill coordinates these single-purpose agents:
```
fetch returns raw content
  ↓ (delegater passes data)
analyze receives content, returns analysis
```

**Anti-Pattern:**
```
❌ fetch agent fetches AND analyzes (doing too much)
```

**Correct Pattern:**
```
✅ fetch agent → raw content → delegater → analyze agent
```

## Coordination Responsibilities

### What Delegater Does
✅ Analyze dependencies
✅ Plan execution order
✅ Call agents in sequence/parallel
✅ Pass data between agents
✅ Aggregate results
✅ Handle errors in workflow

### What Delegater Does NOT Do
❌ Execute domain tasks itself (agents do that)
❌ Analyze content (analyze agent does that)
❌ Fetch data (fetch agent does that)
❌ Transform data (transform agent does that)

## Success Indicators

After activation, the delegater skill helps with:
- ✅ Optimal execution order determined
- ✅ Parallel tasks run simultaneously
- ✅ Sequential dependencies respected
- ✅ Data flows correctly between agents
- ✅ Progress tracked for complex workflows
- ✅ Errors handled gracefully

## Real-World Workflows

### Workflow 1: Compare Websites
```
Request: "Compare example.com and github.com"
Plan:
  1. fetch(example.com) ──┐
  2. fetch(github.com) ───┤ parallel
                          ↓
  3. compare(content1, content2) ← sequential
```

### Workflow 2: Content Pipeline
```
Request: "Fetch, extract text, translate, and summarize"
Plan:
  1. fetch → html
  2. extract(html) → text
  3. [translate(text), summarize(text)] parallel
  4. Return both results
```

### Workflow 3: Multi-Source Analysis
```
Request: "Get data from 3 APIs, combine, analyze"
Plan:
  1. [fetch(api1), fetch(api2), fetch(api3)] parallel
  2. combine(data1, data2, data3) sequential
  3. analyze(combined) sequential
```

## Anti-Patterns (When NOT to Use)

❌ **Single agent task** - No coordination needed
❌ **Simple sequential** - Obvious order, no analysis needed
❌ **No data flow** - Agents don't interact

## Maintenance

**Add to this file when:**
- New coordination patterns emerge
- Complex workflow examples discovered
- Integration patterns with new agents

**Don't modify:**
- The core skill file (`.claude/skills/delegater/SKILL.md`)
- The skill_delegator routing logic

---

**Last Updated:** 2025-11-28
**Skill Version:** 1.0
**Maintained By:** skill_delegator system
