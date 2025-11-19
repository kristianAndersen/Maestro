---
name: tools-skill
description: Expert guidance for command-line tools and file operations. Use for tool selection, command syntax, safety checks, and best practices when working with file system tools (Read, Write, Edit, Glob, Grep), shell commands (git, npm, docker, jq for JSON), and macOS-specific utilities. Triggers on keywords like tool selection, file operations, command syntax, shell commands.
version: 2.0.0
---

# Tools Skill - Maestro Edition

Specialized executor for selecting and using command-line tools effectively and safely. Integrates with Maestro's 4-D methodology to ensure proper tool selection, safe command execution, and evidence-based verification of operations.

## Purpose

When Maestro orchestrates file operations or shell command execution, this skill provides expert guidance on:
- Which tool to use for specific tasks
- How to construct safe, efficient commands
- Best practices for file operations and shell interactions
- Verification of command execution

**Division of Responsibility:**
- **Maestro**: Orchestrates the "what" (read files, search codebase, execute git commands)
- **This Skill**: Provides the "how" (which tool, correct syntax, safety checks)
- **Execution**: Claude implements with proper tools and verification

---

## Integration with Maestro

### DELEGATION (Maestro → Tools Skill)
Maestro delegates when work involves:
- File system operations (reading, writing, searching, finding files)
- Shell command execution (git, npm, docker, system commands)
- JSON processing and manipulation
- Tool selection decisions

**Delegation Direction:**
- **Product**: What needs to be done (read file, search content, execute command)
- **Process**: How to do it safely and efficiently (tool selection, flags, chaining)
- **Performance**: Success criteria (file read completely, search found matches, command succeeded)

### DESCRIPTION (This Skill → Claude)
Skill translates high-level intent into specific tool usage:
- Choose specialized tools over generic shell commands
- Construct safe command syntax with proper quoting
- Chain dependent commands appropriately
- Use parallel execution when possible

### DISCERNMENT (Execution → Evaluation)
After tool execution, evaluate:
- Did the operation succeed? (exit code, output verification)
- Are there safety concerns? (destructive commands, overwriting files)
- Is output as expected? (file contents, search results, command output)
- Were best practices followed? (absolute paths, proper quoting, Read before Write)

**Quality Check:** Maestro evaluates whether tool usage met standards before considering operation complete.

### DILIGENCE (Post-Execution → Verification)
Evidence-based verification:
- For file writes: Verify file exists and contains expected content
- For edits: Confirm changes applied correctly
- For searches: Validate results make sense
- For commands: Check exit codes and output

---

## Core Principles (Excellence Standards)

This skill upholds Maestro's standards through:

**1. Safety First**
- Always explain destructive commands (`rm`, `mv`, overwriting files) before execution
- Verify paths before operations
- Read before Write for existing files (MANDATORY)
- Quote paths with spaces to prevent errors

**2. Use the Right Tool**
- Prefer specialized tools (Read, Write, Edit, Glob, Grep) over generic shell commands
- Never use cat, grep, find, sed, awk via Bash for file operations
- Use Bash only for actual shell commands (git, npm, docker)

**3. Efficiency**
- Use parallel execution for independent operations
- Chain dependent commands with && in single Bash call
- Appropriate flags and options for performance
- Avoid unnecessary processing

**4. Evidence-Based Execution**
- Verify command success with exit codes
- Check output matches expectations
- Confirm file operations completed correctly
- Never claim success without verification

**5. Absolute Paths**
- Always use absolute paths for file operations
- Avoids ambiguity and errors
- Makes operations traceable

---

## When to Use This Skill

### Automatic Activation Triggers

**Tool Selection Questions:**
- "Should I use Read or cat?"
- "How do I search for files?"
- "Which tool for editing files?"
- "How to chain these commands?"

**File Operations:**
- Reading files (Read vs cat vs head/tail)
- Writing files (Write vs echo > vs cat <<EOF)
- Editing files (Edit vs sed/awk)
- Searching content (Grep vs grep/rg)
- Finding files (Glob vs find/ls)

