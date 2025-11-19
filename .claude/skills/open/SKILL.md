---
name: open
description: Activates for file reading operations; provides guidance on partial vs full reads, memory efficiency, and context preservation
---

# Open Skill

## Purpose

This skill provides comprehensive guidance for file reading operations. It helps you decide between partial and full file reads, optimize memory usage, preserve context effectively, and handle various file formats when working with file content exploration tasks.

## When to Use This Skill

This skill automatically activates when:
- Reading file contents for analysis or processing
- Deciding between full and partial file reads
- Working with large files that may not fit in memory
- Preserving context across multiple file operations
- Handling different file formats and encodings

## Quick Start

For 80% of file reading operations, follow these principles:

1. **Read only what you need** - Partial reads for large files, full reads for small files
2. **Check file size first** - Use `stat` or `ls -lh` before reading
3. **Use appropriate tools** - `cat` for full, `head`/`tail` for partial, `less` for interactive
4. **Consider encoding** - UTF-8 is standard, but verify for special cases
5. **Preserve line context** - Include line numbers for reference when analyzing code

## Core Principles

### 1. **Size-Aware Reading**
Always check file size before deciding how to read. Large files require different strategies than small files.

### 2. **Progressive Loading**
Load what you need first, then expand. Don't load everything upfront if you only need a sample.

### 3. **Context Preservation**
Maintain enough surrounding context to understand what you're reading. Isolated snippets lose meaning.

### 4. **Memory Efficiency**
Be mindful of memory constraints, especially with large files or batch operations.

### 5. **Format Recognition**
Detect file format and encoding early to use appropriate reading strategies.

## Tool Selection Matrix

| Scenario | Tool | Command Example | When to Use |
|----------|------|-----------------|-------------|
| Full small file | `cat` | `cat file.txt` | File < 1MB, need all content |
| First N lines | `head` | `head -n 50 file.txt` | Preview, sample, headers |
| Last N lines | `tail` | `tail -n 100 log.txt` | Recent entries, logs |
| Interactive viewing | `less` | `less large-file.txt` | Large files, need search/navigation |
| Specific line range | `sed` | `sed -n '100,200p' file.txt` | Extract specific sections |
| With line numbers | `cat -n` | `cat -n source.py` | Code analysis, reference |
| Binary file inspection | `hexdump` | `hexdump -C file.bin \| head` | Binary data, debugging |
| Structured data | `jq`/`yq` | `jq '.' data.json` | JSON/YAML parsing |

## Common Patterns

### Pattern 1: Smart File Reading Based on Size

```bash
# Check size and read appropriately
file="document.txt"
size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

if [ $size -lt 1048576 ]; then
  # < 1MB: full read
  cat "$file"
else
  # >= 1MB: partial read with preview
  echo "File is large ($size bytes). Showing first 100 lines:"
  head -n 100 "$file"
fi
```

### Pattern 2: Context-Preserving Code Reading

```bash
# Read with line numbers for reference
cat -n source.js

# Read specific function with context
grep -n "function.*targetFunc" source.js
sed -n '45,75p' source.js  # Read lines 45-75 around function
```

### Pattern 3: Log File Analysis

```bash
# Most recent log entries
tail -n 100 application.log

# Follow log in real-time
tail -f application.log

# Search and show context
grep -A 5 -B 5 "ERROR" application.log  # 5 lines before/after
```

### Pattern 4: Sampling Large Files

```bash
# First, middle, last strategy
echo "=== First 10 lines ==="
head -n 10 largefile.txt

echo "=== Sample from middle ==="
total_lines=$(wc -l < largefile.txt)
middle=$((total_lines / 2))
sed -n "${middle},$((middle + 10))p" largefile.txt

echo "=== Last 10 lines ==="
tail -n 10 largefile.txt
```

### Pattern 5: Format-Specific Reading

```bash
# JSON: Pretty-print and navigate
jq '.' config.json
jq '.dependencies' package.json

# YAML: Parse and extract
yq eval '.services' docker-compose.yml

# CSV: Column extraction
cut -d, -f1,3 data.csv | head -20

# Markdown: Extract headers
grep "^#" README.md
```

## Reading Strategies by File Type

### Source Code Files
- **Use:** `cat -n` for line-numbered view
- **Context:** Include surrounding functions/classes
- **Pattern:** Read full file if < 500 lines, otherwise target specific sections

### Log Files
- **Use:** `tail` for recent entries, `grep` for filtering
- **Context:** Include timestamp and surrounding log entries
- **Pattern:** Time-based or pattern-based filtering

### Configuration Files
- **Use:** Specialized parsers (`jq`, `yq`) for structured formats
- **Context:** Understand full structure before extracting values
- **Pattern:** Validate format, then extract specific keys

### Data Files
- **Use:** `head` for schema/header inspection
- **Context:** Sample rows to understand structure
- **Pattern:** Schema first, then samples, then full read if needed

### Binary Files
- **Use:** `hexdump`, `xxd`, `strings`
- **Context:** Identify magic numbers, file signatures
- **Pattern:** Header inspection, selective reading, not full dumps

