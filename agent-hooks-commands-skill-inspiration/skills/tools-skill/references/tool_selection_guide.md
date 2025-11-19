# Tool Selection Guide

Comprehensive decision-making guide for choosing the right tool for any task in Claude Code.

## Overview

This guide helps you choose between specialized tools (Read, Write, Edit, Glob, Grep) and Bash commands. The general principle: **always prefer specialized tools over shell commands** for file operations.

---

## Quick Decision Matrix

| Your Task | Preferred Tool | Alternative | When to Use Alternative |
|-----------|---------------|-------------|------------------------|
| Read a file | **Read** | Bash + cat | Never for simple reading |
| Write new file | **Write** | Bash + echo/cat | Never |
| Edit existing file | **Edit** | Bash + sed | Never |
| Find files by name | **Glob** | Bash + find | Never |
| Search file contents | **Grep** | Bash + grep | Never |
| Process JSON | **Bash + jq** | Read + manual parse | Simple extractions |
| Run git commands | **Bash** | N/A | Always use Bash |
| Install packages | **Bash** | N/A | Always use Bash |
| System operations | **Bash** | N/A | Always use Bash |

---

## Read vs Bash with cat

### Use Read When:
- ✅ Reading any single file
- ✅ Need file content for analysis
- ✅ File is text, image, PDF, or notebook
- ✅ Want line numbers for reference
- ✅ Need to read multiple files (parallel Read calls)
- ✅ File might be very large (supports offset/limit)

### Use Bash with cat When:
- ⚠️ Piping to another shell command (rare)
- ⚠️ Need shell-specific processing
- ⚠️ Read tool genuinely doesn't fit (very rare)

### Why Read is Better:

| Feature | Read Tool | Bash + cat |
|---------|-----------|------------|
| File types | Text, images, PDFs, notebooks | Text only |
| Line numbers | ✅ Yes | ❌ No (unless using cat -n) |
| Large files | ✅ Offset/limit support | ❌ Loads entire file |
| Parallel execution | ✅ Easy | ❌ Difficult |
| Path handling | ✅ No escaping issues | ⚠️ Must escape spaces |
| Multimodal | ✅ Displays images | ❌ Text only |
| Safety | ✅ No shell injection | ⚠️ Shell injection risk |

### Examples

#### ✅ Read Tool (Preferred)
```markdown
Task: Read configuration file

Read tool
file_path: /Users/awesome/dev/project/config.json
```

#### ❌ Bash with cat (Not Preferred)
```bash
# Don't do this for simple file reading
cat /Users/awesome/dev/project/config.json
```

#### ⚠️ Bash with cat (Acceptable Exception)
```bash
# OK: Piping to another command
cat package.json | jq '.dependencies'
```

---

## Write vs Bash with echo/cat

### Use Write When:
- ✅ Creating new files
- ✅ Completely replacing file contents
- ✅ Multi-line content
- ✅ Need safety checks (Read before Write)
- ✅ Content has special characters

### Use Bash with echo/cat When:
- ❌ **Never** - Write tool is always better

### Why Write is Better:

| Feature | Write Tool | Bash + echo | Bash + cat <<EOF |
|---------|------------|-------------|------------------|
| Multi-line | ✅ Native | ❌ Needs escaping | ✅ Yes |
| Safety checks | ✅ Must Read first | ❌ None | ❌ None |
| Special chars | ✅ Handles all | ⚠️ Escaping required | ⚠️ EOF conflicts |
| Encoding | ✅ Proper UTF-8 | ⚠️ Shell dependent | ⚠️ Shell dependent |
| Clarity | ✅ Clear intent | ❌ Unclear | ❌ Verbose |

### Examples

#### ✅ Write Tool (Preferred)
```markdown
Task: Create new component file

Write tool
file_path: /path/to/Component.vue
content: |
  <template>
    <div>{{ message }}</div>
  </template>

  <script setup>
  const message = 'Hello'
  </script>
```

#### ❌ Bash with echo (Not Preferred)
```bash
# Don't do this
echo "<template><div>{{ message }}</div></template>" > Component.vue
```

#### ❌ Bash with cat <<EOF (Not Preferred)
```bash
# Don't do this
cat <<EOF > Component.vue
<template>
  <div>{{ message }}</div>
</template>
EOF
```

---

## Edit vs Bash with sed/awk

### Use Edit When:
- ✅ Replacing specific strings in files
- ✅ Refactoring variable names
- ✅ Updating configuration values
- ✅ Making targeted changes
- ✅ Need exact string matching

### Use Bash with sed/awk When:
- ❌ **Never** - Edit tool is always better

