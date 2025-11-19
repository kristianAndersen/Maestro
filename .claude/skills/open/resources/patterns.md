# Open Skill: Patterns

Concrete examples, read pattern library, format-specific handling templates, and context preservation strategies for file reading operations.

---

## Table of Contents

1. [Read Pattern Library](#read-pattern-library)
2. [Format-Specific Templates](#format-specific-templates)
3. [Context Preservation Patterns](#context-preservation-patterns)
4. [Streaming Patterns](#streaming-patterns)

---

## Read Pattern Library

### Pattern: Safe Universal Reader

Safely read any file with appropriate strategy:

```bash
#!/bin/bash
# Universal file reader

function safe_read() {
  local file=$1

  # Validate file exists
  if [ ! -f "$file" ]; then
    echo "Error: File not found: $file"
    return 1
  fi

  # Check if binary
  if file "$file" | grep -q "text"; then
    # Text file - check size
    local size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    if [ $size -lt 1048576 ]; then
      cat "$file"
    else
      echo "Large file ($size bytes). Use: less $file"
      head -n 100 "$file"
    fi
  else
    # Binary file
    echo "Binary file detected. Hex dump:"
    hexdump -C "$file" | head -50
  fi
}
```

### Pattern: Multi-File Comparison Reader

Read and compare multiple files:

```bash
#!/bin/bash
# Compare file contents

function compare_files() {
  local file1=$1
  local file2=$2

  echo "=== $file1 ==="
  head -n 30 "$file1"

  echo ""
  echo "=== $file2 ==="
  head -n 30 "$file2"

  echo ""
  echo "=== Differences ==="
  diff -u "$file1" "$file2" | head -50
}
```

### Pattern: Context-Aware Grep Reader

Read files with search context:

```bash
#!/bin/bash
# Read with search and context

function read_with_context() {
  local file=$1
  local pattern=$2

  echo "Searching for '$pattern' in $file:"
  grep -n -C 5 "$pattern" "$file"
}

# Usage
read_with_context source.py "def process_data"
```

### Pattern: Structured Configuration Reader

Read configuration files intelligently:

```bash
#!/bin/bash
# Configuration file reader

function read_config() {
  local file=$1
  local ext="${file##*.}"

  case $ext in
    json)
      jq '.' "$file"
      ;;
    yaml|yml)
      yq eval '.' "$file"
      ;;
    toml)
      cat "$file"
      ;;
    env)
      grep -v "^#" "$file" | grep -v "^$"
      ;;
    *)
      cat "$file"
      ;;
  esac
}
```

---

## Format-Specific Templates

### Template: JSON Reader

```bash
#!/bin/bash
# Comprehensive JSON reader

function read_json() {
  local file=$1

  echo "=== Structure ==="
  jq 'keys' "$file"

  echo ""
  echo "=== Sample Entry ==="
  jq 'to_entries | .[0]' "$file"

  echo ""
  echo "=== Full Content (formatted) ==="
  jq '.' "$file" | head -100
}
```

### Template: CSV Reader

```bash
#!/bin/bash
# CSV file reader

function read_csv() {
  local file=$1

  echo "=== Schema (Header) ==="
  head -n 1 "$file"

  echo ""
  echo "=== Sample Data (first 10 rows) ==="
  head -n 11 "$file" | column -t -s,

  echo ""
  echo "=== Statistics ==="
  echo "Total rows: $(wc -l < "$file")"
  echo "Columns: $(head -n 1 "$file" | tr ',' '\n' | wc -l)"
}
```

### Template: Log File Reader

```bash
#!/bin/bash
# Log file reader with analysis

function read_log() {
  local file=$1

  echo "=== Last 50 entries ==="
  tail -n 50 "$file"

  echo ""
  echo "=== Error Summary ==="
  grep -i "error\|exception" "$file" | tail -20

  echo ""
  echo "=== Log Statistics ==="
  echo "Total lines: $(wc -l < "$file")"
  echo "Errors: $(grep -ic "error" "$file")"
  echo "Warnings: $(grep -ic "warn" "$file")"
}
```

### Template: Source Code Reader

```bash
#!/bin/bash
# Source code reader

function read_code() {
  local file=$1

  echo "=== File: $file ==="
  echo "Lines: $(wc -l < "$file")"

  echo ""
  echo "=== Imports/Dependencies ==="
  grep "^import\|^from\|^require\|^use" "$file"

  echo ""
  echo "=== Functions/Methods ==="
  grep -n "^def \|^function \|^class \|fn " "$file"

  echo ""
  echo "=== Content ==="
  cat -n "$file"
}
```

### Template: Markdown Reader

```bash
#!/bin/bash
# Markdown document reader

function read_markdown() {
  local file=$1

  echo "=== Table of Contents ==="
  grep "^#" "$file"

  echo ""
  echo "=== Full Content ==="
  cat "$file"
}
```

---

## Context Preservation Patterns

### Pattern: Line-Number Preserved Reading

```bash
#!/bin/bash
# Read with persistent line numbers

function read_with_numbers() {
  local file=$1
  local start=${2:-1}
  local end=${3:-$(($(wc -l < "$file")))}

  sed -n "${start},${end}p" "$file" | nl -ba -v "$start"
}

# Read lines 50-100 with correct numbering
read_with_numbers source.py 50 100
```

### Pattern: Metadata-Enriched Reading

```bash
#!/bin/bash
# Read with file metadata

function read_with_metadata() {
  local file=$1

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "File: $file"
  echo "Size: $(stat -c%s "$file" 2>/dev/null || stat -f%z "$file") bytes"
  echo "Lines: $(wc -l < "$file")"
  echo "Modified: $(stat -c%y "$file" 2>/dev/null || stat -f "%Sm" "$file")"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  cat -n "$file"
}
```

### Pattern: Section-Based Reading

```bash
#!/bin/bash
# Read file by sections

function read_by_sections() {
  local file=$1

  # Find section markers (## headers in markdown, or function definitions)
  sections=$(grep -n "^##\|^function \|^def \|^class " "$file")

  echo "$sections" | while read -r section; do
    line_num=$(echo "$section" | cut -d: -f1)
    section_name=$(echo "$section" | cut -d: -f2-)

    echo "=== $section_name (line $line_num) ==="
    sed -n "${line_num},$((line_num + 20))p" "$file"
    echo ""
  done
}
```

---

## Streaming Patterns

### Pattern: Real-Time Log Following

```bash
#!/bin/bash
# Follow log with filtering

function follow_log() {
  local file=$1
  local pattern=${2:-""}

  if [ -z "$pattern" ]; then
    tail -f "$file"
  else
    tail -f "$file" | grep --line-buffered "$pattern"
  fi
}

# Usage
follow_log application.log "ERROR"
```

### Pattern: Batch File Processing

```bash
#!/bin/bash
# Process multiple files in streaming fashion

function batch_read() {
  local pattern=$1

  find . -name "$pattern" | while read -r file; do
    echo "=== Processing: $file ==="
    head -n 20 "$file"
    echo ""
  done
}

# Usage
batch_read "*.md"
```

### Pattern: Progressive File Aggregation

```bash
#!/bin/bash
# Aggregate content from multiple files

function aggregate_files() {
  local pattern=$1
  local output=$2

  echo "Aggregating files matching: $pattern"
  echo "# Aggregated Content" > "$output"
  echo "Generated: $(date)" >> "$output"
  echo "" >> "$output"

  find . -name "$pattern" | while read -r file; do
    echo "## File: $file" >> "$output"
    cat "$file" >> "$output"
    echo "" >> "$output"
    echo "---" >> "$output"
    echo "" >> "$output"
  done

  echo "Aggregated to: $output"
}
```

---

## Quick Pattern Reference

### By Use Case

| Use Case | Pattern | Command |
|----------|---------|---------|
| Quick preview | Head/Tail | `head -n 50 file.txt` |
| Full small file | Cat with numbers | `cat -n file.txt` |
| Large file | Sample strategy | `head && tail` |
| Search in file | Grep with context | `grep -C 5 "pattern" file` |
| JSON inspection | JQ pretty-print | `jq '.' file.json` |
| Log analysis | Tail with filter | `tail -f log \| grep ERROR` |
| Binary file | Hex dump | `hexdump -C file \| head` |
| Code review | Read with line numbers | `cat -n source.py` |

### By File Size

| Size Range | Strategy | Example |
|------------|----------|---------|
| < 10KB | Full read | `cat file.txt` |
| 10KB-1MB | Check then read | `ls -lh && cat file.txt` |
| 1MB-10MB | Partial read | `head -n 100 file.txt` |
| 10MB-100MB | Sample read | `head && tail` |
| > 100MB | Stream only | `less file.txt` |

### Common Combinations

```bash
# Read with line numbers and page
cat -n file.txt | less

# Search and show context
grep -C 3 "pattern" file.txt

# Read JSON key
jq '.specific.key' data.json

# Follow log with color
tail -f app.log | grep --color "ERROR"

# Read multiple files
cat file1.txt file2.txt file3.txt

# Compare files side-by-side
diff -y file1.txt file2.txt | less
```
