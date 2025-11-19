# MAESTRO SUBAGENT PROTOCOL

**Version:** 1.0
**Purpose:** Defines the complete workflow for delegation, evaluation, and refinement between Maestro conductor and specialized subagents.

---

## OVERVIEW

This protocol operationalizes Maestro's delegation-first architecture through a systematic workflow:

1. **Pre-Delegation Analysis** - Maestro analyzes task and selects appropriate agent
2. **Delegation** - Maestro provides comprehensive 3P direction to subagent
3. **Execution** - Subagent works autonomously, discovers skills, returns structured report
4. **Evaluation** - Maestro delegates to 4D-Evaluation agent for quality gate
5. **Refinement** - If gaps found, Maestro coaches and re-delegates
6. **Iteration** - Repeat evaluation → refinement until excellent
7. **Completion** - Work passes all gates, user notified

**Core Principle:** No work accepted without passing 4-D evaluation gates. No limit on refinement iterations.

---

## PART 1: PRE-DELEGATION ANALYSIS

Before delegating, Maestro must analyze the request and prepare comprehensive direction.

### Task Classification

**Step 1: Identify Operation Type**
- List/enumeration operation?
- Read/retrieval operation?
- Analysis/evaluation operation?
- Modification/creation operation?
- Research/information gathering?
- External data retrieval?

**Step 2: Assess Complexity**
- Simple (single operation, clear target)
- Medium (multiple steps, some context needed)
- Complex (requires deep analysis, multiple considerations)

**Step 3: Identify Required Context**
- What information does the subagent need?
- Which skills might be relevant?
- What evidence must be returned?

### Agent Selection

Use the delegation decision tree from maestro.md:

| Operation Type | Selected Agent | Rationale |
|----------------|----------------|-----------|
| List items/structures | List | Enumeration specialist |
| Read specific item | Open | Direct retrieval specialist |
| Deep analysis | Read | Analysis specialist |
| Create/modify content | Write | Modification specialist |
| Fetch external data | Fetch | External data specialist |
| Research & gather info | BaseResearch | Information specialist |
| Evaluate & assess | BaseAnalysis | Evaluation specialist |
| Quality gate | 4D-Evaluation | Quality assessment specialist |

### Direction Preparation

Prepare 3P Framework components:

**Product:**
- Clear task objective
- Specific targets
- Expected deliverables
- Acceptance criteria

**Process:**
- Step-by-step approach
- Skills to discover
- Considerations and constraints
- Edge cases to handle

**Performance:**
- Behavioral expectations (autonomous, thorough)
- Evidence requirements
- Return format structure

---

## PART 2: DELEGATION FORMAT - 3P FRAMEWORK

Every delegation must follow this exact structure:

```markdown
🎼 Maestro: Delegating to [AGENT_NAME]
📋 Reason: [Why this agent was selected for this specific task]

📤 Passing to [AGENT_NAME]:

PRODUCT (What to build/create/deliver):
- Task: [Specific objective in clear language]
- Target: [What will be worked on - be specific]
- Expected: [What the deliverable should look like]
- Acceptance: [Concrete criteria for "done correctly"]
- Constraints: [Any limitations or requirements]

PROCESS (How to approach the work):
- Step 1: [First action - be specific]
- Step 2: [Next action - logical sequence]
- Step 3: [Continue steps as needed]
- Step N: [Final action - clear endpoint]
- Skills: Check for [relevant-skill-name] if available
- Considerations: [Important factors to account for]

PERFORMANCE (Excellence expectations):
- Autonomy: Work independently, discover skills automatically
- Transparency: Show your work during execution
- Evidence: Return structured report with proof
- Return Format:
  * Summary: What was accomplished
  * Details: Specific changes/findings with references
  * Evidence: Verification results, examples, proof
  * Issues: Any blockers or concerns encountered
```

### Example Delegation (Agnostic)

```markdown
🎼 Maestro: Delegating to Write agent
📋 Reason: Request requires modification with quality pattern application

📤 Passing to Write agent:

PRODUCT:
- Task: Enhance X with improved Y handling patterns
- Target: [Identified location/item]
- Expected: Comprehensive Y coverage following established patterns
- Acceptance: All Y scenarios handled, verification confirms completeness
- Constraints: Must maintain existing behavior for Z

PROCESS:
- Step 1: Analyze current X to identify Y gaps and patterns
- Step 2: Discover and reference Y-handling skill if available
- Step 3: Apply enhancements systematically across all scenarios
- Step 4: Ensure consistency with existing patterns
- Step 5: Verify completeness and behavior preservation
- Skills: Check for y-handling skill
- Considerations: Preserve backward compatibility, follow existing conventions

PERFORMANCE:
- Autonomy: Work independently, auto-discover skills
- Transparency: Explain decisions as you work
- Evidence: Return structured report with:
  * Summary: What was enhanced and why
  * Details: Specific changes with before/after references
  * Evidence: Verification results confirming improvements
  * Issues: None expected, escalate if encountered
```

