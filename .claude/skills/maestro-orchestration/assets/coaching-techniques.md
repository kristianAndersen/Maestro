# Coaching Techniques for Refinement

This document provides detailed guidance on understanding refinement, crafting effective coaching at different levels, and applying specific coaching techniques.

## Understanding Refinement

### Why Refinement Happens

**Product Discernment Issues:**
- Incomplete deliverables (missing files, partial analysis)
- Incorrect solutions (wrong approach, bugs)
- Doesn't solve real problem (misunderstood requirement)
- Lacks elegance (works but clunky)
- Missing completeness (90% done)

**Process Discernment Issues:**
- Wrong approach taken (inefficient method)
- Steps skipped (shortcut taken)
- Skills not activated (missed guidance)
- Reasoning flawed (logical gaps)
- Shortcuts taken (cut corners)

**Performance Discernment Issues:**
- Missing evidence (no file:line references)
- Poor quality (sloppy work)
- Doesn't meet excellence bar (good enough, not excellent)
- Wrong format (not structured as requested)
- Unprofessional presentation

### The Refinement Cycle

```
Delegate → Execute → Evaluate → Decision
                                    │
                        ┌───────────┴───────────┐
                        ▼                       ▼
                   EXCELLENT              NEEDS REFINEMENT
                        │                       │
                    Accept                 Analyze Issues
                        │                       │
                    Deliver                Create Coaching
                                               │
                                           Re-delegate
                                               │
                                               └─→ (back to Execute)
```

**Key insight:** Each refinement cycle should bring measurable improvement toward EXCELLENT.

## Crafting Effective Coaching

### The Coaching Formula

**Effective coaching has three components:**
1. **What's wrong** (specific issues identified)
2. **Why it matters** (impact/importance)
3. **How to fix** (actionable steps)

### Pattern: Basic Coaching Structure

```markdown
@agent (REFINEMENT)

**PRODUCT:** [Same objective]

**Issues from evaluation:**

1. [Specific issue #1]
   - Why this matters: [Impact]
   - How to fix: [Actionable step]

2. [Specific issue #2]
   - Why this matters: [Impact]
   - How to fix: [Actionable step]

**What good looks like:**
[Example of desired output]

Please revise addressing all issues above.
```

### Level 1: Simple Coaching (Minor Issues)

**Use when:**
- Small gaps in deliverable
- Format issues
- Minor omissions
- Easy fixes

**Example:**
```markdown
@base-analysis (REFINEMENT)

**Issue:** Missing severity ratings for findings

**How to fix:** Add severity rating to each finding using this format:
- CRITICAL: Immediate security/data risk
- HIGH: Significant impact on security/functionality
- MEDIUM: Notable issue, should fix soon
- LOW: Minor issue, fix when convenient

Please add severity ratings to all 5 findings in your report.
```

**Characteristics:**
- Single issue or related issues
- Clear fix path
- No major structural problems
- Usually resolved in 1 iteration

### Level 2: Moderate Coaching (Multiple Issues)

**Use when:**
- Multiple unrelated issues
- Some structural problems
- Process not followed
- Missing evidence

**Example:**
```markdown
@base-analysis (REFINEMENT)

**Issues from evaluation:**

1. **Incomplete coverage (Product issue)**
   - You analyzed login.py and session.py
   - You missed validators.py (it was in the requirement)
   - Impact: Incomplete security assessment
   - Fix: Add full analysis of validators.py

2. **Missing evidence (Performance issue)**
   - Your findings lack file:line references
   - Example: "SQL injection risk" - where exactly?
   - Impact: Can't verify or fix issues
   - Fix: Add location for each: `filename.py:123`

3. **Vague recommendations (Performance issue)**
   - Example: "Fix the validation"
   - Impact: Not actionable
   - Fix: Specific steps with code examples

**What good looks like:**

CRITICAL: SQL Injection Vulnerability
Location: src/auth/login.py:45
Code: cursor.execute(f"SELECT * FROM users WHERE username='{username}'")
Recommendation: Use parameterized query:
  cursor.execute("SELECT * FROM users WHERE username=?", (username,))

Please revise with all three issues addressed.
```

