---
name: read
description: Activates for deep reading tasks; provides methodology for pattern recognition, code comprehension, and systematic reading
---

# Read Skill

## Purpose

This skill provides comprehensive guidance for deep reading of files, codebases, and systems. It helps you recognize patterns, comprehend complex code structures, analyze system architecture, and synthesize understanding from multiple sources.

## When to Use This Skill

This skill automatically activates when:

- Reading files to understand how it works
- Investigating system architecture or design patterns
- Comprehending complex algorithms or data flows
- Researching how components interact
- Evaluating code quality or identifying issues

## Quick Start

For 80% of analysis operations, follow these principles:

1. **Start broad, then narrow** - Understand overall structure before diving into details
2. **Follow the data** - Trace how data flows through the system
3. **Identify patterns** - Recognize common structures and idioms
4. **Build mental model** - Create a conceptual understanding, not just line-by-line reading
5. **Document as you go** - Capture insights to preserve understanding

## Core Principles

### 1. **Layered Analysis**

Start with high-level structure, progressively zoom into details. Understand architecture before algorithms.

### 2. **Pattern Recognition**

Identify recurring structures, design patterns, and code idioms to accelerate comprehension.

### 3. **Contextual Understanding**

Code doesn't exist in isolation. Understand purpose, constraints, and surrounding ecosystem.

### 4. **Evidence-Based Conclusions**

Base analysis on actual code, not assumptions. Verify hypotheses with concrete examples.

### 5. **Systematic Approach**

Use consistent methodology to avoid missing important details or jumping to conclusions.

## Analysis Methodology

### Phase 1: Overview (Structure)

**Goal:** Understand what exists and how it's organized.

```bash
# Directory structure
tree -L 3 -d

# File inventory
find . -type f -name "*.py" | head -20

# Entry points
find . -name "main.*" -o -name "index.*" -o -name "__init__.*"

# Configuration files
find . -maxdepth 2 -name "*.json" -o -name "*.yaml"
```

### Phase 2: Architecture (Relationships)

**Goal:** Understand how components connect and interact.

```bash
# Import/dependency analysis
grep -r "^import\|^from" --include="*.py" | head -30

# Module boundaries
find . -name "__init__.py" -o -name "index.js"

# External dependencies
cat package.json requirements.txt Gemfile | grep -v "^#"
```

### Phase 3: Functionality (What It Does)

**Goal:** Understand core capabilities and behaviors.

```bash
# Key functions/classes
grep -rn "^def \|^class \|^function " --include="*.py" | head -50

# Public API
grep -rn "^export\|^public" --include="*.js" | head -30

# Routes/endpoints (if web app)
grep -rn "@app.route\|@router\|app.get\|app.post" --include="*.py"
```

### Phase 4: Details (How It Works)

**Goal:** Understand implementation specifics and algorithms.

```bash
# Read specific implementation
cat -n src/core/processor.py

# Analyze complex function
sed -n '/def complex_algorithm/,/^def /p' module.py | head -n -1
```

## Pattern Recognition Guide

### Design Patterns to Look For

| Pattern   | Indicators                          | What It Means               |
| --------- | ----------------------------------- | --------------------------- |
| MVC       | Separate model/view/controller dirs | Separation of concerns      |
| Factory   | `create_*`, `make_*` functions      | Object creation abstraction |
| Singleton | `instance`, `getInstance`           | Single shared instance      |
| Observer  | `subscribe`, `notify`, `listener`   | Event-driven architecture   |
| Strategy  | Multiple implementations, interface | Swappable algorithms        |
| Decorator | `@decorator`, wrapper functions     | Behavior extension          |

### Code Idioms by Language

**Python:**

```python
# List comprehension → Data transformation
[x*2 for x in items if x > 0]

# Context manager → Resource management
with open(file) as f:

# Decorators → Cross-cutting concerns
@property, @staticmethod
```

**JavaScript:**

```javascript
# Arrow functions → Functional style
items.map(x => x * 2)

# Promises/async → Async operations
async/await, .then()

# Destructuring → Clean parameter handling
const {id, name} = user
```

### Architectural Patterns

```bash
# Layered architecture
src/
  controllers/  # Request handling
  services/     # Business logic
  models/       # Data layer
  utils/        # Shared utilities

# Microservices
services/
  user-service/
  auth-service/
  payment-service/

# Feature-based
features/
  authentication/
  dashboard/
  reports/
```

## Analysis Strategies

### Strategy 1: Top-Down (Architecture First)

Start from entry point, follow execution flow:

```bash
# 1. Find entry point
find . -name "main.py" -o -name "app.js" -o -name "index.js"

# 2. Read entry point
cat src/main.py

# 3. Follow imports
grep "^import\|^from" src/main.py

# 4. Read each imported module
cat src/config.py
cat src/router.py

# 5. Continue recursively
```

### Strategy 2: Bottom-Up (Components First)

Start with individual components, build up understanding:

```bash
# 1. List all modules
find src -name "*.py"

# 2. Read each module
for file in src/*.py; do
  echo "=== $file ==="
  cat -n "$file"
done

# 3. Identify dependencies
# 4. Build mental map of relationships
```

### Strategy 3: Data Flow Tracing

Follow data through the system:

