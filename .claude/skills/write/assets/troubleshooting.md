# Write Skill: Troubleshooting

Common issues with file modifications, handling merge conflicts, breaking changes, test failures, and rollback strategies.

---

## Table of Contents

1. [Modification Failures](#modification-failures)
2. [Breaking Changes](#breaking-changes)
3. [Test Failures](#test-failures)
4. [Rollback and Recovery](#rollback-and-recovery)

---

## Modification Failures

### Issue: Edit Tool Says String Not Found

**Symptoms:**
Edit fails with "old_string not found in file"

**Causes:**
- Indentation mismatch (spaces vs tabs)
- Extra/missing whitespace
- Line ending differences
- String doesn't exist exactly as specified

**Solutions:**

```bash
# 1. Read file again to get exact string
cat -A file.py | grep -A 5 "function_name"
# -A shows tabs as ^I, spaces as-is

# 2. Copy exact string including whitespace
# Use Read tool to get exact content

# 3. Check for hidden characters
hexdump -C file.py | grep "function_name"

# 4. Try smaller, more specific old_string
# Instead of entire function, target specific line
```

---

### Issue: File Overwrites Lose Content

**Symptoms:**
Used Write on existing file, lost original content

**Prevention:**

```bash
# NEVER use Write on existing files
# Always use Edit for existing files

# Check file exists first
if [ -f "file.py" ]; then
  echo "File exists - use Edit, not Write"
fi
```

**Recovery:**

```bash
# If using git
git checkout file.py

# If no git, check backups
ls -la *.backup *.bak
```

---

### Issue: Syntax Error After Modification

**Symptoms:**
Code doesn't compile/run after Edit

**Diagnosis:**

```bash
# Check syntax
python -m py_compile file.py
node --check file.js

# Look at what changed
git diff file.py

# Read modified section
cat -n file.py | grep -A 10 -B 10 "modified_line"
```

**Solutions:**

```bash
# 1. Identify exact syntax error
python file.py  # See full error message

# 2. Check common issues:
# - Missing closing bracket/paren
# - Indentation errors
# - Missing colon
# - Quote mismatch

# 3. Fix with another Edit
# or rollback and retry
git checkout file.py
```

---

### Issue: Indentation Corrupted

**Symptoms:**
Mixed tabs/spaces, inconsistent indentation

**Diagnosis:**

```bash
# Show tabs and spaces
cat -A file.py | grep "function"
# ^I = tab, spaces show as-is

# Check indentation consistency
python -m tabnanny file.py
```

**Solutions:**

```bash
# Convert tabs to spaces (Python standard)
expand -t 4 file.py > file_fixed.py
mv file_fixed.py file.py

# Or use autopep8
autopep8 --in-place --select=E101,E121 file.py
```

---

## Breaking Changes

### Issue: Change Breaks Other Code

**Symptoms:**
Modified function, now other files fail

**Diagnosis:**

```bash
# Find all callers
grep -rn "function_name(" .

# Run all tests
pytest
npm test

# Check specific failures
pytest -v  # Verbose output shows which tests fail
```

**Solutions:**

```bash
# Option 1: Update all callers
# Find and update each call site

# Option 2: Maintain backward compatibility
def function_name(param, new_param=None):
    if new_param is None:
        # Old behavior
        return old_implementation(param)
    # New behavior
    return new_implementation(param, new_param)

# Option 3: Create new function, deprecate old
def function_name_v2(param, new_param):
    # New implementation
    pass

def function_name(param):
    warnings.warn("Use function_name_v2", DeprecationWarning)
    return function_name_v2(param, default_value)
```

---

### Issue: API Changed, Breaking Clients

**Symptoms:**
Changed API signature, clients fail

**Solutions:**

```python
# Option 1: Version the API
def api_v1(param):
    # Old API - keep for compatibility
    pass

def api_v2(param, new_param):
    # New API
    pass

# Option 2: Add optional parameters
def api(param, new_param=None):
    # Backward compatible
    pass

# Option 3: Adapter pattern
def old_api(param):
    # Adapter to new API
    return new_api(param, default_value)
```

---

### Issue: Database Schema Changed

**Symptoms:**
Modified model, database incompatible

**Solutions:**

```bash
# Create migration script
# Don't modify model directly

# 1. Create migration
python manage.py makemigrations

# 2. Review migration
cat migrations/0001_migration.py

# 3. Apply migration
python manage.py migrate

# 4. Test with old and new data
```

---

## Test Failures

### Issue: Tests Fail After Change

**Symptoms:**
Modified code, tests now fail

**Diagnosis:**

```bash
# Run tests with verbose output
pytest -v

# Run specific failing test
pytest tests/test_module.py::test_function -v

# Check test expectations
cat tests/test_module.py
```

**Solutions:**

```bash
# Determine if failure is:
# 1. Test is wrong → Update test
# 2. Code is wrong → Fix code
# 3. Both need updates → Update both

# Check test assertion
# Does it test the right thing?
# Does expected behavior match requirements?
```

---

### Issue: Tests Pass Locally, Fail in CI

**Causes:**
- Environment differences
- Missing dependencies
- File path issues
- Timing issues

**Solutions:**

```bash
# 1. Check CI environment
# Read CI config (.github/workflows/, .gitlab-ci.yml)

# 2. Reproduce locally
docker run -it <ci-image> bash
# Install deps and run tests

# 3. Check for:
# - Hardcoded paths
# - Environment variables
# - Missing test dependencies
```

---

### Issue: Flaky Tests

**Symptoms:**
Tests pass sometimes, fail sometimes

**Causes:**
- Race conditions
- Time-dependent logic
- Random data
- External dependencies

**Solutions:**

```python
# Fix race conditions
# Don't: time.sleep(1)  # Arbitrary wait
# Do: wait_for_condition(lambda: check(), timeout=5)

# Fix time dependencies
# Don't: if datetime.now() > deadline:
# Do: if current_time > deadline:  # Inject time for testing

# Fix random data
# Don't: random.choice(items)
# Do: random.seed(42); random.choice(items)  # In tests

# Mock external dependencies
@patch('requests.get')
def test_api(mock_get):
    mock_get.return_value = Mock(status_code=200)
    # Test doesn't depend on real API
```

---

## Rollback and Recovery

### Recovery: Git-Based Rollback

```bash
# See what changed
git diff file.py

# Undo changes to specific file
git checkout file.py

# Undo all uncommitted changes
git reset --hard

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Restore from specific commit
git checkout <commit-hash> -- file.py
```

### Recovery: File-Based Rollback

```bash
# If you created backup before editing
cp file.py.backup file.py

# If editor created backup
ls -la file.py~ file.py.bak
cp file.py~ file.py

# Check for auto-save files
ls -la .#file.py #file.py#
```

### Recovery: Incremental Fix

```bash
# Don't rollback - fix forward

# 1. Identify what broke
pytest -v  # See failing tests

# 2. Make minimal fix
# Use Edit to fix just the broken part

# 3. Verify
pytest

# 4. If still broken, repeat
```

### Recovery: Revert to Known Good State

```bash
# Find last known good commit
git log --oneline
git bisect start
git bisect bad  # Current is bad
git bisect good <commit>  # This was good
# Git will help find breaking commit

# Revert the breaking commit
git revert <bad-commit>
```

---

## Quick Troubleshooting Guide

```
Edit fails "string not found"?
  ☐ Read file again (exact string)
  ☐ Check whitespace (cat -A)
  ☐ Verify indentation matches
  ☐ Try smaller old_string

Syntax error after edit?
  ☐ Run syntax checker
  ☐ Check git diff
  ☐ Look for missing brackets/colons
  ☐ Verify indentation

Tests failing?
  ☐ Run tests verbose (pytest -v)
  ☐ Read test expectations
  ☐ Determine: test wrong or code wrong?
  ☐ Fix appropriate one

Breaking other code?
  ☐ Find all callers (grep)
  ☐ Add backward compatibility
  ☐ Or update all callers
  ☐ Add deprecation warning

Need to rollback?
  ☐ git checkout file.py (undo changes)
  ☐ or cp file.py.backup file.py
  ☐ or fix forward incrementally
```

---

## Prevention Strategies

### Strategy: Small Changes

```bash
# Don't: One big change
Edit(file, old="entire file", new="completely different file")

# Do: Many small changes
Edit(file, old="function1", new="improved function1")
# Verify
Edit(file, old="function2", new="improved function2")
# Verify
```

### Strategy: Test-Driven Modification

```bash
# 1. Write test for desired behavior
# 2. Run test (should fail)
# 3. Make modification
# 4. Run test (should pass)
# 5. Verify all tests still pass
```

### Strategy: Backup Before Modify

```bash
# For critical files
cp important.py important.py.backup

# Make changes
# If breaks: cp important.py.backup important.py
```

### Strategy: Incremental Verification

```bash
# After each Edit:
python -m py_compile file.py  # Syntax
pytest tests/test_file.py  # Tests

# Don't wait until end to verify
```
