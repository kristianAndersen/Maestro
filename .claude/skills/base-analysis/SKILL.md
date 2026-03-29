---
name: base-analysis
description: Evaluation and quality assessment methodology. Use whenever evaluating code quality, performing security assessments, reviewing architecture, analyzing performance, or assessing technical debt.
---

# base-analysis Skill

## Quick Start

For 80% of analysis operations, follow these principles:

1. **Use objective criteria** — Base judgments on measurable standards
2. **Look for patterns** — Identify systemic issues, not just symptoms
3. **Consider context** — Requirements and constraints matter
4. **Provide evidence** — Support conclusions with specific examples
5. **Be constructive** — Focus on improvement, not just criticism

## Tool Mapping

| Task | Tool | Example |
|---|---|---|
| Find patterns in code | Grep | `Grep(pattern="eval\|exec", include="*.py")` |
| Read a file | Read | `Read("src/auth.py")` |
| Find files by type | Glob | `Glob("**/*.py")` |
| Check for secrets | Grep | `Grep(pattern="password\s*=", include="*.py")` |

## Quality Dimensions

**Functionality:** Does it work correctly? Edge cases handled?
**Readability:** Clear, understandable code? Descriptive names?
**Maintainability:** Easy to modify? Well-documented? Manageable dependencies?
**Testability:** Can it be tested? Are tests present and adequate?
**Security:** Inputs validated? Credentials protected? Common vulnerabilities avoided?

## Code Review Checklist

```bash
# 1. Functionality
grep -n "TODO\|FIXME\|BUG" file.py  # Incomplete work?

# 2. Code Quality
wc -l file.py  # Size reasonable?
grep -c "^def \|^class " file.py  # Complexity manageable?

# 3. Security
grep -n "eval\|exec\|system" file.py  # Dangerous functions?
grep -n "password\|secret\|key" file.py  # Hardcoded secrets?

# 4. Best Practices
grep -n "^import" file.py  # Proper imports?
```

### Security Assessment

For full security scan scripts (OWASP Top 10, code quality bash patterns, architecture analysis), load `assets/methodology.md`.

## 3-Pass Iterative Refinement

**Pass 1 — Surface scan:** Structure, naming, obvious issues, missing tests.

**Pass 2 — Deep review:** Logic correctness, security patterns, edge cases, integration points.

**Pass 3 — Synthesis:** Prioritize findings, form recommendations, draft verdict.

## Evaluation Criteria

For the 4-tier scoring rubric and the full Assessment Template, load `assets/patterns.md`.

## Inter-Agent Delegation

When analysis requires capabilities beyond your scope:
- **Need external docs for baseline?** → Delegate to `fetch` agent
- **Need comprehensive discovery first?** → Delegate to `base-research` agent
- **Need to save analysis results?** → Delegate to `file-writer` agent

Use 3P format (Product, Process, Performance) when delegating.

## Anti-Patterns

- **❌ Analysis without evidence** — "This code is bad" → Say WHERE and WHY with line numbers
- **❌ Ignoring context** — Consider performance requirements before applying rigid standards
- **❌ Only finding problems** — Balance strengths with issues; include fix suggestions

## Quick Reference

```bash
# Quick analysis workflow
# 1. Understand purpose: cat README.md
# 2. Check structure: tree -L 2
# 3. Review code quality: grep patterns
# 4. Check tests: pytest --cov
# 5. Security scan: grep dangerous patterns
# 6. Synthesize findings
# 7. Provide actionable feedback
```

## Assets (Load When Needed)

- **`assets/methodology.md`** — OWASP Top 10, full bash scripts for code quality / security / architecture analysis, systematic review phases, risk-based assessment. Load for comprehensive audits.
- **`assets/patterns.md`** — 4-tier scoring rubric, Assessment Template, Component Analysis template, Architecture Review template, PR review format, security audit format. Load when you need report templates or scoring frameworks.
- **`assets/troubleshooting.md`** — Handling subjective criteria, conflicting standards, incomplete information, verification strategies. Load when facing difficult judgment calls.