**Shell Commands:**
- Git operations (chaining, commit messages)
- Package managers (npm, pip, docker)
- System commands (ps, kill, df)
- JSON processing (jq syntax)

**Safety Checks:**
- Destructive operations (rm, mv, overwrite)
- Path validation
- Command verification

### Do NOT Use For

- Simple, obvious tool usage you're confident about
- When user explicitly requested specific approach
- Domain-specific tools outside general shell/file operations
- When more specialized skill is better suited

**Maestro Principle:** Use the right tool for the job, safely and efficiently.

---

## Tool Quick Reference

### File Operations (Specialized Tools)

| Tool | Primary Use | When to Use | Never Use For |
|------|------------|-------------|---------------|
| **Read** | Read file contents | Any single file (text, image, PDF, notebook) | Multiple pattern-matched files without Glob first |
| **Write** | Create/overwrite files | New files or complete replacements | Editing existing files (use Edit instead) |
| **Edit** | Modify existing files | String replacements, refactoring, updates | Creating new files (use Write) |
| **Glob** | Find files by pattern | File name/path patterns (*.js, **/*.vue) | Content search (use Grep instead) |
| **Grep** | Search file contents | Text/regex in files | Finding files by name (use Glob) |

### Shell Commands (Bash Tool)

| Tool | Primary Use | When to Use |
|------|------------|-------------|
| **Bash** | Execute shell commands | Git, npm, docker, system commands, command chains |
| **NotebookEdit** | Edit Jupyter notebooks | Modifying .ipynb cell contents |

### JSON Processing (jq via Bash)

| Tool | Primary Use | When to Use |
|------|------------|-------------|
| **jq** | JSON manipulation | Parse, filter, transform JSON data |

---

## Tool Selection Decision Trees

### Reading Files

```
Need to read file(s)?
├─→ Single file?
│   └─→ ✅ Use Read tool
├─→ Multiple specific files?
│   └─→ ✅ Use multiple Read calls in parallel
├─→ Files matching pattern?
│   └─→ ✅ Use Glob first, then Read matched files
└─→ Need to pipe to another command?
    └─→ ✅ Use Bash with cat (rare exception)

❌ Never use: cat, head, tail via Bash for simple file reading
✅ Always prefer: Read tool for direct file access
```

### Searching

```
Need to search?
├─→ Search file contents by text/regex?
│   ├─→ Know specific file? ✅ Use Grep with path parameter
│   └─→ Search all files? ✅ Use Grep with glob/type parameter
├─→ Find files by name/pattern?
│   └─→ ✅ Use Glob tool with pattern (*.js, **/*.vue)
└─→ Complex multi-step search?
    └─→ ✅ Use Glob + Grep combination

❌ Never use: find, grep, rg via Bash
✅ Always prefer: Specialized Glob and Grep tools
```

### Writing and Editing Files

```
Need to modify file?
├─→ File doesn't exist yet?
│   └─→ ✅ Use Write tool
├─→ File exists?
│   ├─→ Replace specific string(s)?
│   │   └─→ ✅ Use Edit tool (exact match)
│   ├─→ Complete rewrite?
│   │   └─→ ✅ Use Read first (REQUIRED!), then Write
│   └─→ Rename variable across file?
│       └─→ ✅ Use Edit with replace_all: true
└─→ Jupyter notebook?
    └─→ ✅ Use NotebookEdit

❌ Never use: echo >, cat <<EOF, sed, awk via Bash
✅ Always prefer: Write and Edit tools
⚠️  CRITICAL: MUST Read existing file before using Write
```

### Executing Shell Commands

```
Need to run command?
├─→ File operation (read/write/search)?
│   └─→ ✅ Use specialized tool (Read/Write/Edit/Glob/Grep)
├─→ Git operation?
│   └─→ ✅ Use Bash (chain with && if dependent)
├─→ Package manager (npm, pip)?
│   └─→ ✅ Use Bash
├─→ System command (ps, kill, df)?
│   └─→ ✅ Use Bash
└─→ Multiple independent commands?
    └─→ ✅ Use parallel Bash calls