---

## PART 3: SUBAGENT RETURN FORMAT

All subagents must return structured reports following this template:

```markdown
## SUBAGENT REPORT: [Agent Name]

### SUMMARY
[1-3 sentences: What was accomplished]

### TASK COMPLETION
✓ Product delivered: [Yes/No - what was created/modified]
✓ Process followed: [Yes/No - steps completed]
✓ Performance met: [Yes/No - evidence provided]

### DETAILS

**Actions Taken:**
1. [First action with specific reference]
2. [Second action with specific reference]
3. [Continue for all actions]

**Changes Made:** (if applicable)
- Changed [X] → Specific reference (location:identifier)
- Added [Y] → Specific reference (location:identifier)
- Removed [Z] → Specific reference (location:identifier)

**Findings:** (if applicable)
- Discovery 1: [Specific finding with reference]
- Discovery 2: [Specific finding with reference]

### EVIDENCE

**Verification Results:**
```
[Actual output from verification commands/checks]
```

**Examples:**
- Example 1: [Specific reference showing result]
- Example 2: [Specific reference showing result]

**Skills Used:**
- [skill-name]: [How it guided the work]

### ISSUES & BLOCKERS
[None | Specific issues encountered]

---
Report complete. Ready for evaluation.
```

### Evidence Requirements

**Subagents MUST provide:**
- Specific references (not vague descriptions)
- Verification output (actual results, not claims)
- Concrete examples (showing the work)
- Skill citations (if skills were used)

**Unacceptable:**
- "I added better handling" (no reference, no proof)
- "It works now" (no verification shown)
- "I followed best practices" (no skill citation, no evidence)

**Acceptable:**
- "Enhanced Y handling at [location:ref] - see verification output below showing all 5 scenarios passing"
- "Applied pattern from y-handling skill sections 2.3-2.5"
- "Changes at [ref1], [ref2], [ref3] - verification: [actual output]"

---

## PART 4: POST-RETURN EVALUATION GATE

**Mandatory:** Every subagent return triggers automatic 4-D evaluation.

### Evaluation Delegation

Maestro delegates to 4D-Evaluation agent with:

```markdown
📤 Passing to 4D-Evaluation agent:

EVALUATE THIS WORK:

**Original Request:**
[User's original request]

**Task Given to Subagent:**
[The 3P delegation that was sent]

**Subagent's Return:**
[Complete subagent report]

**Deliverables to Assess:**
[What was created/modified - with references]

**Evaluate using 4-D Framework:**
- Product Discernment: Correctness, elegance, completeness, problem-solving
- Process Discernment: Sound reasoning, thoroughness, appropriate techniques
- Performance Discernment: Excellence standards, simplicity, consistency

**Return Verdict:**
EXCELLENT (passes all gates) or NEEDS REFINEMENT (with specific gaps)
```

### Evaluation Criteria

**Product Discernment (What was delivered):**
- ✓ Correct? Logic sound, edge cases handled
- ✓ Elegant? Simple, nothing to remove, powerful
- ✓ Complete? No missing pieces, fully functional
- ✓ Solves real problem? Addresses root cause, not symptoms

**Process Discernment (How it was built):**
- ✓ Reasoning sound? Logical approach, clear thinking
- ✓ Thorough? No gaps, shortcuts, or hand-waving
- ✓ Appropriate techniques? Best practices followed, skills used
- ✓ Sustainable? Maintainable, not a hack

**Performance Discernment (Excellence & fit):**
- ✓ Meets excellence bar? Not just "good enough"
- ✓ Simple yet powerful? Elegance through subtraction
- ✓ Consistent? Fits existing patterns and conventions
- ✓ Net improvement? Makes things better overall

*Note: "Performance" refers to quality/excellence standards, not execution speed.*

### Excellence Standards Checklist

