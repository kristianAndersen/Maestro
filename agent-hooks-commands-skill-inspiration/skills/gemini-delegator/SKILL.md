---
name: gemini-delegator
description: Delegate heavy context tasks to Gemini CLI for large codebase analysis, multi-file reviews, and long document processing. Use when analyzing 5+ files, files over 1000 lines, or total context over 2000 lines. Triggers on keywords like large codebase, multi-file analysis, documentation processing, code review at scale.
version: 2.0.0
dependencies: python>=3.8, gemini-cli
---

# Gemini Delegator - Maestro Edition

Specialized executor for delegating context-heavy analysis tasks to Gemini CLI. Integrates with Maestro's 4-D methodology to efficiently handle large-scale code analysis, multi-file reviews, and documentation processing.

## Purpose

When Maestro orchestrates work involving large codebases or extensive documentation, this skill delegates the heavy context processing to Gemini CLI while maintaining Maestro's excellence standards and verification requirements.

**Division of Labor:**
- **Gemini**: Reads entire books, processes massive context, broad pattern detection
- **Maestro/Claude**: Precise implementation, interactive refinement, quality gates
- **This Skill**: Orchestrates the handoff between them

---

## Integration with Maestro

### DELEGATION (Maestro → Gemini)
This skill receives orchestration from Maestro when:
- Task involves analyzing 5+ files simultaneously
- Single file exceeds 1000 lines
- Total context exceeds 2000 lines
- Large documentation files (>500 lines)

**Delegation Direction:**
- **Product**: What analysis Gemini should produce (architecture review, security audit, etc.)
- **Process**: How to structure the analysis (focus areas, output format)
- **Performance**: What constitutes successful analysis (structured findings, actionable recommendations)

### DESCRIPTION (This Skill → Gemini)
Skill translates Maestro's direction into structured Gemini prompts:
- Clear analysis objectives
- Specific focus areas
- Required output structure (JSON format)
- File scope and boundaries

### DISCERNMENT (Gemini Response → Evaluation)
Gemini's analysis returns for evaluation:
- Structured JSON with findings
- Specific file locations and line ranges
- Actionable recommendations
- Areas of concern with evidence

**Quality Check:** Maestro evaluates whether Gemini's analysis provides sufficient actionable intelligence before proceeding to implementation.

### DILIGENCE (Implementation → Verification)
After implementation based on Gemini's analysis:
- Verify changes align with recommendations
- Test that issues are actually resolved
- Evidence-based confirmation (not assumptions)
- Iterate if gaps exist

---

## When to Use This Skill

### Automatic Delegation Triggers

**Large Files:**
- Single file > 1000 lines
- Complex nested structures requiring full context
- Large configuration files

**Multi-File Analysis:**
- Analyzing 5+ files simultaneously
- Codebase-wide refactoring planning
- Cross-file dependency analysis
- Total lines > 2000 across files

**Documentation Processing:**
- Large markdown documentation (>500 lines)
- Multiple documentation files
- Technical specifications and API docs

**Code Review at Scale:**
- Pull requests with 10+ files
- Full directory/module review
- Security audits across codebase
- Architecture reviews

### Do NOT Delegate For

- Small focused tasks (<500 lines total)
- Single file edits
- Quick fixes or targeted changes
- Real-time interactive coding
- Tasks requiring immediate back-and-forth

**Maestro Principle:** Delegate the heavy reading, not the precise execution.

---

## Excellence Standards

This skill upholds Maestro's standards through:

**Structured Output:**
- Gemini returns JSON (not free-form text)
- Specific file paths and line ranges
- Actionable recommendations (not vague observations)
- Evidence-backed findings

**Verification Requirements:**
- Never blindly implement Gemini's suggestions
- Verify recommendations align with project context
- Test that fixes actually resolve issues
- Evidence of success required

**Iterative Refinement:**
- If Gemini's analysis is incomplete, re-delegate with better focus
- If implementation reveals gaps, request targeted follow-up analysis
- No "good enough" - iterate until right

