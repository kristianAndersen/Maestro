---
description: Clear one-sentence purpose of what this command does
argument-hint: example-argument-name
---

[Opening instruction setting context and role. Example: "You are helping create a comprehensive development plan for..."]

## Instructions

1. **[Step 1 Name]** - [Action description]
   - [Sub-point if needed]
   - [Additional detail]
   - [Example or clarification]

2. **[Step 2 Name with $ARGUMENTS]** - [Action description that uses the user's input]
   - Create [thing] for: **$ARGUMENTS**
   - [How to use the arguments]
   - [What to generate]

3. **[Step 3 Name]** - [Action description]:
   - **[Sub-component A]**: [Details]
     - [Nested detail]
     - [Format or requirement]
   - **[Sub-component B]**: [Details]
     - [Nested detail]
     - [Format or requirement]
   - **[Sub-component C]**: [Details]

4. **[Step 4 Name]** - [Action description]:
   ```[format-type]
   [Example structure or template to follow]
   ```

5. **[Step 5 Name]** - [Action description]
   - [Requirement 1]
   - [Requirement 2]
   - [Quality standard]

## Output Format

[Describe the expected output structure]

### [Component 1]
```[format]
[Template or example]
```

### [Component 2]
```[format]
[Template or example]
```

## Quality Standards

- **[Standard 1]**: [Description of requirement]
- **[Standard 2]**: [Description of requirement]
- **[Standard 3]**: [Description of requirement]
- **[Standard 4]**: [Description of validation or check]

## File Organization

[If command creates files, describe the structure]

```
directory/
├── file1.ext           # Purpose
├── file2.ext           # Purpose
└── subdirectory/
    └── file3.ext       # Purpose
```

## Context References

[Optional section for related documentation]

- Check `REFERENCE_FILE.md` for [what information] (if exists)
- Consult `GUIDE_FILE.md` for [what guidance] (if exists)
- See `PATTERN_FILE.md` for [what patterns] (if exists)

## Examples

### Example 1: [Use Case Name]

**User Input**: `[command-name] example argument`

**Expected Output**:
```
[What should be generated]
```

### Example 2: [Another Use Case]

**User Input**: `[command-name] another example`

**Expected Output**:
```
[What should be generated]
```

## Notes

**Important Context**:
- [Important note 1]
- [Important note 2]
- [Usage guidance or limitation]

**When to Use This Command**:
- [Scenario 1]
- [Scenario 2]
- [Scenario 3]

**When NOT to Use This Command**:
- [Anti-pattern 1]
- [Anti-pattern 2]

---

## Command Design Checklist

When creating a command, ensure:

- [ ] Clear description in YAML frontmatter
- [ ] Helpful argument-hint provided
- [ ] Step-by-step instructions are explicit
- [ ] $ARGUMENTS placeholder used appropriately
- [ ] Output format clearly specified
- [ ] Quality standards defined
- [ ] Examples provided
- [ ] Context references included (if applicable)
- [ ] Notes section explains when to use

---

## Template Variables

**$ARGUMENTS**: Replaced with user's input after command name
- Example: `/command-name my-feature` → $ARGUMENTS = "my-feature"
- Use in instructions: "Create plan for: $ARGUMENTS"
- Use in output: "# Implementation Plan: $ARGUMENTS"

**Other Conventions**:
- `[PLACEHOLDER]`: Indicates where dynamic content goes
- `**Bold**`: Emphasizes important terms or sections
- Code blocks: Show exact format to follow
- Bullet lists: Break down complex steps

---

## Command Types & Patterns

### Planning Commands
Purpose: Create structured plans or documentation
Pattern:
1. Analyze the request
2. Create directory structure
3. Generate multiple related files
4. Include timestamps and metadata

Example: `/dev-docs`, `/write-plan`

### Execution Commands
Purpose: Perform specific operations
Pattern:
1. Parse parameters
2. Validate inputs
3. Execute operation
4. Report results

Example: `/run-tests`, `/build`

### Research Commands
Purpose: Gather and analyze information
Pattern:
1. Define research scope
2. Search/explore codebase
3. Analyze findings
4. Summarize results

Example: `/route-research`

### Documentation Commands
Purpose: Create or update documentation
Pattern:
1. Gather current state
2. Identify what needs documentation
3. Generate structured documentation
4. Validate completeness

Example: `/dev-docs-update`

---

## Best Practices

### Structure
- Start with context-setting instruction
- Use numbered steps for clarity
- Break complex steps into sub-bullets
- Provide examples in code blocks
- End with notes and guidance

### Language
- Use imperative voice ("Create", "Generate", "Analyze")
- Be specific about requirements
- Include "why" when helpful
- Provide examples for clarity

### Quality
- Define success criteria
- Specify output format explicitly
- Include validation steps
- Reference related documentation

### User Experience
- Make argument hints descriptive
- Provide multiple examples
- Explain when to use (and not use)
- Keep instructions scannable

---

**Template Version**: 1.0.0
**Last Updated**: 2025-11-18
