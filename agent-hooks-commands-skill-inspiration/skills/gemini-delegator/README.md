# Gemini Delegator Skill

A Claude Code skill that intelligently delegates  context heavy tasks to Gemini CLI for efficient large-scale code analysis, codebase reviews, and documentation processing.

## What It Does

When working with large codebases or multiple files, Claude Code automatically delegates the heavy lifting to Gemini CLI. Gemini reads and analyzes everything, then returns structured summaries that Claude Code uses to perform precise, focused implementation work.

**Think of it as:** Gemini reads the entire book, Claude Code writes the specific chapter you need.

## Why Use This?

- **Efficiency**: Gemini excels at processing large amounts of context quickly
- **Better Analysis**: Get comprehensive codebase insights without token limitations
- **Focused Implementation**: Claude Code receives actionable summaries and implements changes precisely
- **Automatic Detection**: The skill triggers automatically when needed

## When It Activates

The skill automatically delegates when:

- Single file exceeds **1000 lines**
- Analyzing **5+ files** simultaneously
- Total context exceeds **2000 lines**
- Processing large documentation (**>500 lines**)
- Performing codebase-wide analysis or refactoring
- Reviewing full directories or modules

**Does NOT delegate for:**
- Small focused tasks (<500 lines)
- Single file edits
- Quick fixes or targeted changes
- Real-time interactive coding

## Installation

### Prerequisites

1. **Gemini CLI** must be installed and authenticated
2. **Python 3.8+** 
3. Add this skill to your Claude Code skills directory

### Setup

```bash
# Install Gemini CLI (if not already installed)
pip install google-generativeai-cli

# Authenticate Gemini CLI
gemini auth

# Clone or add this skill to your skills directory
# Default: ~/.claude/skills/user/gemini-delegator/
```

## Usage

The skill works automatically when Claude Code detects a heavy context task. You don't need to invoke it manually.

### Example Scenarios

#### Large Codebase Review

```
You: "Analyze my Vue 3 app and suggest improvements"

Claude Code detects: 12 .vue files, 6 .js composables (2800 lines total)
→ Automatically delegates to Gemini
→ Receives structured analysis
→ Presents findings and implements improvements
```

#### Documentation Processing

```
You: "Read the API docs and help me implement authentication"

Claude Code detects: API_REFERENCE.md (1800 lines), AUTH_GUIDE.md (700 lines)
→ Delegates documentation reading to Gemini
→ Receives structured auth flow summary
→ Writes implementation code based on findings
```

#### Multi-File Code Review

```
You: "Review this PR for bugs and anti-patterns"

Claude Code detects: 15 changed files across Vue, JS, CSS
→ Delegates comprehensive review to Gemini
→ Receives specific issues with file locations
→ Fixes identified problems
```

## How It Works

### Workflow

1. **Detection**: Claude Code identifies a heavy context task
2. **Delegation**: Sends files and analysis prompt to Gemini via script
3. **Analysis**: Gemini processes everything and returns structured JSON
4. **Implementation**: Claude Code uses the summary for precise changes
5. **Verification**: Ensures changes align with analysis

### Output Structure

Gemini returns structured data including:

- **Overview**: High-level summary
- **Key Findings**: Important discoveries
- **File Structure**: Architecture overview
- **Recommendations**: Actionable suggestions
- **Areas of Concern**: Issues to address
- **Code Snippets**: Specific problems with fixes and locations

## Manual Usage (Advanced)

While the skill typically runs automatically, you can manually invoke the delegation script:

```bash
# Basic analysis
python scripts/delegate_to_gemini.py "Analyze for Vue 3 best practices" \
  --files src/**/*.vue src/**/*.js

# With custom focus
python scripts/delegate_to_gemini.py "Review for security issues" \
  --files components/*.vue api/*.js \
  --instructions "Focus on XSS vulnerabilities and input validation"

# Document processing
python scripts/delegate_to_gemini.py "Extract API authentication steps" \
  --files docs/API_REFERENCE.md docs/AUTH_GUIDE.md
```

## Configuration

The delegation script includes:

- **2-minute timeout** for analysis
- **Automatic error handling** with fallback responses
- **Glob pattern support** for file selection
- **JSON output parsing** with raw text fallback

## Best Practices

### Do:
- Let the skill auto-detect when to delegate
- Provide clear, specific analysis prompts
- Review Gemini's recommendations before implementing
- Use for exploratory analysis of unfamiliar codebases

### Don't:
- Force delegation for small, focused tasks
- Skip verification of Gemini's analysis
- Use for real-time interactive debugging
- Delegate when you need immediate, single-file changes

## Troubleshooting

### "Gemini CLI not found"
```bash
pip install google-generativeai-cli
gemini auth
```

### "Script timeout"
Large codebases may exceed 2-minute timeout. Try:
- Breaking analysis into smaller chunks
- Being more specific with file patterns
- Focusing on specific directories

### "Non-JSON response"
The script captures raw responses when Gemini doesn't return JSON. Claude Code will still process the text output.

## File Structure

```
gemini-delegator/
├── SKILL.md                          # Skill definition
├── README.md                         # This file
├── scripts/
│   └── delegate_to_gemini.py        # Delegation script
└── references/
    └── delegation_patterns.md        # Detailed patterns and examples
```

## Requirements

- Python 3.8 or higher
- Gemini CLI installed and authenticated


## Contributing

This skill is designed to work seamlessly with Claude Code. Improvements should:
- Maintain the automatic detection system
- Preserve structured JSON output format
- Include error handling for edge cases
- Document new delegation patterns


---

**Note**: Always verify Gemini's analysis before implementing changes. This skill augments Claude Code's capabilities but doesn't replace careful code review.