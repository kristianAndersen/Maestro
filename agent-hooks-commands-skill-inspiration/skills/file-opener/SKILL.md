---
name: file-opener
description: Opens files based on user prompts, analyzes context and intent, then automatically delegates to appropriate specialist skills for further operations.
type: skill
tier: 2
version: 1.0.0
allowed-tools: Read, Glob, Grep
model: sonnet
---

# File Opener - Smart Delegator

**Domain**: File Operations & Intelligent Routing
**Expertise**: Context analysis, intent detection, skill delegation
**Role**: Opening Conductor - Opens files and routes to appropriate specialists

---

## Purpose

This skill opens files based on natural language prompts, then analyzes the content and original intent to automatically determine which specialist skill should handle the next operation.

**What Maestro Delegates:**
- Open file(s) mentioned in user prompt
- Understand what user wants to do with the file
- Route to appropriate specialist skill

**What This Skill Delivers:**
- File content opened and ready
- Context-aware skill delegation
- Seamless handoff to specialists

---

## Integration with Maestro

### Receives Strategic Direction

**Product (What to accomplish):**
- Goal: Open file(s) and prepare for next operation
- Expected Outcome: File open + specialist skill activated
- Acceptance Criteria: Right file, right skill, smooth handoff

**Process (How to approach it):**
- Parse prompt for file references
- Open identified files
- Analyze intent from prompt + content
- Delegate to specialist

**Performance (Quality expectations):**
- Fast file opening
- Accurate intent detection
- Correct skill routing

---

## Tactical 4-D Methodology

### 1. DELEGATION (Tactical) - Intent Analysis & Routing

**Two-Phase Process:**

**Phase 1: File Opening**
1. Parse user prompt for file references:
   - Explicit paths: "/config/settings.json"
   - Relative paths: "src/App.vue"
   - Glob patterns: "*.json", "src/**/*.ts"
   - Natural language: "the config file", "main component"

2. Open files using appropriate strategy:
   - Single file → Direct read
   - Multiple files → Batch read
   - Pattern-based → Glob then read
   - Ambiguous → Search and confirm

**Phase 2: Intent Detection & Delegation**

Analyze prompt + file content to detect intent:

**Code Analysis Intents:**
- "review this code" → code-analysis skill
- "find bugs in" → code-analysis skill
- "check quality of" → code-analysis skill
- "analyze patterns in" → code-analysis skill

**Content Analysis Intents:**
- "check marketing copy" → content-analysis skill
- "review messaging in" → content-analysis skill
- "analyze tone of" → content-analysis skill

**Data Validation Intents:**
- "validate this data" → data-validation skill
- "check data quality" → data-validation skill
- "verify CSV format" → data-validation skill

**File Operations:**
- "edit this file" → Use Edit tool directly
- "update the file" → Use Edit tool directly
- "change X to Y" → Use Edit tool directly

**Reading Only:**
- "show me" → Just display content
- "what's in" → Just display content
- "read the file" → Just display content

### 2. DESCRIPTION (Tactical) - File Opening Strategy

**For Direct Read:**
```typescript
{
  operation: "read-file",
  file_path: "/path/to/file.ext",
  purpose: "Open file for [detected intent]",
  context: "User wants to [summarized intent]"
}
```

**For Pattern-Based:**
```typescript
{
  operation: "glob-then-read",
  pattern: "src/**/*.vue",
  purpose: "Find and open matching files",
  next_step: "Delegate to [skill] for [intent]"
}
```

**For Ambiguous Reference:**
```typescript
{
  operation: "search-and-confirm",
  search_term: "config file",
  strategy: "Grep for likely files, present options if multiple matches",
  confirmation: "Ask user if multiple candidates found"
}
```

### 3. DISCERNMENT (Tactical) - Intent Validation

**After Opening File:**
```
✓ Check:
  - File exists and readable
  - Content loaded successfully
  - Intent is clear from prompt
  - Appropriate specialist skill identified

⚠️ If issues:
  - File not found → Search or ask user
  - Multiple files match → Present options
  - Intent unclear → Ask user what they want to do
  - No matching skill → Perform basic operation (read/edit)
```

