# Detecting and Resolving Stuck Refinement Loops

This document provides comprehensive guidance on detecting stuck situations, implementing circuit breakers, escalation strategies, advanced refinement patterns, and measuring progress.

## Detecting Stuck Situations

### Symptoms of Stuck Loops

**Symptom 1: Same Issues Recurring**
```
Iteration 1: Missing file references
Iteration 2: Still missing file references
Iteration 3: Still missing file references
```

**Root cause:** Coaching not clear, or agent lacks capability.

**Symptom 2: No Measurable Progress**
```
Iteration 1: 40% complete
Iteration 2: 42% complete
Iteration 3: 43% complete
```

**Root cause:** Incremental tweaking without addressing core issues.

**Symptom 3: New Issues Each Time**
```
Iteration 1: Missing references
Iteration 2: References added, but now missing severity
Iteration 3: Severity added, but now missing recommendations
```

**Root cause:** Agent fixing one thing but breaking another (whack-a-mole).

**Symptom 4: Circular Reasoning**
```
Iteration 1: Too vague
Iteration 2: Now too detailed
Iteration 3: Back to too vague
```

**Root cause:** Agent misunderstanding what you want.

**Symptom 5: Agent Confusion**
```
Agent: "I'm not sure what you want me to do differently"
Agent: "Can you clarify the requirement?"
Agent: "I think I did what you asked?"
```

**Root cause:** Unclear coaching or ambiguous requirements.

### Stuck Loop Analysis Framework

**After 3 iterations without EXCELLENT, ask:**

**Question 1: Is my coaching specific enough?**
- Am I pointing to exact issues?
- Am I showing examples?
- Am I giving actionable steps?

If NO → Improve coaching specificity

**Question 2: Is this the right agent for the task?**
- Does this agent have required capabilities?
- Is the task within agent's domain?
- Would different agent be better?

If NO → Switch to appropriate agent

**Question 3: Is the task actually possible?**
- Are requirements clear?
- Is information available?
- Are there blockers?

If NO → Simplify task or escalate to user

**Question 4: Is evaluation criteria too strict/unclear?**
- Are standards achievable?
- Am I asking for mutually exclusive things?
- Is "excellent" well-defined?

If NO → Clarify or adjust criteria

### Circuit Breaker Implementation

**3-Iteration Circuit Breaker:**

```markdown
# After 3rd NEEDS REFINEMENT

Pause and analyze:

**Iterations so far:**
1. Issue: [what was wrong]
2. Issue: [what was wrong]
3. Issue: [what was wrong]

**Pattern analysis:**
- Same issue recurring? → Coaching not working
- Different issues each time? → Whack-a-mole situation
- No progress? → Wrong approach

**Root cause hypothesis:**
[Based on pattern, identify likely root cause]

**Corrective action:**
[Specific change to make before iteration 4]

Example corrective actions:
- Switch agents (if wrong agent)
- Simplify task (if too complex)
- Improve coaching specificity (if vague)
- Provide complete example (if unclear)
- Break into smaller sub-tasks (if overwhelming)
```

**5-Iteration Circuit Breaker:**

```markdown
# After 5th NEEDS REFINEMENT

Hard stop. Escalate to user.

**To user:**

"I've attempted to [task description] 5 times but haven't achieved excellent results. Here's what happened:

**Attempts:**
1. [Iteration 1 issue]
2. [Iteration 2 issue]
3. [Iteration 3 issue]
4. [Iteration 4 issue]
5. [Iteration 5 issue]

**Root challenge:**
[Explain the core problem]

**Options to proceed:**

**Option 1: Simplify the task**
- Break into smaller pieces
- [Specific simplified approach]
- Likely to succeed but takes longer

**Option 2: Accept current state with limitations**
- Current output has these strengths: [list]
- Current output has these gaps: [list]
- May be sufficient for your needs?

**Option 3: Provide additional context**
- I need clarification on: [specific questions]
- Or: I need access to: [specific resources]
- This would help me complete successfully

**Option 4: Different approach**
- [Alternative method]
- Higher chance of success
- Trade-offs: [explain]

Which option would you prefer, or do you have another approach in mind?"
```

## Escalation Strategies

### When to Escalate to User

