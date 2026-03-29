# Read Skill: Methodology

Deep analysis techniques, comprehension frameworks, synthesis strategies, and systematic investigation approaches for code and system analysis.

---

## Table of Contents

1. [Analysis Frameworks](#analysis-frameworks)
2. [Comprehension Strategies](#comprehension-strategies)
3. [Synthesis Techniques](#synthesis-techniques)
4. [Investigation Approaches](#investigation-approaches)

---

## Analysis Frameworks

### Framework: 5W1H Analysis

Ask systematic questions about code:

**What:** What does this code do?
**Why:** Why is it implemented this way?
**Where:** Where is it called from?
**When:** When does it execute?
**Who:** Who (what component) uses this?
**How:** How does it accomplish its goal?

**Application:**
```python
# Analyzing this function
def process_payment(amount, method):
    validated = validate_amount(amount)
    transaction = create_transaction(validated, method)
    return execute_payment(transaction)

# 5W1H Analysis:
# What: Processes a payment by validating amount and executing transaction
# Why: Separates validation from execution for cleaner code
# Where: Called from PaymentController.handle_payment
# When: User submits payment form
# Who: PaymentController (primary caller)
# How: Validates → Creates transaction object → Executes
```

### Framework: Layer-by-Layer Analysis

Analyze systems in architectural layers:

1. **Interface Layer** - What users/clients interact with
2. **Application Layer** - Business logic coordination
3. **Domain Layer** - Core business rules
4. **Infrastructure Layer** - External integrations

**Application:**
```bash
# Identify layers
find . -type d | grep -E "api|controller|service|model|repository"

# Analyze each layer
echo "=== Interface (API/Controllers) ==="
cat src/api/payment_controller.py

echo "=== Application (Services) ==="
cat src/services/payment_service.py

echo "=== Domain (Models) ==="
cat src/models/payment.py

echo "=== Infrastructure (Repositories) ==="
cat src/repositories/payment_repository.py
```

### Framework: Data Flow Analysis

Trace data transformations through the system:

**Steps:**
1. Identify inputs (request, file, event)
2. Track transformations (validation, processing, enrichment)
3. Locate outputs (response, file, database)
4. Map intermediate states

**Application:**
```bash
# 1. Find input points
grep -rn "request\|@app.route" src/

# 2. Trace processing
grep -rn "process\|transform\|validate" src/

# 3. Find outputs
grep -rn "return\|response\|save\|write" src/
```

### Framework: Dependency Analysis

Understand module relationships:

**Techniques:**
- Import analysis (what does this module use?)
- Usage analysis (who uses this module?)
- Circular dependency detection
- Coupling measurement

**Application:**
```bash
# What does auth.py import?
grep "^import\|^from" src/auth.py

# Who imports auth.py?
grep -r "import.*auth\|from.*auth" src/

# Find circular dependencies
# (modules that import each other)
for file in src/*.py; do
  echo "=== $(basename $file) ==="
  grep "^import\|^from" "$file"
done | tee /tmp/deps.txt
# Manually check for cycles in /tmp/deps.txt
```

---

## Comprehension Strategies

### Strategy: Chunking

Break complex code into understandable pieces:

**Technique:**
1. Identify natural boundaries (functions, classes, modules)
2. Understand each chunk independently
3. Understand chunk interactions
4. Synthesize full picture

**Example:**
```python
# Complex nested code
def complex_operation(data):
    # Chunk 1: Validation
    if not data or not isinstance(data, dict):
        raise ValueError("Invalid data")

    # Chunk 2: Transformation
    processed = {k: v*2 for k, v in data.items() if v > 0}

    # Chunk 3: Aggregation
    result = sum(processed.values())

    # Chunk 4: Output formatting
    return {"total": result, "count": len(processed)}

# Understand each chunk separately, then together
```

### Strategy: Pattern Matching

Recognize familiar patterns to accelerate understanding:

**Common Patterns:**
- **Guard clauses:** Early returns for edge cases
- **Factory methods:** Object creation abstraction
- **Template method:** Algorithm skeleton with customizable steps
- **Chain of responsibility:** Sequential handler pattern

**Application:**
```python
# Recognize pattern: Guard clauses
def process(data):
    if not data:
        return None  # Guard clause
    if len(data) < 5:
        return None  # Guard clause

    # Main logic only runs if guards pass
    return transform(data)
```

### Strategy: Mental Simulation

Execute code mentally with example inputs:

**Steps:**
1. Choose representative input
2. Trace execution step-by-step
3. Track variable states
4. Predict output
5. Verify prediction (run if possible)

**Example:**
```python
def calculate(nums):
    total = 0
    for n in nums:
        if n % 2 == 0:
            total += n * 2
    return total

# Mental simulation with nums = [1, 2, 3, 4]
# Iteration 1: n=1, odd, skip
# Iteration 2: n=2, even, total = 0 + (2*2) = 4
# Iteration 3: n=3, odd, skip
# Iteration 4: n=4, even, total = 4 + (4*2) = 12
# Return: 12
```

### Strategy: Abstraction Levels

Understand code at multiple abstraction levels:

**Levels:**
1. **High:** "This module handles user authentication"
2. **Medium:** "It validates credentials, creates sessions, manages tokens"
3. **Low:** "Uses bcrypt for hashing with salt rounds of 12"

**Application:**
```bash
# High level: Read file names and directory structure
ls src/auth/

# Medium level: Read function signatures
grep -n "^def " src/auth/login.py

# Low level: Read full implementation
cat src/auth/login.py
```

---

## Synthesis Techniques

### Technique: Progressive Summarization

Build understanding incrementally:

**Levels:**
1. **Sentence:** One-line summary
2. **Paragraph:** Key points in 3-5 sentences
3. **Document:** Detailed explanation with examples
4. **Diagram:** Visual representation

**Example:**
```
# Level 1: Sentence
"PaymentService handles payment processing and validation"

# Level 2: Paragraph
"PaymentService coordinates payment operations. It validates amounts,
creates transaction records, integrates with payment gateway, and
handles error cases. Returns transaction results to controllers."

# Level 3: Document
[Full documentation with examples, edge cases, etc.]

# Level 4: Diagram
[Flow chart showing data flow through PaymentService]
```

### Technique: Concept Mapping

Create visual maps of relationships:

```
PaymentService
  ├─ uses → PaymentGateway
  ├─ uses → TransactionRepository
  ├─ validates → PaymentRequest
  ├─ creates → Transaction
  └─ emits → PaymentEvent
      └─ handled by → NotificationService
```

### Technique: Example-Based Understanding

Learn through concrete examples:

**Approach:**
1. Find usage examples (tests, documentation)
2. Trace example execution
3. Generalize to understand all cases

**Application:**
```bash
# Find tests (examples of usage)
cat tests/test_payment.py

# Read implementation with examples in mind
cat src/payment.py
```

---

## Investigation Approaches

### Approach: Hypothesis-Driven Investigation

Form and test hypotheses about code behavior:

**Process:**
1. Form hypothesis ("This function caches results")
2. Identify evidence needed (look for cache data structure)
3. Search for evidence
4. Confirm or refute hypothesis
5. Refine understanding

**Example:**
```bash
# Hypothesis: "This module uses caching"

# Search for evidence
grep -rn "cache\|memo" src/processor.py
grep -rn "@lru_cache\|@cache" src/processor.py

# If found: Hypothesis confirmed
# If not found: Hypothesis refuted, investigate further
```

### Approach: Timeline Reconstruction

Understand how code executes over time:

**Steps:**
1. Identify trigger (HTTP request, event, schedule)
2. Trace execution chronologically
3. Note side effects and state changes
4. Document timeline

**Example:**
```
Timeline: User Login Request
  T0: HTTP POST /login
  T1: Router directs to AuthController.login
  T2: Extract credentials from request
  T3: Query database for user
  T4: Validate password with bcrypt
  T5: Create session token
  T6: Store session in Redis
  T7: Return token to client
  T8: Set cookie in response
```

### Approach: Comparative Analysis

Compare similar components to understand differences:

**Technique:**
```bash
# Compare two similar modules
diff -u src/payment_v1.py src/payment_v2.py

# Compare implementations
grep -A 10 "def process" module1.py
grep -A 10 "def process" module2.py
```

### Approach: Reverse Engineering

Work backwards from output to input:

**Steps:**
1. Start with desired output
2. Find code that produces it
3. Trace back to required inputs
4. Understand transformations

**Example:**
```bash
# Want to understand: "How is this JSON generated?"

# 1. Find where JSON is returned
grep -rn "jsonify\|json.dumps" src/

# 2. Trace back to data source
# Read function that creates JSON
# Find where data comes from
# Continue backwards to original source
```

---

## Summary

This methodology provides:
- **Frameworks** for systematic code analysis
- **Strategies** for effective comprehension
- **Techniques** for synthesizing understanding
- **Approaches** for investigating complex systems

Apply based on analysis goals and code complexity.

---

## 4-Phase Analysis Process

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

---

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

---

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
