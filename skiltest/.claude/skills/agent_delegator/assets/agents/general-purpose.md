# General-Purpose Agent - Detailed Profile

## Overview

**Agent Name:** general-purpose
**Type:** Built-in Claude Code agent
**Category:** Implementation & Execution
**Complexity:** Full-featured

## Specialization

Default choice for most implementation work. General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks. Has access to all tools and can handle diverse task types.

## When to Delegate

### Primary Use Cases
- Implementing features
- Fixing bugs
- Refactoring code
- Multi-step complex operations
- Tasks requiring file modifications
- Command execution (builds, tests, etc.)
- When no other specialized agent fits better

### Activation Signals

**High Confidence (delegate immediately):**
- "Implement...", "Add feature...", "Build..."
- "Fix bug...", "Refactor..."
- Requires Write/Edit tools
- Needs Bash execution
- Multi-step implementation tasks

**Medium Confidence (likely delegate):**
- Complex tasks with no clear specialized agent
- Combination of exploration + implementation
- General coding work

**Low Confidence (consider alternatives):**
- Pure exploration (use Explore)
- Planning only (use Plan)
- Claude Code questions (use claude-code-guide)

## Tools Available

### All Tools (*)
The general-purpose agent has access to the complete toolset:

**File Operations:**
- Read, Write, Edit
- Glob, Grep

**Execution:**
- Bash (command execution)

**Web Access:**
- WebFetch, WebSearch

**Orchestration:**
- Task (can spawn sub-agents)
- Skill (can activate skills)

**Planning:**
- TodoWrite

**MCP:**
- All MCP tools available

## Capabilities

### Strengths
✅ Can do almost anything
✅ File creation and modification
✅ Command execution
✅ Web access for external data
✅ Can orchestrate sub-agents
✅ Full implementation capabilities
✅ Multi-step task handling

### Limitations
❌ Not optimized for pure exploration (Explore is faster)
❌ Not specialized for planning (Plan is better)
❌ No specific domain knowledge (use skills for that)

## Examples

### Example 1: Feature Implementation
**Request:** "Implement a dark mode toggle"
**Match:** High - "implement" + feature work
**Delegation:** general-purpose agent

### Example 2: Bug Fix + Tests
**Request:** "Fix the auth bug and add tests"
**Match:** High - code modification + testing
**Delegation:** general-purpose agent

### Example 3: Refactoring
**Request:** "Refactor the API layer to use async/await"
**Match:** High - "refactor" + code changes
**Delegation:** general-purpose agent

### Example 4: Build & Deploy
**Request:** "Build the project and fix any errors"
**Match:** High - Bash execution needed
**Delegation:** general-purpose agent

### Example 5: Complex Multi-Step
**Request:** "Add logging, write tests, update docs"
**Match:** High - multiple operations
**Delegation:** general-purpose agent

## Integration Notes

### Works Well With
- **Skills:** Can use any skill (has Skill tool)
- **Other Agents:** Often the "executor" after Explore/Plan agents
- **Workflow:** Plan → general-purpose implements OR Explore → general-purpose modifies

### Common Patterns

**Pattern 1: Direct Implementation**
```
User request → general-purpose executes
```

**Pattern 2: After Exploration**
```
Explore finds code → general-purpose modifies
```

**Pattern 3: After Planning**
```
Plan creates plan → general-purpose implements
```

**Pattern 4: With Skills**
```
Activate skill (e.g., fetch) → general-purpose executes with skill knowledge
```

## Anti-Patterns (When NOT to Use)

❌ **Pure exploration** - Explore agent is faster
❌ **Just planning** - Plan agent is specialized for this
❌ **Claude Code docs** - claude-code-guide agent has better access
❌ **Trivial single-tool tasks** - Current agent can handle directly

## Default Choice Logic

Use general-purpose as the **default** when:
- No specialized agent clearly fits
- Task requires implementation
- Multiple tool types needed
- You're unsure which agent to use

## Success Indicators

After delegation, general-purpose agent should:
- ✅ Complete implementation tasks
- ✅ Handle errors gracefully
- ✅ Execute commands successfully
- ✅ Modify files as needed
- ✅ Coordinate multi-step operations

## Maintenance

**Add to this file when:**
- New common use cases emerge
- Integration patterns with other agents discovered

**Don't modify:**
- The built-in general-purpose agent itself (managed by Claude Code)

---

**Last Updated:** 2025-11-28
**Agent Version:** Built-in
**Maintained By:** agent_delegator system