**Immediate escalation (don't iterate):**
- Task is impossible (file doesn't exist, API down)
- Missing critical information (requirements unclear)
- Ambiguous requirements (multiple valid interpretations)
- External dependencies (need user's decision/access)

**After 3 iterations:**
- Same issue persisting despite specific coaching
- Agent seems incapable of requirement
- No measurable progress

**After 5 iterations:**
- Any situation (circuit breaker rule)
- Persistent challenges
- Time to involve user

### Escalation Message Template

```markdown
**What I'm trying to do:**
[Clear task description]

**Challenge I'm facing:**
[Specific problem]

**What I've tried:**
1. [Approach 1] - Result: [outcome]
2. [Approach 2] - Result: [outcome]
3. [Approach 3] - Result: [outcome]

**Why it's not working:**
[Root cause analysis]

**What I need from you:**
[Specific ask: clarification, decision, access, etc.]

**Options if you'd like to proceed differently:**
1. [Alternative 1]
2. [Alternative 2]
3. [Alternative 3]
```

### Escalation vs Giving Up

**Escalation (GOOD):**
- Explains what was attempted
- Analyzes root cause
- Provides options
- Seeks user input
- Maintains forward momentum

**Giving Up (BAD):**
- "I can't do this"
- No explanation
- No options provided
- Dead end
- Frustrating for user

## Advanced Refinement Patterns

### Pattern: Scaffolding (Build Gradually)

**Use when:** Task is complex and agent is overwhelmed.

**Approach:**
```markdown
# Instead of: "Do all 10 things correctly"

# Do: Build incrementally

Iteration 1:
"First, just add file:line references. Don't worry about other issues yet."

Iteration 2:
"Good! Now add severity ratings to each finding."

Iteration 3:
"Excellent! Now make recommendations specific with code examples."

Each iteration builds on previous success.
```

### Pattern: Constraint Relaxation

**Use when:** Standards might be too strict.

**Approach:**
```markdown
# Original requirement:
"Analyze all 50 files with complete security assessment"

# After 3 failed iterations:
"Let's narrow scope: Analyze top 10 highest-risk files with complete security assessment"

# Deliver quality on subset rather than poor quality on everything
```

### Pattern: Reference Implementation

**Use when:** Agent keeps misunderstanding what you want.

**Approach:**
```markdown
"Let me show you exactly what I want by doing one example:

**Example Finding (this is the format I need):**

CRITICAL: SQL Injection Vulnerability
Location: src/auth/login.py:45
Current Code:
```python
cursor.execute(f"SELECT * FROM users WHERE username='{username}'")
```
Issue: Direct string interpolation allows attacker to inject SQL
OWASP: A1-Injection
Impact: Attacker can access all user data, modify database, or delete data
Fix:
```python
cursor.execute('SELECT * FROM users WHERE username=?', (username,))
```
Testing: Try input: ' OR '1'='1 - should be safely escaped

---

Now, create findings for the other 4 vulnerabilities in this exact format."
```

### Pattern: Collaborative Refinement

**Use when:** Agent is close but needs minor tweaks.

**Approach:**
```markdown
"Your analysis is 90% excellent! Let me help with the last 10%:

**Your Finding #3 (current version):**
'Weak validation in validators.py'

**My refined version of your Finding #3:**
'CRITICAL: Missing Input Length Validation
Location: src/auth/validators.py:34
Code: def validate_username(username):
        return username.isalnum()
Issue: No length check allows extremely long usernames (DoS risk)
Fix: def validate_username(username):
        if len(username) < 3 or len(username) > 20:
            return False
        return username.isalnum()'

See the difference? Now refine your other findings to this level of detail."
```

### Pattern: Partial Acceptance

**Use when:** Part of output is excellent, part needs work.

**Approach:**
```markdown
"Your analysis has two parts:

**Part A: Security Analysis** ✓ EXCELLENT
- Complete, thorough, well-documented
- I'm accepting this part

**Part B: Performance Analysis** ✗ NEEDS REFINEMENT
- Missing metrics
- Vague recommendations

Let's keep Part A as-is. Focus only on improving Part B:
[Specific coaching for Part B]

You don't need to redo Part A."
```

## Measuring Progress

### Progress Indicators

**Positive signs (converging toward EXCELLENT):**
- Issues from previous iteration resolved
- New issues are minor (not major)
- Quality improving each iteration
- Agent understanding improving
- Fewer issues each time

**Warning signs (not converging):**
- Same issues recurring
- Quality not improving
- More issues appearing
- Agent seems confused
- No measurable progress

### Progress Tracking Template

```markdown
# Refinement Progress Tracker

**Iteration 1:**
Issues: [5 major issues]
Status: NEEDS REFINEMENT

**Iteration 2:**
Resolved: [2 of 5 issues]
New issues: [1 minor issue]
Status: NEEDS REFINEMENT (progress: 40%)

**Iteration 3:**
Resolved: [3 more issues]
New issues: [0]
Status: NEEDS REFINEMENT (progress: 95%)

**Iteration 4:**
Resolved: [all remaining issues]
Status: EXCELLENT ✓

Total iterations: 4 (within acceptable range)
```

### Convergence Metrics

**Fast convergence (1-2 iterations):**
- Simple issues
- Clear coaching
- Capable agent
- Good understanding

**Normal convergence (3-4 iterations):**
- Multiple issues
- Complex requirements
- Incremental improvement
- Typical for substantial work

**Slow convergence (5+ iterations):**
- Major issues or misunderstanding
- Circuit breaker triggered
- Intervention needed
- Consider escalation

## Summary

**Detecting Stuck Situations:**
- Monitor for recurring issues
- Track measurable progress
- Watch for whack-a-mole pattern
- Notice agent confusion signals
- Analyze root cause after 3 iterations

**Circuit Breakers:**
- 3-iteration breaker: Analyze and adjust approach
- 5-iteration breaker: Escalate to user (hard stop)
- Never continue indefinitely

**Escalation:**
- Immediate: If task impossible or missing info
- After 3 iterations: If stuck with no progress
- After 5 iterations: Always (mandatory)
- Provide context, options, and maintain momentum

**Advanced Patterns:**
1. Scaffolding - Build incrementally on success
2. Constraint Relaxation - Reduce scope if needed
3. Reference Implementation - Show exact example
4. Collaborative Refinement - Help agent finish
5. Partial Acceptance - Accept good parts, refine rest

**Progress Tracking:**
- Positive: Fewer issues, quality improving
- Warning: Same issues, no improvement
- Measure: Track resolution rate and new issues
- Convergence: 1-2 fast, 3-4 normal, 5+ slow

**Key Principles:**
- Circuit breakers prevent infinite loops
- Escalation maintains user control
- Every iteration should show improvement
- Coaching quality determines convergence speed
- Excellence is the goal, not speed
