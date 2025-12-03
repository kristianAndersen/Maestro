# Explore Agent - Detailed Profile

## Overview

**Agent Name:** Explore
**Type:** Built-in Claude Code agent
**Category:** Code Exploration
**Complexity:** Fast, specialized

## Specialization

Fast agent optimized for exploring codebases. Designed for finding files by patterns, searching code for keywords, and answering questions about codebase structure and architecture.

## When to Delegate

### Primary Use Cases
- Finding files by patterns (e.g., `src/components/**/*.tsx`)
- Searching code for keywords (e.g., "API endpoints")
- Understanding codebase architecture
- Answering "where is X?" questions
- Locating specific implementations
- Multi-location code exploration

### Activation Signals

**High Confidence (delegate immediately):**
- Questions starting with "where", "find", "locate"
- "How does X work?" (regarding codebase)
- Pattern matching requests
- Architecture understanding requests

**Medium Confidence (likely delegate):**
- Need to explore before implementation
- Understanding existing patterns
- Code discovery tasks

**Low Confidence (don't delegate):**
- Implementation tasks
- File modifications needed
- Already know the location

## Tools Available

### Primary Tools
- **Glob** - Fast file pattern matching
- **Grep** - Code content searching
- **Read** - Reading file contents
- **All tools** - Has access to full toolset

### Optimized For
- Fast pattern matching
- Efficient code searching
- Multi-file exploration
- Read-only operations

### Does NOT Focus On
- File modifications (use general-purpose instead)
- Code implementation (use general-purpose instead)
- Planning (use Plan agent instead)

## Thoroughness Levels

The Explore agent supports different thoroughness settings:

- **quick** - Basic searches, obvious locations
- **medium** - Moderate exploration, common patterns
- **very thorough** - Comprehensive analysis, edge cases

Specify thoroughness in the delegation prompt.

## Examples

### Example 1: Find Files
**Request:** "Where are all the React components that use hooks?"
**Match:** High - "where" + finding files
**Delegation:** `Task(subagent_type="Explore", prompt="Find all React components using hooks", ...)`

### Example 2: Locate Implementation
**Request:** "Find the authentication logic"
**Match:** High - "find" + code location
**Delegation:** Explore agent with medium thoroughness

### Example 3: Architecture Question
**Request:** "How do API endpoints work in this codebase?"
**Match:** High - Architecture understanding
**Delegation:** Explore agent with medium-to-thorough setting

### Example 4: Pattern Search
**Request:** "Locate all files matching src/**/*.test.ts"
**Match:** High - Pattern matching
**Delegation:** Explore agent (quick search)

## Capabilities

### Strengths
✅ Very fast at file discovery
✅ Efficient code searching
✅ Good at understanding patterns
✅ Can explore multiple locations simultaneously
✅ Read-only focus (safe, no accidental modifications)

### Limitations
❌ Not designed for implementation
❌ Doesn't modify files
❌ Not for planning (use Plan agent)
❌ Not for executing commands

## Integration Notes

### Works Well With
- **Skills:** None needed (exploration is straightforward)
- **Other Agents:** Often used before general-purpose agent implements changes
- **Workflow:** Explore → understand → delegate to implementer

### Delegation Pattern
```
User: "Where is the auth logic?"
  ↓
agent_delegator analyzes
  ↓
Match: Exploration task
  ↓
Delegate to Explore agent
  ↓
Explore finds the code
  ↓
Return results
```

## Anti-Patterns (When NOT to Use)

❌ **Implementation tasks** - Use general-purpose instead
❌ **Already know location** - Just use Read tool directly
❌ **Need to modify code** - Explore is read-only focused
❌ **Planning needed** - Use Plan agent

## Success Indicators

After delegation, Explore agent should:
- ✅ Quickly locate relevant files
- ✅ Identify patterns in codebase
- ✅ Provide clear file paths and line numbers
- ✅ Explain architecture when asked

## Maintenance

**Add to this file when:**
- New exploration patterns emerge
- Better ways to use thoroughness levels discovered
- Common use cases identified

**Don't modify:**
- The built-in Explore agent itself (managed by Claude Code)

---

**Last Updated:** 2025-11-28
**Agent Version:** Built-in
**Maintained By:** agent_delegator system
