---
name: base-research
description: Information gathering and research methodology. Use whenever investigating unfamiliar topics, finding documentation, researching best practices, or systematically exploring how a system works.
tools: Read, Grep, Glob, Bash, LS, WebSearch, WebFetch
---

# base-research Skill

## Purpose

Systematic guidance for information gathering operations: discovering sources, evaluating credibility, synthesizing findings, and documenting research effectively.

## Claude Code Tool Mapping

| Task | Tool |
|---|---|
| Find files by pattern | Glob |
| Search content in files | Grep |
| Read a file | Read |
| Fetch external docs | WebFetch |
| Search the web | WebSearch |

---

## Quick Start

1. **Start broad, then narrow** — Get overview first, then dive into specifics
2. **Use multiple sources** — Cross-reference to verify information
3. **Evaluate credibility** — Official docs > reputable blogs > forums
4. **Document as you go** — Capture sources and key findings
5. **Synthesize, don't just collect** — Understand and connect information

## Core Principles

1. **Structured Investigation** — Define question → search → evaluate → synthesize
2. **Source Diversity** — Use official docs, code examples, tests, and community resources
3. **Critical Evaluation** — Not all sources are equal; verify authority, recency, and accuracy
4. **Progressive Refinement** — Start high-level, progressively add detail
5. **Evidence-Based Conclusions** — Base findings on concrete evidence, not assumptions

## Source Evaluation Hierarchy

1. **Tier 1:** Official documentation, source code
2. **Tier 2:** Well-maintained examples, official tutorials
3. **Tier 3:** Reputable blogs, established community resources
4. **Tier 4:** Forum posts, Stack Overflow (verify before trusting)
5. **Tier 5:** Random blogs, outdated tutorials

## Inter-Agent Delegation

When research requires external data, delegate to fetch:
- Web pages, APIs, or external documentation → delegate to `fetch` agent
- Large files (>2000 lines) or bulk operations → delegate to `gemini-brain`
- Use 3P format when delegating; integrate results into final research report

---

## Resources (Progressive Disclosure)

Load assets when you need depth beyond the quick start:

- **`assets/methodology.md`** — Load when you need the full 4-phase methodology walkthrough (Define → Identify → Gather → Synthesize), advanced research frameworks, source evaluation (CRAAP test), or synthesis techniques. Load at the start of a complex multi-source investigation.

- **`assets/patterns.md`** — Load when you need concrete examples: Technology Investigation, Problem-Solution, and Best Practices patterns with command examples; Research Log, Organized Findings, and Technology Evaluation documentation templates. Load when you need a template or workflow to follow.

- **`assets/troubleshooting.md`** — Load when encountering conflicting sources, incomplete information, outdated docs, or information overload. Contains verification strategies and cross-reference techniques.

---

## Anti-Patterns

**Single source reliance** — Trust first result without cross-referencing. Always verify against a second authoritative source.

**No source tracking** — Collecting information without noting where it came from. Document sources as you go, not after.

**Assumption over evidence** — "This probably uses Redis." Verify in code before stating as fact:
```
Grep(pattern: "redis|Redis", path: ".")
```

---

## Quick Reference

```
Research workflow:
1. Define question clearly
2. Find official docs (README.md, docs/)
3. Check implementation: Grep pattern in src/
4. Review examples: Glob **/examples/**
5. Verify in tests: Grep test.*topic in tests/
6. Synthesize and document findings

Source priority:
1. Official docs
2. Source code
3. Tests / examples
4. Community resources

Verification checklist:
- Cross-reference multiple sources
- Test examples yourself when possible
- Check recency (git log -1 docs/file.md)
- Evaluate authority before trusting
```