### Why Edit is Better:

| Feature | Edit Tool | Bash + sed | Bash + awk |
|---------|-----------|------------|------------|
| Exact matching | ✅ String-based | ⚠️ Regex can over-match | ⚠️ Complex syntax |
| Safety | ✅ Must Read first | ❌ Direct modification | ❌ Direct modification |
| Multiline | ✅ Native support | ❌ Complex | ⚠️ Possible but hard |
| Error handling | ✅ Fails if no match | ⚠️ Silent failures | ⚠️ Silent failures |
| Clarity | ✅ Clear intent | ❌ Cryptic syntax | ❌ Cryptic syntax |
| Uniqueness check | ✅ Fails if not unique | ❌ Replaces all | ❌ Complex logic |

### Examples

#### ✅ Edit Tool (Preferred)
```markdown
Task: Update API URL in config

Step 1: Read config file
Read /path/to/config.js

Step 2: Edit exact match
Edit tool
file_path: /path/to/config.js
old_string: "const API_URL = 'http://localhost:3000'"
new_string: "const API_URL = 'https://api.production.com'"
```

#### ❌ Bash with sed (Not Preferred)
```bash
# Don't do this
sed -i 's/localhost:3000/api.production.com/' config.js
# Risk: Might match unwanted strings
```

---

## Glob vs Bash with find

### Use Glob When:
- ✅ Finding files by name pattern
- ✅ Need fast file discovery
- ✅ Working with standard glob patterns
- ✅ Any codebase size
- ✅ Want results sorted by modification time

### Use Bash with find When:
- ❌ **Never** - Glob tool is always better

### Why Glob is Better:

| Feature | Glob Tool | Bash + find |
|---------|-----------|-------------|
| Performance | ✅ Optimized | ⚠️ Slower |
| Syntax | ✅ Simple glob patterns | ❌ Complex arguments |
| Output format | ✅ Consistent | ⚠️ Needs formatting |
| Sorting | ✅ By modification time | ❌ Requires extra flags |
| Integration | ✅ Works with all codebases | ⚠️ Platform differences |

### Examples

#### ✅ Glob Tool (Preferred)
```markdown
Task: Find all Vue components

Glob tool
pattern: "src/components/**/*.vue"
```

#### ❌ Bash with find (Not Preferred)
```bash
# Don't do this
find src/components -name "*.vue" -type f
```

#### Pattern Comparison

| Need | Glob Pattern | find Equivalent |
|------|--------------|-----------------|
| All JS files in dir | `*.js` | `find . -maxdepth 1 -name "*.js"` |
| JS files recursively | `**/*.js` | `find . -name "*.js"` |
| Multiple extensions | `*.{js,ts,vue}` | `find . -name "*.js" -o -name "*.ts" -o -name "*.vue"` |
| Exclude pattern | *Complex* | `find . -name "*.js" ! -path "*/node_modules/*"` |

---

## Grep vs Bash with grep/rg

### Use Grep When:
- ✅ Searching file contents
- ✅ Need regex pattern matching
- ✅ Want structured output modes
- ✅ Need context lines
- ✅ Want line numbers
- ✅ Filtering by file type

### Use Bash with grep/rg When:
- ❌ **Never** - Grep tool is always better

### Why Grep is Better:

| Feature | Grep Tool | Bash + grep | Bash + rg |
|---------|-----------|-------------|-----------|
| Output modes | ✅ 3 modes (files/content/count) | ❌ One format | ⚠️ Multiple flags |
| Type filtering | ✅ Built-in type param | ❌ Manual globbing | ✅ Has --type |
| Context lines | ✅ -A, -B, -C params | ✅ Same flags | ✅ Same flags |
| Multiline | ✅ multiline param | ❌ Not supported | ⚠️ Complex |
| Integration | ✅ Optimized for Claude | ❌ Raw output | ❌ Raw output |
| Permissions | ✅ Proper access | ⚠️ Might fail | ⚠️ Might fail |

### Examples

#### ✅ Grep Tool (Preferred)
```markdown
Task: Find all uses of useAuthStore

Step 1: Find which files
Grep tool
pattern: "useAuthStore"
output_mode: "files_with_matches"
type: "js"

Step 2: See the code
Grep tool
pattern: "useAuthStore"
output_mode: "content"
-n: true
-C: 2
```

#### ❌ Bash with grep (Not Preferred)
```bash
# Don't do this
grep -r "useAuthStore" src/ --include="*.js"
grep -n -C 2 "useAuthStore" src/**/*.js
```

---

## JSON Processing: jq vs Read + Manual Parse