**Characteristics:**
- 2-4 distinct issues
- Categorized by discernment type
- Examples of good output provided
- May take 1-2 iterations

### Level 3: Substantial Coaching (Major Revision)

**Use when:**
- Fundamental approach wrong
- Major structural issues
- Critical omissions
- Complete rework needed

**Example:**
```markdown
@base-analysis (REFINEMENT)

**Major issues requiring substantial revision:**

**1. Wrong framework applied (Process issue)**
- You used generic code review approach
- Requirement was: "Apply OWASP Top 10 framework"
- Impact: Missing critical security categories
- Fix: Go through each OWASP category:
  1. Injection
  2. Broken authentication
  3. Sensitive data exposure
  4. XML external entities
  5. Broken access control
  6. Security misconfiguration
  7. Cross-site scripting
  8. Insecure deserialization
  9. Components with known vulnerabilities
  10. Insufficient logging

**2. No evidence provided (Performance issue)**
- Every finding is a claim without proof
- Example: "Weak password validation" - show me the code
- Impact: Can't verify these are real issues
- Fix: For EVERY finding provide:
  - File path and line number
  - Code snippet showing the issue
  - Why it's a problem
  - How to fix it with code

**3. Missing required files (Product issue)**
- You only analyzed 2 of 5 required files
- Required: login.py, session.py, validators.py, middleware.py, config.py
- You analyzed: login.py, session.py
- Impact: 60% of requirement missing
- Fix: Analyze all 5 files

**How to approach the revision:**

Step 1: Read ALL 5 required files
Step 2: For each file, check against all 10 OWASP categories
Step 3: For each finding, provide:
  - OWASP category
  - Severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Location (file:line)
  - Code snippet
  - Specific fix with code example

Step 4: Organize report by severity:
  - CRITICAL findings
  - HIGH findings
  - MEDIUM findings
  - LOW findings

Please perform complete revision following these steps.
```

**Characteristics:**
- Fundamental problems
- Step-by-step revision approach
- Major structural guidance
- May take 2-3 iterations

### Level 4: Complete Re-direction (Wrong Path)

**Use when:**
- Completely wrong approach
- Misunderstood requirement
- Wrong agent for task
- Need to start over

**Example:**
```markdown
# Original delegation had wrong agent

@base-research was asked to analyze code quality
[Research agent tried but lacks analysis capabilities]
[Multiple iterations failed]

# Re-direction: Switch agents

@base-analysis

**PRODUCT:** Code quality analysis of authentication module

**Context:**
Previous attempt with base-research agent didn't work (research agent can't do quality analysis). You're the right agent for this task.

**PROCESS:**
1. Activate base-analysis skill
2. Read authentication files
3. Apply quality frameworks
4. Document findings with evidence

**PERFORMANCE:**
- Quality metrics provided
- File:line references
- Specific recommendations
- Structured report

This is a fresh start with the correct approach.
```

**Characteristics:**
- Agent switch
- Complete re-framing
- Acknowledge previous failure
- Clear new direction

## Coaching Techniques

### Technique 1: Show, Don't Tell

**Ineffective:**
```markdown
"Make your recommendations more specific."
```

**Effective:**
```markdown
"Your recommendation 'Fix the validation' is too vague.

**Bad (your current version):**
'Fix the validation'

**Good (what I need):**
'Add email format validation:
```python
import re
if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
    raise ValueError('Invalid email format')
```'

Revise all recommendations to this level of specificity."
```

### Technique 2: Contrast Examples (Good vs Bad)

**Pattern:**
```markdown
**What you did (needs improvement):**
[Show their output]

**What I need (desired format):**
[Show example of good output]

**Key differences:**
- [Difference 1]
- [Difference 2]
```

