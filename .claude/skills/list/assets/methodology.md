# List Skill: Methodology

Advanced techniques, deep theory, step-by-step processes, decision frameworks, and strategic approaches for file and directory listing operations.

## Table of Contents

1. [Advanced Filtering Strategies](#advanced-filtering-strategies)
2. [Organization Strategies](#organization-strategies)
3. [Performance Optimization](#performance-optimization)
4. [Complex Use Cases](#complex-use-cases)
5. [Integration Patterns](#integration-patterns)

---

## Advanced Filtering Strategies

### Multi-Criteria Filtering

Combine multiple predicates for precise file discovery:

```bash
# Files modified in last 7 days, larger than 1MB, executable
find . -type f -mtime -7 -size +1M -perm -u+x

# JavaScript files excluding tests and build directories
find . -type f -name "*.js" \
  ! -name "*.test.js" \
  ! -name "*.spec.js" \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*"
```

### Dynamic Pattern Generation

Build patterns programmatically for complex scenarios:

```bash
# Generate exclude patterns from .gitignore
excludes=$(grep -v '^#' .gitignore | grep -v '^$' | sed 's/^/-path "*\//' | sed 's/$/*" -o/' | tr '\n' ' ')
eval "find . -type f ! \( $excludes -false \)"
```

### Content-Based Discovery

Combine file listing with content analysis:

```bash
# Find files containing specific patterns
find . -type f -name "*.js" -exec grep -l "import.*React" {} \;

# Files with TODO comments, show line numbers
find . -type f \( -name "*.js" -o -name "*.ts" \) -exec grep -Hn "TODO:" {} \;
```

---

## Organization Strategies

### Hierarchical Categorization

Group files by multiple dimensions:

```bash
# By purpose
find . -type f -name "*.js" ! -path "*/test/*" > src-files.txt
find . -type f -name "*.test.js" > test-files.txt

# By language/framework
for ext in js ts py rb go rs; do
  echo "=== .$ext files ==="
  find . -name "*.$ext" ! -path "*/node_modules/*" | wc -l
done
```

### Inventory Generation

Create comprehensive file inventories:

```bash
# Full inventory with metadata
find . -type f -printf "%T@ %s %p\n" | sort -rn | awk '{
  cmd="date -d @"$1" +%Y-%m-%d"
  cmd | getline date
  close(cmd)
  printf "%-12s %-10s %s\n", date, $2, $3
}'
```

---

## Performance Optimization

### Limiting Traversal Depth

Control search depth for better performance:

```bash
# Search only 2 levels deep
find . -maxdepth 2 -name "*.json"

# Skip deep directories
find . -name node_modules -prune -o -name "*.js" -print
```

### Parallel Processing

Use parallel execution for large file sets:

```bash
# Process files in parallel with xargs
find . -name "*.js" | xargs -P 4 -I {} sh -c 'wc -l {}'

# Batch processing
find . -name "*.jpg" -exec mogrify -resize 50% {} +
```

### Caching Strategies

Cache expensive operations:

```bash
# Cache file list
find . -type f > /tmp/all-files.txt

# Use cached list
grep "\.js$" /tmp/all-files.txt
grep "\.test\." /tmp/all-files.txt
```

---

## Complex Use Cases

### Codebase Analysis

Deep analysis of project structure:

```bash
# Language breakdown by line count
for ext in js ts py rb go; do
  count=$(find . -name "*.$ext" ! -path "*/node_modules/*" -exec wc -l {} + | tail -1 | awk '{print $1}')
  echo "$ext: $count lines"
done

# Find orphaned files (not imported anywhere)
all_files=$(find src -name "*.js" -not -name "*.test.js")
for file in $all_files; do
  basename=$(basename "$file" .js)
  if ! grep -r "import.*$basename\|require.*$basename" src --exclude="$(basename $file)" > /dev/null; then
    echo "Orphaned: $file"
  fi
done
```

### Diff and Comparison

Compare directory structures:

```bash
# Compare two directory trees
diff <(find dir1 -type f | sort) <(find dir2 -type f | sort)

# Find new files since last commit
find . -type f -newer .git/ORIG_HEAD
```

### Audit and Compliance

Verify file structure meets requirements:

```bash
# Check for required files
required_files=("README.md" "LICENSE" "package.json")
for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
  fi
done

# Find files with overly permissive permissions
find . -type f -perm -002  # World-writable
```

---

## Integration Patterns

### With Version Control

Leverage git information:

```bash
# Files changed in last 10 commits
git diff --name-only HEAD~10

# Find files not tracked by git
comm -23 <(find . -type f | sort) <(git ls-files | sort)
```

### With Build Tools

Integrate with build systems:

```bash
# List all entry points
find . -name "index.js" -o -name "main.js" | grep -v node_modules

# Files not covered by build
all_src=$(find src -name "*.js" | sort)
built=$(cat dist/manifest.json | jq -r '.[]' | sort)
comm -23 <(echo "$all_src") <(echo "$built")
```

### With Testing Frameworks

Coordinate with test infrastructure:

```bash
# Find source files without tests
find src -name "*.js" ! -name "*.test.js" | while read src_file; do
  test_file="${src_file%.js}.test.js"
  [ ! -f "$test_file" ] && echo "Missing test: $src_file"
done
```

---

## Decision Frameworks

### When to List vs. When to Search

**Use listing (ls, tree) when:**
- Exploring unfamiliar structure
- Need visual hierarchy
- Working with single directory

**Use search (find, grep) when:**
- Pattern matching across deep trees
- Complex filtering criteria
- Building file processing pipelines

### Depth vs. Breadth Trade-offs

**Shallow searches:**
- Fast execution
- Quick overview
- Good for initial exploration

**Deep searches:**
- Complete coverage
- Finds all matches
- Good for thorough analysis

---

## Summary

This methodology provides advanced techniques for:
- Complex multi-criteria filtering
- Strategic file organization
- Performance-optimized searches
- Real-world use case solutions
- Integration with development tools

Apply techniques progressively based on needs.
