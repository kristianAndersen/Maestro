# Write Skill: Methodology

Advanced modification strategies, safety protocols, testing approaches, and systematic change management for code and file modifications.

---

## Table of Contents

1. [Modification Strategies](#modification-strategies)
2. [Safety Protocols](#safety-protocols)
3. [Testing Approaches](#testing-approaches)
4. [Change Management](#change-management)

---

## Modification Strategies

### Strategy: Red-Green-Refactor

Always use when modifying existing functionality:

**Process:**
1. **Red:** Write/update test for desired behavior (should fail)
2. **Green:** Modify code to make test pass
3. **Refactor:** Clean up implementation while keeping tests green

**Application:**
```bash
# 1. Red - Write test
cat > tests/test_feature.py << 'EOF'
def test_new_behavior():
    result = process(data)
    assert result == expected
EOF

pytest tests/test_feature.py  # Should fail

# 2. Green - Implement
# Use Edit to modify source code
pytest tests/test_feature.py  # Should pass

# 3. Refactor - Clean up
# Use Edit to improve implementation
pytest tests/test_feature.py  # Should still pass
```

### Strategy: Incremental Change

Break large modifications into small, verifiable steps:

**Process:**
1. Identify logical chunks
2. Make one change
3. Verify it works
4. Commit/checkpoint
5. Repeat

**Example:**
```bash
# Large task: Refactor authentication system

# Step 1: Extract validation function
# Edit auth.py - extract validate_credentials()
pytest tests/test_auth.py

# Step 2: Add error handling
# Edit auth.py - add try/except
pytest tests/test_auth.py

# Step 3: Refactor session creation
# Edit auth.py - improve create_session()
pytest tests/test_auth.py

# Each step verified before proceeding
```

### Strategy: Parallel Path

Create new implementation alongside old one:

**Process:**
1. Create new implementation (different name)
2. Add feature flag to switch between old/new
3. Test new implementation
4. Gradually migrate
5. Remove old implementation

**Application:**
```python
# 1. Create new implementation
def process_data_v2(data):
    # New improved logic
    pass

# 2. Add feature flag
def process_data(data):
    if USE_NEW_PROCESSOR:
        return process_data_v2(data)
    return process_data_v1(data)

# 3. Test both paths
# 4. Migrate callers
# 5. Remove v1 when safe
```

### Strategy: Strangler Fig

Gradually replace old system with new one:

**Steps:**
1. Create abstraction layer
2. Route traffic through it
3. Implement new version behind abstraction
4. Gradually switch traffic to new version
5. Remove old version when fully migrated

---

## Safety Protocols

### Protocol: Pre-Modification Checks

Always verify before making changes:

```bash
#!/bin/bash
# Pre-modification safety checklist

file="$1"

echo "=== Pre-Modification Checks ==="

# Check 1: File exists (for Edit operations)
if [ ! -f "$file" ]; then
  echo "❌ File does not exist: $file"
  exit 1
fi

# Check 2: File is readable
if [ ! -r "$file" ]; then
  echo "❌ File not readable: $file"
  exit 1
fi

# Check 3: File is writable
if [ ! -w "$file" ]; then
  echo "❌ File not writable: $file"
  exit 1
fi

# Check 4: File is text (not binary)
if ! file "$file" | grep -q "text"; then
  echo "⚠️  Warning: File may be binary"
fi

# Check 5: Tests exist
test_file="tests/test_$(basename ${file%.py}).py"
if [ ! -f "$test_file" ]; then
  echo "⚠️  Warning: No test file found at $test_file"
fi

echo "✓ Pre-modification checks passed"
```

### Protocol: Post-Modification Verification

Always verify after making changes:

```bash
#!/bin/bash
# Post-modification verification

file="$1"
ext="${file##*.}"

echo "=== Post-Modification Verification ==="

# Step 1: Syntax check
case $ext in
  py)
    python -m py_compile "$file" && echo "✓ Syntax valid"
    ;;
  js)
    node --check "$file" && echo "✓ Syntax valid"
    ;;
  go)
    go build "$file" && echo "✓ Syntax valid"
    ;;
esac

# Step 2: Run tests
echo "Running tests..."
case $ext in
  py)
    pytest "tests/test_$(basename ${file%.py}).py" -v
    ;;
  js)
    npm test -- "$(basename ${file%.js}).test.js"
    ;;
esac

# Step 3: Check for common issues
echo "Checking for common issues..."
grep -n "TODO\|FIXME\|XXX" "$file" && echo "⚠️  Has TODO comments"
grep -n "console.log\|print(" "$file" && echo "⚠️  Has debug statements"

echo "✓ Verification complete"
```

### Protocol: Rollback Plan

Always have a way to undo changes:

**Git-based rollback:**
```bash
# Before modification: Note current state
git rev-parse HEAD > /tmp/rollback-point

# After modification: If something breaks
git reset --hard $(cat /tmp/rollback-point)
```

**File-based rollback:**
```bash
# Before modification: Backup
cp file.py file.py.backup

# After modification: If something breaks
mv file.py.backup file.py
```

---

## Testing Approaches

### Approach: Test First, Then Modify

```bash
# 1. Understand current behavior
pytest tests/test_module.py -v

# 2. Write test for new behavior
cat >> tests/test_module.py << 'EOF'
def test_new_feature():
    result = new_feature(input)
    assert result == expected
EOF

# 3. Verify test fails (RED)
pytest tests/test_module.py::test_new_feature

# 4. Implement feature
# Use Edit to add code

# 5. Verify test passes (GREEN)
pytest tests/test_module.py::test_new_feature

# 6. Verify all tests still pass
pytest tests/test_module.py -v
```

### Approach: Golden Master Testing

For refactoring without existing tests:

```bash
# 1. Capture current output (golden master)
python module.py > golden_output.txt

# 2. Make refactoring changes
# Use Edit to refactor code

# 3. Compare new output to golden master
python module.py > new_output.txt
diff golden_output.txt new_output.txt

# If diff is empty: refactoring preserved behavior ✓
```

### Approach: Characterization Testing

Document existing behavior through tests:

```python
# 1. Run code with various inputs and record outputs
def test_characterize_existing_behavior():
    # These tests document how code currently works
    assert process([1,2,3]) == 6
    assert process([]) == 0
    assert process([-1,1]) == 0

# 2. Now safe to refactor - tests will catch changes
```

### Approach: Mutation Testing

Verify tests catch bugs:

```bash
# Make intentional bugs to verify tests catch them
# Edit code: change + to -
pytest  # Should fail

# Edit code: remove validation
pytest  # Should fail

# If tests don't fail: tests are weak
```

---

## Change Management

### Technique: Change Isolation

Keep changes focused and isolated:

**Guidelines:**
- One logical change per modification
- Don't mix refactoring with feature addition
- Don't fix unrelated bugs in same change
- Don't reformat code while changing logic

**Example:**
```bash
# BAD: Mixed changes
Edit(file.py,
  old="entire file",
  new="new feature + refactoring + bug fix + formatting")

# GOOD: Isolated changes
# Change 1: Add feature
Edit(file.py, old="function", new="function with feature")
# Verify
pytest

# Change 2: Fix bug (separate)
Edit(file.py, old="buggy code", new="fixed code")
# Verify
pytest
```

### Technique: Progressive Enhancement

Add functionality without breaking existing:

```python
# 1. Add new optional parameter (default maintains old behavior)
def process(data, new_option=False):
    if new_option:
        return new_implementation(data)
    return old_implementation(data)

# 2. Gradually migrate callers to use new option
# 3. When all migrated, make new option the default
# 4. Eventually remove old implementation
```

### Technique: Feature Flags

Control changes with runtime flags:

```python
# config.py
ENABLE_NEW_FEATURE = False

# module.py
if ENABLE_NEW_FEATURE:
    result = new_feature(data)
else:
    result = old_feature(data)

# Can enable/disable without code changes
# Can do gradual rollout
# Can instant rollback if issues
```

### Technique: API Versioning

Maintain compatibility during changes:

```python
# v1 API - keep unchanged
def api_v1(data):
    return old_implementation(data)

# v2 API - new implementation
def api_v2(data):
    return new_implementation(data)

# Route based on version
def api(data, version=1):
    if version == 2:
        return api_v2(data)
    return api_v1(data)
```

---

## Summary

This methodology provides:
- **Modification strategies** for safe, incremental changes
- **Safety protocols** for preventing and recovering from errors
- **Testing approaches** for verifying changes work correctly
- **Change management** techniques for maintaining stability

Apply these based on change complexity and risk level.
