---
name: write
description: Activates for code/file modification operations; provides guidance on Edit vs Write tool selection, safety checks, and verification
---

# Write Skill

## Purpose

This skill provides comprehensive guidance for code and file modification operations. It helps you choose between Edit and Write tools, implement safety checks, verify changes, and follow best practices for making reliable, maintainable code modifications.

## When to Use This Skill

This skill automatically activates when:
- Creating new files or modifying existing ones
- Refactoring code or fixing bugs
- Making configuration changes
- Implementing new features
- Updating documentation

## Quick Start

For 80% of modification operations, follow these principles:

1. **Read before writing** - Always read the file first to understand context
2. **Edit over Write** - Prefer Edit for existing files, Write only for new files
3. **Small, focused changes** - Make one logical change at a time
4. **Verify immediately** - Check that changes work after each modification
5. **Test your changes** - Run tests or manual verification before considering complete

## Core Principles

### 1. **Context Preservation**
Understand the existing code before modifying. Read the file, understand its purpose, then make targeted changes.

### 2. **Minimal Impact**
Change only what's necessary. Avoid reformatting, refactoring, or "improving" unrelated code.

### 3. **Safety First**
Use Edit tool for existing files (prevents accidental overwrites). Use Write only for new files.

### 4. **Immediate Verification**
Verify changes work right after making them, not at the end of a long series of modifications.

### 5. **Reversibility**
Make changes that can be easily undone. Avoid destructive operations without backups.

## Tool Selection: Edit vs Write

### Use Edit Tool When:
- ✅ Modifying existing files
- ✅ Making targeted changes to specific sections
- ✅ Updating configuration or code
- ✅ Fixing bugs in existing code
- ✅ Refactoring existing functionality

### Use Write Tool When:
- ✅ Creating brand new files
- ✅ File doesn't exist yet
- ✅ Generating boilerplate/scaffolding
- ✅ Creating new components from scratch

### Never:
- ❌ Use Write on existing files (risk of data loss)
- ❌ Use Edit without reading file first
- ❌ Make multiple unrelated changes in one Edit

## Safe Modification Workflow

### Step 1: Read and Understand

```bash
# Check if file exists
ls -l path/to/file

# Read file contents
cat path/to/file

# Understand structure
grep -n "^class \|^def \|^function " path/to/file
```

### Step 2: Plan Change

Ask yourself:
- What exactly needs to change?
- What's the minimal change required?
- What could break if I change this?
- How will I verify the change works?

### Step 3: Make Change

```bash
# For existing files: Use Edit
# - Specify exact old_string to replace
# - Provide exact new_string replacement
# - Preserve indentation and formatting

# For new files: Use Write
# - Create complete, well-formed file
# - Follow project conventions
# - Include necessary imports/headers
```

### Step 4: Verify Change

```bash
# Read back to confirm
cat path/to/file | grep -A 5 "changed_section"

# Run syntax check
python -m py_compile file.py  # Python
node --check file.js  # JavaScript
go build file.go  # Go

# Run tests
pytest tests/test_file.py
npm test
```

## Common Modification Patterns

### Pattern 1: Adding a New Function

```python
# 1. Read existing file
cat module.py

# 2. Identify insertion point (end of file, or after related function)

# 3. Use Edit to add function
# old_string: existing content at insertion point
# new_string: existing content + new function

# 4. Verify
python -m py_compile module.py
```

### Pattern 2: Modifying Existing Function

```python
# 1. Read file and locate function
cat -n module.py | grep -A 20 "def target_function"

# 2. Use Edit with exact old function text
# old_string: entire old function
# new_string: entire modified function

# 3. Verify syntax and logic
python -m py_compile module.py
pytest tests/test_module.py
```

### Pattern 3: Updating Configuration

```yaml
# 1. Read current config
cat config.yaml

# 2. Use Edit for specific key change
# old_string: old key-value pair
# new_string: new key-value pair

# 3. Validate config format
yq eval '.' config.yaml  # Check YAML is valid
```

### Pattern 4: Refactoring

```python
# 1. Ensure tests exist first
cat tests/test_module.py

# 2. Run tests (establish baseline)
pytest tests/test_module.py

# 3. Make refactoring change with Edit

# 4. Run tests again (verify behavior unchanged)
pytest tests/test_module.py

# 5. If tests fail, fix or revert
```

### Pattern 5: Creating New File

```python
# 1. Verify file doesn't exist
ls path/to/new_file.py

# 2. Use Write to create complete file
# - Include all necessary imports
# - Follow project structure conventions
# - Add docstrings/comments

# 3. Verify new file
python -m py_compile path/to/new_file.py
```