### Use jq (via Bash) When:
- ✅ Complex JSON extraction or transformation
- ✅ Working with API responses
- ✅ Filtering arrays of JSON objects
- ✅ Need to pipe JSON operations
- ✅ Multiple operations on JSON data
- ✅ Pretty-printing JSON

### Use Read + Manual Parse When:
- ✅ Simple single value extraction
- ✅ JSON file is small and simple
- ✅ Need to understand full file context
- ✅ Will edit the JSON file afterward

### Why jq is Better for Complex JSON:

| Feature | jq | Read + Manual Parse |
|---------|----|--------------------|
| Filtering | ✅ Built-in filters | ❌ Manual logic |
| Array operations | ✅ map, select, etc. | ❌ Manual iteration |
| Nested access | ✅ Simple syntax | ⚠️ Verbose |
| Transformations | ✅ Powerful | ❌ Complex |
| Piping | ✅ Native support | ❌ N/A |
| Performance | ✅ Fast | ⚠️ Slower for complex |

### Examples

#### ✅ jq via Bash (Preferred for Complex JSON)
```bash
# Extract version from package.json
jq -r '.version' package.json

# Get all dependency names
jq -r '.dependencies | keys[]' package.json

# Filter array
jq '.users[] | select(.active == true)' users.json

# Complex transformation
jq '.items | map({id, name: .title, price: (.price * 1.1)})' data.json
```

#### ✅ Read + Parse (Preferred for Simple Cases)
```markdown
Task: Get version from package.json

Read: package.json
Look for: "version": "1.0.0"
Extract: 1.0.0

(Simple enough to do visually)
```

#### ⚠️ When to Choose Which

```
Need to work with JSON?
├─→ Single simple value (e.g., version)?
│   ├─→ Small file? → Read + visual inspection
│   └─→ Large file? → jq for precision
├─→ Multiple values or nested data?
│   └─→ jq via Bash
├─→ Filtering arrays?
│   └─→ jq via Bash
├─→ Transforming structure?
│   └─→ jq via Bash
└─→ Will modify JSON afterward?
    └─→ Read first (to see structure), then Edit

❌ Never use: Manual string manipulation for JSON
✅ Always prefer: jq for JSON operations, Read for viewing
```

### Common jq Patterns

```bash
# Package.json operations
jq -r '.version' package.json                    # Get version
jq '.scripts' package.json                       # List scripts
jq -r '.dependencies | keys[]' package.json      # List deps

# API responses
curl -s api.com/data | jq '.results[].name'      # Extract names
curl -s api.com/data | jq '.[] | select(.active)' # Filter

# Config files
jq -r '.api.baseUrl' config.json                 # Get nested value
jq '.features | keys' config.json                # Get feature flags

# Data transformation
jq 'map(.name)' users.json                       # Extract field
jq 'sort_by(.age)' users.json                    # Sort by field
jq 'group_by(.category)' products.json           # Group data
```

---

## Specialized Tools vs Bash - When to Use Each

### Clear Categories

#### Category 1: File Operations → Use Specialized Tools

| Operation | Tool | NOT Bash |
|-----------|------|----------|
| Read files | Read | ❌ cat, head, tail |
| Write files | Write | ❌ echo >, cat <<EOF |
| Edit files | Edit | ❌ sed, awk, perl |
| Find files | Glob | ❌ find, ls |
| Search content | Grep | ❌ grep, rg, ag |

#### Category 2: Terminal Operations → Use Bash

| Operation | Bash Command | Tool |
|-----------|--------------|------|
| Version control | git status, git add, git commit | Bash |
| Package managers | npm install, pip install | Bash |
| Build tools | npm run build, vite build | Bash |
| Docker | docker ps, docker build | Bash |
| System commands | ps, kill, df, uptime | Bash |
| JSON processing | jq '.field' file.json | Bash + jq |
| macOS utilities | open, pbcopy, say | Bash |

---

## Decision Trees

### Tree 1: I Need to Access File Contents

```
Need file contents?
├─→ Reading?
│   ├─→ Single file? → Read tool
│   ├─→ Multiple files? → Parallel Read tools
│   └─→ Files matching pattern? → Glob + Read
├─→ Searching for text?
│   └─→ Grep tool
└─→ Piping to shell command?
    └─→ Bash with cat (exception)
```

### Tree 2: I Need to Modify a File

```
Need to modify file?
├─→ File doesn't exist?
│   └─→ Write tool (create new)
├─→ File exists?
│   ├─→ Complete replacement?
│   │   └─→ Read first, then Write
│   ├─→ Specific string changes?
│   │   └─→ Read first, then Edit
│   └─→ Jupyter notebook?
│       └─→ NotebookEdit
└─→ File is binary?
    └─→ Bash command if appropriate
```

