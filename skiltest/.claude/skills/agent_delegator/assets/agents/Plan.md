# Plan Agent - Detailed Profile

## Overview

**Agent Name:** Plan
**Type:** Built-in Claude Code agent
**Category:** Planning & Design
**Complexity:** Specialized for planning

## Specialization

Fast agent specialized for planning implementation approaches. Creates detailed plans for complex features before execution. Focuses on design and strategy, not implementation.

## When to Delegate

### Primary Use Cases
- Planning large features or refactors
- Designing implementation approaches
- Breaking down complex tasks into steps
- Evaluating multiple solution approaches
- Architectural design decisions
- When user explicitly requests "plan"

### Activation Signals

**High Confidence (delegate immediately):**
- Request starts with "Plan...", "Design..."
- "Create a plan for..."
- Large architectural changes
- Multiple possible approaches need evaluation

**Medium Confidence (consider):**
- Complex tasks that benefit from planning
- Unclear how to approach the problem
- Need to think through architecture first

**Low Confidence (skip):**
- Simple straightforward tasks
- Already have a clear plan
- Just need execution, not planning

## Tools Available

### Primary Tools
- Read, Glob, Grep (for understanding current state)
- Planning and design focus
- Has access to all tools

### Optimized For
- Architecture analysis
- Implementation planning
- Approach evaluation
- Task breakdown
- Design documentation

### Does NOT Focus On
- Actual implementation (use general-purpose)
- File modifications (planning only)
- Command execution (strategy, not tactics)

## Thoroughness Levels

The Plan agent supports thoroughness settings:

- **quick** - Basic plan outline
- **medium** - Detailed step-by-step plan
- **very thorough** - Comprehensive plan with alternatives

## Examples

### Example 1: Feature Planning
**Request:** "Plan how to add user authentication"
**Match:** High - "plan" + large feature
**Delegation:** Plan agent with medium-thorough setting

### Example 2: Refactoring Strategy
**Request:** "Design an approach for optimizing DB queries"
**Match:** High - "design approach" + architectural
**Delegation:** Plan agent with thorough setting

### Example 3: Architecture Decision
**Request:** "Should we use Redux or Context for state management?"
**Match:** High - Architectural evaluation
**Delegation:** Plan agent to evaluate options

### Example 4: Task Breakdown
**Request:** "Break down the dark mode implementation into steps"
**Match:** High - Planning and breakdown
**Delegation:** Plan agent

## Capabilities

### Strengths
✅ Excellent at architectural thinking
✅ Evaluates multiple approaches
✅ Creates detailed implementation plans
✅ Breaks complex tasks into manageable steps
✅ Identifies dependencies and risks

### Limitations
❌ Doesn't implement (that's for general-purpose)
❌ Doesn't execute commands
❌ Doesn't modify files
❌ Planning only, not execution

## Integration Notes

### Works Well With
- **Skills:** Generally doesn't need skills (planning is generic)
- **Other Agents:** Often followed by general-purpose for implementation
- **Workflow:** Plan creates strategy → general-purpose executes

### Common Pattern
```
User: "Add feature X"
  ↓
agent_delegator → Plan agent (if complex)
  ↓
Plan creates detailed plan
  ↓
general-purpose agent implements the plan
```

## Anti-Patterns (When NOT to Use)

❌ **Simple tasks** - Don't over-plan trivial work
❌ **Already know how to do it** - Just implement
❌ **Execution needed** - Use general-purpose instead
❌ **Finding code** - Use Explore instead

## When Plan Agent Adds Value

✅ Large features with unclear approach
✅ Architectural decisions needed
✅ Multiple solutions to evaluate
✅ Complex refactoring with many steps
✅ Risk assessment needed
✅ Team coordination (plan serves as blueprint)

## Success Indicators

After delegation, Plan agent should:
- ✅ Provide clear implementation steps
- ✅ Identify potential issues
- ✅ Suggest optimal approach
- ✅ Break down complexity
- ✅ Create actionable plan

## Maintenance

**Add to this file when:**
- New planning patterns discovered
- Better ways to use thoroughness levels
- Integration with implementation agents refined

**Don't modify:**
- The built-in Plan agent itself (managed by Claude Code)

---

**Last Updated:** 2025-11-28
**Agent Version:** Built-in
**Maintained By:** agent_delegator system
