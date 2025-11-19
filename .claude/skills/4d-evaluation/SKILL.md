---
name: 4d-evaluation
description: Activates for quality assessment using 4-D methodology; evaluates Delegation, Description, Discernment, and Diligence
---

# 4D-Evaluation Skill

## Purpose

This skill provides the 4-D evaluation framework for assessing deliverables from subagents or any work output. It evaluates across four dimensions: Delegation, Description, Discernment (Product, Process, Performance), and Diligence.

## CRITICAL: Performance = Quality, NOT Speed

**IMPORTANT CLARIFICATION:**

When we say "Performance Discernment," we mean **quality and excellence**, NOT execution speed or runtime metrics.

**Performance Discernment evaluates:**
- ✅ Quality of the solution
- ✅ Elegance and simplicity
- ✅ How well it fits the codebase
- ✅ Whether it improves overall quality

**Performance Discernment does NOT evaluate:**
- ❌ Execution speed
- ❌ Runtime performance
- ❌ Memory usage
- ❌ Benchmarks or timing

Think: "How well did they **perform** the task?" not "How **fast** does it run?"

## When to Use This Skill

This skill automatically activates when:
- Evaluating subagent deliverables
- Reviewing completed work before acceptance
- Providing feedback for refinement
- Assessing quality against excellence standards

## Quick Start

For 80% of evaluations, ask these questions:

1. **Delegation:** Was the right approach used?
2. **Description:** Is the work complete and well-explained?
3. **Product Discernment:** Is it correct, elegant, and complete?
4. **Process Discernment:** Was the reasoning sound and thorough?
5. **Performance Discernment:** Does it meet excellence standards? (quality, not speed!)

## The 4-D Framework

### Dimension 1: Delegation

**Question:** Was the right agent/approach used for this task?

**Evaluate:**
- Appropriate tool/agent selection
- Followed correct protocols
- Used available skills
- Delegated subtasks when appropriate

**Evidence:**
```bash
# Check tool usage
grep "agent used:\|tool used:" output.txt

# Verify skills were discovered/used
grep "skill:\|using skill" output.txt
```

### Dimension 2: Description

**Question:** Is the work complete and clearly explained?

**Evaluate:**
- All requirements addressed
- Clear explanation of what was done
- Evidence provided for claims
- Documentation adequate

**Evidence:**
```markdown
# Check completeness
- [x] All requirements met
- [x] Evidence provided
- [x] Clear explanations
- [x] Examples included
```

### Dimension 3: Discernment

#### Product Discernment

**Question:** Is the deliverable correct, elegant, and complete?

**Evaluate:**
- Correctness: Does it work? Does it solve the right problem?
- Elegance: Is it simple yet powerful? Clean and clear?
- Completeness: All requirements met? Edge cases handled?

**Evidence:**
```bash
# Verify correctness
pytest tests/  # Tests pass?

# Check elegance
wc -l implementation.py  # Reasonable size?
grep -c "TODO\|HACK" implementation.py  # Clean code?

# Verify completeness
diff requirements.txt implemented_features.txt  # All requirements?
```

#### Process Discernment

**Question:** Was the approach sound and thorough?

**Evaluate:**
- Sound reasoning (logical steps)
- Thoroughness (considered alternatives, edge cases)
- Appropriate techniques (used right patterns/tools)

**Evidence:**
```markdown
# Review work log
- Considered multiple approaches? ✓
- Tested edge cases? ✓
- Used appropriate patterns? ✓
- Documented reasoning? ✓
```

#### Performance Discernment (QUALITY, NOT SPEED!)

**Question:** Does this meet excellence standards for quality?

**Evaluate:**
- **Excellence:** Is this outstanding work? Or just "good enough"?
- **Simplicity:** Simple solution? Or unnecessarily complex?
- **Fit:** Matches codebase patterns? Improves overall quality?
- **Quality:** Would you be proud to show this work?

**NOT About:**
- ❌ How fast it runs
- ❌ Execution time
- ❌ Memory usage
- ❌ Performance benchmarks

**Evidence:**
```bash
# Quality indicators
grep -c "class \|def " file.py  # Appropriate complexity?
git diff --stat  # Reasonable change size?
pytest --cov  # Good test coverage?

# Does it improve quality?
# - More maintainable than before?
# - Clearer than alternatives?
# - Elegant solution?
```

### Dimension 4: Diligence

**Question:** Was appropriate care and effort applied?

**Evaluate:**
- Attention to detail
- Error handling considered
- Edge cases addressed
- Testing performed

**Evidence:**
```bash
# Check thoroughness
grep -n "if.*None\|try.*except" file.py  # Error handling?
find tests -name "test_*.py" | wc -l  # Tests present?
grep -c "edge case\|boundary" tests/  # Edge cases tested?
```