### Tree 3: I Need to Find Files or Content

```
Need to find something?
├─→ Find files by name/pattern?
│   └─→ Glob tool
├─→ Find text in files?
│   ├─→ Know which files? → Grep with path
│   └─→ Search all? → Grep with type/glob
└─→ Complex multi-step search?
    └─→ Glob + Grep combination
```

### Tree 4: I Need to Work with JSON

```
Need to work with JSON?
├─→ Simple value extraction?
│   ├─→ Small file? → Read + visual inspection
│   └─→ Large file or precision needed? → jq via Bash
├─→ Complex extraction (nested, multiple values)?
│   └─→ jq via Bash
├─→ Filter array of objects?
│   └─→ jq via Bash
├─→ Transform JSON structure?
│   └─→ jq via Bash
├─→ API response processing?
│   └─→ curl + jq via Bash
├─→ Pretty-print JSON?
│   └─→ jq via Bash
└─→ Modify JSON file?
    └─→ Read, then Edit (jq is read-only)
```

### Tree 5: I Need to Run a Command

```
Need to run command?
├─→ File operation?
│   └─→ Use specialized tool (Read/Write/Edit/Glob/Grep)
├─→ JSON processing?
│   └─→ Bash + jq
├─→ Git operation?
│   └─→ Bash
├─→ Package manager?
│   └─→ Bash
├─→ Build tool?
│   └─→ Bash
├─→ System command?
│   └─→ Bash
└─→ Multiple commands?
    ├─→ Independent? → Parallel Bash calls
    └─→ Dependent? → Single Bash with &&
```

---

## Common Scenarios

### Scenario 1: Explore New Codebase

**Goal:** Understand project structure and find key files

**Tools to Use:**
1. Glob - Discover file structure
2. Read - Examine key files (package.json, README, config)
3. Grep - Search for specific patterns

**Example Workflow:**
```markdown
Step 1: Find all config files
Glob: "*.config.{js,ts,json}"

Step 2: Read package.json
Read: /path/to/package.json

Step 3: Find all components
Glob: "src/components/**/*.vue"

Step 4: Search for API calls
Grep: pattern="/api/", type="js"
```

### Scenario 2: Refactor Code

**Goal:** Rename variable across multiple files

**Tools to Use:**
1. Grep - Find all occurrences
2. Read - Verify context in each file
3. Edit - Make changes with replace_all

**Example Workflow:**
```markdown
Step 1: Find all uses
Grep: pattern="oldVarName", output_mode="files_with_matches"

Step 2: Review each file
Read each matched file

Step 3: Edit each file
Edit with old_string="oldVarName", new_string="newVarName", replace_all=true
```

### Scenario 3: Debug Production Issue

**Goal:** Find where error is occurring

**Tools to Use:**
1. Grep - Search for error message
2. Read - Examine relevant files
3. Bash - Check logs, restart services

**Example Workflow:**
```markdown
Step 1: Search for error message
Grep: pattern="Error: Invalid token", output_mode="content", -n=true

Step 2: Read affected files
Read files found in step 1

Step 3: Check logs
Bash: tail -100 /var/log/app.log

Step 4: Fix code
Edit to fix the issue
```

### Scenario 4: Add New Feature

**Goal:** Implement new functionality

**Tools to Use:**
1. Glob - Find similar existing features
2. Read - Study implementation patterns
3. Write - Create new files
4. Edit - Integrate into existing code
5. Bash - Run tests and build

**Example Workflow:**
```markdown
Step 1: Find similar features
Glob: "src/features/**/*.js"

Step 2: Study implementation
Read relevant files

Step 3: Create new files
Write new component/store/composable

Step 4: Integrate
Edit existing files to import and use new feature

Step 5: Test
Bash: npm run test
Bash: npm run build
```

### Scenario 5: Code Review

**Goal:** Review changes in pull request

**Tools to Use:**
1. Bash - Get changed files
2. Glob - Find all affected files
3. Read - Examine each file
4. Grep - Find related code

**Example Workflow:**
```markdown
Step 1: Get changed files
Bash: git diff --name-only main...feature-branch

Step 2: Read each changed file
Read each file in parallel

Step 3: Find related code
Grep for functions/variables used in changes

Step 4: Verify
Read related files to ensure consistency
```

---

## Performance Comparison

### Task: Read 5 Files