✅ Good: git add . && git commit -m "msg" && git push
❌ Bad: Separate Bash calls for dependent commands
```

---

## Common Patterns with Maestro Verification

### Pattern 1: Find and Read Files

**Maestro Direction:** "Read all Vue components in src/components/"

**Tool Selection:**
1. Use Glob: `src/components/**/*.vue`
2. Evaluate results (files found?)
3. Use parallel Read calls for matched files

**Verification:**
- ✅ All files found
- ✅ All files readable
- ✅ Contents as expected

### Pattern 2: Search Content Across Files

**Maestro Direction:** "Find all uses of useAuthStore"

**Tool Selection:**
1. Use Grep:
   - Pattern: `useAuthStore`
   - Output mode: `files_with_matches`
2. Then Grep again with `output_mode: content` for details

**Verification:**
- ✅ Matches found (or confirmed none exist)
- ✅ Results make sense in context
- ✅ No false positives

### Pattern 3: Safe File Editing (Critical Path)

**Maestro Direction:** "Update configuration value"

**Tool Selection:**
1. **Read existing file** (MANDATORY first step)
2. Verify content and find exact match string
3. Use Edit tool:
   - `old_string`: exact string from file (including indentation)
   - `new_string`: replacement string

**Verification:**
- ✅ Edit succeeded (no error)
- ✅ Read file again to confirm change
- ✅ File still valid (parse if JSON/YAML)

⚠️ **Edit fails if old_string not unique** → Provide more context or use `replace_all`

### Pattern 4: Chain Dependent Shell Commands

**Maestro Direction:** "Commit and push changes"

**Tool Selection:**
- Use single Bash call with &&:
  ```bash
  git add . && git commit -m "message" && git push
  ```

**Why:** Commands depend on previous success

**Verification:**
- ✅ Exit code 0
- ✅ Output shows success messages
- ✅ Remote updated (if push)

### Pattern 5: Parallel Execution (Performance)

**Maestro Direction:** "Read multiple configuration files"

**Tool Selection:**
- Use single message with multiple Read calls:
  ```
  Read file1.json
  Read file2.json
  Read file3.json
  ```

**Why:** Maximizes performance by running in parallel

**Verification:**
- ✅ All files read successfully
- ✅ No errors in any read
- ✅ Contents complete

---

## Safety Checklist (Maestro Diligence)

Before executing potentially destructive commands:

- [ ] Explain what the command will do
- [ ] Warn about irreversible changes (rm, mv, >, overwrite)
- [ ] Verify paths are correct (use absolute paths)
- [ ] Check if files exist before overwriting
- [ ] Quote paths with spaces: `"path with spaces"`
- [ ] Consider using Read first to verify file contents
- [ ] After execution: verify success with evidence

---

## Examples with Maestro Integration

### Example 1: Read Configuration File

**User:** "What's in the vite config?"

**Maestro delegates to tools-skill:**
- **Product**: Get vite.config.js contents
- **Process**: Use Read tool with absolute path
- **Performance**: File contents returned

**Tool Selection:**
1. Use Read tool: `/Users/awesome/project/vite.config.js`
2. NOT `cat vite.config.js` via Bash

**Verification:**
- ✅ File exists and read successfully
- ✅ Contents displayed
- ✅ Valid JavaScript

### Example 2: Find All Composables

**User:** "Show me all composables"

**Maestro delegates:**
- **Product**: List composable files
- **Process**: Use Glob with pattern
- **Performance**: All composable files found

**Tool Selection:**
1. Use Glob: `src/composable/**/*.js`
2. NOT `find src/composable -name "*.js"` via Bash

**Verification:**
- ✅ Pattern matched files
- ✅ Results reasonable (not empty, not too many)
- ✅ Paths correct

### Example 3: Update Import Statement

**User:** "Change imports from '@/utils' to '@/lib/utils'"

**Maestro delegates:**
- **Product**: Update all matching imports
- **Process**: Read → Edit with replace_all
- **Performance**: All imports updated

**Tool Selection:**
1. Read sample file to see exact format
2. Edit with `replace_all: true`:
   - old_string: `from '@/utils'`
   - new_string: `from '@/lib/utils'`
3. NOT `sed` or `awk` via Bash

**Verification:**
- ✅ Edit succeeded
- ✅ Read sample file to confirm change
- ✅ Test build still passes

### Example 4: Git Operations

**User:** "Commit these changes and push"

**Maestro delegates:**
- **Product**: Commit and push to remote
- **Process**: Chain git commands
- **Performance**: Changes pushed successfully

**Tool Selection:**
1. Bash: `git add . && git commit -m "message" && git push`
2. NOT separate Bash calls (lose context)

**Verification:**
- ✅ Exit code 0
- ✅ Output shows commit SHA
- ✅ Push confirmed to remote

---

## Detailed Reference Materials

For comprehensive documentation on specific topics:

- **[file_system_tools.md](references/file_system_tools.md)** - Read, Write, Edit, Glob, Grep deep dive
- **[jq_json_processor.md](references/jq_json_processor.md)** - jq syntax, filters, patterns
- **[shell_commands.md](references/shell_commands.md)** - Bash best practices, quoting, chaining
- **[tool_selection_guide.md](references/tool_selection_guide.md)** - Comparative analysis and decision criteria

---

## Quick Command Reference

### File System (Use Tools, NOT Bash)

```bash
❌ cat file.txt                    ✅ Use Read tool
❌ grep "pattern" file.txt         ✅ Use Grep tool
❌ find . -name "*.js"             ✅ Use Glob tool
❌ echo "content" > file.txt       ✅ Use Write tool
❌ sed 's/old/new/' file.txt       ✅ Use Edit tool
```

### Shell Commands (Use Bash Tool)

```bash
✅ git status
✅ npm install
✅ docker ps
✅ git add . && git commit -m "msg"
```

## Common Mistakes to Avoid

1. ❌ Using cat via Bash to read files → ✅ Use Read tool
2. ❌ Using find via Bash to search files → ✅ Use Glob tool
3. ❌ Using grep via Bash to search content → ✅ Use Grep tool
4. ❌ Using echo > to write files → ✅ Use Write tool
5. ❌ Using sed/awk to edit files → ✅ Use Edit tool
6. ❌ Separate Bash calls for dependent commands → ✅ Chain with &&
7. ❌ Forgetting to quote paths with spaces → ✅ Always quote
8. ❌ Using Write without Reading first → ✅ Read existing files first
9. ❌ Sequential tool calls when parallel possible → ✅ Parallel in one message
10. ❌ Using relative paths → ✅ Always use absolute paths

---

## Reminders (Maestro Excellence Checklist)

**Before Tool Execution:**
1. ✅ Right tool selected for task?
2. ✅ Safe operation (no data loss risk)?
3. ✅ Paths absolute and correct?
4. ✅ Paths with spaces quoted?
5. ✅ Read before Write for existing files?

**During Tool Execution:**
6. ✅ Parallel when possible?
7. ✅ Sequential when dependent (&&)?
8. ✅ Proper flags and options?

**After Tool Execution:**
9. ✅ Exit code indicates success?
10. ✅ Output matches expectations?
11. ✅ File operations verified?
12. ✅ Evidence of success captured?

---

**Skill Status**: Maestro Edition - 4-D integrated, safety-focused, evidence-driven ✅
**Line Count**: < 500 (following 500-line rule) ✅
**Philosophy**: Right tool, safe execution, verified results ✅

**For detailed guidance:** See reference files in `references/` directory
