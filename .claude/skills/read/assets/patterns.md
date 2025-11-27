# Read Skill: Patterns

Concrete examples of analysis workflows, language-specific comprehension patterns, architecture templates, and pattern catalogs for code analysis.

---

## Table of Contents

1. [Analysis Workflow Patterns](#analysis-workflow-patterns)
2. [Language-Specific Patterns](#language-specific-patterns)
3. [Architecture Reading Patterns](#architecture-reading-patterns)
4. [Pattern Catalogs](#pattern-catalogs)

---

## Analysis Workflow Patterns

### Pattern: New Project Analysis

First-time analysis of unfamiliar codebase:

```bash
#!/bin/bash
# Complete project analysis workflow

echo "=== 1. Project Overview ==="
ls -la
cat README.md 2>/dev/null || echo "No README"

echo ""
echo "=== 2. Technology Stack ==="
cat package.json requirements.txt Gemfile pom.xml 2>/dev/null | head -30

echo ""
echo "=== 3. Directory Structure ==="
tree -L 2 -I "node_modules|__pycache__|.git"

echo ""
echo "=== 4. Entry Points ==="
find . -name "main.*" -o -name "app.*" -o -name "index.*" -o -name "__main__.py" | head -10

echo ""
echo "=== 5. File Count by Type ==="
for ext in js ts py rb go java; do
  count=$(find . -name "*.$ext" ! -path "*/node_modules/*" | wc -l)
  [ $count -gt 0 ] && echo "$ext: $count files"
done

echo ""
echo "=== 6. Configuration Files ==="
find . -maxdepth 2 -name "*.json" -o -name "*.yaml" -o -name "*.toml"

echo ""
echo "=== 7. Test Structure ==="
find . -name "*test*" -type d | head -10
```

### Pattern: Feature Investigation

Understanding a specific feature:

```bash
#!/bin/bash
# Feature-focused analysis

feature="authentication"

echo "=== Files related to: $feature ==="
grep -rl "$feature" src/ | head -20

echo ""
echo "=== Functions/Classes in feature ==="
for file in $(grep -rl "$feature" src/ | head -10); do
  echo "--- $file ---"
  grep -n "def \|class \|function " "$file"
done

echo ""
echo "=== Feature entry points ==="
grep -rn "route.*$feature\|@.*$feature" src/
```

### Pattern: Bug Investigation

Analyzing code to understand a bug:

```bash
#!/bin/bash
# Bug investigation workflow

bug_symptom="NullPointerException"
affected_module="user_service"

echo "=== 1. Find error occurrences ==="
grep -rn "$bug_symptom" logs/

echo ""
echo "=== 2. Locate relevant code ==="
find . -name "*$affected_module*"

echo ""
echo "=== 3. Analyze affected code ==="
cat src/services/user_service.py

echo ""
echo "=== 4. Check for null handling ==="
grep -n "if.*None\|null\|undefined" src/services/user_service.py

echo ""
echo "=== 5. Review tests ==="
cat tests/test_user_service.py
```

---

## Language-Specific Patterns

### Python Analysis Patterns

```bash
#!/bin/bash
# Python codebase analysis

echo "=== Module Structure ==="
find . -name "__init__.py"

echo ""
echo "=== Class Definitions ==="
grep -rn "^class " --include="*.py" | head -20

echo ""
echo "=== Function Definitions ==="
grep -rn "^def " --include="*.py" | head -20

echo ""
echo "=== Decorators Used ==="
grep -rn "^@" --include="*.py" | cut -d: -f2 | sort -u

echo ""
echo "=== Import Patterns ==="
grep -rh "^import\|^from" --include="*.py" | sort -u | head -30

echo ""
echo "=== Async Code ==="
grep -rn "async def\|await " --include="*.py"
```

**Key Patterns to Recognize:**
- `if __name__ == "__main__":` → Entry point
- `@property` → Computed attribute
- `@staticmethod/@classmethod` → Class-level methods
- `__init__.py` → Package marker
- `*args, **kwargs` → Variable arguments

### JavaScript/TypeScript Patterns

```bash
#!/bin/bash
# JavaScript/TypeScript analysis

echo "=== Module Exports ==="
grep -rn "export " --include="*.js" --include="*.ts" | head -20

echo ""
echo "=== Function Definitions ==="
grep -rn "function \|const.*=.*=> \|async " --include="*.js" | head -20

echo ""
echo "=== Class Definitions ==="
grep -rn "^class \|^export class " --include="*.js" --include="*.ts"

echo ""
echo "=== React Components ==="
grep -rn "extends.*Component\|^export.*function.*() {" --include="*.jsx" --include="*.tsx"

echo ""
echo "=== Async Patterns ==="
grep -rn "async \|await \|\.then(\|Promise" --include="*.js"
```

**Key Patterns to Recognize:**
- `export default` → Main export
- `() => {}` → Arrow function
- `async/await` → Async operations
- `require()` vs `import` → Module systems
- `.then().catch()` → Promise chains

### Go Analysis Patterns

```bash
#!/bin/bash
# Go codebase analysis

echo "=== Package Structure ==="
find . -name "*.go" -exec head -1 {} \; | sort -u

echo ""
echo "=== Function Definitions ==="
grep -rn "^func " --include="*.go" | head -30

echo ""
echo "=== Interface Definitions ==="
grep -rn "^type.*interface" --include="*.go"

echo ""
echo "=== Struct Definitions ==="
grep -rn "^type.*struct" --include="*.go"

echo ""
echo "=== Error Handling ==="
grep -rn "if err != nil" --include="*.go" | wc -l
```

**Key Patterns to Recognize:**
- `package main` + `func main()` → Entry point
- `type X interface{}` → Interface definition
- `if err != nil` → Error handling
- `defer` → Cleanup/finalization
- `go funcname()` → Goroutine

---

## Architecture Reading Patterns

### Pattern: Layered Architecture

```bash
#!/bin/bash
# Analyze layered architecture

echo "=== Layer: Presentation (Controllers/Routes) ==="
find . -name "*controller*" -o -name "*route*" | head -10
cat src/controllers/user_controller.py | head -50

echo ""
echo "=== Layer: Business Logic (Services) ==="
find . -name "*service*" | head -10
cat src/services/user_service.py | head -50

echo ""
echo "=== Layer: Data Access (Repositories/Models) ==="
find . -name "*repository*" -o -name "*model*" | head -10
cat src/models/user.py | head -50

echo ""
echo "=== Layer Dependencies ==="
for layer in controllers services models; do
  echo "--- $layer imports ---"
  grep -rh "^import\|^from" src/$layer/ | sort -u | head -10
done
```

### Pattern: Microservices Architecture

```bash
#!/bin/bash
# Analyze microservices architecture

echo "=== Services List ==="
ls -d services/*/ 2>/dev/null || ls -d src/services/*/

echo ""
echo "=== Service Dependencies ==="
for service in services/*/; do
  echo "--- $(basename $service) ---"
  cat "$service/package.json" 2>/dev/null | grep -A 10 "dependencies"
done

echo ""
echo "=== Inter-Service Communication ==="
grep -rn "http.*://\|grpc\|message\|event" services/*/src/

echo ""
echo "=== Service Entry Points ==="
find services/ -name "main.*" -o -name "server.*"
```

### Pattern: Plugin Architecture

```bash
#!/bin/bash
# Analyze plugin architecture

echo "=== Core System ==="
find src/core -type f | head -20

echo ""
echo "=== Plugin Interface ==="
grep -rn "interface.*Plugin\|class.*Plugin" src/

echo ""
echo "=== Installed Plugins ==="
ls -d plugins/*/ 2>/dev/null || ls -d src/plugins/*/

echo ""
echo "=== Plugin Registration ==="
grep -rn "register.*plugin\|load.*plugin" src/
```

---

## Pattern Catalogs

### Common Code Smells to Spot

```bash
# Long functions (>50 lines)
for file in src/*.py; do
  awk '/^def /{start=NR} /^def |^class |^$/{if(start && NR-start>50) print FILENAME":"start":"$0; start=0}' "$file"
done

# Deep nesting (>3 levels)
grep -rn "        if\|        for\|        while" --include="*.py"

# Duplicated code
# (Manual review needed - look for similar function names)
grep -rn "^def " --include="*.py" | cut -d: -f2 | sort | uniq -d

# Magic numbers
grep -rn "[^a-zA-Z_][0-9][0-9][0-9]" --include="*.py" | head -20

# TODO/FIXME comments
grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.py"
```

### Common Design Patterns

| Pattern | Indicators | Example |
|---------|-----------|---------|
| Factory | `create_`, `make_`, `build_` | `UserFactory.create()` |
| Singleton | `instance`, `getInstance` | `Config.getInstance()` |
| Observer | `subscribe`, `notify`, `on_` | `event.subscribe(handler)` |
| Strategy | Multiple classes implementing same interface | `PaymentStrategy` |
| Decorator | Function wrapping, `@decorator` | `@cache`, `@auth_required` |
| Adapter | `adapt`, wrapper classes | `LegacyAdapter` |
| Command | `execute`, `undo` methods | `Command.execute()` |

### Architectural Smells

```bash
# Circular dependencies
# (Requires building dependency graph - complex)

# God objects (classes doing too much)
for file in src/*.py; do
  methods=$(grep -c "^    def " "$file")
  [ $methods -gt 20 ] && echo "$file has $methods methods (God object?)"
done

# Tight coupling (too many imports)
for file in src/*.py; do
  imports=$(grep -c "^import\|^from" "$file")
  [ $imports -gt 15 ] && echo "$file has $imports imports (tight coupling?)"
done

# Missing abstraction (duplicate logic)
# (Manual review needed)
```

---

## Quick Patterns Reference

### First-Time Analysis Checklist

```
☐ Read README/documentation
☐ Check directory structure (tree)
☐ Identify technology stack
☐ Find entry points
☐ Review configuration files
☐ Check test structure
☐ Scan for patterns/idioms
☐ Build mental model
```

### Per-File Analysis

```
☐ Read file purpose (docstring/comments)
☐ List imports/dependencies
☐ Identify exports/public API
☐ Read function signatures
☐ Understand main logic flow
☐ Note edge cases/error handling
☐ Check for tests
```

### Pattern Recognition

```bash
# Spot patterns quickly
grep -rn "class.*Factory\|def create_" .  # Factory
grep -rn "@.*\|decorator" .  # Decorator
grep -rn "subscribe\|observe\|notify" .  # Observer
grep -rn "strategy\|algorithm" .  # Strategy
grep -rn "singleton\|instance" .  # Singleton
```