**Intent Detection Confidence:**
- **High confidence** (keyword match + context) → Auto-delegate
- **Medium confidence** (partial match) → Suggest skill, ask confirmation
- **Low confidence** (ambiguous) → Ask user what they want to do

### 4. DILIGENCE (Tactical) - Delegation Quality

**Before Delegating:**
```
✓ Verify:
  - Correct file(s) opened
  - Intent accurately detected
  - Specialist skill appropriate for task
  - File content compatible with specialist (e.g., don't send binary to code-analysis)

✓ Handoff includes:
  - File path(s)
  - File content
  - User's original intent
  - Relevant context from prompt
```

---

## Execution Workflow

### Workflow: Single File Analysis Request

```
User: "Review the code in src/App.vue"

1. Parse Prompt
   - File reference: "src/App.vue"
   - Intent keywords: "Review the code"
   - Detected intent: Code analysis

2. Open File
   → Read("/Users/project/src/App.vue")
   → Content: <template>...</template>
   → Evaluate: ✓ Vue component file, readable

3. Detect Intent
   - "Review the code" → Code analysis intent
   - File type: .vue → Code file
   - Confidence: HIGH
   - Selected skill: code-analysis

4. Delegate to Specialist
   → Invoke code-analysis skill with:
     - file_paths: ["src/App.vue"]
     - content: [file content]
     - user_intent: "Review the code"
     - focus_areas: ["quality", "patterns", "issues"]

5. Report to User
   "Opened src/App.vue. Delegating to code-analysis skill for comprehensive review..."
```

### Workflow: Ambiguous File Reference

```
User: "Check the config file"

1. Parse Prompt
   - File reference: "the config file" (ambiguous)
   - Intent: "Check" (needs clarification)

2. Search for Candidates
   → Grep for common config patterns: "config", "settings", ".env"
   → Found:
     - /config/app.json
     - /src/config.ts
     - /.env

3. Present Options
   "Found 3 potential config files:
    1. /config/app.json
    2. /src/config.ts
    3. /.env

   Which would you like to check?"

4. User Selects → Open file → Detect intent → Delegate
```

### Workflow: Pattern-Based Multi-File

```
User: "Analyze all Vue components for consistency"

1. Parse Prompt
   - File pattern: "all Vue components" → *.vue, **/*.vue
   - Intent: "Analyze for consistency" → Code analysis
   - Scope: Multiple files

2. Find Matching Files
   → Glob("**/*.vue")
   → Found: 12 files

3. Check File Count
   - 12 files = Heavy context
   - Decision: Consider gemini-delegator for batch analysis

4. Delegate Appropriately
   If <= 5 files:
     → code-analysis skill with all files

   If > 5 files:
     → gemini-delegator skill (better for large batches)

5. Report
   "Found 12 Vue components. Delegating to gemini-delegator for comprehensive batch analysis..."
```

---

## Intent Detection Patterns

### Code Analysis Triggers

**Keywords:**
- review, analyze, check, audit, inspect, examine
- bugs, issues, problems, errors
- quality, patterns, best practices
- refactor, improve, optimize

**File Types:**
- .js, .ts, .jsx, .tsx, .vue, .py, .java, .go, .rs, etc.

**Delegate to:** `code-analysis` skill

### Content Analysis Triggers

**Keywords:**
- marketing, copy, messaging, tone
- brand voice, audience, engagement
- readability, clarity, SEO

**File Types:**
- .md, .txt, .html (marketing content)

**Delegate to:** `content-analysis` skill

### Data Validation Triggers

**Keywords:**
- validate, verify, check data
- data quality, integrity, schema
- CSV, JSON validation

**File Types:**
- .csv, .json, .xml, .yaml

**Delegate to:** `data-validation` skill

### File Operations (No Delegation)

**Keywords:**
- edit, update, change, modify
- add, remove, replace
- write, save

