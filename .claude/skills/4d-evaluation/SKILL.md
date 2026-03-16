---
name: 4d-evaluation
description: Quality gate for reviewing subagent outputs and deliverables. Use this skill whenever you're about to accept work from a subagent, reviewing any completed task, evaluating whether something is "done", or sensing that output feels incomplete, off, or doesn't fully match what was asked. Apply this before saying EXCELLENT or requesting refinement — don't skip it just because the work looks reasonable at a glance. This skill prevents accepting mediocre work and guides calibrated, fair pushback.
---

# 4D-Evaluation Skill

## Purpose

Evaluate deliverables from subagents or any completed work across four dimensions: Delegation, Description, Discernment (Product, Process, Performance), and Diligence. The goal is calibrated quality — push back when there's a real problem, accept when it genuinely meets the bar.

## When to Push Back (Calibration)

This is the most important section. Not every imperfection warrants NEEDS REFINEMENT.

**Always push back:**
- A stated requirement isn't met
- The logic is wrong or would break something
- Security, data integrity, or correctness issue

**Usually push back:**
- Error handling absent for a realistic failure case
- Solution is significantly more complex than it needs to be
- Claims made without evidence when evidence was possible

**Use judgment (consider context):**
- Style differences that don't affect correctness
- Minor documentation gaps on simple changes
- Different approach than expected, but still valid

**Don't push back:**
- Personal preference with no real impact
- "I'd have done it differently" without a substantive reason
- Cosmetic issues when the work is solid

> If unsure, ask: *"Does this gap create a real problem, or am I pattern-matching on imperfection?"*

## Note on "Performance Discernment"

"Performance Discernment" means **quality and excellence of the work**, not execution speed. Ask: *"How well did they perform the task?"* — not *"How fast does it run?"*

## Quick Start

For most evaluations, these five questions are enough:

1. **Delegation:** Was the right approach/agent used?
2. **Description:** Is the work complete and clearly explained?
3. **Product Discernment:** Is it correct, elegant, and complete?
4. **Process Discernment:** Was the reasoning sound?
5. **Performance Discernment:** Is it genuinely good work — not just technically correct?

## The 4-D Framework

### Dimension 1: Delegation

Was the right agent/tool/approach used?

- Appropriate tool or agent selected
- Available skills discovered and used
- Subtasks delegated when appropriate
- Correct protocols followed

### Dimension 2: Description

Is the work complete and clearly explained?

- All requirements addressed
- Clear explanation of what was done and why
- Evidence provided for claims
- No unexplained gaps

### Dimension 3: Discernment

#### Product Discernment

Is the deliverable correct, elegant, and complete?

- **Correct:** Does it work? Does it solve the actual problem?
- **Elegant:** Is it as simple as it can be while still being complete?
- **Complete:** All requirements met, edge cases handled?

#### Process Discernment

Was the approach sound?

- Logical, justified reasoning
- Alternatives considered where relevant
- Appropriate techniques and patterns used

#### Performance Discernment (Quality)

Is this genuinely good work?

- **Excellence:** Does it go beyond technically-correct to actually good?
- **Simplicity:** Simple solution, or unnecessarily complex?
- **Fit:** Matches context and patterns, improves overall quality?
- **Craft:** Would you be confident putting your name on it?

### Dimension 4: Diligence

Was appropriate care applied?

- Attention to detail — consistent quality throughout
- Error handling considered for realistic failure cases
- Testing or verification performed where appropriate

## Evaluation Process

### Step 1: Gather Evidence

Evidence should be concrete and specific — file paths, line numbers, examples, outputs. Not impressions.

- **Code:** test results, specific line references, coverage data
- **Documents/research:** specific claims verified, sources checked, requirements cross-referenced
- **Plans/designs:** requirements mapped to deliverables, gaps identified

### Step 2: Assess Each Dimension

```markdown
## 4-D Evaluation

### Delegation: PASS/FAIL
[What approach was used, was it appropriate]

### Description: PASS/FAIL
[What's present/missing, evidence quality]

### Product Discernment: PASS/FAIL
- Correct: [evidence]
- Elegant: [evidence]
- Complete: [evidence]

### Process Discernment: PASS/FAIL
[Reasoning quality, alternatives considered]

### Performance Discernment (Quality): PASS/FAIL
[Excellence, simplicity, fit — not speed]

### Diligence: PASS/FAIL
[Care, error handling, testing]
```

### Step 3: Determine Verdict

**EXCELLENT:** All dimensions pass. Work meets the quality bar for this context.

**NEEDS REFINEMENT:** One or more dimensions fail with a real gap (see calibration above). Always include coaching.

### Step 4: Coaching (when NEEDS REFINEMENT)

Good coaching is specific, explains why it matters, and gives an actionable path forward.

```markdown
## Coaching

### What Needs Improvement
[Specific dimension + specific issue, with location if applicable]

### Why It Matters
[Real impact — not just "it's not ideal"]

### How to Improve
[Actionable steps]

### Example (if helpful)
[Concrete example of the better approach]
```

## Anti-Patterns

### Vague feedback
Bad: "Needs improvement"
Good: "Product Discernment: FAIL — missing validation for empty input (auth.py:34)"

### No coaching
Bad: "NEEDS REFINEMENT" with no explanation
Good: Specific issue + why it matters + how to fix it

### Pushing back on preferences
Bad: Failing because you'd have structured it differently
Good: Only failing when there's a real gap or problem

### Accepting mediocrity
Bad: Passing because "it mostly works"
Good: Holding to the calibrated bar — genuinely good work, not just technically-not-broken

## Quick Reference Template

```markdown
# 4-D Evaluation

## Delegation: PASS/FAIL
[Evidence]

## Description: PASS/FAIL
[Evidence]

## Product Discernment: PASS/FAIL
- Correct: [evidence]
- Elegant: [evidence]
- Complete: [evidence]

## Process Discernment: PASS/FAIL
[Evidence]

## Performance Discernment (Quality): PASS/FAIL
[Evidence — quality, not speed]

## Diligence: PASS/FAIL
[Evidence]

## Verdict: EXCELLENT | NEEDS REFINEMENT

## Coaching (if needed):
[Specific, actionable, explains why it matters]
```

## Resources (Progressive Disclosure)

Load these when you need deeper guidance:

- **`assets/methodology.md`** — Deep dive on each dimension and assessment techniques
- **`assets/patterns.md`** — Example evaluations across domains (code, docs, research, config)
- **`assets/troubleshooting.md`** — Borderline cases, conflicting criteria, calibration edge cases
