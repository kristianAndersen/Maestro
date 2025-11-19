# Tools Expert Skill

A comprehensive reference skill for command-line tool selection and usage in Claude Code.

## Purpose

This skill serves as a **chaining skill** that other skills can reference when they need guidance on:
- Which tool to use for a specific task
- How to construct safe and efficient commands
- Best practices for file operations and shell interactions
- Command syntax and patterns

## Structure

```
tools-skill/
├── SKILL.md                          # Main skill file with quick reference
└── references/
    ├── file_system_tools.md          # Deep dive: Read, Write, Edit, Glob, Grep
    ├── jq_json_processor.md          # Deep dive: jq for JSON processing
    ├── shell_commands.md             # Deep dive: Bash tool best practices
    └── tool_selection_guide.md       # Comparative analysis and decision trees
```

## What This Skill Covers

### File System Tools
- **Read**: Reading files (text, images, PDFs, notebooks)
- **Write**: Creating new files
- **Edit**: Modifying existing files
- **Glob**: Finding files by pattern
- **Grep**: Searching file contents

### JSON Processing (jq)
- **jq**: Command-line JSON processor
- Parsing and extracting JSON data
- Filtering arrays and objects
- Transforming JSON structures
- Working with package.json and API responses

### Shell Commands (Bash)
- Git operations
- Package managers (npm, pip, yarn)
- Build tools
- Docker/containers
- System commands
- macOS-specific utilities

### Decision-Making
- Tool selection decision trees
- Comparative analysis
- Common patterns and workflows
- Performance optimization
- Safety considerations

## Key Principles

1. **Safety First**: Always explain destructive commands before execution
2. **Use the Right Tool**: Prefer specialized tools over generic shell commands
3. **Efficiency**: Use parallel execution and appropriate flags
4. **Absolute Paths**: Always use absolute paths for file operations
5. **Quote Paths**: Always quote file paths containing spaces

## When to Use This Skill

This skill is automatically invoked when:
- Deciding which tool to use for a task
- Constructing shell commands
- Working with file system operations
- Debugging failed tool executions
- Optimizing command performance
- Questions about tool selection

## Quick Examples

### Example 1: Reading Files
**Don't:** `Bash: cat file.txt`
**Do:** `Read: /absolute/path/to/file.txt`

### Example 2: Finding Files
**Don't:** `Bash: find . -name "*.js"`
**Do:** `Glob: pattern="**/*.js"`

### Example 3: Searching Content
**Don't:** `Bash: grep -r "pattern" src/`
**Do:** `Grep: pattern="pattern", path="src/"`

### Example 4: Editing Files
**Don't:** `Bash: sed -i 's/old/new/' file.txt`
**Do:** `Read file.txt`, then `Edit: old_string="old", new_string="new"`

### Example 5: Git Operations
**Do:** `Bash: git add . && git commit -m "message" && git push`
(Bash is correct for git operations!)

### Example 6: Parse JSON
**Don't:** Read package.json and manually parse complex nested data
**Do:** `Bash: jq -r '.dependencies.vue' package.json`

## How Other Skills Can Use This

Other skills can reference this skill for tool guidance:

```markdown
# In another skill's SKILL.md

For guidance on which tool to use for file operations,
see the tools-expert skill reference sections:
- File operations: tools-skill/references/file_system_tools.md
- Shell commands: tools-skill/references/shell_commands.md
- Decision trees: tools-skill/references/tool_selection_guide.md
```

## Quick Reference

| Task | Tool | NOT This |
|------|------|----------|
| Read file | Read | Bash + cat |
| Write file | Write | Bash + echo |
| Edit file | Edit | Bash + sed |
| Find files | Glob | Bash + find |
| Search content | Grep | Bash + grep |
| Git operations | Bash | N/A |
| Package managers | Bash | N/A |

## Contents Overview

### SKILL.md
- Core principles
- Quick reference table
- Tool selection decision trees
- Common patterns
- Safety checklist
- Examples

### references/file_system_tools.md
- Read tool (parameters, examples, anti-patterns)
- Write tool (safety rules, best practices)
- Edit tool (exact matching, replace_all)
- Glob tool (pattern syntax, examples)
- Grep tool (output modes, regex, context lines)
- Tool comparison matrix
- Performance tips
- Common workflows

### references/jq_json_processor.md
- jq overview and when to use
- Basic syntax and options
- Core filters (., .field, .[], etc.)
- Common patterns (extract, filter, map, sort)
- Working with package.json
- Advanced filters (select, map, keys, length)
- Pipes and composition
- Conditionals and string operations
- API response processing
- Integration with other tools

### references/shell_commands.md
- When to use Bash
- Command chaining (&&, ;, ||, |)
- Quoting and escaping
- Working directory management
- Parallel vs sequential execution
- Background processes
- macOS-specific commands
- Git best practices
- npm/package manager patterns
- Error handling
- Security considerations

### references/tool_selection_guide.md
- Quick decision matrix
- Read vs cat comparison
- Write vs echo comparison
- Edit vs sed comparison
- Glob vs find comparison
- Grep vs grep comparison
- jq vs manual parse comparison
- Decision trees for each scenario (including JSON processing)
- Common scenarios and workflows
- Performance comparison
- Integration patterns
- Common mistakes and solutions

## Version History

- **1.1.0** (2025-10-30): Added jq JSON processor
  - Comprehensive jq reference (jq_json_processor.md)
  - JSON processing patterns and examples
  - jq vs manual parse decision trees
  - Integration with package.json workflows

- **1.0.0** (2025-10-30): Initial release
  - Comprehensive coverage of file system tools
  - Shell command best practices
  - Tool selection decision trees
  - Integration patterns and examples

## Related Skills

- **gemini-delegator**: Uses tools-expert for file discovery before delegation
- **vue3-expert-skill**: Can reference tools-expert for file operations
- Any skill needing file operations or command execution

## Contributing

To improve this skill:
1. Add new tools as they become available
2. Update examples with real-world patterns from this project
3. Add new decision trees for complex scenarios
4. Document new macOS utilities or shell commands
5. Update version number in SKILL.md frontmatter

---

**This is a foundational skill** - keep it up to date and accurate. Many other skills depend on it for correct tool usage!
