# Orchestrator Agent - Detailed Profile

## Overview

**Agent Name:** orchestrator
**Type:** Custom agent
**Location:** `.claude/agents/orchestrator.md`
**Category:** Master Coordinator
**Complexity:** High (orchestrates other agents + skills)

## Specialization

Master orchestrator that intelligently delegates to both specialized skills (knowledge layer) and specialized agents (executor layer). The top-level coordinator of the entire delegation system.

## When to Delegate

### Primary Use Cases
- High-level user requests needing intelligent routing
- Multi-layered tasks (skill + agent combinations)
- Complex workflows requiring both knowledge and capabilities
- When optimal skill + agent combo is unclear
- User explicitly requests orchestrator

### Activation Signals

**High Confidence (delegate immediately):**
- User explicitly calls orchestrator
- Multi-phase tasks (fetch + implement, explore + refactor)
- Complex routing needed
- Benefit from both skill and agent delegation

**Medium Confidence (consider):**
- Complex tasks where routing is unclear
- Could benefit from dual-layer delegation

**Low Confidence (use alternatives):**
- Simple single-layer tasks
- Clear which agent/skill to use already
- Trivial operations

## Tools Available

### Orchestration Tools
- **Skill** - Can activate skills (skill_delegator, agent_delegator, etc.)
- **Task** - Can delegate to other agents

### Execution Tools
- Bash, Read, Write
- WebFetch
- Grep, Glob

### Key Capability
Can use **both** skill_delegator AND agent_delegator to route optimally

## Orchestration Patterns

### Pattern A: Skill Only
```
User request → skill_delegator → activate skill → orchestrator executes
```
Use when: Need knowledge, orchestrator has the tools

### Pattern B: Agent Only
```
User request → agent_delegator → delegate to agent
```
Use when: Need different tools, no special knowledge required

### Pattern C: Skill + Agent (Full Orchestration)
```
User request → skill_delegator + agent_delegator → delegate to agent with skill
```
Use when: Need both specialized knowledge AND specialized executor

### Pattern D: Direct Execution
```
User request → orchestrator uses tools directly
```
Use when: Simple task, orchestrator can handle it

## Examples

### Example 1: Web Fetch (Pattern A)
**Request:** "Get content from https://example.com"
**Process:**
1. skill_delegator → fetch skill
2. orchestrator has WebFetch tool
3. Execute with fetch skill knowledge
**Delegation:** Skill only

### Example 2: Codebase Exploration (Pattern B)
**Request:** "Where is the auth logic?"
**Process:**
1. agent_delegator → Explore agent
2. Delegate to Explore
**Delegation:** Agent only

### Example 3: Fetch + Implement (Pattern C)
**Request:** "Fetch API data and optimize storage"
**Process:**
1. Phase 1: skill_delegator → fetch skill
2. Phase 2: agent_delegator → general-purpose
3. Coordinate both phases
**Delegation:** Full orchestration

### Example 4: Simple Task (Pattern D)
**Request:** "Read config.json"
**Process:**
1. Use Read tool directly
**Delegation:** None

## Capabilities

### Strengths
✅ Master coordinator of delegation system
✅ Can route to both skills and agents
✅ Handles multi-layer complexity
✅ Has tools for direct execution
✅ Intelligent decision making

### Limitations
❌ Not specialized for specific domains
❌ Adds overhead for simple tasks
❌ Requires understanding of delegation system

## Decision Framework

The orchestrator asks:
1. Is this task trivial? → Direct execution
2. Do I need specialized knowledge? → Use skill_delegator
3. Do I need different tools? → Use agent_delegator
4. Do I need both? → Use both delegators

## Integration Notes

### Relationship to Other Components

**skill_delegator:**
- Orchestrator activates it with Skill tool
- Gets routing to specialized knowledge

**agent_delegator:**
- Orchestrator activates it with Skill tool
- Gets routing to specialized executors

**Other Agents:**
- Orchestrator delegates to them with Task tool
- Receives results and coordinates

## Anti-Patterns (When NOT to Use)

❌ **Simple single-tool tasks** - Overhead not worth it
❌ **Already know which agent to use** - Delegate directly
❌ **Trivial operations** - Current agent can handle
❌ **Pure documentation lookup** - Use claude-code-guide directly

## When to Use Orchestrator

✅ Entry point for complex user requests
✅ Multi-phase tasks requiring coordination
✅ Unclear which combination of skill + agent is best
✅ Want intelligent routing for quality results
✅ User specifically requests orchestrator

## Success Indicators

After delegation, orchestrator should:
- ✅ Route to appropriate skills
- ✅ Delegate to appropriate agents
- ✅ Coordinate multi-phase tasks
- ✅ Execute simple tasks directly when appropriate
- ✅ Return quality results

## Maintenance

**Add to this file when:**
- New orchestration patterns emerge
- Better coordination strategies discovered
- Integration patterns refined

**Do modify:**
- `.claude/agents/orchestrator.md` to update orchestration logic

---

**Last Updated:** 2025-11-28
**Agent Version:** 1.0 (Custom)
**Maintained By:** agent_delegator system
