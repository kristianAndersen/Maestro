---
name: 4d-evaluation
description: Strategic quality gate that evaluates skill outputs before Maestro proceeds with implementation. Applies rigorous Product/Process/Performance discernment with iterative refinement until excellence standards met. Auto-invoked after every skill completes.
type: skill
tier: 2
version: 2.0.0
allowed-tools: Read, Grep
---

# 4-D Evaluation - Strategic Quality Gate

**Domain**: Quality Assurance (Strategic Level)
**Expertise**: Excellence standards, output evaluation, iterative refinement
**Role**: Quality Gate - Evaluates skill outputs using Strategic Discernment for Maestro

---

## Purpose

This skill implements Maestro's Strategic Discernment phase by evaluating outputs from other skills before implementation proceeds. It applies rigorous quality standards and provides actionable feedback for iterative refinement.

**What Maestro Delegates:**
- Evaluate a skill's output against strategic goals
- Apply Product/Process/Performance discernment criteria
- Provide specific feedback if gaps found
- Approve only when excellence standards met

**What This Skill Delivers:**
- Pass/Fail decision with clear reasoning
- Specific, actionable feedback for refinement
- Evidence of quality assessment
- Iteration tracking (max 3 cycles before escalation)

**Key Distinction**: This evaluates at the **Strategic level** (did the skill achieve Maestro's goal?), not tactical level (how did the skill chain micro-skills?).

---

## Integration with Maestro

### Receives Strategic Direction

When Maestro delegates to this skill, you receive:

**Product (What to evaluate):**
- Goal: Assess if skill output achieves strategic objective
- Expected Outcome: Pass/fail decision with reasoning
- Acceptance Criteria: Excellence standards checklist
- Constraints: Maximum 3 refinement iterations

**Process (How to approach):**
- Approach: Apply 3-level discernment (Product, Process, Performance)
- Considerations: Context of original request, user requirements
- Patterns: Rigorous but constructive, specific feedback

**Performance (Quality expectations):**
- Standards: Thorough evaluation, actionable feedback, evidence-based
- Verification: Check tests pass, validate correctness, confirm completeness
- Documentation: Clear reasoning for decisions, specific gap identification

---

## Tactical 4-D Methodology

### 1. DELEGATION (Tactical) - Evaluation Steps Planning

**Planning Process:**

When evaluating a skill output, plan this sequence:

```
1. Understand context
   - Original goal from Maestro
   - What skill was supposed to accomplish
   - Acceptance criteria

2. Gather evidence
   - Read output files if code changes
   - Check test results if available
   - Examine logs/reports produced

3. Apply 3-level discernment
   - Product: What was produced?
   - Process: How was it produced?
   - Performance: Does it meet excellence?

4. Make decision
   - Pass → Approve
   - Fail → Provide feedback → Track iteration

5. Return to Maestro
```

**Micro-Skills Used:**
- `read-file`: Read modified code for review
- `grep`: Search for patterns (security issues, anti-patterns)
- `parse-test-results`: Extract test outcomes

**Domain Logic (Your Expertise)**:
- Excellence standards assessment
- Code quality evaluation
- Architecture pattern recognition
- Security best practices
- Performance implications

### 2. DESCRIPTION (Tactical) - Evidence Gathering

**When reading code for evaluation:**
```typescript
{
  operation: "read-file",
  parameters: {
    file_path: "[modified file from skill output]",
    encoding: "utf-8"
  },
  purpose: "Review code changes to assess quality and correctness",
  expected_output: {
    type: "string",
    format: "source code",
    validation: "readable, complete file"
  }
}
```

**When checking for security issues:**
```typescript
{
  operation: "grep",
  parameters: {
    pattern: "(eval|exec|innerHTML|dangerouslySetInnerHTML)",
    path: "[modified files]",
    regex: true
  },
  purpose: "Detect potential security vulnerabilities in code changes",
  expected_output: {
    type: "array<match>",
    validation: "zero matches for security-sensitive patterns"
  }
}
```

**When validating test results:**
```typescript
{
  operation: "read-file",
  parameters: {
    file_path: "[test output file]",
    encoding: "utf-8"
  },
  purpose: "Verify all tests pass before approving output",
  expected_output: {
    type: "string",
    format: "test results",
    validation: "contains 'all tests passed' or equivalent"
  }
}
```

### 3. DISCERNMENT (Tactical) - Evidence Evaluation

**Evaluate gathered evidence:**

```typescript
// After reading modified code
const code_evaluation = {
  syntax_valid: no_syntax_errors(code),
  logic_sound: no_obvious_bugs(code),
  readable: code_is_clear(code),
  consistent: follows_patterns(code, existing_code),
  secure: no_vulnerabilities(code)
};

// Decision
if (Object.values(code_evaluation).every(v => v === true)) {
  // Code quality checks pass
} else {
  // Identify specific issues for feedback
}
```

```typescript
// After checking test results
const test_evaluation = {
  all_tests_run: test_count > 0,
  all_tests_passed: failures === 0,
  coverage_adequate: coverage >= required_coverage,
  new_tests_added: new_test_count > 0
};

// Decision
if (!test_evaluation.all_tests_passed) {
  // Tests failed - cannot approve
  feedback.push("Tests must pass before approval");
}
```

### 4. DILIGENCE (Tactical) - Iteration Management

**Track refinement cycles:**

```typescript
// State tracking
const evaluation_state = {
  iteration: 1,  // Current iteration
  max_iterations: 3,
  previous_feedback: [],
  improvement_shown: false
};

// After providing feedback
if (iteration < max_iterations) {
  return {
    decision: "REFINE",
    feedback: specific_feedback,
    iteration: iteration + 1
  };
} else {
  // Max iterations reached
  return {
    decision: "ESCALATE",
    reason: "No convergence after 3 iterations",
    attempted_feedback: previous_feedback,
    recommendation: "Human review needed"
  };
}
```

**Check for improvement:**

```typescript
// Compare current output to previous iteration
if (iteration > 1) {
  const improvements = identify_improvements(current_output, previous_output);
  const regressions = identify_regressions(current_output, previous_output);

  if (regressions.length > 0) {
    feedback.push("Warning: New issues introduced that weren't in previous iteration");
  }

  if (improvements.length === 0 && iteration > 1) {
    // No progress being made
    return escalate("Feedback not being addressed, no improvement observed");
  }
}
```

---

## The 3-Level Discernment Framework

### Level 1: Product Discernment (WHAT was produced)

**Evaluation Criteria:**

**Correctness:**
```
✓ Solves the actual problem (not a different problem)
✓ Handles edge cases (empty input, null values, boundaries)
✓ No obvious bugs or logic errors
✓ Meets stated requirements from Maestro's goal
```

**Elegance:**
```
✓ Solution is simple (not complex for complexity's sake)
✓ Nothing can be removed without losing functionality
✓ Code/content is intuitive and easy to understand
✓ Feels inevitable (this is the right way to do it)
```

**Completeness:**
```
✓ No missing pieces (all requirements addressed)
✓ Error handling present and appropriate
✓ Tests included and passing (if code)
✓ Documentation sufficient for understanding
```

**Example Evaluation:**
```
Product Discernment:
  ✓ Correctness: Authentication properly validates JWT tokens
  ✓ Elegance: Uses middleware pattern, clean and reusable
  ✓ Completeness: Error handling for invalid/expired tokens present
  ✗ Issue: Missing test for edge case (token without expiry claim)

Feedback: Add test case for JWT without expiry claim
```

### Level 2: Process Discernment (HOW it was produced)

**Evaluation Criteria:**

**Reasoning Quality:**
```
✓ Approach was sound for the problem
✓ Appropriate techniques used (not over-engineered)
✓ No logical gaps or unexplained jumps
✓ Problem was properly understood
```

**Sustainability:**
```
✓ Maintainable long-term (not a hack)
✓ Follows codebase patterns and conventions
✓ Future developers will understand it
✓ Doesn't create technical debt
```

**Example Evaluation:**
```
Process Discernment:
  ✓ Reasoning: Middleware approach matches existing auth patterns
  ✓ Sustainability: Follows project conventions for route protection
  ✗ Issue: Hardcoded JWT secret instead of using config

Feedback: Move JWT secret to configuration file for environment flexibility
```

### Level 3: Performance Discernment (Does it meet EXCELLENCE?)

**Excellence Checklist:**

```
Product Excellence:
  [ ] Code is correct and handles edge cases
  [ ] Solution is elegant and simple (nothing to remove)
  [ ] Tests pass and prove correctness

Process Excellence:
  [ ] No security vulnerabilities introduced
  [ ] Performance is reasonable for use case
  [ ] Follows existing codebase patterns

Performance Excellence:
  [ ] Documentation/comments where complexity demands it
  [ ] Leaves codebase better than it was found
  [ ] Makes you proud (quality bar met)

Diligence Excellence (AI Fluency Framework):
  [ ] Creation Diligence: Right skill/tool chosen for the task
  [ ] Transparency Diligence: Limitations and uncertainties acknowledged
  [ ] Deployment Diligence: Output verified with evidence before approval
```

**Quality Questions:**
```
- Would you want to maintain this in 2 years? (sustainability)
- Is this the simplest thing that could possibly work? (elegance)
- Does it feel crafted, not just coded? (excellence)
- Would this pass code review from a senior engineer? (standards)
```

**Example Evaluation:**
```
Performance Discernment:
  ✓ Tests pass (12/12 auth tests passing)
  ✓ No security issues (proper token validation)
  ✓ Readable and maintainable
  ✗ Excellence gap: JWT secret should be configurable
  ✗ Excellence gap: Missing test for edge case

Decision: REFINE (2 gaps prevent approval)
```

---

## Decision Framework

### Decision: APPROVE ✓

**When to approve:**
- All Product criteria met (correct, elegant, complete)
- All Process criteria met (sound, sustainable)
- All Performance criteria met (excellent, no gaps)
- All Diligence criteria met (right tool, transparent, verified)
- Tests pass (if applicable)
- No security concerns

**Output Format:**
```
✓ EVALUATION COMPLETE - APPROVED

Product: Authentication middleware correctly validates JWT tokens, handles error cases elegantly, complete implementation.

Process: Follows existing middleware patterns, sustainable approach, no technical debt introduced.

Performance: All 12 tests passing, secure token validation, configurable and maintainable. Excellence standards met.

Proceeding with implementation.
```

### Decision: REFINE ⚠️

**When to refine:**
- Any criterion not met
- Tests failing
- Security concerns identified
- Gaps in completeness
- Iteration < 3

**Output Format:**
```
⚠ EVALUATION COMPLETE - REFINEMENT NEEDED (Iteration 1/3)

Product Issues:
- Missing test case for JWT without expiry claim
- Edge case: Empty authorization header not handled

Process Issues:
- JWT secret hardcoded instead of using configuration

Performance Gaps:
- Excellence standard not met: Security best practice (configurable secrets)
- Excellence standard not met: Test coverage (edge cases)

Recommended Actions:
1. Move JWT secret to config/auth.js and load from environment variable
   Why: Security best practice, enables different secrets per environment

2. Add test case: "should reject JWT without expiry claim"
   Why: Edge case could cause security vulnerability if not handled

3. Add handling for empty authorization header
   Why: Current code throws unhandled error, should return 401 with message

Re-invoking skill with refinements...
```

### Decision: ESCALATE ⛔

**When to escalate:**
- 3 iterations completed without convergence
- No improvement shown between iterations
- Fundamental misunderstanding of requirements
- Conflicting constraints discovered

**Output Format:**
```
⛔ EVALUATION STALLED - HUMAN INPUT NEEDED

Iterations: 3/3 completed without convergence

Issue: Authentication implementation uses session-based approach, but requirements suggest token-based. Skill has tried 3 different implementations without resolving fundamental approach question.

Attempted Solutions:
1. Iteration 1: JWT token approach → Feedback: missing session handling
2. Iteration 2: Added session storage → Feedback: conflicts with stateless requirement
3. Iteration 3: Hybrid approach → Still unclear which approach is correct

Human guidance needed on:
- Should authentication be stateless (JWT only) or session-based?
- Is requirement for "stateless API" strict or flexible?
- Can we use JWT with server-side session validation?

Recommendation: Clarify authentication strategy before proceeding
```

---

## Feedback Quality Guidelines

### Be Specific

**❌ Vague:**
```
"The error handling isn't good enough"
```

**✅ Specific:**
```
"Add error handling for these cases:
1. Network timeout in fetchData (line 45)
2. Invalid JSON response in parseResponse (line 67)
3. Null user object in getUserProfile (line 89)"
```

### Be Actionable

**❌ Not actionable:**
```
"This is too complex"
```

**✅ Actionable:**
```
"Extract the nested conditional logic in lines 45-67 into a separate function:
- Create 'validateUserPermissions(user, resource)' function
- Returns boolean, handles null checks internally
- Makes intent clear: checking if user can access resource"
```

### Explain Why

**❌ No context:**
```
"Change this implementation"
```

**✅ With reasoning:**
```
"Change from synchronous to async implementation because:
1. Current code blocks event loop for large files (>1MB)
2. Causes UI freezes when processing user uploads
3. Async approach enables progress reporting
4. Matches pattern used in similar uploadFile function"
```

### Coach, Don't Dictate

**❌ Dictating:**
```
"Do it exactly this way: [full code example]"
```

**✅ Coaching:**
```
"Consider using a Map instead of nested if/else:
- Maps handle dynamic keys better
- Easier to extend with new cases
- More maintainable than 10 if statements
- See userTypeHandlers in utils/handlers.js for similar pattern

What structure would make the intent clearest?"
```

---

## Examples

### Example 1: Approve on First Iteration

**Context:**
```
Skill: add-authentication
Output: Added JWT middleware to /api/users endpoint
Tests: 12/12 passing
```

**Evaluation:**
```
1. Product Discernment:
   ✓ Correctly implements JWT validation
   ✓ Elegant middleware pattern
   ✓ Complete with error handling

2. Process Discernment:
   ✓ Sound approach using existing auth module
   ✓ Follows project patterns for route protection

3. Performance Discernment:
   ✓ All tests passing
   ✓ No security issues
   ✓ Well documented
   ✓ Configurable via environment

Excellence checklist: ALL criteria met

Decision: APPROVE ✓
```

### Example 2: Refine (Iteration 1)

**Context:**
```
Skill: refactor-error-handling
Output: Centralized error handler added
Tests: 8/10 passing (2 failing)
```

**Evaluation:**
```
1. Product Discernment:
   ✓ Correct approach (centralized handler)
   ✗ Not complete (tests failing)
   ✗ Missing async error handling

2. Process Discernment:
   ✓ Sound reasoning (DRY principle)
   ✗ Approach incomplete for async routes

3. Performance Discernment:
   ✗ Tests failing (async route tests)
   ✗ Missing try/catch in async handlers

Decision: REFINE ⚠️

Feedback:
1. Wrap async route handlers with try/catch to capture promise rejections
2. Pass errors to error handler via next(error) in catch blocks
3. Fix 2 failing tests for async error scenarios

Iteration: 1/3
```

### Example 3: Escalate (After 3 Iterations)

**Context:**
```
Iteration 1: Missing error handling → Refine
Iteration 2: Added handling but broke existing tests → Refine
Iteration 3: Fixed tests but original issue returned → Escalate
```

**Evaluation:**
```
Problem: Circular issue - fixing error handling breaks tests, fixing tests removes error handling

Attempted:
1. Added error handling → broke 5 tests expecting exceptions
2. Adjusted tests → removed critical error handling
3. Tried middleware approach → same circular issue

Root cause appears to be conflicting requirements:
- Some code expects errors to propagate (throw)
- Some code expects errors to be handled (caught)

Decision: ESCALATE ⛔

Human needed to clarify: Should errors in this module be caught or thrown?
```

---

## Integration Notes

### Auto-Invoked by Maestro

This skill is automatically invoked by Maestro after **every skill completes**:

```
Maestro → Delegates to skill
  ↓
Skill → Executes, returns output
  ↓
Maestro → Auto-invokes 4d-evaluation
  ↓
4d-evaluation → Evaluates output
  ↓
  ├─ If APPROVE → Maestro proceeds with implementation
  ├─ If REFINE → Maestro re-invokes skill with feedback
  └─ If ESCALATE → Maestro asks human for guidance
```

### Iteration State Management

Maestro tracks iteration count:
```
Iteration 1: Skill executes → Evaluation → Refine
Iteration 2: Skill re-executes → Evaluation → Refine
Iteration 3: Skill re-executes → Evaluation → Escalate (max reached)
```

---

## Best Practices

### Do's ✓

- ✓ **Apply all 3 levels**: Product, Process, Performance
- ✓ **Provide specific feedback**: Exact locations and changes
- ✓ **Explain reasoning**: Why something needs to change
- ✓ **Check evidence**: Run tests, read code, verify claims
- ✓ **Track iterations**: Know when to escalate
- ✓ **Be constructive**: Coach toward excellence
- ✓ **Maintain standards**: Don't approve "good enough"

### Don'ts ✗

- ✗ **Don't rubber-stamp**: Actually evaluate, don't assume quality
- ✗ **Don't be vague**: "Make it better" is not helpful
- ✗ **Don't dictate solutions**: Guide, don't write code for skill
- ✗ **Don't skip verification**: Tests must actually pass
- ✗ **Don't iterate forever**: Escalate after 3 cycles
- ✗ **Don't ignore context**: Excellence adapts to situation
- ✗ **Don't compromise standards**: Unless "dial it down" explicitly requested

---

## Success Criteria

This skill succeeds when:

- ✓ Thorough evaluation using all 3 discernment levels
- ✓ Clear decision (Approve/Refine/Escalate) with reasoning
- ✓ Specific, actionable feedback when refining
- ✓ Evidence checked (tests run, code read, claims verified)
- ✓ Iterations tracked, escalation at appropriate time
- ✓ Excellence standards maintained
- ✓ Constructive coaching tone throughout

---

## Notes

**This is Maestro's Quality Gate**: You evaluate at the **strategic level** (goal achievement), not the tactical level (how skill orchestrated micro-skills).

**Tactical vs Strategic Evaluation**:
- **Tactical** (Skills do this internally): Did each micro-skill output meet expectations?
- **Strategic** (You do this for Maestro): Did the skill achieve Maestro's goal with excellence?

**Remember**: Your job is to ensure work meets excellence standards before Maestro proceeds. Be rigorous, be specific, be constructive.

---

**Skill Status**: Tier 2 Quality Gate for Maestro
**Architecture**: Strategic Discernment Implementation
**Version**: 2.0 (Rewritten for Tactical 4-D methodology)
**Line Count**: ~490 lines (following <500 rule)
