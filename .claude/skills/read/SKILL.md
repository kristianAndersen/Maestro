---
name: read
description: Deep file reading and codebase comprehension. Use whenever reading files to understand how they work, investigating architecture, tracing data flows, or doing multi-file analysis where building a mental model matters.
---

# Read Skill

## Quick Start

For 80% of analysis operations, follow these principles:

1. **Start broad, then narrow** — Understand overall structure before diving into details
2. **Follow the data** — Trace how data flows through the system
3. **Identify patterns** — Recognize common structures and idioms
4. **Build mental model** — Create a conceptual understanding, not just line-by-line reading
5. **Document as you go** — Capture insights to preserve understanding

## Tool Selection Guide

| Shell Command | Claude Code Tool | Notes |
|---|---|---|
| `tree -L 2` / `ls` | Glob or LS | `Glob("**/*", path="src")` for recursive listing |
| `find . -name "*.py"` | Glob | `Glob("**/*.py")` |
| `grep -rn "pattern"` | Grep | `Grep(pattern="pattern", include="*.py")` |
| `cat file.py` | Read | `Read("file.py")` — line numbers included by default |
| `head -n 50 file.py` | Read + limit | `Read("file.py", limit=50)` |
| `sed -n '45,75p' file.py` | Read + offset | `Read("file.py", offset=44, limit=31)` |

Use Bash for operations with no dedicated tool equivalent (e.g., `wc -l`, `sort`, pipeline operations).

## Core Principles

1. **Layered Analysis** — Start with high-level structure, progressively zoom into details.
2. **Pattern Recognition** — Identify recurring structures, design patterns, and code idioms.
3. **Contextual Understanding** — Code doesn't exist in isolation. Understand purpose, constraints, and ecosystem.
4. **Evidence-Based Conclusions** — Base analysis on actual code, not assumptions. Verify hypotheses.
5. **Systematic Approach** — Use consistent methodology to avoid missing important details.

## Analysis Decision Tree

```
Need to analyze code?
  ├─ Never seen before?
  │   └─ Top-down: Start with entry point
  ├─ Looking for specific feature?
  │   └─ Feature-based: Search + trace
  ├─ Understanding architecture?
  │   └─ Bottom-up: Components + relationships
  └─ Debugging or investigating?
      └─ Data flow: Trace inputs to outputs
```

## Anti-Patterns

- **❌ Line-by-line without context** — Grep for structure (`^class \|^def `) before reading line-by-line
- **❌ Assuming without verifying** — Check actual dependencies, don't guess
- **❌ Analysis paralysis** — Progressive analysis: structure → entry point → follow imports
- **❌ Ignoring tests** — Tests are documentation; read them alongside source code

## Quick Reference

```
1. Structure → What exists?        (tree, find, ls)
2. Architecture → How organized?   (grep imports, find modules)
3. Functionality → What does it do? (grep functions/classes)
4. Details → How does it work?     (cat specific files)
5. Synthesis → Document understanding
```

## Assets (Load When Needed)

- **`assets/methodology.md`** — 4-phase analysis methodology with tool examples, investigation approaches (hypothesis-driven, timeline, comparative, reverse engineering). Load for complex multi-file analysis or unfamiliar systems.
- **`assets/patterns.md`** — Concrete workflow scripts: new project analysis, feature investigation, bug investigation, language-specific patterns (Python/JS/Go), architecture reading patterns, design pattern catalog. Load when you need step-by-step examples.
- **`assets/troubleshooting.md`** — Handling complex nested structures, unclear variable names, missing documentation, legacy patterns. Load when facing comprehension challenges.