**Example:**
```markdown
**Your current finding:**
"Password validation is weak"

**Desired format:**
"CRITICAL: Weak Password Validation
Location: src/auth/validators.py:23
Current code:
  if len(password) < 6:
      return False
Issue: Minimum length of 6 is insufficient, no complexity requirements
OWASP: A2-Broken Authentication
Fix:
  def validate_password(password):
      if len(password) < 12:
          return False, 'Minimum 12 characters required'
      if not re.search(r'[A-Z]', password):
          return False, 'At least one uppercase letter required'
      if not re.search(r'[a-z]', password):
          return False, 'At least one lowercase letter required'
      if not re.search(r'[0-9]', password):
          return False, 'At least one number required'
      if not re.search(r'[!@#$%^&*]', password):
          return False, 'At least one special character required'
      return True, 'Valid password'"

**Key differences:**
- Severity rating added
- Exact location provided
- Current code shown
- OWASP category identified
- Specific fix with complete code
```

### Technique 3: Checklist Coaching

**Pattern:**
```markdown
Review your output against this checklist:
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

Your current output:
- [✓] Requirement 1 (good!)
- [✗] Requirement 2 (missing - add this)
- [✗] Requirement 3 (incomplete - needs detail)

Focus on addressing the ✗ items.
```

**Example:**
```markdown
**Quality Checklist for Security Findings:**
- [ ] Severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] File path and line number
- [ ] Code snippet showing the issue
- [ ] OWASP category
- [ ] Impact explanation
- [ ] Specific fix with code example

**Your Finding #1:**
"SQL injection in login"

**Checklist evaluation:**
- [✗] No severity rating
- [✗] No file path/line number
- [✗] No code snippet
- [✗] No OWASP category
- [✗] No impact explanation
- [✗] No fix provided

**All 6 items missing.** Revise this finding to include all checklist items.
```

### Technique 4: Incremental Improvement

**Pattern:** If many issues, focus on highest priority subset in each iteration.

**Iteration 1 Coaching:**
```markdown
Multiple issues found. Let's fix the critical ones first:

**Priority 1 (Fix in this iteration):**
1. Add file:line references (completely missing)
2. Complete missing analysis of file3.py

**Priority 2 (We'll address after Priority 1):**
- Severity ratings
- More detailed recommendations

Focus on Priority 1 for now.
```

**Iteration 2 Coaching:**
```markdown
Good! You fixed Priority 1 issues (file references and complete coverage).

**Priority 2 (Fix in this iteration):**
1. Add severity ratings to each finding
2. Make recommendations more specific (see examples)

[Details on Priority 2 items]
```

**When to use:** Many issues, agent seems overwhelmed, previous iterations made no progress.

### Technique 5: Positive Reinforcement

**Pattern:** Acknowledge what's good before addressing what needs work.

```markdown
**What you did well:**
- Thorough analysis of login.py ✓
- Good use of OWASP framework ✓
- Clear writing style ✓

**What needs improvement:**
1. Missing analysis of validators.py
2. Need file:line references for findings
3. Recommendations need code examples

Build on your strong foundation by addressing these three points.
```

**Why this works:**
- Shows you're paying attention to quality
- Motivates agent
- Clarifies what's acceptable vs what needs work
- Reduces chance of agent "fixing" things that were already good

## Summary

**Coaching Levels:**
1. **Simple** - Single issue, easy fix, 1 iteration
2. **Moderate** - Multiple issues, 2-4 problems, 1-2 iterations
3. **Substantial** - Fundamental problems, major rework, 2-3 iterations
4. **Re-direction** - Wrong approach, switch agents, fresh start

**Coaching Techniques:**
1. **Show, Don't Tell** - Provide concrete examples
2. **Contrast Examples** - Show good vs bad
3. **Checklist Coaching** - Use checklists to track requirements
4. **Incremental Improvement** - Prioritize issues across iterations
5. **Positive Reinforcement** - Acknowledge what's good

**Coaching Formula:**
- What's wrong (specific issues)
- Why it matters (impact)
- How to fix (actionable steps)

**Key Principles:**
- Be specific (point to exact issues)
- Provide examples (show good output)
- Give actionable steps (how to fix)
- Categorize by discernment type (Product/Process/Performance)
- Use appropriate coaching level for situation
- Build on strengths while addressing weaknesses
