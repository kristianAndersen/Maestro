# Delegater Agent - Detailed Profile

## Overview

**Agent Name:** delegater
**Type:** Custom agent
**Location:** `.claude/agents/delegater.md`
**Category:** Execution Coordinator
**Complexity:** Medium (coordinates, doesn't execute domain tasks)

## Specialization

Execution coordinator that sits between strategy (orchestrator) and execution (specialized single-purpose agents). Analyzes dependencies, determines optimal execution order, manages data flow, and orchestrates multi-agent workflows.

**Key Role:** Project manager for agent execution

## When to Delegate

### Primary Use Cases
- Executing multi-agent workflows
- Coordinating parallel/sequential execution
- Managing data flow between agents
- Progress tracking for complex workflows
- Aggregating results from multiple agents

### Activation Signals

**High Confidence (delegate immediately):**
- Orchestrator has determined multiple agents needed
- Multi-step workflow requires coordination
- Dependencies need to be analyzed
- Parallel execution opportunities exist

**Medium Confidence (consider):**
- Complex task that might benefit from coordination
- Orchestrator unsure of execution order

**Low Confidence (skip):**
- Single agent task
- Simple sequential that orchestrator can handle

## Tools Available

### Coordination Tools
- **Task** - Delegates to specialized agents
- **Read** - Reads coordination patterns from delegater skill
- **TodoWrite** - Tracks progress in multi-step workflows

### Key Capability
Uses **delegater skill** for coordination knowledge

## Coordination Workflow

### Step 1: Receive Plan
Orchestrator provides:
- Which agents to call
- What each agent should do
- Any initial context/data

### Step 2: Activate delegater Skill
Use Skill tool to get coordination patterns

### Step 3: Analyze Dependencies
Determine:
- What depends on what?
- What can run in parallel?
- How does data flow?

### Step 4: Execute Optimally
- Parallel: Multiple Task calls in one message
- Sequential: Wait for results, pass data
- Track: Use TodoWrite for visibility

### Step 5: Return Results
Aggregate and return to orchestrator

## Examples

### Example 1: Fetch + Analyze

**Received:**
"Coordinate: fetch https://example.com, then analyze"

**Process:**
1. Activate delegater skill
2. Analyze: Sequential (analyze needs fetch output)
3. Call fetch agent → get content
4. Call analyze agent with content → get analysis
5. Return analysis to orchestrator

**Delegation:** Sequential execution

---

### Example 2: Parallel Fetches

**Received:**
"Coordinate: fetch url1 and url2"

**Process:**
1. Activate delegater skill
2. Analyze: Parallel (independent fetches)
3. Call both fetch agents simultaneously
4. Collect both results
5. Return both to orchestrator

**Delegation:** Parallel execution

---

### Example 3: Complex Pipeline

**Received:**
"Coordinate: fetch api1 and api2, combine, analyze"

**Process:**
1. Activate delegater skill
2. Analyze:
   - Level 1 (parallel): fetch api1, fetch api2
   - Level 2 (sequential): combine
   - Level 3 (sequential): analyze
3. TodoWrite: Track 4 steps
4. Execute Level 1 in parallel
5. Execute Level 2 with combined data
6. Execute Level 3 with combined data
7. Return final analysis

**Delegation:** Mixed parallel/sequential

## Capabilities

### Strengths
✅ Optimal execution planning (parallel when possible)
✅ Dependency analysis
✅ Data flow management
✅ Progress tracking
✅ Result aggregation
✅ Respects single-purpose agents

### Limitations
❌ Doesn't execute domain tasks (agents do that)
❌ Doesn't decide which agents to use (orchestrator does that)
❌ Doesn't fetch/analyze/transform (specialized agents do that)

## Single-Purpose Philosophy

The delegater agent respects that each agent does ONE thing:

**Good:**
```
fetch agent → returns raw content
  ↓ (delegater passes data)
analyze agent → receives content, analyzes it
```

**Bad:**
```
fetch agent → fetches AND analyzes (too much!)
```

Delegater ensures each agent stays focused on its single responsibility.

## Integration Notes

### Relationship to orchestrator

```
orchestrator (strategy)
    ↓
"Use these agents: fetch, analyze"
    ↓
delegater (coordination)
    ↓
Executes agents optimally
    ↓
Returns results to orchestrator
```

### Relationship to specialized agents

```
delegater calls:
  - fetch agent (single purpose: fetch)
  - analyze agent (single purpose: analyze)
  - transform agent (single purpose: transform)

Each agent does ONE thing well.
Delegater coordinates them.
```

## Anti-Patterns (When NOT to Use)

❌ **Single agent call** - No coordination needed
❌ **Orchestrator can handle** - Simple sequential
❌ **No dependencies** - Just one task

## Success Indicators

After delegation, delegater agent should:
- ✅ Execute agents in optimal order
- ✅ Run parallel tasks simultaneously
- ✅ Pass data correctly between agents
- ✅ Track progress for visibility
- ✅ Aggregate results properly
- ✅ Return comprehensive results

## Maintenance

**Add to this file when:**
- New coordination patterns discovered
- Better execution strategies found
- Integration with new agent types

**Do modify:**
- `.claude/agents/delegater.md` to improve coordination logic
- `delegater` skill for better patterns

---

**Last Updated:** 2025-11-28
**Agent Version:** 1.0 (Custom)
**Maintained By:** agent_delegator system
