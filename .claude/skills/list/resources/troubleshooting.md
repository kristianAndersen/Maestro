# List Skill: Troubleshooting

Common problems with solutions, edge case handling, debugging techniques, performance optimization, and known limitations for directory and file listing operations.

---

## Table of Contents

1. [Common Issues and Solutions](#common-issues-and-solutions)
2. [Edge Case Handling](#edge-case-handling)
3. [Performance Optimization](#performance-optimization)
4. [Known Limitations](#known-limitations)

---

## Common Issues and Solutions

### Issue: Permission Denied Errors

**Problem:**
```bash
find /some/directory -name "*.js"
# Output: find: '/some/directory/protected': Permission denied
```

**Solutions:**

```bash
# Solution 1: Suppress error messages
find /some/directory -name "*.js" 2>/dev/null

# Solution 2: Use sudo (if appropriate)
sudo find /some/directory -name "*.js"

# Solution 3: Only search accessible directories
find /some/directory -name "*.js" -readable

# Solution 4: Filter out permission errors
find /some/directory -name "*.js" 2>&1 | grep -v "Permission denied"
```

**Best Practice:** Use `2>/dev/null` for user-facing scripts, preserve errors for debugging.

---

### Issue: Too Many Results

**Problem:**
```bash
find . -name "*.js"
# Output: 10,000+ files flooding terminal
```

**Solutions:**

```bash
# Solution 1: Count instead of list
find . -name "*.js" | wc -l

# Solution 2: Limit output
find . -name "*.js" | head -50

# Solution 3: Add filters to narrow scope
find . -name "*.js" ! -path "*/node_modules/*" ! -path "*/.git/*"

# Solution 4: Increase specificity
find ./src -name "*.component.js"

# Solution 5: Use pagination
find . -name "*.js" | less
```

**Best Practice:** Start narrow, then broaden if needed.

---

### Issue: No Results Found

**Problem:**
```bash
find . -name "*.JS"
# Output: (nothing)
```

**Diagnosis:**

```bash
# Check 1: Case sensitivity
find . -iname "*.js"  # Case-insensitive

# Check 2: Verify directory exists
ls -la /path/to/search

# Check 3: Check for typos in pattern
find . -name "*.js" | head -5  # Verify pattern works

# Check 4: Search in parent directory
find .. -name "pattern"

# Check 5: Check if files are hidden
find . -name ".*pattern*"
```

**Common Causes:**
- Case mismatch (`*.JS` vs `*.js`)
- Wrong directory
- Pattern typo
- Files are hidden (start with `.`)
- Files in excluded paths

---

### Issue: Symlink Loops

**Problem:**
```bash
find -L . -name "*.js"
# Output: Hangs or "Filesystem loop detected"
```

**Solutions:**

```bash
# Solution 1: Don't follow symlinks
find . -name "*.js"  # Default behavior

# Solution 2: Follow but detect loops
find -L . -name "*.js" 2>&1 | grep -v "Filesystem loop"

# Solution 3: Limit depth
find -L . -maxdepth 5 -name "*.js"

# Solution 4: Identify problematic symlinks first
find . -type l -exec file {} \; | grep "symbolic link"
```

**Best Practice:** Avoid `-L` flag unless symlink following is required.

---

### Issue: Special Characters in Filenames

**Problem:**
```bash
# Filename: "my file (1).js"
for file in $(find . -name "*.js"); do
  echo $file  # Breaks on spaces
done
```

**Solutions:**

```bash
# Solution 1: Use null delimiter
find . -name "*.js" -print0 | xargs -0 -I {} echo {}

# Solution 2: Use while read loop
find . -name "*.js" | while read -r file; do
  echo "$file"
done

# Solution 3: Quote variables
for file in $(find . -name "*.js"); do
  echo "$file"  # Quoted
done

# Solution 4: Use find -exec
find . -name "*.js" -exec echo {} \;
```

**Best Practice:** Always use `-print0` with `xargs -0` for robust handling.

---

### Issue: Slow Performance on Large Directories

**Problem:**
```bash
find /massive/directory -name "*.js"
# Takes minutes to complete
```

**Solutions:**

```bash
# Solution 1: Limit depth
find /massive/directory -maxdepth 3 -name "*.js"

# Solution 2: Prune large subdirectories
find . -name node_modules -prune -o -name "*.js" -print

# Solution 3: Use parallel processing
find . -name "*.js" | xargs -P 4 process_file.sh

# Solution 4: Cache results
find . -name "*.js" > /tmp/js-files.txt
cat /tmp/js-files.txt  # Subsequent uses are instant

# Solution 5: Use locate (if available and updated)
updatedb
locate "*.js" | grep "^$(pwd)"
```

**Best Practice:** Profile first (`time find ...`), then optimize based on bottleneck.

---

## Edge Case Handling

### Edge Case: Empty Directories

**Challenge:** Listing directories that contain no files.

```bash
# Find empty directories
find . -type d -empty

# Find directories with no regular files (but may have subdirs)
find . -type d -exec sh -c '[ $(find "$1" -maxdepth 1 -type f | wc -l) -eq 0 ]' _ {} \; -print
```

---

### Edge Case: Hidden Files

**Challenge:** Including or excluding hidden files.

```bash
# Include hidden files
ls -A  # All except . and ..

# Find only hidden files
find . -name ".*" ! -name "." ! -name ".."

# Exclude hidden directories from search
find . ! -path "*/\.*" -name "*.js"
```

---

### Edge Case: Files Without Extensions

**Challenge:** Finding files with no extension.

```bash
# Files without extension
find . -type f ! -name "*.*"

# Executable files without extension
find . -type f -executable ! -name "*.*"

# Check if truly no extension (not just hidden extension)
find . -type f | grep -v '\.[^/]*$'
```

---

### Edge Case: Case-Insensitive Filesystems

**Challenge:** macOS/Windows filesystems are case-insensitive.

```bash
# Use -iname for explicit case-insensitivity
find . -iname "readme*"  # Finds README, ReadMe, readme

# Check filesystem case sensitivity
touch test_case TEST_CASE
ls -la test_case TEST_CASE  # Same file? Case-insensitive

# Portable pattern matching
find . -name "[Rr][Ee][Aa][Dd][Mm][Ee]*"
```

---

### Edge Case: Very Long Paths

**Challenge:** Paths exceeding PATH_MAX (typically 4096 bytes).

```bash
# Identify long paths
find . -type f | awk 'length > 200 {print length, $0}' | sort -rn

# Truncate output for readability
find . -type f | while read path; do
  if [ ${#path} -gt 100 ]; then
    echo "...${path: -97}"
  else
    echo "$path"
  fi
done
```

---

## Performance Optimization

### Optimization: Prune Unwanted Directories Early

**Inefficient:**
```bash
find . -name "*.js" | grep -v node_modules
```

**Efficient:**
```bash
find . -name node_modules -prune -o -name "*.js" -print
```

**Why:** Pruning prevents traversal into excluded directories, saving time.

---

### Optimization: Combine Multiple Patterns

**Inefficient:**
```bash
find . -name "*.js"
find . -name "*.ts"
find . -name "*.jsx"
```

**Efficient:**
```bash
find . \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" \)
```

**Why:** Single traversal instead of three.

---

### Optimization: Use Appropriate Tools

**Inefficient for simple listing:**
```bash
find . -maxdepth 1 -type f
```

**Efficient:**
```bash
ls -1
```

**Why:** `ls` is optimized for single-directory listings.

---

### Optimization: Parallel Processing

**Sequential:**
```bash
find . -name "*.jpg" -exec convert {} {}.thumbnail \;
```

**Parallel:**
```bash
find . -name "*.jpg" | xargs -P 8 -I {} convert {} {}.thumbnail
```

**Why:** Utilizes multiple CPU cores for I/O-bound tasks.

---

## Known Limitations

### Limitation: Glob Patterns in `find -name`

**Issue:** `find -name` uses shell glob patterns, not regex.

```bash
# This does NOT work (regex)
find . -name "file[0-9]+.txt"

# Use this instead (glob)
find . -name "file[0-9].txt"

# Or use -regex
find . -regex ".*/file[0-9]+\.txt"
```

---

### Limitation: `tree` Not Always Available

**Issue:** `tree` is not installed by default on many systems.

**Workaround:**
```bash
# Check if tree exists
if command -v tree &> /dev/null; then
  tree -L 2
else
  # Fallback to find
  find . -maxdepth 2 -print | sed -e 's|[^/]*/| |g'
fi
```

---

### Limitation: Cross-Platform Compatibility

**Issue:** Different `find`, `ls`, `stat` implementations on Linux vs macOS/BSD.

```bash
# Linux stat
stat -c%s filename

# macOS/BSD stat
stat -f%z filename

# Portable solution
if stat -c%s filename 2>/dev/null; then
  # Linux
  size=$(stat -c%s filename)
else
  # macOS/BSD
  size=$(stat -f%z filename)
fi
```

---

### Limitation: Maximum Command Line Length

**Issue:** `xargs` has maximum argument length limits.

```bash
# May fail with "Argument list too long"
find . -name "*.txt" -exec cat {} \;

# Solution: Use xargs
find . -name "*.txt" | xargs cat

# Or batch with -exec +
find . -name "*.txt" -exec cat {} +
```

---

## Debugging Techniques

```bash
# Verify pattern on test files
touch test.js test.txt && find . -name "*.js" && rm test.js test.txt

# Use -print to verify before executing
find . -name "*.js" -print  # Verify, then execute action

# Check exit codes
find . -name "*.js" && echo "Found" || echo "Not found or error"
```

---

## Quick Troubleshooting Checklist

```
Issue: No results?
  ☐ Check case sensitivity (-iname)
  ☐ Verify directory exists
  ☐ Check pattern syntax
  ☐ Look for hidden files (-name ".*")

Issue: Too slow?
  ☐ Add -maxdepth limit
  ☐ Prune large directories
  ☐ Cache results
  ☐ Use parallel processing

Issue: Errors?
  ☐ Check permissions (2>/dev/null)
  ☐ Look for symlink loops
  ☐ Verify paths exist
  ☐ Check for special characters

Issue: Unexpected results?
  ☐ Test pattern in isolation
  ☐ Check for implicit excludes
  ☐ Verify logical operators (! -o -a)
  ☐ Use -print to debug
```