---

## Core Workflow

### 1. Detection Phase

Claude Code (via Maestro) detects heavy context task:

```
Analyzing request...
- File count: 12 files
- Total lines: 2800 lines
- Complexity: Cross-file dependencies

→ Triggers gemini-delegator skill
```

### 2. Delegation Phase

Inform user and delegate:

```
"This involves 12 files (2800 lines). Delegating analysis to Gemini for comprehensive review..."
```

Execute delegation script:

```bash
python scripts/delegate_to_gemini.py \
  "Analyze Vue 3 app architecture and suggest improvements" \
  --files src/**/*.vue src/composables/*.js \
  --instructions "Focus on Composition API patterns, component structure, and reactivity"
```

### 3. Analysis Phase

Gemini processes files and returns structured JSON:

```json
{
  "overview": "Vue 3 app with 12 components...",
  "key_findings": [
    "Inconsistent Composition API usage",
    "3 components missing proper reactive unwrapping"
  ],
  "recommendations": [
    "Standardize composable patterns",
    "Add toRefs() in ComponentA.vue line 45"
  ],
  "code_snippets": [
    {
      "file": "src/components/ComponentA.vue",
      "line_range": "45-50",
      "issue": "Destructured props lose reactivity",
      "suggestion": "Use toRefs(props) before destructuring"
    }
  ]
}
```

### 4. Evaluation Phase (4-D Discernment)

Maestro evaluates Gemini's output:
- ✅ Structured findings with specific locations
- ✅ Actionable recommendations
- ✅ Evidence-backed concerns
- ✅ Clear implementation path

**Decision:** Proceed with implementation

### 5. Implementation Phase

Based on Gemini's structured analysis, precise changes:

```
Implementing recommendations:
1. ComponentA.vue:45 - Add toRefs() for reactive props
2. ComponentB.vue:78 - Standardize composable pattern
3. ...
```

### 6. Verification Phase (4-D Diligence)

Evidence-based verification:
- Run tests: ✅ All passing
- Check reactivity: ✅ Props reactive as expected
- Code review: ✅ Patterns consistent

**Result:** Changes verified, implementation complete

---

## Using the Delegation Script

### Basic Usage

```bash
python scripts/delegate_to_gemini.py \
  "Your analysis prompt" \
  --files path/to/files/*.ext
```

### With Custom Focus

```bash
python scripts/delegate_to_gemini.py \
  "Review for security issues" \
  --files components/*.vue api/*.js \
  --instructions "Focus on XSS vulnerabilities and input validation"
```

### Documentation Processing

```bash
python scripts/delegate_to_gemini.py \
  "Extract API authentication implementation steps" \
  --files docs/API_REFERENCE.md docs/AUTH_GUIDE.md
```

---

## Output Format

Gemini returns structured JSON:

```typescript
{
  overview: string;              // High-level summary
  key_findings: string[];        // Important discoveries
  file_structure: {              // Architecture overview
    description: string;
    main_components: string[];
  };
  recommendations: string[];     // Actionable suggestions
  areas_of_concern: string[];    // Issues to address
  code_snippets: Array<{         // Specific problems with fixes
    file: string;
    line_range: string;
    issue: string;
    suggestion: string;
  }>;
}
```

**Script Output:** Formatted summary highlighting actionable items

---

## Examples

### Example 1: Large Codebase Review

**User:** "Analyze my Vue 3 app and suggest improvements"

**Detection:**
- 12 .vue files
- 6 .js composables
- Total: 2800 lines
- → Triggers gemini-delegator

**Delegation:**
```bash
python scripts/delegate_to_gemini.py \
  "Analyze Vue 3 app architecture and suggest improvements" \
  --files src/**/*.vue src/composables/*.js \
  --instructions "Focus on Composition API patterns and component structure"
```

**Result:** Gemini summary with specific findings → Maestro evaluates → Claude implements improvements → Verify changes

