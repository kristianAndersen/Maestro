# Read Skill: Troubleshooting

Common analysis challenges, complex code handling, comprehension blocks, and strategies for overcoming understanding difficulties.

---

## Table of Contents

1. [Comprehension Challenges](#comprehension-challenges)
2. [Complex Code Handling](#complex-code-handling)
3. [Missing Information](#missing-information)
4. [Conflicting Information](#conflicting-information)

---

## Comprehension Challenges

### Challenge: Code is Too Complex to Understand

**Symptoms:**
- Lost in details
- Can't see big picture
- Overwhelmed by complexity

**Solutions:**

```bash
# Step back - get overview first
grep -n "^class \|^def \|^function " complex_file.py

# Break into chunks
# Read one function at a time
sed -n '/^def target_func/,/^def /p' complex_file.py | head -n -1

# Create abstraction
# Document what each piece does in simple terms
echo "process_data: validates input, transforms, returns result"
```

**Strategy:**
1. Don't try to understand everything at once
2. Build understanding incrementally
3. Start with function signatures, then implementations
4. Focus on intent before details

---

### Challenge: Unfamiliar Language or Framework

**Symptoms:**
- Don't recognize syntax
- Unclear how framework works
- Missing idioms and conventions

**Solutions:**

```bash
# Identify language/framework
file source_file
head -5 source_file  # Check imports/requires

# Find examples
cat tests/*.py  # Tests show usage
cat examples/*.py  # Example code

# Look for patterns
grep -rn "@\|decorator" .  # Framework-specific decorators
grep -rn "extends\|implements" .  # OOP patterns
```

**Strategy:**
1. Search for "<language> <pattern> tutorial" externally
2. Read tests to see idiomatic usage
3. Focus on what code does, not how (initially)
4. Compare with familiar languages

---

### Challenge: No Comments or Documentation

**Symptoms:**
- Unclear what code does
- No explanation of why
- Mysterious variable names

**Solutions:**

```bash
# Read tests as documentation
cat tests/test_module.py

# Analyze function signatures
grep -n "^def " module.py

# Trace data flow
grep -n "return " module.py  # What does it produce?
# Work backwards to understand inputs

# Check git history
git log --oneline module.py
git show <commit-hash>  # See why changes were made
```

**Strategy:**
1. Tests are executable documentation
2. Function names and signatures reveal intent
3. Git history shows evolution and reasoning
4. Run code with example inputs

---

### Challenge: Spaghetti Code (No Clear Structure)

**Symptoms:**
- No obvious organization
- Everything calls everything
- Can't find entry points

**Solutions:**

```bash
# Find most-called functions
grep -roh "function_name()" . | sort | uniq -c | sort -rn

# Trace from known entry points
# (HTTP routes, main(), command handlers)
grep -rn "@app.route\|def main\|if __name__" .

# Build call graph
# (Manual or use tools)
# Document: "A calls B, B calls C"

# Identify clusters
# Group related functions mentally
```

**Strategy:**
1. Find and start from entry points
2. Map call relationships
3. Identify functional clusters
4. Refactor mentally (create your own structure)

---

## Complex Code Handling

### Handling: Deeply Nested Logic

**Example:**
```python
def complex_nested(data):
    if data:
        if data.valid:
            if data.user:
                if data.user.active:
                    if data.user.permissions:
                        # Deeply nested logic
                        return process(data)
    return None
```

**Analysis Technique:**

```bash
# Flatten mentally
# Rewrite logic in head as guard clauses:
# if not data: return None
# if not data.valid: return None
# if not data.user: return None
# if not data.user.active: return None
# if not data.user.permissions: return None
# return process(data)
```

**Strategy:**
- Work from outside in
- Understand each condition separately
- Mentally flatten to sequential checks
- Identify happy path vs error paths

---

### Handling: Long Functions (>100 lines)

**Approach:**

```bash
# 1. Get overview
grep -n "^def long_function" file.py
wc -l file.py  # Check length

# 2. Identify sections
grep -n "# " file.py  # Find comment markers

# 3. Break mentally into phases
# Phase 1: Lines 1-30 (validation)
# Phase 2: Lines 31-60 (processing)
# Phase 3: Lines 61-90 (output formatting)

# 4. Understand each phase separately
sed -n '1,30p' file.py  # Read phase 1
sed -n '31,60p' file.py  # Read phase 2
# etc.
```

---

### Handling: Metaprogramming or Dynamic Code

**Examples:**
- `eval()`, `exec()`
- Dynamic imports
- Reflection/introspection
- Code generation

**Analysis Technique:**

```bash
# Find dynamic behavior
grep -rn "eval\|exec\|getattr\|setattr" .

# Check what's being generated/called
# Read carefully - add print statements if needed

# Look for patterns
# Often dynamic code follows templates
```

**Strategy:**
- Understand template/pattern first
- Trace with concrete example
- Don't get lost in mechanics
- Focus on end result

---

### Handling: Callback Hell or Complex Async

**Example:**
```javascript
api.get(url, (err, data) => {
  process(data, (err, result) => {
    save(result, (err, saved) => {
      notify(saved, (err, done) => {
        // Deeply nested callbacks
      });
    });
  });
});
```

**Analysis Technique:**

```bash
# Linearize flow mentally:
# 1. GET from API
# 2. Process response
# 3. Save processed data
# 4. Notify about saved data

# Or draw timeline
# T1: API call
# T2: Process
# T3: Save
# T4: Notify
```

---

## Missing Information

### Missing: Where is This Called From?

**Solutions:**

```bash
# Search for function calls
grep -rn "function_name(" .

# Check imports
grep -rn "import.*module_name\|from.*module_name" .

# Look in tests
grep -rn "function_name" tests/
```

---

### Missing: What Does This Variable Contain?

**Solutions:**

```bash
# Trace variable origin
grep -n "variable_name =" file.py

# Check type hints (if present)
grep -n "variable_name:" file.py

# Look at usage context
grep -C 3 "variable_name" file.py

# Check function parameters
grep -n "def.*variable_name" file.py
```

---

### Missing: Why Does This Code Exist?

**Solutions:**

```bash
# Check git history
git log --follow -p -- file.py | less
git blame file.py  # See who wrote what

# Look for related issues/tickets
grep -r "TICKET-123\|Issue #" .

# Search for comments
grep -C 5 "# " file.py
```

---

### Missing: What's the Expected Input/Output?

**Solutions:**

```bash
# Read tests
cat tests/test_function.py

# Check docstrings
grep -A 10 "def function_name" file.py

# Look for usage examples
grep -rn "function_name(" . | head -10

# Check type hints
# Python: def func(x: int) -> str:
# TypeScript: function func(x: number): string
```

---

## Conflicting Information

### Conflict: Code vs Comments Disagree

**Resolution:**
- Trust code over comments
- Comments may be outdated
- Verify by tracing execution

```bash
# Check git history
git log -p file.py | grep -C 5 "comment text"

# See when comment was written vs code changed
git blame -L 10,15 file.py
```

---

### Conflict: Multiple Implementations

**Example:**
Two functions that seem to do the same thing.

**Analysis:**

```bash
# Compare implementations
diff -u function1.py function2.py

# Check which is used
grep -rn "function1\|function2" . | wc -l

# Look for deprecation
grep -rn "@deprecated\|# deprecated" .

# Check git history
git log --grep="deprecat"
```

---

### Conflict: Documentation vs Actual Behavior

**Resolution:**

```bash
# Run tests
pytest tests/test_module.py -v

# Add your own test
echo "Test with actual input, see actual output"

# Check recent changes
git log -p --since="1 month ago" -- file.py

# Trust actual behavior, update mental model
```

---

## Quick Troubleshooting Guide

```
Can't understand code?
  ☐ Step back - get overview first
  ☐ Break into smaller chunks
  ☐ Focus on what, not how (initially)
  ☐ Read tests for examples

Too complex?
  ☐ Identify entry points
  ☐ Trace one path at a time
  ☐ Build mental map incrementally
  ☐ Document understanding as you go

Missing information?
  ☐ Search codebase (grep)
  ☐ Read tests
  ☐ Check git history
  ☐ Look for usage examples

Conflicting information?
  ☐ Trust code over comments
  ☐ Trust tests over documentation
  ☐ Trust recent code over old
  ☐ Verify by running/testing
```

---

## Strategies for Different Scenarios

### When Stuck: Ask Questions

- What problem is this solving?
- What would happen if this didn't exist?
- What's the simplest case this handles?
- What's the most complex case?

### When Overwhelmed: Reduce Scope

- Focus on one function
- Ignore edge cases initially
- Understand happy path first
- Add complexity incrementally

### When Confused: Compare and Contrast

- Compare with similar code
- Compare old vs new versions
- Compare with familiar patterns
- Contrast expected vs actual

### When Uncertain: Verify

- Run the code
- Add print/log statements
- Write a test
- Check with debugger