**Action:** Use Edit tool directly

### Read-Only (No Delegation)

**Keywords:**
- show, display, read, view, open
- what's in, contents of

**Action:** Display content to user

---

## Examples

### Example 1: Code Review

**User:** "Check src/api/auth.ts for security issues"

**Execution:**
```
1. Parse: File = "src/api/auth.ts", Intent = "security issues"
2. Open: Read(src/api/auth.ts) → Content loaded
3. Detect: "security issues" + .ts file → code-analysis
4. Delegate: code-analysis skill with focus on security
5. Result: "Opened auth.ts. Running security-focused code analysis..."
```

### Example 2: Data Validation

**User:** "Validate users.csv"

**Execution:**
```
1. Parse: File = "users.csv", Intent = "validate"
2. Open: Read(users.csv) → CSV content
3. Detect: "validate" + .csv → data-validation
4. Delegate: data-validation skill for CSV
5. Result: "Opened users.csv. Running data validation checks..."
```

### Example 3: Simple Read

**User:** "Show me the README"

**Execution:**
```
1. Parse: File = "README" (likely README.md), Intent = "show"
2. Search: Find README.md or README
3. Open: Read(README.md) → Content
4. Detect: "show me" → Read-only, no delegation
5. Result: Display README.md content to user
```

### Example 4: Pattern-Based Search

**User:** "Find all TypeScript config files and check them"

**Execution:**
```
1. Parse: Pattern = "TypeScript config", Intent = "check"
2. Search: Glob("**/tsconfig*.json")
3. Found: tsconfig.json, tsconfig.node.json
4. Open: Read both files
5. Detect: "check" + config files → Multiple approaches:
   - If JSON structure → data-validation
   - If code patterns → code-analysis
   - If ambiguous → Ask user
6. Delegate: Based on clarification
```

---

## Best Practices

### Do's ✓

- ✓ **Parse natural language carefully**: "the config" needs search, "/config.json" is explicit
- ✓ **Detect intent from entire prompt**: Not just keywords, consider context
- ✓ **Match file types to skills**: Don't send images to code-analysis
- ✓ **Ask when ambiguous**: Better to confirm than delegate incorrectly
- ✓ **Consider file count**: Large batches may need different delegation
- ✓ **Preserve user intent**: Pass original prompt context to specialist

### Don'ts ✗

- ✗ **Don't guess file paths**: Search or ask if uncertain
- ✗ **Don't force delegation**: Simple reads don't need specialists
- ✗ **Don't ignore file types**: CSV files don't need code-analysis
- ✗ **Don't lose context**: Specialist needs to know what user wanted
- ✗ **Don't delegate blindly**: Validate intent before routing

---

## Success Criteria

This skill succeeds when:

- ✓ Correct file(s) opened from natural language prompt
- ✓ User intent accurately detected
- ✓ Appropriate specialist skill selected
- ✓ Smooth handoff with full context preserved
- ✓ User experiences seamless operation (feels automatic)
- ✓ Ambiguities resolved through clarification
- ✓ Evidence: User gets the analysis/operation they requested

---

## Notes

**Core Philosophy:**
This is an **orchestrator** not a **doer**. It routes work intelligently but doesn't perform complex operations itself.

**Decision Tree:**
1. Open file(s) → 2. Detect intent → 3. Select specialist → 4. Delegate OR perform simple operation

**Integration:**
Works seamlessly with Maestro's other skills:
- `file-reader`: Uses for complex file operations
- `code-analysis`: Delegates code review tasks
- `content-analysis`: Delegates marketing/content tasks
- `data-validation`: Delegates data quality tasks
- `gemini-delegator`: Delegates large batch operations

**Key Insight:**
The user shouldn't need to know which skill handles what. They say "check this file" and the system figures out the rest.

---

**Skill Status**: Tier 2 Orchestrator for Maestro Marketplace
**Architecture**: Smart delegation with intent detection
**Line Count**: ~480 lines (following <500 rule)
**Domain**: File Operations & Intelligent Routing
