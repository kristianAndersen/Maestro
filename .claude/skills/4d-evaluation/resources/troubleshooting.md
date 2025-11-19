# 4D-Evaluation Skill: Troubleshooting

Handling borderline cases, conflicting criteria, and common evaluation challenges.

---

## Common Misconceptions

### Misconception: "Performance" Means Speed

**WRONG:**
"Performance Discernment: FAIL - Function takes 500ms"

**RIGHT:**
"Performance Discernment (Quality): PASS - Elegant, maintainable solution"

**Why This Matters:**
Confusing "performance" with "speed" leads to:
- Optimizing when simplicity is needed
- Ignoring quality issues
- Misunderstanding evaluation purpose

**How to Remember:**
Think "How well did they **perform the task**?" not "How fast does it run?"

---

## Borderline Cases

### Case: Technically Correct but Inelegant

**Situation:**
- Code works (Product Discernment: Correct ✓)
- But is overly complex (Performance Discernment: Simplicity ✗)

**Resolution:**
```markdown
Product Discernment: PASS (works correctly)
Performance Discernment (Quality): FAIL (unnecessarily complex)

Verdict: NEEDS REFINEMENT

Coaching: Simplify approach while maintaining correctness
```

### Case: Excellent Code but Missing Requirements

**Situation:**
- Beautiful implementation
- But doesn't meet all requirements

**Resolution:**
```markdown
Product Discernment: FAIL (incomplete)
Performance Discernment (Quality): N/A (can't assess quality of incomplete work)

Verdict: NEEDS REFINEMENT

Coaching: Complete requirements first, then can assess quality
```

### Case: Good Enough vs Excellent

**Situation:**
- Work is functional and adequate
- But not outstanding

**Resolution:**
Depends on context:

**If excellence expected:**
```markdown
Performance Discernment (Quality): FAIL
Verdict: NEEDS REFINEMENT
Work is adequate but doesn't meet excellence bar
```

**If "good enough" acceptable:**
```markdown
Performance Discernment (Quality): PASS
Verdict: EXCELLENT
Meets requirements and quality standards for this context
```

---

## Conflicting Criteria

### Conflict: Simplicity vs Completeness

**Situation:**
- Simple solution doesn't handle edge case
- Complete solution is more complex

**Resolution:**
```markdown
Both simplicity and completeness are required.

Best: Simple solution that IS complete
- Handle edge case simply
- Use framework features
- Appropriate abstraction

Coaching: Find simpler way to be complete
```

### Conflict: Speed vs Quality

**Situation:**
Fast solution sacrifices code quality

**Resolution:**
```markdown
Remember: Performance Discernment is about QUALITY, not speed!

If quality sacrificed for speed:
Performance Discernment (Quality): FAIL

If quality maintained despite being slower:
Performance Discernment (Quality): PASS

Runtime speed is separate concern (not part of 4-D evaluation)
```

---

## Coaching Effectiveness

### Issue: Feedback Too Vague

**Problem:**
"This needs improvement"

**Solution:**
```markdown
Be specific:
- Which dimension failed?
- Where exactly? (file:line)
- What specifically needs to change?
- How to improve?
- Example of better approach?
```

### Issue: Feedback Too Harsh

**Problem:**
"This is terrible, complete rewrite needed"

**Solution:**
```markdown
Be constructive:
- Acknowledge what works
- Identify specific issues
- Explain why they matter
- Provide path to improvement
- Maintain professional tone
```

### Issue: Feedback Not Actionable

**Problem:**
"Code quality could be better"

**Solution:**
```markdown
Make it actionable:
- Extract function X (line 45) to reduce complexity
- Add error handling for case Y
- Simplify logic at line Z using pattern P
```

---

## Evaluation Challenges

### Challenge: Insufficient Context

**Problem:**
Can't fully evaluate without understanding requirements

**Solution:**
```bash
# Request clarification
- What were the requirements?
- What problem was this solving?
- What constraints existed?

# Evaluate based on available info
# Note limitations in evaluation
```

### Challenge: Subjective Quality

**Problem:**
"Clean code" is subjective

**Solution:**
Use objective criteria:
```bash
# Objective measures
- Line count (> 300 lines in one file?)
- Cyclomatic complexity (> 10?)
- Test coverage (< 70%?)
- Duplication (repeated code?)

# Reference standards
- Project style guide
- Language conventions
- Industry best practices
```

### Challenge: Time Pressure

**Problem:**
Need quick evaluation

**Solution:**
```markdown
Focus on critical dimensions:
1. Product Discernment (does it work?)
2. Diligence (is it tested?)

If both pass → likely EXCELLENT
If either fails → NEEDS REFINEMENT

Full 4-D for important work
Quick check for minor changes
```

---

## Common Failures and Fixes

### Failure: "Performance means speed"

**Fix:**
Every time you see "Performance Discernment," mentally translate to "Quality Discernment"

### Failure: No evidence provided

**Fix:**
Always cite specific examples with file:line references

### Failure: Accepting mediocrity

**Fix:**
Excellence is the standard. "Good enough" often isn't.

### Failure: Overly critical

**Fix:**
Balance: Acknowledge strengths + identify improvements

---

## Quick Troubleshooting Guide

```
Unsure how to evaluate?
☐ Check all 4-D dimensions systematically
☐ Gather objective evidence
☐ Reference concrete examples
☐ Consider context and requirements

Performance Discernment confusion?
☐ Remember: Quality, NOT speed
☐ Ask: "How well did they perform the task?"
☐ Focus on elegance, fit, excellence
☐ Ignore execution time/memory

Borderline case?
☐ Which dimension is borderline?
☐ Does it meet minimum standard?
☐ Is excellence expected here?
☐ Provide coaching either way

Coaching not working?
☐ Be more specific
☐ Provide concrete examples
☐ Explain why it matters
☐ Give actionable steps
```
