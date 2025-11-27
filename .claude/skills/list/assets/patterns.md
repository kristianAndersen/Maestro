# List Skill: Patterns

Concrete examples, templates, code snippets, pattern library, and common scenarios with solutions for directory and file listing operations.

---

## Table of Contents

1. [Pattern Library](#pattern-library)
2. [Framework-Agnostic Patterns](#framework-agnostic-patterns)
3. [Output Format Templates](#output-format-templates)
4. [Pattern Selection Guide](#pattern-selection-guide)

---

## Pattern Library

### Pattern: Project Inventory

Generate comprehensive project file inventory:

```bash
#!/bin/bash
# Project inventory generator

echo "# Project File Inventory"
echo "Generated: $(date)"
echo ""

echo "## Directory Structure"
tree -L 3 -I "node_modules|.git|dist|build"
echo ""

echo "## File Count by Type"
for ext in js ts jsx tsx py rb go rs java c cpp; do
  count=$(find . -name "*.$ext" ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l)
  if [ $count -gt 0 ]; then
    echo "  $ext: $count files"
  fi
done
echo ""

echo "## Configuration Files"
find . -maxdepth 2 \( -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" \) -exec ls -lh {} \;
echo ""

echo "## Documentation Files"
find . -name "*.md" ! -path "*/node_modules/*" -exec echo "  - {}" \;
```

### Pattern: Code Organization Analyzer

Understand codebase organization:

```bash
#!/bin/bash
# Analyze code organization

echo "=== Source Code Analysis ==="

# Total source files
src_total=$(find src -type f 2>/dev/null | wc -l)
echo "Total source files: $src_total"

# Files by directory
echo ""
echo "Files per directory:"
find src -type d 2>/dev/null | while read dir; do
  count=$(find "$dir" -maxdepth 1 -type f | wc -l)
  [ $count -gt 0 ] && echo "  $dir: $count"
done | sort -t: -k2 -rn

# Largest files
echo ""
echo "Top 10 largest files:"
find src -type f -exec ls -lh {} \; 2>/dev/null | sort -k5 -rh | head -10 | awk '{print $5, $9}'
```

### Pattern: Test Coverage Mapping

Map source files to their tests:

```bash
#!/bin/bash
# Test coverage mapper

echo "=== Test Coverage Report ==="

find src -name "*.js" ! -name "*.test.js" ! -name "*.spec.js" | while read src_file; do
  base="${src_file%.js}"

  if [ -f "${base}.test.js" ]; then
    echo "✓ $src_file"
  elif [ -f "${base}.spec.js" ]; then
    echo "✓ $src_file"
  else
    echo "✗ $src_file (NO TEST)"
  fi
done
```

### Pattern: Configuration Discovery

Find all configuration files across formats:

```bash
#!/bin/bash
# Discover all configuration files

config_patterns=(
  "*.json"
  "*.yaml"
  "*.yml"
  "*.toml"
  "*.ini"
  "*.conf"
  ".env*"
)

echo "=== Configuration Files ==="

for pattern in "${config_patterns[@]}"; do
  files=$(find . -name "$pattern" ! -path "*/node_modules/*" 2>/dev/null)
  if [ -n "$files" ]; then
    echo "Pattern: $pattern"
    echo "$files" | sed 's/^/  /'
  fi
done
```

---

## Framework-Agnostic Patterns

### Pattern: Module Boundary Detection

Identify module boundaries in any codebase:

```bash
#!/bin/bash
# Detect module boundaries

find . -type f \( -name "index.*" -o -name "main.*" -o -name "__init__.py" \) ! -path "*/node_modules/*" | while read entry; do
  module_dir=$(dirname "$entry")
  file_count=$(find "$module_dir" -maxdepth 1 -type f | wc -l)
  echo "Module: $module_dir ($file_count files)"
done
```

### Pattern: Documentation Coverage

Check documentation completeness:

```bash
#!/bin/bash
# Documentation coverage check

find src -type d ! -path "*/node_modules/*" | while read dir; do
  has_readme=$(find "$dir" -maxdepth 1 -name "README.md" | wc -l)
  file_count=$(find "$dir" -maxdepth 1 -type f | wc -l)

  if [ $file_count -gt 0 ]; then
    if [ $has_readme -gt 0 ]; then
      echo "✓ $dir"
    else
      echo "✗ $dir (no README)"
    fi
  fi
done
```

### Pattern: Dead Code Detection

Find potentially unused files:

```bash
#!/bin/bash
# Detect potentially dead code

echo "Files not modified in 6 months:"
find src -type f -mtime +180 2>/dev/null | head -20
```

---

## Output Format Templates

### Template: Markdown File Tree

Generate markdown-formatted directory tree:

```bash
#!/bin/bash

function print_tree() {
  local dir=$1
  local prefix=$2

  find "$dir" -maxdepth 1 ! -path "$dir" | sort | while read item; do
    local name=$(basename "$item")
    if [ -d "$item" ]; then
      echo "${prefix}- **${name}/**"
    else
      echo "${prefix}- ${name}"
    fi
  done
}

echo "# Project Structure"
print_tree "." ""
```

### Template: JSON File Manifest

Generate JSON manifest of all files:

```bash
#!/bin/bash

echo "{"
echo '  "generated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
echo '  "files": ['

find . -type f ! -path "*/node_modules/*" | while read file; do
  size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
  echo "    {"
  echo '      "path": "'$file'",'
  echo '      "size": '$size
  echo "    },"
done | sed '$ s/,$//'

echo "  ]"
echo "}"
```

---

## Pattern Selection Guide

### By Use Case

| Use Case | Recommended Pattern | Why |
|----------|-------------------|-----|
| Initial exploration | Project Inventory | Comprehensive overview |
| Code review prep | Code Organization Analyzer | Understand structure |
| Quality audit | Test Coverage Mapping | Identify gaps |
| Module design | Module Boundary Detection | Understand boundaries |
| Security audit | Configuration Discovery | Find all configs |
| Code cleanup | Dead Code Detection | Remove unused |
| Documentation | Documentation Coverage | Ensure completeness |

### By Output Format

| Format | Best For | Pattern |
|--------|----------|---------|
| Markdown | Documentation, READMEs | Markdown File Tree |
| JSON | APIs, automation | JSON File Manifest |
| Plain text | Logs, simple reports | Custom with echo |

### Quick Pattern Reference

```bash
# Project inventory
tree -L 3 -I "node_modules|.git"

# Find untested files
comm -23 <(find src -name "*.js" | sort) <(find src -name "*.test.js" | sed 's/.test.js/.js/' | sort)

# Configuration files
find . -maxdepth 3 \( -name "*.json" -o -name "*.yaml" \)

# Largest files
find . -type f -exec ls -lh {} \; | sort -k5 -rh | head -20

# Recently modified
find . -type f -mtime -7 | head -20

# Dead code candidates
find src -type f -mtime +180
```
