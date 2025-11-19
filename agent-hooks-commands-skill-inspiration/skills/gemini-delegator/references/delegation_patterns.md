# Gemini Delegation Patterns

This document provides detailed patterns for when and how to delegate tasks to Gemini.

## Delegation Triggers

### Automatic Delegation Scenarios

**Large Single Files:**
- File > 1000 lines
- Complex nested structures
- Large configuration files

**Multiple File Analysis:**
- More than 5 files to analyze
- Codebase-wide refactoring
- Cross-file dependency analysis
- Total lines > 2000 across files

**Document Processing:**
- Large markdown documentation (>500 lines)
- Multiple documentation files
- PDF content extraction and analysis

**Code Review at Scale:**
- Pull request with 10+ files
- Full directory/module review
- Security audit across codebase

## Delegation Workflow

1. **Detect** - Automatically detect if task meets delegation criteria
2. **Delegate** - Send context to Gemini with structured prompt
3. **Summarize** - Gemini returns structured analysis
4. **Execute** - Claude Code uses summary to do precise work

## Usage Examples

### Example 1: Large Codebase Analysis

```bash
# User query: "Analyze this Vue 3 codebase and suggest improvements"

# Claude Code detects:
- 15 .vue files
- 8 .js files  
- Total: 3500 lines

# Automatically delegates:
python scripts/delegate_to_gemini.py \
  "Analyze this Vue 3 codebase for architecture, patterns, and improvement areas" \
  --files src/**/*.vue src/**/*.js \
  --instructions "Focus on Vue 3 Composition API usage and component structure"
```

### Example 2: Document Review

```bash
# User query: "Read these API docs and tell me how to implement authentication"

# Claude Code detects:
- API_REFERENCE.md (2000 lines)
- AUTH_GUIDE.md (800 lines)

# Delegates:
python scripts/delegate_to_gemini.py \
  "Extract authentication implementation steps from these API docs" \
  --files docs/API_REFERENCE.md docs/AUTH_GUIDE.md
```

### Example 3: Multi-file Code Review

```bash
# User query: "Review this PR for potential issues"

# Claude Code detects:
- 12 changed files
- Mix of Vue, JS, and CSS

# Delegates:
python scripts/delegate_to_gemini.py \
  "Code review: check for bugs, anti-patterns, and security issues" \
  --files components/*.vue utils/*.js styles/*.css \
  --instructions "Pay special attention to XSS vulnerabilities and Vue reactivity issues"
```

## Output Format

Gemini returns JSON with this structure:

```json
{
  "overview": "High-level summary",
  "key_findings": [
    "Important discovery 1",
    "Important discovery 2"
  ],
  "file_structure": {
    "description": "Architecture overview",
    "main_components": [
      "Component 1: purpose",
      "Component 2: purpose"
    ]
  },
  "recommendations": [
    "Actionable suggestion 1",
    "Actionable suggestion 2"
  ],
  "areas_of_concern": [
    "Issue 1 to address",
    "Issue 2 to address"
  ],
  "code_snippets": [
    {
      "file": "path/to/file.vue",
      "line_range": "45-60",
      "issue": "Description of problem",
      "suggestion": "How to fix it"
    }
  ]
}
```

## When NOT to Delegate

- Small files (<500 lines)
- Single focused task
- Quick edits or fixes
- User explicitly asks Claude to do it
- Real-time interactive coding

## Integration with Claude Code

After Gemini analysis, Claude Code should:

1. **Read the summary** - Understand high-level findings
2. **Ask clarifying questions** - If needed based on summary
3. **Execute precisely** - Make specific changes based on recommendations
4. **Verify** - Check that changes align with Gemini's analysis

The division of labor:
- **Gemini**: Heavy reading, pattern detection, broad analysis
- **Claude Code**: Precise implementation, code generation, interactive refinement