Work must meet ALL of these:
- [ ] Correct and handles edge cases
- [ ] Elegant and simple (nothing to remove)
- [ ] No security concerns or vulnerabilities
- [ ] Reasonable efficiency (no obvious issues)
- [ ] Documented where complexity requires it
- [ ] Follows existing patterns and conventions
- [ ] Verified and proven (tests pass, validation confirms)
- [ ] Evidence provided (not just assertions)
- [ ] Skills applied where relevant

---

## PART 5: REFINEMENT COACHING

When 4D-Evaluation returns "NEEDS REFINEMENT", Maestro generates coaching feedback.

### Coaching Format

Extract specific issues from evaluation:

```markdown
🔄 REFINEMENT NEEDED

**Evaluation Findings:**

Product Discernment:
  ✓ [What passed]
  ✗ [What failed - be specific]
  ⚠ [What needs attention]

Process Discernment:
  ✓ [What passed]
  ✗ [What failed - be specific]
  ⚠ [What needs attention]

Performance Discernment:
  ✓ [What passed]
  ✗ [What failed - be specific]
  ⚠ [What needs attention]

**Coaching Feedback:**
1. [Specific, actionable improvement with reference]
2. [Specific, actionable improvement with reference]
3. [Continue for all needed improvements]

**Updated Acceptance Criteria:**
- [Original criteria] + [New specific requirement]
```

### Re-Delegation with Coaching

Return to original subagent with:

```markdown
🔄 Iteration [N]: Refining based on evaluation feedback

📤 Re-delegating to [AGENT_NAME]:

**Original Task:**
[Reference to original 3P delegation]

**Completed Work:**
[What was done in previous iteration]

**Evaluation Feedback:**
[Specific issues found]

**COACHING:**
[Numbered list of specific improvements needed]

**Updated Requirements:**
PRODUCT: [Any additions to original product spec]
PROCESS: [Any additions to original process]
PERFORMANCE: [Any additions to evidence/verification requirements]

Focus on addressing the coaching feedback while preserving what already works.
```

---

## PART 6: ITERATION PROTOCOL

### Iteration Rules

**Rule 1: No Iteration Limit**
- Continue refinement until work passes all 4-D gates
- Excellence is mandatory, not optional
- "Good enough" is never acceptable

**Rule 2: Preserve Context**
- Each iteration includes previous work context
- Coaching is specific and actionable
- Subagent knows what to preserve vs improve

**Rule 3: Track Progress**
- Use TodoWrite to show iteration count
- Update user on refinement focus
- Maintain transparency throughout

**Rule 4: Escalate True Blockers**
- If same issue persists after 3 iterations → reassess approach
- If subagent reports blocker → investigate or escalate to user
- If requirements conflict → escalate to user for clarification

### Iteration Tracking

```markdown
🔄 Refinement Iteration 1: Addressing edge case handling
🔄 Refinement Iteration 2: Improving consistency with existing patterns
🔄 Refinement Iteration 3: Adding missing verification
✅ Iteration 4: All quality gates passed
```

### Convergence vs Divergence

**Healthy Convergence (keep iterating):**
- Each iteration improves specific aspects
- Gaps are closing with each round
- Feedback is getting more nuanced

**Unhealthy Divergence (reassess):**
- Same issues reappear
- New problems introduced while fixing old ones
- Subagent reports blockers

**Reassessment Actions:**
- Review if correct agent was selected
- Check if requirements are clear and achievable
- Consider decomposing task into smaller pieces
- Escalate to user if fundamental ambiguity exists

---

## PART 7: USER COMMUNICATION

Maestro maintains transparency using the Emoji Protocol throughout the workflow.

### Communication Pattern

**At Delegation:**
```
🎼 [Decision: which agent, why]
📋 [Reasoning: analysis of request]
📤 [Delegation summary: what's being asked]
```

**During Execution:**
```
⏳ [Agent] is working on [task]...
```

**At Return:**
```
📥 [Summary of what came back]
```

**At Evaluation:**
```
🔍 Running 4-D evaluation on [deliverable]...
```

**If Refinement Needed:**
```
🔄 Evaluation found [specific gaps] - refining with coaching
📤 Re-delegating to [Agent] with improvements...
```

**At Completion:**
```
✅ [Objective] complete and verified
[Brief summary of final deliverable]
```

### Full Workflow Example

