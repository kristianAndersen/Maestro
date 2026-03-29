---
name: open
description: Activates for file reading operations. Use this skill whenever reading files to understand their content, deciding whether to read a whole file or specific sections, or working with files that may be too large to load entirely at once.
---

# Open Skill

## Purpose

This skill provides guidance for reading files efficiently using the Read tool in Claude Code. It helps you decide between full and partial reads, use offset/limit for large files, and preserve context when working across multiple files.

## When to Use This Skill

- Reading file contents for analysis, debugging, or understanding
- Deciding whether to read a file fully or just specific sections
- Working with large files that exceed the default 2000-line limit
- Reading multiple related files while preserving context

## Quick Start

For 80% of file reading operations:

1. **Try the full read first** — the Read tool covers most files in one shot
2. **Check if output was truncated** — if there are more lines, use `offset` to read the rest
3. **Grep before reading for targeted lookups** — if you're looking for something specific, find the line first, then read around it
4. **Read in parallel** — multiple independent files can be read in the same turn

## Core Principles

### 1. Full Read by Default

Most files fit within the 2000-line default. Start with a full read — don't prematurely optimize with partial reads unless you know the file is large.

### 2. Use Offset/Limit for Large Files

When output is truncated, use the `offset` and `limit` parameters to read subsequent sections:

```
Read(file_path, offset=2000, limit=2000)  → lines 2001-4000
Read(file_path, offset=4000, limit=2000)  → lines 4001-6000
```

### 3. Grep Before Reading for Targeted Lookups

When looking for a specific function, class, or variable, use Grep first to find the line number. Then read with context around that location instead of loading the whole file.

### 4. Preserve Line Number Context

When referencing code in analysis or reports, use `file_path:line_number` format. The Read tool provides line numbers — use them.

## Tool Selection

| Scenario | Tool | How |
|---|---|---|
| Read a file (any size) | Read | `Read(file_path)` |
| Read from line 500 onward | Read + offset | `Read(file_path, offset=499, limit=200)` |
| Find a function/class location | Grep | `Grep(pattern="def authenticate")` then Read |
| List files before reading | Glob | `Glob(pattern="**/*.py")` then Read |
| Read a PDF | Read + pages | `Read(file_path, pages="1-5")` |
| Large file, unknown structure | Grep + Read | Grep for key terms, Read around matches |

## Reading Patterns

### Pattern 1: Standard File Read

```
Read("/path/to/file.py")
→ Returns full file with line numbers, up to 2000 lines
```

No configuration needed for most files.

### Pattern 2: Large File Navigation

```
# First section (lines 1-2000)
Read("/path/to/large.py")

# Continue if truncated (note: offset is 0-indexed lines to skip)
Read("/path/to/large.py", offset=2000, limit=2000)

# Jump to a known section
Read("/path/to/large.py", offset=500, limit=100)
```

### Pattern 3: Targeted Section Read

```
# Find the function location first
Grep(pattern="def authenticate", include="*.py")
→ Returns: src/auth.py:45

# Read just around that function
Read("src/auth.py", offset=44, limit=60)
```

### Pattern 4: Multi-File Reading Strategy

When reading multiple related files:

1. Start with the entry point or most central file
2. Follow imports/references to identify the next files to read
3. Note key findings (file:line) before moving on
4. Read all independent files in the same turn (parallel reads save time)

### Pattern 5: Structured Data Files

For JSON, YAML, TOML — Read handles them all. For locating a specific key, Grep is faster:

```
Grep(pattern="database_url", include="*.yaml")
→ Returns: config/settings.yaml:12
Read("config/settings.yaml", offset=10, limit=20)
```

## Decision Guide

```
Need to read a file?
  ├─ Looking for something specific?
  │   └─ Grep first → Read with offset around the match
  ├─ Unknown file, want to understand it?
  │   └─ Read full → read more sections if truncated
  ├─ Know it's a large file (>2000 lines)?
  │   └─ Read in sections: offset=0, then 2000, then 4000...
  ├─ Reading many files?
  │   └─ Read all in the same turn for parallel execution
  └─ Need a specific line range?
      └─ Read(file_path, offset=<start_line-1>, limit=<count>)
```

## Context Efficiency

- **Every Read loads into context** — file content consumes tokens
- **Read targeted sections** — if you only need one class, don't load 3000 lines
- **Don't re-read unnecessarily** — use line number references from the first read rather than reading again
- **Parallel reads** — read multiple independent files in the same response turn

## Edge Cases

### File Not Found

Read returns an error if the path is wrong. Use Glob to verify the path first if uncertain.

### Binary Files / Images

The Read tool handles images (renders them visually) and PDFs (extracts text). For large PDFs, use the `pages` parameter to read specific page ranges — required for PDFs over 10 pages.

### Very Long Lines

Lines over 2000 characters are truncated. Minified code or data dumps may lose content mid-line. For these, use Grep to extract specific values.

## Anti-Patterns

### Reading Everything to Find One Thing

```
# BAD: Loading 3000 lines to find one function
Read("large_service.py")  → reads 2000 lines, function might not even be there

# GOOD: Find it first
Grep("def process_payment", "*.py")
Read("large_service.py", offset=<line-5>, limit=60)
```

### Re-reading Files Already in Context

```
# BAD: Reading the same file again to check a detail
# GOOD: Reference the line numbers from the first read
```

### Sequential Reads When Parallel Is Possible

```
# BAD: Read file1, wait, Read file2, wait, Read file3
# GOOD: Read all three files in the same turn
```

## Resources (Progressive Disclosure)

- **`assets/methodology.md`** — Advanced read strategies, systematic file exploration patterns, reading order for different project types
- **`assets/patterns.md`** — Concrete examples by project type (Django, React, Go, etc.), structured data patterns, log file navigation
- **`assets/troubleshooting.md`** — Truncation handling, encoding issues, large file strategies, binary file reading
