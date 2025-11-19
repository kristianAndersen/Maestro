# 4D-Evaluation Skill: Patterns

Evaluation patterns, coaching templates, refinement patterns, and cross-domain examples.

---

## Evaluation Patterns

### Pattern: Code Deliverable Evaluation

```markdown
# 4-D Evaluation: [Feature Name]

## Delegation: PASS
- Used Write agent appropriately ✓
- Discovered and used write skill ✓
- Followed modification protocols ✓

## Description: PASS
- All requirements implemented ✓
- Clear commit message ✓
- Evidence: Tests passing ✓

## Product Discernment: PASS
- **Correct:** All tests pass, handles edge cases ✓
- **Elegant:** Clean, simple solution (file.py:45-67) ✓
- **Complete:** All requirements + error handling ✓

## Process Discernment: PASS
- **Sound reasoning:** Logical approach ✓
- **Thorough:** Considered alternatives (documented in PR) ✓
- **Appropriate techniques:** Used factory pattern appropriately ✓

## Performance Discernment (Quality): PASS
⚠️ Evaluating quality, not speed
- **Excellence:** Production-ready, exemplary work ✓
- **Simplicity:** Minimal complexity, easy to understand ✓
- **Fit:** Matches existing patterns, improves quality ✓
- **Quality:** Well-tested, documented, maintainable ✓

## Diligence: PASS
- **Detail-oriented:** Edge cases handled ✓
- **Error handling:** Comprehensive (lines 78-92) ✓
- **Testing:** 95% coverage ✓

## Verdict: EXCELLENT

Outstanding work. Clean, well-tested implementation that raises
the quality bar. Ready to merge.
```

### Pattern: Documentation Evaluation

```markdown
# 4-D Evaluation: API Documentation

## Delegation: PASS
- Used appropriate research and writing approaches ✓

## Description: PASS
- All endpoints documented ✓
- Examples provided ✓

## Product Discernment: PASS
- **Correct:** Accurate information verified against code ✓
- **Elegant:** Well-organized, easy to navigate ✓
- **Complete:** All endpoints, parameters, responses ✓

## Process Discernment: PASS
- **Sound:** Logical organization ✓
- **Thorough:** Checked all endpoints ✓

## Performance Discernment (Quality): PASS
- **Excellence:** Comprehensive, professional ✓
- **Simplicity:** Clear language, good examples ✓
- **Fit:** Matches existing docs style ✓

## Diligence: PASS
- **Detail-oriented:** No typos, consistent formatting ✓

## Verdict: EXCELLENT
```

### Pattern: Needs Refinement

```markdown
# 4-D Evaluation: User Authentication

## Delegation: PASS
- Appropriate agent used ✓

## Description: PASS
- Work explained clearly ✓

## Product Discernment: FAIL
- **Correct:** Tests pass ✓
- **Elegant:** ✓
- **Complete:** ✗ Missing password validation

## Verdict: NEEDS REFINEMENT

### What Needs Improvement

**Product Discernment - Completeness:** Missing validation for
password strength. Accepts passwords < 8 characters and
no complexity requirements.

Location: src/auth/register.py:34

### Why It Matters

Weak passwords compromise security. This is a critical
requirement from security policy.

### How to Improve

1. Add password length check (minimum 12 characters)
2. Require at least one uppercase, lowercase, digit, symbol
3. Add test cases for weak password rejection

### Example

```python
def validate_password(password):
    if len(password) < 12:
        raise ValueError("Password must be 12+ characters")
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain uppercase")
    # ... additional checks
```

Re-submit after implementing password validation.
```

---

## Coaching Patterns

### Pattern: Missing Error Handling

```markdown
## Coaching: Error Handling

**Diligence Discernment: FAIL**

### What Needs Improvement
No error handling for API call failure (file.py:45)

### Why It Matters
API can fail (network, service down). Without handling,
entire operation crashes instead of graceful degradation.

### How to Improve
Wrap API call in try/except, return cached data on failure

### Example
```python
try:
    data = api.fetch_data()
except RequestException as e:
    logger.warning(f"API failed, using cache: {e}")
    data = cache.get(cache_key)
```
```

### Pattern: Overcomplicated Solution

```markdown
## Coaching: Simplicity

**Performance Discernment (Quality): FAIL**

### What Needs Improvement
Solution is unnecessarily complex (100 lines when 20 would suffice)

### Why It Matters
Complex code is harder to maintain, test, and understand.
Violates KISS principle.

### How to Improve
Use built-in function instead of reimplementing

### Example
Instead of custom sorting implementation (lines 45-145),
use: `sorted(items, key=lambda x: x.timestamp)`
```

---

## Cross-Domain Examples

### Code Quality Performance

**Performance Discernment (Quality) for Code:**
- ✅ "Clean architecture, minimal coupling"
- ✅ "Elegant use of design patterns"
- ✅ "Simple solution to complex problem"
- ❌ "Function runs in O(n log n)" ← This is algorithmic complexity, not Performance Discernment!

### Documentation Quality Performance

**Performance Discernment (Quality) for Documentation:**
- ✅ "Comprehensive yet concise"
- ✅ "Well-organized with clear examples"
- ✅ "Professional quality, publication-ready"
- ❌ "Documentation is 5 pages long" ← Length is not quality!

### Research Quality Performance

**Performance Discernment (Quality) for Research:**
- ✅ "Thorough investigation with multiple credible sources"
- ✅ "Clear synthesis of findings"
- ✅ "Actionable conclusions"
- ❌ "Research completed in 1 hour" ← Speed is not quality!

### Configuration Quality Performance

**Performance Discernment (Quality) for Configuration:**
- ✅ "Clean, maintainable, follows conventions"
- ✅ "Well-documented with sensible defaults"
- ✅ "Robust and secure"
- ❌ "Config file is only 50 lines" ← Size is not quality!

---

## Refinement Patterns

### Pattern: Iterative Improvement

```markdown
# Iteration 1 Feedback
**Verdict:** NEEDS REFINEMENT
- Product: Missing edge case handling

# Iteration 2 Feedback
**Verdict:** NEEDS REFINEMENT
- Process: Error handling could be more robust

# Iteration 3 Feedback
**Verdict:** EXCELLENT
- All dimensions pass
- Significant improvement over iteration 1
```

### Pattern: Partial Approval

```markdown
# 4-D Evaluation: Mixed Results

## Verdict: NEEDS REFINEMENT

**What's Good:**
- Delegation, Description, Process all PASS ✓
- Core functionality works correctly

**What Needs Work:**
- Performance Discernment (Quality): Solution is overly complex
- Diligence: Missing test coverage for edge cases

**Recommendation:**
Good foundation. Focus on simplifying approach and
adding edge case tests. Re-evaluate after changes.
```

---

## Quick Patterns Reference

```markdown
# Template for EXCELLENT verdict
All 4-D dimensions pass
Evidence provided for each
Ready for production/acceptance

# Template for NEEDS REFINEMENT verdict
1. Identify which dimension(s) failed
2. Provide specific examples with line numbers
3. Explain why it matters
4. Give actionable improvement steps
5. Show example of better approach

# Remember
- Performance = Quality, not speed
- Evidence > assertions
- Specific > vague
- Actionable > general
- Coaching > criticism
```