## Safety Checks

### Before Modification

```bash
# Check file exists (for Edit operations)
test -f file.py && echo "File exists" || echo "File not found"

# Check file is not binary
file file.py | grep -q text && echo "Text file" || echo "Binary file"

# Check file permissions
ls -l file.py

# Backup critical files (optional)
cp important.py important.py.backup
```

### During Modification

- **Preserve exact indentation** (tabs vs spaces)
- **Match existing formatting** (don't reformat)
- **Keep line endings consistent** (LF vs CRLF)
- **Maintain imports organization** (don't reorder unnecessarily)

### After Modification

```bash
# Syntax check
python -m py_compile file.py
node --check file.js

# Lint check (optional)
pylint file.py
eslint file.js

# Run affected tests
pytest tests/test_file.py -v

# Check diff (if using git)
git diff file.py
```

## Verification Strategies

### Level 1: Syntax Verification

```bash
# Python
python -m py_compile file.py

# JavaScript
node --check file.js

# TypeScript
tsc --noEmit file.ts

# Go
go build file.go

# Ruby
ruby -c file.rb
```

### Level 2: Unit Tests

```bash
# Run specific test file
pytest tests/test_module.py
npm test -- tests/module.test.js

# Run with coverage
pytest --cov=module tests/test_module.py
```

### Level 3: Integration Tests

```bash
# Run integration test suite
pytest tests/integration/
npm run test:integration
```

### Level 4: Manual Verification

```bash
# Run application
python app.py

# Test specific endpoint
curl http://localhost:8000/api/test

# Check logs
tail -f application.log
```

## Edge Cases

### Large Files
- Don't use Edit on files > 10,000 lines
- Break into smaller, focused edits
- Verify each edit before next

### Generated Code
- Be cautious editing auto-generated files
- Look for "DO NOT EDIT" warnings
- Modify source/template instead

### Multiple Changes Needed
- Make one logical change per Edit
- Verify each change works
- Don't batch unrelated changes

### Formatting Conflicts
- Preserve existing formatting style
- Don't mix tabs and spaces
- Match existing line endings

## Resources (Progressive Disclosure)

For deeper guidance, load these resources as needed:

- **`resources/methodology.md`** - When you need advanced modification strategies, refactoring techniques, safety protocols, or testing approaches
- **`resources/patterns.md`** - When you need concrete examples of modification patterns, language-specific templates, or common scenarios
- **`resources/troubleshooting.md`** - When encountering merge conflicts, breaking changes, test failures, or rollback needs

## Anti-Patterns

### ❌ Writing Without Reading
```bash
# BAD: Modify without understanding context
Write(file.py, new_content)

# GOOD: Read first, then modify
Read(file.py)
# Understand structure
Edit(file.py, old_string, new_string)
```

### ❌ Using Write on Existing Files
```bash
# BAD: Overwrites entire file
Write(existing.py, content)

# GOOD: Targeted edit
Edit(existing.py, old_section, new_section)
```

### ❌ No Verification
```bash
# BAD: Make change and move on
Edit(file.py, old, new)
# Next task...

# GOOD: Verify immediately
Edit(file.py, old, new)
python -m py_compile file.py
pytest tests/test_file.py
```

### ❌ Batching Unrelated Changes
```bash
# BAD: Change multiple things at once
Edit(file.py,
  old="entire file",
  new="entire file with 5 different changes")

# GOOD: One logical change at a time
Edit(file.py, old="function A", new="improved function A")
# Verify
Edit(file.py, old="function B", new="improved function B")
# Verify
```

## Quick Reference

### Decision Tree: Edit or Write?

```
Need to modify code?
  ├─ File exists?
  │   ├─ Yes → Use Edit
  │   └─ No → Use Write
  ├─ Making targeted change?
  │   └─ Yes → Use Edit
  └─ Creating from scratch?
      └─ Yes → Use Write
```

### Modification Checklist

```
Before:
  ☐ Read file (if exists)
  ☐ Understand context
  ☐ Plan minimal change
  ☐ Consider what could break

During:
  ☐ Use Edit for existing, Write for new
  ☐ Preserve formatting
  ☐ Make focused change
  ☐ Keep change reversible

After:
  ☐ Syntax check
  ☐ Run tests
  ☐ Verify behavior
  ☐ Check for side effects
```

### Quick Commands

```bash
# Read before editing
cat file.py

# Syntax check after edit
python -m py_compile file.py

# Run tests
pytest tests/test_file.py

# Check changes
git diff file.py

# Verify file structure
grep -n "^class \|^def " file.py
```