| Approach | Time | Why |
|----------|------|-----|
| **Parallel Read** (5 tools in 1 message) | ⚡ Fastest | Parallel execution |
| Sequential Read (5 messages) | 🐢 Slowest | Sequential waiting |
| Bash with cat (5 calls) | 🚶 Slow | Sequential execution |

### Task: Find Files and Search Content

| Approach | Steps | Performance |
|----------|-------|-------------|
| **Glob + Grep** | 2 steps | ⚡ Optimized |
| Bash find + grep | Multiple commands | 🚶 Slower |
| Manual file listing | Many steps | 🐢 Very slow |

### Task: Edit Multiple Files

| Approach | Safety | Performance |
|----------|--------|-------------|
| **Read + Edit** for each file | ✅ Safe | ⚡ Good |
| Bash sed on all files | ❌ Risky | 🚶 Slower |
| Manual editing | ✅ Safe | 🐢 Very slow |

---

## Integration Patterns

### Pattern 1: Glob + Read

**When:** Need to read files matching a pattern

```markdown
Step 1: Find files
Glob: pattern="src/**/*.test.js"

Result: [file1.test.js, file2.test.js, file3.test.js]

Step 2: Read all in parallel
Read file1.test.js
Read file2.test.js
Read file3.test.js
```

### Pattern 2: Grep + Read

**When:** Need to examine files containing specific content

```markdown
Step 1: Find files with pattern
Grep: pattern="useAuthStore", output_mode="files_with_matches"

Result: [ComponentA.vue, ComponentB.vue]

Step 2: Read each file for full context
Read ComponentA.vue
Read ComponentB.vue
```

### Pattern 3: Read + Edit

**When:** Need to make targeted changes

```markdown
Step 1: Read file to verify content
Read /path/to/file.js

Step 2: Edit specific string
Edit: old_string="exact match", new_string="replacement"
```

### Pattern 4: Glob + Grep + Read

**When:** Complex search and examination

```markdown
Step 1: Find all Vue files
Glob: pattern="src/**/*.vue"

Step 2: Search for specific pattern in those files
Grep: pattern="computed", type="vue", output_mode="files_with_matches"

Step 3: Read matched files
Read each matched file
```

---

## Common Mistakes and Solutions

### Mistake 1: Using Bash for File Operations

❌ **Problem:**
```bash
cat file.txt
find . -name "*.js"
grep -r "pattern" src/
sed -i 's/old/new/' file.txt
echo "content" > file.txt
```

✅ **Solution:**
```markdown
Read file.txt
Glob pattern="**/*.js"
Grep pattern="pattern", path="src/"
Edit old_string="old", new_string="new"
Write file.txt content="content"
```

### Mistake 2: Sequential Instead of Parallel

❌ **Problem:**
```markdown
Message 1: Read file1.js
Message 2: Read file2.js
Message 3: Read file3.js
```

✅ **Solution:**
```markdown
Single message:
  Read file1.js
  Read file2.js
  Read file3.js
```

### Mistake 3: Not Reading Before Edit

❌ **Problem:**
```markdown
Edit file without reading it first
Error: Must Read file before Edit
```

✅ **Solution:**
```markdown
Step 1: Read file.js
Step 2: Edit file.js
```

### Mistake 4: Using Write on Existing File Without Reading

❌ **Problem:**
```markdown
Write existing-file.js
Error: Must Read existing files before using Write
```

✅ **Solution:**
```markdown
Step 1: Read existing-file.js
Step 2: Write existing-file.js (with new content)
```

---

## Summary

### The Golden Rule

**For file operations → Use specialized tools**
**For terminal operations → Use Bash**

### Quick Reference

| Task Category | Tools to Use |
|--------------|-------------|
| File reading | Read |
| File writing | Write (new), Edit (existing) |
| File finding | Glob |
| Content search | Grep |
| Git operations | Bash |
| Package managers | Bash |
| System commands | Bash |
| macOS utilities | Bash |

### Decision Priority

1. **First:** Check if there's a specialized tool (Read/Write/Edit/Glob/Grep)
2. **Second:** If no specialized tool, use Bash
3. **Third:** Consider parallel vs sequential execution
4. **Fourth:** Apply safety checks (Read before Write/Edit)

### Benefits of Specialized Tools

✅ Safety checks and validation
✅ Optimized performance
✅ Consistent output format
✅ Better error handling
✅ Integration with Claude Code workflows
✅ Multimodal support (Read images, PDFs)
✅ No shell escaping issues

---

**Remember:** When in doubt, prefer specialized tools over Bash for file operations. They're designed specifically for Claude Code workflows and provide better safety, performance, and integration.
