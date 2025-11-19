# Open Skill: Methodology

Advanced read strategies, memory management, progressive loading techniques, and format-specific approaches for file reading operations.

---

## Table of Contents

1. [Advanced Read Strategies](#advanced-read-strategies)
2. [Memory Management](#memory-management)
3. [Progressive Loading](#progressive-loading)
4. [Format-Specific Approaches](#format-specific-approaches)
5. [Stream Processing](#stream-processing)

---

## Advanced Read Strategies

### Strategy: Adaptive Reading

Automatically adjust reading strategy based on file characteristics:

```bash
#!/bin/bash
# Adaptive file reader

function read_file() {
  local file=$1
  local size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  local lines=$(wc -l < "$file" 2>/dev/null || echo 0)

  # Decision tree
  if [ $size -lt 10240 ]; then
    # < 10KB: Full read
    cat "$file"
  elif [ $size -lt 1048576 ]; then
    # 10KB - 1MB: Check line count
    if [ $lines -lt 1000 ]; then
      cat "$file"
    else
      echo "Large file. First 100 lines:"
      head -n 100 "$file"
    fi
  else
    # > 1MB: Sample strategy
    echo "File: $file ($size bytes, $lines lines)"
    echo "=== First 50 lines ==="
    head -n 50 "$file"
    echo ""
    echo "=== Last 50 lines ==="
    tail -n 50 "$file"
  fi
}
```

### Strategy: Selective Reading

Read only relevant portions based on content patterns:

```bash
# Read specific sections
function read_section() {
  local file=$1
  local start_pattern=$2
  local end_pattern=$3

  sed -n "/$start_pattern/,/$end_pattern/p" "$file"
}

# Example: Extract function definition
read_section code.js "function processData" "^}"

# Extract configuration block
read_section config.yaml "database:" "cache:"
```

### Strategy: Intelligent Sampling

Sample file intelligently, not just first/last:

```bash
#!/bin/bash
# Intelligent sampler

function sample_file() {
  local file=$1
  local total_lines=$(wc -l < "$file")
  local sample_size=100

  # Calculate sample points
  local quarter=$((total_lines / 4))
  local half=$((total_lines / 2))
  local three_quarters=$((total_lines * 3 / 4))

  echo "=== Start (lines 1-20) ==="
  head -n 20 "$file"

  echo ""
  echo "=== Quarter mark (lines $quarter-$((quarter + 20))) ==="
  sed -n "${quarter},$((quarter + 20))p" "$file"

  echo ""
  echo "=== Midpoint (lines $half-$((half + 20))) ==="
  sed -n "${half},$((half + 20))p" "$file"

  echo ""
  echo "=== End (last 20 lines) ==="
  tail -n 20 "$file"
}
```

---

## Memory Management

### Technique: Streaming vs Loading

**When to stream:**
- File size > available memory / 10
- Processing can be done line-by-line
- Don't need random access
- Working with logs or data feeds

**When to load:**
- File size < 1% of available memory
- Need random access to content
- Multiple passes required
- In-memory processing is faster

```bash
# Check available memory
free -h | grep Mem

# Streaming approach
while IFS= read -r line; do
  process_line "$line"
done < large-file.txt

# Loading approach (small files only)
mapfile -t lines < small-file.txt
for line in "${lines[@]}"; do
  process_line "$line"
done
```

### Technique: Chunked Processing

Process large files in manageable chunks:

```bash
#!/bin/bash
# Chunk processor

function process_in_chunks() {
  local file=$1
  local chunk_size=10000  # lines per chunk

  total_lines=$(wc -l < "$file")
  chunks=$(( (total_lines + chunk_size - 1) / chunk_size ))

  for ((i=0; i<chunks; i++)); do
    start=$((i * chunk_size + 1))
    end=$(( (i + 1) * chunk_size ))

    echo "Processing chunk $((i + 1))/$chunks (lines $start-$end)"
    sed -n "${start},${end}p" "$file" | process_chunk
  done
}
```

### Technique: Memory-Mapped Reading

For very large files, use tools that support memory mapping:

```bash
# Python example for memory-mapped reading
python3 << 'EOF'
import mmap

with open('huge-file.txt', 'r+b') as f:
    mmapped = mmap.mmap(f.fileno(), 0)
    # Read specific range without loading entire file
    chunk = mmapped[1000:2000]
    print(chunk.decode())
    mmapped.close()
EOF
```

---

## Progressive Loading

### Pattern: Lazy Loading

Load content only when needed:

```bash
#!/bin/bash
# Lazy file loader

# Cache file info
declare -A file_cache

function get_file_info() {
  local file=$1

  if [ -z "${file_cache[$file]}" ]; then
    file_cache[$file]=$(stat -c%s "$file" 2>/dev/null)
  fi

  echo "${file_cache[$file]}"
}

# Load on demand
function load_if_needed() {
  local file=$1
  local size=$(get_file_info "$file")

  if [ $size -lt 1048576 ]; then
    cat "$file"
  else
    echo "File too large. Use 'head $file' or 'less $file'"
  fi
}
```

### Pattern: Incremental Reading

Read file incrementally, expanding as needed:

```bash
#!/bin/bash
# Incremental reader

function incremental_read() {
  local file=$1
  local initial_lines=50
  local increment=50
  local current=$initial_lines

  head -n $current "$file"

  while true; do
    read -p "Show $increment more lines? (y/n): " answer
    case $answer in
      [Yy]*)
        current=$((current + increment))
        head -n $current "$file" | tail -n $increment
        ;;
      *)
        break
        ;;
    esac
  done
}
```

### Pattern: On-Demand Sections

Load specific sections on request:

```bash
# Section index
function build_section_index() {
  local file=$1
  grep -n "^##" "$file" > /tmp/section-index.txt
}

function read_section_by_name() {
  local file=$1
  local section_name=$2

  start_line=$(grep "$section_name" /tmp/section-index.txt | cut -d: -f1)
  next_line=$(grep -A1 "$section_name" /tmp/section-index.txt | tail -1 | cut -d: -f1)

  sed -n "${start_line},$((next_line - 1))p" "$file"
}
```

---

## Format-Specific Approaches

### Approach: JSON Files

```bash
# Size check first
size=$(stat -c%s data.json 2>/dev/null || stat -f%z data.json)

if [ $size -lt 1048576 ]; then
  # Small JSON: pretty-print fully
  jq '.' data.json
else
  # Large JSON: explore structure
  echo "Keys at root:"
  jq 'keys' data.json

  echo "Sample of first array element:"
  jq '.[0]' data.json
fi
```

### Approach: YAML Files

```bash
# Read with structure awareness
yq eval '.' config.yaml  # Full read

# Or target specific keys
yq eval '.services | keys' docker-compose.yml
yq eval '.services.web' docker-compose.yml
```

### Approach: CSV/TSV Files

```bash
# Schema detection (read header only)
head -n 1 data.csv

# Sample rows
head -n 11 data.csv  # Header + 10 rows

# Column extraction
cut -d, -f1,3,5 data.csv | head -20

# Statistics
awk -F, '{sum+=$2} END {print sum/NR}' data.csv  # Average of column 2
```

### Approach: Log Files

```bash
# Recent entries
tail -n 100 application.log

# Time-based filtering
grep "2024-01-18" application.log

# Error analysis
grep -i "error\|exception\|fail" application.log | tail -50

# Pattern extraction with context
grep -C 3 "OutOfMemoryError" application.log
```

### Approach: Source Code

```bash
# Read with syntax awareness
bat source.py  # Syntax highlighting if available

# Function extraction
sed -n '/^def target_function/,/^def /p' source.py | head -n -1

# Class extraction
sed -n '/^class TargetClass/,/^class /p' source.py | head -n -1

# Import analysis
grep "^import\|^from" source.py
```

### Approach: Binary Files

```bash
# File type identification
file binary-file

# Header inspection (first 512 bytes)
hexdump -C binary-file | head -32

# String extraction
strings binary-file | head -100

# Specific offset reading
dd if=binary-file bs=1 skip=1000 count=100 2>/dev/null | hexdump -C
```

---

## Stream Processing

### Pattern: Pipeline Reading

Build processing pipelines for efficient file reading:

```bash
# Multi-stage pipeline
cat large.log \
  | grep "ERROR" \
  | awk '{print $1, $2, $NF}' \
  | sort -u \
  | head -50
```

### Pattern: Parallel Reading

Read multiple files in parallel:

```bash
#!/bin/bash
# Parallel file reader

files=( file1.txt file2.txt file3.txt file4.txt )

for file in "${files[@]}"; do
  (
    echo "=== $file ==="
    head -n 20 "$file"
  ) &
done

wait
```

### Pattern: Buffered Reading

Use buffering for efficient I/O:

```bash
# Large buffer for better performance
cat large-file.txt | buffer -s 10M | process_data.sh

# Or using dd with buffer
dd if=input-file bs=1M | process_data.sh
```

---

## Decision Frameworks

### When to Read Fully vs Partially

**Read fully when:**
- Size < 1MB
- Lines < 1000
- Need complete context
- File format requires parsing (small JSON/YAML)

**Read partially when:**
- Size > 1MB
- Lines > 1000
- Only need samples
- Looking for specific patterns

**Use streaming when:**
- Size > 100MB
- Processing can be incremental
- Memory is limited
- Real-time processing (logs)

### Optimization Checklist

```
Before reading:
  ☐ Check file size (stat, ls -lh)
  ☐ Check file type (file command)
  ☐ Estimate line count (wc -l)
  ☐ Determine encoding (file -bi)

Choose strategy:
  ☐ Small file → Full read
  ☐ Medium file → Partial/sample read
  ☐ Large file → Streaming/chunked
  ☐ Binary file → Hex/string inspection

During reading:
  ☐ Monitor memory usage
  ☐ Use appropriate tools
  ☐ Preserve context (line numbers)
  ☐ Handle errors gracefully
```

---

## Summary

This methodology provides:
- **Advanced strategies** for adaptive and selective reading
- **Memory management** techniques for efficient file handling
- **Progressive loading** patterns for on-demand content access
- **Format-specific approaches** optimized for different file types
- **Stream processing** patterns for large-scale file operations

Apply these techniques based on file characteristics and processing requirements.