```bash
# 1. Identify data entry points (API, file input, etc.)
grep -rn "request\|input\|read" --include="*.py"

# 2. Trace transformations
grep -rn "process\|transform\|convert" --include="*.py"

# 3. Find outputs
grep -rn "write\|send\|return" --include="*.py"
```

### Strategy 4: Feature-Based Analysis

Analyze by feature or use case:

```bash
# 1. Identify feature
feature="user authentication"

# 2. Find related files
grep -rl "auth\|login\|user" src/

# 3. Read feature implementation
cat src/auth/login.py
cat src/auth/middleware.py

# 4. Understand feature flow
```

## Comprehension Techniques

### Technique 1: Reading with Questions

Ask and answer questions while reading:

- **What** does this code do?
- **Why** is it structured this way?
- **How** does it handle errors?
- **When** is this code executed?
- **Where** does the data come from/go to?

### Technique 2: Mental Execution

Trace code execution mentally:

```python
# Given this code
def process(items):
    filtered = [x for x in items if x > 0]
    doubled = [x * 2 for x in filtered]
    return sum(doubled)

# Mental trace with items = [-1, 2, 3]
# filtered = [2, 3]
# doubled = [4, 6]
# return = 10
```

### Technique 3: Annotation

Add comments while reading to capture understanding:

```python
# Original code
def handle_request(request):
    data = request.json
    validated = validate(data)
    result = process(validated)
    return jsonify(result)

# With annotations
def handle_request(request):
    # Extract JSON payload from HTTP request
    data = request.json

    # Validate schema and business rules
    validated = validate(data)

    # Core processing logic
    result = process(validated)

    # Convert to JSON response
    return jsonify(result)
```

### Technique 4: Diagramming

Create visual representations:

```
Request Flow:
  Client
    ↓
  Router (/api/users)
    ↓
  Controller (UserController.create)
    ↓
  Service (UserService.validateAndCreate)
    ↓
  Model (User.save)
    ↓
  Database
```

## Edge Cases

### Complex Nested Structures

- Break down into smaller parts
- Analyze innermost structures first
- Build understanding layer by layer

### Unclear Variable Names

- Trace usage to understand purpose
- Look at type hints or comments
- Check tests for examples

### Missing Documentation

- Read tests as documentation
- Analyze function signatures
- Look for usage examples

### Legacy or Unfamiliar Patterns

- Research pattern names found in code
- Compare with modern equivalents
- Focus on intent, not just syntax

## Resources (Progressive Disclosure)

For deeper guidance, load these resources as needed:

- **`resources/methodology.md`** - When you need deep analysis techniques, comprehension frameworks, synthesis strategies, or systematic investigation approaches
- **`resources/patterns.md`** - When you need concrete examples of analysis workflows, language-specific patterns, architecture templates, or pattern catalogs
- **`resources/troubleshooting.md`** - When encountering complex code, unclear logic, conflicting information, or comprehension challenges

## Anti-Patterns

### ❌ Line-by-Line Reading Without Context

```bash
# BAD: Reading every line sequentially
cat huge-file.py | less

# GOOD: Start with structure
grep -n "^class \|^def " huge-file.py  # Overview
cat -n huge-file.py  # Then details
```

### ❌ Assuming Without Verifying

```bash
# BAD: "This probably uses Redis"
echo "Uses Redis"

# GOOD: Check actual dependencies
grep -r "redis\|Redis" .
cat requirements.txt | grep redis
```

### ❌ Analysis Paralysis

```bash
# BAD: Reading every file before understanding anything
for file in src/*.py; do cat "$file"; done

# GOOD: Progressive analysis
tree src/  # Structure first
cat src/main.py  # Entry point
# Then follow imports as needed
```

### ❌ Ignoring Tests

```bash
# BAD: Only reading source code
cat src/module.py

# GOOD: Read tests for usage examples
cat tests/test_module.py  # How it's used
cat src/module.py  # How it's implemented
```

## Quick Reference

### Analysis Workflow

```
1. Structure → What exists?
   ↓ tree, find, ls
2. Architecture → How is it organized?
   ↓ grep imports, find modules
3. Functionality → What does it do?
   ↓ grep functions/classes
4. Details → How does it work?
   ↓ cat specific files
5. Synthesis → Document understanding
   ↓ Notes, diagrams, summaries
```

### Quick Commands

```bash
# Project overview
tree -L 2 && find . -name "*.py" | wc -l

# Find entry points
find . -name "main.*" -o -name "__main__.*" -o -name "app.*"

# List all functions/classes
grep -rn "^def \|^class \|^function " --include="*.py"

# Dependency analysis
grep -r "^import\|^from\|^require" --include="*.py" | sort -u

# Find specific pattern
grep -rn "pattern_name" --include="*.py"

# Read with context
grep -C 10 "function_name" file.py
```

### Decision Tree

```
Need to analyze code?
  ├─ Never seen before?
  │   └─ Top-down: Start with entry point
  ├─ Looking for specific feature?
  │   └─ Feature-based: Search + trace
  ├─ Understanding architecture?
  │   └─ Bottom-up: Components + relationships
  └─ Debugging or investigating?
      └─ Data flow: Trace inputs to outputs
```