## Evaluation Process

### Step 1: Gather Evidence

```bash
# Collect objective data
pytest tests/ > test_results.txt
grep -r "TODO\|FIXME" . > todos.txt
wc -l **/*.py > size_metrics.txt
```

### Step 2: Assess Each Dimension

```markdown
## 4-D Evaluation

### Delegation: PASS/FAIL
- Tool selection: Appropriate ✓
- Protocol followed: Yes ✓

### Description: PASS/FAIL
- Complete: Yes ✓
- Clear: Yes ✓
- Evidence: Provided ✓

### Product Discernment: PASS/FAIL
- Correct: Tests pass ✓
- Elegant: Simple, clear ✓
- Complete: All requirements ✓

### Process Discernment: PASS/FAIL
- Sound reasoning: Logical ✓
- Thorough: Edge cases considered ✓
- Appropriate techniques: Yes ✓

### Performance Discernment (Quality): PASS/FAIL
- Excellence: Outstanding work ✓
- Simplicity: Clean solution ✓
- Fit: Matches patterns ✓
- Quality: Production-ready ✓

### Diligence: PASS/FAIL
- Detail-oriented: Yes ✓
- Error handling: Present ✓
- Testing: Comprehensive ✓
```

### Step 3: Determine Verdict

**EXCELLENT:** All dimensions pass, work exceeds standards
**NEEDS REFINEMENT:** One or more dimensions fail, specific improvements needed

### Step 4: Provide Coaching (if needed)

```markdown
## Coaching Feedback

### What Needs Improvement
[Specific issue with dimension]

### Why It Matters
[Impact/importance]

### How to Improve
[Actionable steps]

### Example
[Concrete example of improvement]
```

## Scoring Guidelines

### Product Discernment

**Excellent:**
- Solves exact problem
- Elegant, minimal solution
- All requirements + edge cases
- Production-ready quality

**Needs Work:**
- Incomplete or overcomplicated
- Missing requirements
- Edge cases not handled
- Quality issues present

### Process Discernment

**Excellent:**
- Clear, logical reasoning
- Considered alternatives
- Used appropriate techniques
- Documented thought process

**Needs Work:**
- Unclear reasoning
- Didn't consider alternatives
- Inappropriate techniques
- No documentation of process

### Performance Discernment (Quality)

**Excellent:**
- Simple yet powerful
- Fits codebase beautifully
- Raises quality bar
- You'd be proud to show it

**Needs Work:**
- Unnecessarily complex
- Doesn't match patterns
- Decreases code quality
- Feels rushed or sloppy

## Resources (Progressive Disclosure)

- **`resources/methodology.md`** - Deep dive into 4-D methodology, assessment techniques, scoring frameworks
- **`resources/patterns.md`** - Evaluation patterns, coaching templates, refinement patterns, cross-domain examples
- **`resources/troubleshooting.md`** - Handling borderline cases, conflicting criteria, coaching effectiveness

## Anti-Patterns

### ❌ Confusing Performance with Speed
```markdown
# WRONG
"Performance Discernment: FAIL - function takes 100ms"

# RIGHT
"Performance Discernment (Quality): PASS - solution is elegant and maintainable"
```

### ❌ Vague Feedback
```markdown
# BAD
"Needs improvement"

# GOOD
"Product Discernment: FAIL - Missing validation for negative inputs (file.py:45)"
```

### ❌ No Coaching
```markdown
# BAD
"NEEDS REFINEMENT"
[No explanation]

# GOOD
"NEEDS REFINEMENT

Process Discernment: Didn't consider error case when API is unavailable.

How to improve: Add try/except around API call, return cached data on failure.

Example: [specific code example]"
```

## Quick Reference

```markdown
# 4-D Evaluation Template

## Delegation: PASS/FAIL
- Right approach? [Evidence]

## Description: PASS/FAIL
- Complete? [Evidence]
- Clear? [Evidence]

## Product Discernment: PASS/FAIL
- Correct? [Evidence]
- Elegant? [Evidence]
- Complete? [Evidence]

## Process Discernment: PASS/FAIL
- Sound reasoning? [Evidence]
- Thorough? [Evidence]

## Performance Discernment (Quality): PASS/FAIL
⚠️ Remember: Quality, NOT speed!
- Excellence? [Evidence]
- Simplicity? [Evidence]
- Fit? [Evidence]

## Diligence: PASS/FAIL
- Thorough? [Evidence]

## Verdict: EXCELLENT | NEEDS REFINEMENT

## Coaching (if needed):
[Specific, actionable feedback]
```
