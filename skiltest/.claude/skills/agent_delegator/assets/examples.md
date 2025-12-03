# Agent Delegation Examples

Real-world examples of task requirements and how agent_delegator routes them to the appropriate agent.

---

## Exploration Tasks

### Example 1: Find Code Pattern

**User Request:**
> "Where are errors from the client handled?"

**Analysis:**
- **Task type:** Code exploration / finding
- **Tools needed:** Grep, Glob, Read (search-focused)
- **Scope:** Codebase exploration
- **Complexity:** Medium (needs to search multiple locations)

**Decision:** Delegate to `Explore` agent
**Confidence:** High
**Reasoning:** Classic "where is X" question - perfect for Explore agent's specialization

---

### Example 2: Architecture Understanding

**User Request:**
> "How do API endpoints work in this codebase?"

**Analysis:**
- **Task type:** Codebase architecture understanding
- **Tools needed:** Read, Grep, Glob
- **Scope:** Multi-file exploration
- **Complexity:** Medium-high

**Decision:** Delegate to `Explore` agent with "medium" thoroughness
**Confidence:** High
**Reasoning:** Understanding architecture patterns requires codebase exploration

---

## Planning Tasks

### Example 3: Feature Planning

**User Request:**
> "Plan how to add user authentication to the app"

**Analysis:**
- **Task type:** Feature planning
- **Tools needed:** Read (to understand current structure), planning
- **Scope:** Large architectural decision
- **Complexity:** High

**Decision:** Delegate to `Plan` agent
**Confidence:** High
**Reasoning:** "Plan" keyword + large architectural feature = Plan agent

---

### Example 4: Refactoring Strategy

**User Request:**
> "Design an approach for optimizing database queries"

**Analysis:**
- **Task type:** Design/planning
- **Tools needed:** Read, exploration, analysis
- **Scope:** Performance optimization planning
- **Complexity:** High

**Decision:** Delegate to `Plan` agent with "very thorough" setting
**Confidence:** High
**Reasoning:** "Design approach" indicates planning phase, not implementation

---

## Implementation Tasks

### Example 5: Feature Implementation

**User Request:**
> "Implement a dark mode toggle in the application settings"

**Analysis:**
- **Task type:** Implementation
- **Tools needed:** Read, Write, Edit, possibly Bash (for testing)
- **Scope:** Multi-file changes
- **Complexity:** Medium

**Decision:** Delegate to `general-purpose` agent
**Confidence:** High
**Reasoning:** Implementation task requiring file modifications and diverse tools

---

### Example 6: Bug Fix

**User Request:**
> "Fix the authentication bug and add tests"

**Analysis:**
- **Task type:** Bug fix + testing
- **Tools needed:** Read, Edit, Write, Bash (for running tests)
- **Scope:** Code modification + verification
- **Complexity:** Medium

**Decision:** Delegate to `general-purpose` agent
**Confidence:** High
**Reasoning:** Requires code modification and test execution

---

## Documentation Tasks

### Example 7: Claude Code Feature Question

**User Request:**
> "How do I write a slash command in Claude Code?"

**Analysis:**
- **Task type:** Documentation lookup
- **Subject:** Claude Code features
- **Tools needed:** Read, WebFetch (for docs)
- **Scope:** Documentation retrieval

**Decision:** Delegate to `claude-code-guide` agent
**Confidence:** High
**Reasoning:** Direct question about Claude Code functionality

---

### Example 8: SDK Architecture Question

**User Request:**
> "What is the Claude Agent SDK architecture?"

**Analysis:**
- **Task type:** Documentation/educational
- **Subject:** Claude Agent SDK
- **Tools needed:** Documentation access
- **Scope:** Knowledge retrieval

**Decision:** Delegate to `claude-code-guide` agent
**Confidence:** High
**Reasoning:** SDK-specific question requiring official documentation

---

## Orchestration Tasks

### Example 9: Complex Multi-Layer Task

**User Request:**
> "Fetch data from https://api.example.com and then optimize how we store it"

**Analysis:**
- **Task type:** Multi-phase (fetch + implementation)
- **Layer 1:** Data retrieval → fetch skill
- **Layer 2:** Implementation → file modifications
- **Tools needed:** WebFetch, Read, Write, Edit
- **Complexity:** High (multi-step)

**Decision:** Delegate to `orchestrator` agent
**Confidence:** High
**Reasoning:** Complex task needing both skill routing (fetch) and implementation

**Orchestrator would then:**
1. Use skill_delegator → activate fetch skill for the API call
2. Use general-purpose capabilities for the optimization implementation

---

### Example 10: Open-Ended Complex Task