### Example 2: Documentation Processing

**User:** "Read the API docs and help me implement authentication"

**Detection:**
- API_REFERENCE.md (1800 lines)
- AUTH_GUIDE.md (700 lines)
- → Triggers gemini-delegator

**Delegation:**
```bash
python scripts/delegate_to_gemini.py \
  "Extract authentication implementation details and flow" \
  --files docs/*.md
```

**Result:** Structured auth flow summary → Maestro validates understanding → Claude writes implementation → Test authentication

### Example 3: Code Review at Scale

**User:** "Review this PR for bugs and anti-patterns"

**Detection:**
- 15 changed files
- Mix of Vue, JS, CSS
- → Triggers gemini-delegator

**Delegation:**
```bash
python scripts/delegate_to_gemini.py \
  "Code review for bugs, anti-patterns, security issues" \
  --files <changed-files> \
  --instructions "Pay attention to Vue reactivity and XSS"
```

**Result:** Gemini analysis with specific file locations → Maestro reviews findings → Claude fixes identified issues → Verify fixes work

---

## Requirements

**Dependencies:**
- Python 3.8 or higher
- Gemini CLI installed and authenticated
- `scripts/delegate_to_gemini.py` in skill directory

**Setup:**
```bash
# Install Gemini CLI
pip install google-generativeai-cli

# Authenticate
gemini auth

# Verify
gemini --version
```

**Configuration:**
- Script has 2-minute timeout for analysis
- Automatic error handling with fallback
- Glob patterns supported for file selection
- JSON output parsing with raw text fallback

---

## Advanced Patterns

For detailed delegation patterns, see [delegation_patterns.md](references/delegation_patterns.md) which covers:
- Detailed delegation scenarios
- Output format specifications
- Integration patterns with Maestro/Claude
- When NOT to delegate
- Troubleshooting

---

## Best Practices

### Maestro-Aligned Practices

**Do:**
- ✅ Let skill auto-detect when to delegate
- ✅ Provide clear, specific analysis prompts to Gemini
- ✅ Evaluate Gemini's recommendations through 4-D lens before implementing
- ✅ Verify with evidence (tests, builds, manual checks)
- ✅ Iterate if analysis is incomplete or implementation reveals gaps

**Don't:**
- ❌ Force delegation for small, focused tasks
- ❌ Skip Maestro's evaluation of Gemini's output
- ❌ Implement recommendations blindly without verification
- ❌ Use for real-time interactive debugging
- ❌ Delegate when immediate single-file changes needed

---

## Troubleshooting

### "Gemini CLI not found"
```bash
pip install google-generativeai-cli
gemini auth
```

### "Script timeout"
Large codebases may exceed 2-minute timeout:
- Break analysis into smaller chunks
- Be more specific with file patterns
- Focus on specific directories
- Consider multiple targeted delegations

### "Non-JSON response"
Script captures raw responses when Gemini doesn't return JSON:
- Review raw output in script response
- Reformulate prompt for better structure
- Add more specific instructions
- Claude will still process text output

### "Analysis incomplete"
If Gemini's analysis misses key areas:
- Re-delegate with more specific focus
- Provide additional context in instructions
- Split into multiple targeted analyses
- This is iterative - refine until complete

---

## Notes

**Verification is Mandatory:**
- Always verify Gemini's recommendations before implementing
- Test that fixes actually work
- Evidence over assertions

**Error Handling:**
- Script handles errors gracefully with fallback responses
- Non-JSON responses captured as raw text
- Timeout protection (2 minutes max)

**File Selection:**
- Multiple files: space-separated arguments
- Glob patterns supported: `src/**/*.vue`
- Specific files: full paths

---

**Skill Status**: Maestro Edition - 4-D integrated, evidence-driven ✅
**Line Count**: < 500 (following 500-line rule) ✅
**Philosophy**: Gemini reads the book, Maestro/Claude writes the chapter you need ✅

**For detailed patterns:** See `references/delegation_patterns.md`