## Memory Efficiency Guidelines

### For Small Files (< 1MB)
```bash
# Safe to read fully
content=$(cat small-file.txt)
# Process in memory
```

### For Medium Files (1MB - 100MB)
```bash
# Stream processing
cat medium-file.txt | while read line; do
  process_line "$line"
done

# Or use pagination
less medium-file.txt
```

### For Large Files (> 100MB)
```bash
# Never load entirely into memory
# Use streaming tools
tail -f huge.log | grep "pattern"

# Or process in chunks
split -l 10000 huge.txt chunk_
for chunk in chunk_*; do
  process_chunk "$chunk"
done
```

## Context Preservation Techniques

### Technique 1: Line Number References

```bash
# Always include line numbers for code
cat -n script.py > script-numbered.txt

# Reference format: file:line
echo "Error in script.py:45"
```

### Technique 2: Surrounding Context

```bash
# Show context around matches
grep -C 3 "function targetFunc" code.js  # 3 lines before/after

# Extract with context markers
sed -n '40,60p' code.js | nl -ba -v 40  # Lines 40-60 with numbers starting at 40
```

### Technique 3: Metadata Preservation

```bash
# Include file info with content
echo "File: $filename"
echo "Size: $(stat -c%s "$filename")"
echo "Modified: $(stat -c%y "$filename")"
echo "---"
cat "$filename"
```

## Edge Cases

### Encoding Issues
- Check encoding: `file -bi filename`
- Convert if needed: `iconv -f ISO-8859-1 -t UTF-8 file.txt`
- Handle non-UTF8: Specify encoding in tools that support it

### Files Without Newlines
- Binary files may lack line endings
- Use `cat -v` to show non-printing characters
- Use `od` or `hexdump` for binary inspection

### Very Long Lines
- Some tools struggle with lines > 4KB
- Use `fold` to wrap: `fold -w 80 file.txt`
- Or process in chunks

### Special Characters
- Control characters: `cat -v` makes them visible
- Null bytes: Can break text tools, use binary tools
- Unicode: Ensure terminal and tools support UTF-8

## Resources (Progressive Disclosure)

For deeper guidance, load these resources as needed:

- **`resources/methodology.md`** - When you need advanced read strategies, memory management techniques, progressive loading patterns, or format-specific approaches
- **`resources/patterns.md`** - When you need concrete examples of read patterns, file format templates, context preservation strategies, or streaming patterns
- **`resources/troubleshooting.md`** - When encountering encoding issues, performance problems, corrupt files, or edge case handling challenges

## Anti-Patterns

### ❌ Reading Entire Large Files Into Memory
```bash
# BAD: Loads 500MB into memory
content=$(cat huge-log.txt)
echo "$content" | grep "ERROR"

# GOOD: Stream processing
grep "ERROR" huge-log.txt
```

### ❌ Ignoring File Size
```bash
# BAD: Blindly reading unknown file
cat mystery-file.txt

# GOOD: Check size first
ls -lh mystery-file.txt
# Then decide: full read, partial read, or sample
```

### ❌ Losing Context
```bash
# BAD: No line numbers, no context
grep "error" code.js

# GOOD: With line numbers and context
grep -n -C 3 "error" code.js
```

### ❌ Wrong Tool for Format
```bash
# BAD: Using cat for JSON
cat config.json  # Unformatted, hard to read

# GOOD: Use appropriate parser
jq '.' config.json  # Pretty-printed, validated
```

## Quick Reference

### Decision Tree: How to Read?

```
Need to read a file?
  ├─ What's the size?
  │   ├─ < 1MB → Full read (cat)
  │   ├─ 1-100MB → Partial/stream (head/tail/less)
  │   └─ > 100MB → Chunked processing
  ├─ What format?
  │   ├─ Text → cat/less
  │   ├─ JSON → jq
  │   ├─ YAML → yq
  │   ├─ CSV → cut/awk
  │   ├─ Binary → hexdump/xxd
  │   └─ Logs → tail/grep
  └─ Need context?
      ├─ Yes → Include line numbers (cat -n)
      └─ No → Plain read
```

### Quick Commands Cheatsheet

```bash
# Check size before reading
ls -lh file.txt
stat file.txt

# Full read with line numbers
cat -n file.txt

# First/last N lines
head -n 50 file.txt
tail -n 100 file.txt

# Specific line range
sed -n '100,200p' file.txt

# Interactive viewing
less file.txt

# Search with context
grep -C 5 "pattern" file.txt

# JSON/YAML
jq '.' file.json
yq eval '.' file.yaml

# Binary inspection
hexdump -C file.bin | head
strings file.bin
```

### Size Thresholds

- **< 1KB:** Trivial, read fully
- **1KB - 100KB:** Small, safe to read fully
- **100KB - 1MB:** Medium, consider partial reads
- **1MB - 100MB:** Large, use streaming or partitioning
- **> 100MB:** Very large, mandatory streaming, no full loads