**User Request:**
> "Get the content from https://example.com and tell me what it says"

**Analysis:**
- **Task type:** Fetch + analysis
- **Tools needed:** WebFetch, analysis
- **Scope:** External data + interpretation
- **Complexity:** Medium

**Decision:** Delegate to `orchestrator` agent
**Confidence:** Medium-High
**Reasoning:** Combines fetch skill (for best practices) with analysis

---

## Edge Cases

### Example 11: Ambiguous Scope

**User Request:**
> "Help me understand the user authentication system"

**Analysis:**
- **Could be:** Exploration (find the code) OR documentation (explain concepts)
- **Unclear:** What level of detail needed?
- **Tools needed:** Depends on interpretation

**Decision:** Delegate to `Explore` agent (assume codebase exploration)
**Confidence:** Medium
**Reasoning:** "understand the system" likely means codebase exploration, but could clarify with user

**Alternative:** Could ask user: "Do you want me to find and explain the code, or explain authentication concepts?"

---

### Example 12: Simple Local Task

**User Request:**
> "Read config.json"

**Analysis:**
- **Task type:** Trivial file read
- **Tools needed:** Read
- **Scope:** Single tool call
- **Complexity:** Trivial

**Decision:** **Do NOT delegate** - current agent can handle directly
**Confidence:** High
**Reasoning:** Over-delegation for trivial tasks reduces efficiency

---

### Example 13: Already in Specialized Agent

**User Request:**
> "Now find all the test files" (while already in Explore agent)

**Analysis:**
- **Current context:** Already in Explore agent
- **Task type:** Finding files
- **Tools needed:** Glob
- **Complexity:** Low

**Decision:** **Do NOT delegate** - current Explore agent should continue
**Confidence:** High
**Reasoning:** Avoid re-delegating when current agent can handle the task

---

## Multi-Step Delegation

### Example 14: Exploration → Planning → Implementation

**User Request:**
> "Add caching to the API layer"

**Phase 1: Exploration**
- **Decision:** Delegate to `Explore` agent
- **Purpose:** Find current API implementation
- **Output:** Located API files and patterns

**Phase 2: Planning**
- **Decision:** Delegate to `Plan` agent
- **Purpose:** Design caching approach
- **Output:** Implementation plan

**Phase 3: Implementation**
- **Decision:** Delegate to `general-purpose` agent
- **Purpose:** Execute the plan
- **Output:** Implemented caching

**Orchestrator manages all three phases**

---

## Pattern Summary

| Request Pattern | Agent | Confidence |
|----------------|-------|------------|
| "Where is..." / "Find..." | Explore | High |
| "How does X work?" (codebase) | Explore | High |
| "Plan..." / "Design approach" | Plan | High |
| "Implement..." / "Add feature" | general-purpose | High |
| "Fix bug..." | general-purpose | High |
| "How do I... (Claude Code)" | claude-code-guide | High |
| "Fetch... and then..." | orchestrator | High |
| Simple single tool use | Current agent | High |
| Already in capable agent | Current agent | High |

---

## Decision Matrix

| Task Characteristic | Explore | Plan | general-purpose | claude-code-guide | orchestrator |
|--------------------|---------|------|-----------------|-------------------|--------------|
| Read-only exploration | ✅ Best | ✅ Good | ✅ Can do | ❌ | ✅ Can route |
| Planning large features | ❌ | ✅ Best | ✅ Can do | ❌ | ✅ Can route |
| File modifications | ❌ | ❌ | ✅ Best | ❌ | ✅ Can route |
| Web fetching | ✅ Can do | ✅ Can do | ✅ Best | ✅ Good | ✅ Can route |
| Claude Code docs | ❌ | ❌ | ❌ | ✅ Best | ✅ Can route |
| Multi-layer tasks | ❌ | ❌ | ✅ Good | ❌ | ✅ Best |
| Command execution | ❌ | ❌ | ✅ Best | ❌ | ✅ Can route |

---

## Delegation Decision Tree

```
Task Request
    ↓
Is it trivial (single tool call)?
    ↓ Yes → Use current agent (no delegation)
    ↓ No
Is it about Claude Code/SDK?
    ↓ Yes → claude-code-guide
    ↓ No
Does it say "where/find/how does X work" (codebase)?
    ↓ Yes → Explore
    ↓ No
Does it say "plan/design approach"?
    ↓ Yes → Plan
    ↓ No
Does it require file modifications?
    ↓ Yes → general-purpose
    ↓ No
Is it multi-layer or needs skill routing?
    ↓ Yes → orchestrator
    ↓ No
→ general-purpose (default)
```
