---
name: list
description: Activates for directory/file listing operations; provides tool selection, filtering patterns, and output formatting guidance
---

# List Skill

## Purpose

This skill provides comprehensive guidance for directory and file listing operations. It helps you select the appropriate tools, apply filtering patterns, format output effectively, and handle edge cases when working with file system exploration tasks.

## When to Use This Skill

This skill automatically activates when:
- Listing directory contents or file structures
- Exploring codebases to understand organization
- Finding files matching specific patterns
- Generating directory trees or file inventories
- Scanning for specific file types across directories

## Quick Start

For 80% of listing operations, follow these principles:

1. **Use `ls` for simple directory contents** - Quick single-directory viewing
2. **Use `find` for recursive pattern matching** - When you need to search deeply
3. **Use `tree` for hierarchical visualization** - Understanding structure at a glance
4. **Filter early, format late** - Apply filters first, then shape output
5. **Be specific with patterns** - Narrow scope to avoid overwhelming output

## Core Principles

### 1. **Tool Selection Over Tool Forcing**
Choose the right tool for the task rather than forcing one tool to do everything. Each listing tool has optimal use cases.

### 2. **Progressive Filtering**
Start broad, then narrow. Apply filters progressively to refine results without missing important files.

### 3. **Human-Readable Output**
Format output for the intended audience. Machines need parseable formats, humans need readable ones.

### 4. **Performance Awareness**
Large directory trees can be expensive. Limit depth and scope when working with massive file systems.

### 5. **Consistent Patterns**
Use consistent glob patterns and naming conventions across operations for predictability.

## Tool Selection Matrix

| Scenario | Tool | Command Example | When to Use |
|----------|------|-----------------|-------------|
| Single directory list | `ls` | `ls -la /path` | Quick view, basic metadata |
| Recursive file search | `find` | `find . -name "*.js"` | Pattern matching, complex filters |
| Directory tree | `tree` | `tree -L 2 /path` | Visual hierarchy, structure overview |
| File counting | `find` + `wc` | `find . -type f \| wc -l` | Statistics, inventory |
| Size-based listing | `du` | `du -sh */ \| sort -h` | Disk usage, large file identification |
| Recent files | `ls` + sort | `ls -lt \| head -20` | Finding recent changes |
| Pattern with content | `grep` + `find` | `find . -name "*.md" -exec grep -l "pattern" {} \;` | Content-based discovery |

## Common Patterns

### Pattern 1: Exploring Unknown Codebase
```bash
# Get high-level structure (2 levels deep)
tree -L 2 -d /path/to/codebase

# Count files by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Find configuration files
find . -maxdepth 2 -name "*.json" -o -name "*.yaml" -o -name "*.toml"
```

### Pattern 2: Finding Specific File Types
```bash
# All JavaScript/TypeScript files
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" \)

# All test files (common patterns)
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -path "*/tests/*" \)

# All documentation
find . -type f \( -name "*.md" -o -name "*.rst" -o -name "*.txt" \) ! -path "*/node_modules/*"
```

### Pattern 3: Smart Filtering (Excluding Common Directories)
```bash
# Exclude node_modules, .git, dist, build
find . -type f -name "*.js" \
  ! -path "*/node_modules/*" \
  ! -path "*/.git/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*"
```

### Pattern 4: Size-Based Discovery
```bash
# Find large files (>10MB)
find . -type f -size +10M -exec ls -lh {} \; | awk '{print $9, $5}'

# Directory sizes sorted
du -sh */ | sort -h
```

### Pattern 5: Date-Based Listing
```bash
# Files modified in last 7 days
find . -type f -mtime -7

# Recently modified, most recent first
ls -lt | head -20
```

## Output Formatting Guidelines

### For Human Consumption
- Use `-h` flags for human-readable sizes (KB, MB, GB)
- Include headers and spacing for clarity
- Limit output length (use `head`/`tail`)
- Use color when available (`ls --color`, `tree -C`)

### For Machine Processing
- Use `-1` flag for one-per-line output
- Avoid color codes (`--color=never`)
- Use null-delimited output for filenames with spaces (`-print0`)
- Prefer structured formats when available (JSON, CSV)

### For Documentation
- Use `tree` for directory structures
- Include counts and summaries
- Show relevant metadata (size, date, permissions)
- Annotate with comments explaining structure

## Edge Cases

### Hidden Files
- Use `ls -A` to include hidden files (except `.` and `..`)
- Use `find . -name ".*"` to find only hidden files
- Remember: `ls -a` includes `.` and `..` which may not be desired

### Symlinks
- `ls -L` follows symlinks
- `find -L` follows symlinks during traversal
- Use `ls -l` to see symlink targets
- Be aware of circular symlinks (can cause infinite loops)

### Large Result Sets
- Pipe through `less` or `more` for pagination
- Use `head -n 100` to limit output
- Apply filters to reduce scope before listing
- Consider splitting into subdirectory operations

### Special Characters in Names
- Use `-print0` with `find` and `xargs -0` for safety
- Quote variables: `"$filename"` not `$filename`
- Escape special characters in patterns

## Resources (Progressive Disclosure)

For deeper guidance, load these resources as needed:

- **`resources/methodology.md`** - When you need advanced filtering strategies, organization techniques, performance optimization, or complex use case patterns
- **`resources/patterns.md`** - When you need framework-specific patterns, output format templates, or pattern library for common scenarios
- **`resources/troubleshooting.md`** - When encountering permission errors, performance issues, encoding problems, or edge case handling challenges

## Anti-Patterns

### ❌ Listing Everything Then Filtering
```bash
# BAD: Generate huge output then filter
ls -R /massive/directory | grep "pattern"

# GOOD: Filter during traversal
find /massive/directory -name "*pattern*"
```

### ❌ Ignoring Excludes
```bash
# BAD: Including node_modules, .git in results
find . -name "*.js"

# GOOD: Explicit excludes
find . -name "*.js" ! -path "*/node_modules/*" ! -path "*/.git/*"
```

### ❌ Assuming Directory Structure
```bash
# BAD: Hardcoded paths that might not exist
ls /src/components/*.js

# GOOD: Check existence, use find for flexibility
find . -path "*/components/*.js" 2>/dev/null
```

### ❌ Overwhelming Output
```bash
# BAD: Unlimited output to terminal
find / -name "*.log"

# GOOD: Limited, scoped, or paginated
find /var/log -name "*.log" -mtime -7 | head -50
```

## Quick Reference

### Decision Tree: Which Tool?

```
Need to list files?
  ├─ Single directory only?
  │   └─ Use: ls
  ├─ Recursive with patterns?
  │   └─ Use: find
  ├─ Visual tree structure?
  │   └─ Use: tree
  ├─ Size/disk usage?
  │   └─ Use: du
  └─ Complex filtering (size/date/type)?
      └─ Use: find with predicates
```

### Common Glob Patterns

| Pattern | Matches | Example |
|---------|---------|---------|
| `*` | Any characters | `*.js` matches all JS files |
| `?` | Single character | `file?.txt` matches file1.txt, fileA.txt |
| `[abc]` | One of: a, b, or c | `file[123].txt` |
| `[!abc]` | Not a, b, or c | `file[!0-9].txt` |
| `**` | Any directories (recursive) | `**/*.js` (in find context) |

### Quick Commands Cheatsheet

```bash
# Recent files
ls -lt | head -10

# File count by type
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Directory sizes
du -sh */ | sort -h

# Find large files
find . -type f -size +10M

# Exclude common dirs
find . ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*"

# Tree limited depth
tree -L 2 -I "node_modules|.git|dist"
```