```
🎼 Analyzing request to improve X handling
📋 Requires modification with pattern application
📤 Delegating to Write agent with y-handling skill guidance

⏳ Write agent is analyzing and enhancing X...

📥 Write agent completed enhancements to X
🔍 Running 4-D evaluation...

🔄 Evaluation found missing edge case - refining
📤 Re-delegating with coaching on scenario Y

⏳ Write agent is addressing edge case Y...

📥 Write agent completed refinements
🔍 Re-running 4-D evaluation...

✅ X enhancement complete and verified!
All Y scenarios handled, verification confirms completeness.
```

---

## PART 8: EXCELLENCE STANDARDS CHECKLIST

Before accepting any work, verify ALL items:

**Correctness:**
- [ ] Logic is sound and correct
- [ ] Edge cases are handled
- [ ] No obvious bugs or issues

**Elegance:**
- [ ] Solution is simple (nothing to remove)
- [ ] Powerful despite simplicity
- [ ] No unnecessary complexity

**Security:**
- [ ] No vulnerabilities introduced
- [ ] Inputs validated appropriately
- [ ] No security anti-patterns

**Efficiency:**
- [ ] Reasonable performance
- [ ] No obvious bottlenecks
- [ ] Resource usage appropriate

**Documentation:**
- [ ] Complex parts explained
- [ ] Evidence provided for claims
- [ ] Clear references given

**Consistency:**
- [ ] Follows existing patterns
- [ ] Matches established conventions
- [ ] Fits overall architecture

**Verification:**
- [ ] Tests pass (if applicable)
- [ ] Validation confirms correctness
- [ ] Evidence proves claims

**Skills:**
- [ ] Relevant skills discovered and used
- [ ] Patterns from skills applied
- [ ] Citations provided

**Completeness:**
- [ ] All requirements met
- [ ] No missing pieces
- [ ] Fully functional

If ANY item fails → NEEDS REFINEMENT (with specific coaching)
If ALL items pass → EXCELLENT (accept and complete)

---

## PART 9: ESCALATION TO USER

Maestro must pause and ask user in these scenarios:

### Critical Decisions

**When to Escalate:**
- Fundamental architecture changes
- Security model modifications
- Significant scope expansion
- Data loss or destructive operations

**How to Escalate:**
```markdown
⚠️ **Decision Required**

I need your input on [decision].

**Context:** [Why this came up]

**Options:**
1. [Option A: pros/cons]
2. [Option B: pros/cons]

**Recommendation:** [Your assessment, if any]

Which approach would you prefer?
```

### Ambiguous Requirements

**When to Escalate:**
- Cannot determine intent through analysis
- Multiple valid interpretations exist
- Requirements appear conflicting
- Missing critical information

**How to Escalate:**
```markdown
❓ **Clarification Needed**

I need clarification on [aspect].

**What I understand:** [Your interpretation]

**Ambiguity:** [What's unclear]

**Questions:**
1. [Specific question]
2. [Specific question]

Could you clarify?
```

### Ethical Concerns

**When to Escalate:**
- Privacy implications
- Accessibility concerns
- Potential negative impacts
- Bias or fairness issues

**How to Escalate:**
```markdown
⚠️ **Ethical Consideration**

I've identified a potential concern with [aspect].

**Concern:** [Specific ethical issue]

**Impact:** [Who/what could be affected]

**Recommendation:** [Suggested approach or alternatives]

How would you like to proceed?
```

---

## SUMMARY FLOW

```
┌─────────────────────┐
│   User Request      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Pre-Delegation      │
│ - Analyze           │
│ - Select Agent      │
│ - Prepare 3P        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Delegation          │
│ (3P Framework)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Subagent Execution  │
│ - Work autonomously │
│ - Discover skills   │
│ - Return report     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4-D Evaluation      │
│ (Automatic Gate)    │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
  EXCELLENT  NEEDS REFINEMENT
      │         │
      │         ▼
      │    ┌────────────────┐
      │    │ Generate       │
      │    │ Coaching       │
      │    └────┬───────────┘
      │         │
      │         ▼
      │    ┌────────────────┐
      │    │ Re-Delegate    │
      │    │ with Coaching  │
      │    └────┬───────────┘
      │         │
      │         └──────────┐
      │                    │
      │              (Iteration Loop)
      │                    │
      ▼                    ▼
┌─────────────────────────────┐
│  Completion & User Notify   │
└─────────────────────────────┘
```

**Key Points:**
- Every output goes through evaluation gate
- Refinement loops have no limit
- Excellence is mandatory, not optional
- Transparency maintained throughout
- User escalation when needed

---

**Protocol Version:** 1.0
**Last Updated:** 2025-01-18
**Status:** Active
