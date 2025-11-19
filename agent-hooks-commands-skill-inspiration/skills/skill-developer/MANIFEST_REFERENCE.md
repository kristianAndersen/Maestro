# Skill Manifest Reference - Complete Field Guide

**For**: Skill Developers
**Purpose**: Comprehensive reference for all manifest fields
**Architecture**: Maestro Marketplace

---

## Complete Schema

```json
{
  // Core Identity (REQUIRED)
  "name": "string",              // Lowercase-with-hyphens, max 64 chars
  "type": "string",              // "skill" or "micro-skill"
  "tier": number,                // 2 (skill) or 3 (micro-skill)
  "description": "string",       // 100-1000 chars, includes keywords
  "version": "string",           // Semantic versioning: "1.0.0"

  // Input/Output Specification (REQUIRED)
  "inputs": [...],               // Array of input parameter objects
  "outputs": [...],              // Array of output objects

  // Discovery & Routing (REQUIRED)
  "capabilities": [...],         // 5-10 freeform capability tags

  // Dependencies & Chaining (OPTIONAL)
  "dependencies": [...],         // Micro-skills this requires
  "suggestedNextSkills": [...],  // Workflow suggestions

  // Configuration (OPTIONAL)
  "errorHandling": {...},        // Error handling config (micro-skills)
  "estimatedComplexity": "string", // "low", "medium", "high"
  "author": "string",            // Creator/team name
  "tags": [...],                 // Additional categorization
  "metadata": {...}              // Custom metadata
}
```

---

## Core Identity Fields

### name (REQUIRED)

**Type**: `string`
**Format**: `lowercase-with-hyphens`
**Max Length**: 64 characters
**Validation**: `^[a-z][a-z0-9-]*$`

**Purpose**: Unique identifier for the skill in the registry.

**Rules**:
- Must be unique across all skills in the marketplace
- Start with lowercase letter
- Only lowercase letters, numbers, hyphens
- No spaces, underscores, or special characters
- Should be descriptive and memorable

**Examples**:
```json
✅ "code-analysis"
✅ "content-analysis"
✅ "data-validation"
✅ "read-file"

❌ "CodeAnalysis"         // No camelCase
❌ "code_analysis"        // No underscores
❌ "code analysis"        // No spaces
❌ "code-analysis-v2"     // No version in name
```

---

### type (REQUIRED)

**Type**: `string`
**Allowed Values**: `"skill"` or `"micro-skill"`

**Purpose**: Distinguish between orchestrators (skills) and executors (micro-skills).

**Rules**:
- Must match tier value
- `"skill"` → tier 2
- `"micro-skill"` → tier 3

**Examples**:
```json
// Tier 2 - Orchestrator
{
  "type": "skill",
  "tier": 2
}

// Tier 3 - Executor
{
  "type": "micro-skill",
  "tier": 3
}
```

---

### tier (REQUIRED)

**Type**: `number`
**Allowed Values**: `2` or `3`

**Purpose**: Indicate architectural tier in Maestro system.

**Tiers**:
- **Tier 1**: Maestro (Conductor) - Not in registry
- **Tier 2**: Skills (Orchestrators) - Domain expertise + chaining
- **Tier 3**: Micro-Skills (Musicians) - Single operations

**Rules**:
- Must be 2 or 3
- Must match type value
- Determines invocation pattern

**Examples**:
```json
// Skill (Orchestrator)
{
  "tier": 2,
  "type": "skill"
}

// Micro-Skill (Executor)
{
  "tier": 3,
  "type": "micro-skill"
}
```

---

### description (REQUIRED)

**Type**: `string`
**Length**: 100-1000 characters
**Importance**: ⭐⭐⭐ CRITICAL for discovery

**Purpose**: Enable semantic search and explain what skill does.

**Structure**:
```
[What it does] + [Domain expertise] + [Use cases] + [Keywords]
```

**Rules**:
- First 100 characters most important (shown in summaries)
- Include domain-specific terminology
- List concrete use cases
- Add search keywords users would type
- Be specific, not generic
- Focus on WHAT and WHY, not HOW

**Template**:
```
[Action verb] [domain] [objects] for [use cases].
Provides [expertise] including [specific capabilities].
Use when [triggers].
Handles [edge cases].
Keywords: [searchable terms].
```

**Examples**:

✅ **Good (code-analysis)**:
```json
"Analyzes JavaScript/TypeScript codebases for quality issues, code smells, and refactoring opportunities. Provides security audits (OWASP Top 10), complexity analysis (cyclomatic complexity), and best practices validation (SOLID principles). Use when reviewing code quality, detecting vulnerabilities, or assessing maintainability. Handles large codebases with incremental analysis. Keywords: code review, security audit, code quality, refactoring, static analysis, linting."
```

✅ **Good (read-file)**:
```json
"Reads file contents from disk with encoding detection and error recovery. Single-purpose micro-skill for file I/O operations. Handles binary detection, large files, locked files with automatic retry (exponential backoff). Returns content with metadata (size, encoding, modified date). Use for any file reading operation. Keywords: read, file, load, open, contents, I/O."
```

❌ **Bad**:
```json
"Helps with code stuff and analysis things."  // Too vague

"This skill analyzes code using various algorithms and techniques to detect problems and issues."  // Generic, no keywords

"A comprehensive solution for all your code analysis needs."  // Marketing speak, not specific
```

**Discovery Optimization**:
- First 100 chars appear in search results
- Put most important keywords early
- Include synonyms (code review, code analysis, static analysis)
- Add common search phrases
- Use domain vocabulary

---

### version (REQUIRED)

**Type**: `string`
**Format**: Semantic versioning `"MAJOR.MINOR.PATCH"`

**Purpose**: Track skill evolution and compatibility.

**Rules**:
- Follow semver: `"1.0.0"`, `"2.1.3"`, etc.
- Increment MAJOR for breaking changes
- Increment MINOR for new features
- Increment PATCH for bug fixes
- Start at `"1.0.0"` for production

**Examples**:
```json
"version": "1.0.0"    // Initial release
"version": "1.1.0"    // Added new capability
"version": "1.1.1"    // Fixed bug
"version": "2.0.0"    // Breaking change (manifest schema)
```

---

## Input/Output Specification

### inputs (REQUIRED)

**Type**: `array<InputObject>`
**Purpose**: Define parameters this skill accepts.

**InputObject Schema**:
```json
{
  "name": "string",         // Parameter name (camelCase)
  "type": "string",         // Data type
  "description": "string",  // What this parameter does
  "required": boolean,      // Is this mandatory?
  "default": any           // Default value (if not required)
}
```

**Supported Types**:
- `"string"` - Text value
- `"number"` - Numeric value
- `"boolean"` - True/false
- `"array<type>"` - Array of type (e.g., `"array<string>"`)
- `"object"` - JSON object
- `"file_path"` - Absolute file path
- `"array<file_path>"` - Multiple file paths
- `"structured_document"` - Rich document
- Custom types as needed

**Examples**:

**Skill Input (code-analysis)**:
```json
"inputs": [
  {
    "name": "file_paths",
    "type": "array<file_path>",
    "description": "Source files to analyze (supports glob patterns like **/*.js)",
    "required": true
  },
  {
    "name": "analysis_depth",
    "type": "string",
    "description": "Analysis level: 'quick' (syntax only), 'standard' (includes complexity), 'deep' (full analysis with suggestions)",
    "required": false,
    "default": "standard"
  },
  {
    "name": "focus_areas",
    "type": "array<string>",
    "description": "Specific areas to analyze: ['security', 'complexity', 'style', 'performance']",
    "required": false,
    "default": ["security", "complexity"]
  }
]
```

**Micro-Skill Input (read-file)**:
```json
"inputs": [
  {
    "name": "file_path",
    "type": "file_path",
    "description": "Absolute path to file to read",
    "required": true
  },
  {
    "name": "encoding",
    "type": "string",
    "description": "File encoding: 'utf-8', 'ascii', 'latin1', or 'auto' for detection",
    "required": false,
    "default": "utf-8"
  },
  {
    "name": "max_size",
    "type": "number",
    "description": "Maximum file size in bytes (error if exceeded)",
    "required": false
  }
]
```

**Best Practices**:
- Use clear, descriptive names
- Provide detailed descriptions with examples
- Specify default values for optional inputs
- List allowed values in description
- Use specific types (not just "string" for everything)

---

### outputs (REQUIRED)

**Type**: `array<OutputObject>`
**Purpose**: Define what this skill returns.

**OutputObject Schema**:
```json
{
  "name": "string",         // Output name (camelCase)
  "type": "string",         // Data type
  "description": "string"   // What this contains and format
}
```

**Examples**:

**Skill Output (code-analysis)**:
```json
"outputs": [
  {
    "name": "analysis_report",
    "type": "structured_document",
    "description": "Complete analysis with sections: summary (overall quality score), critical_issues (severity: critical with locations), high_priority (severity: high), recommendations (actionable fixes with examples), metrics (complexity, lines, files analyzed)"
  },
  {
    "name": "issue_list",
    "type": "array<object>",
    "description": "Array of issues with fields: severity ('critical'|'high'|'medium'|'low'), file (path), line (number), issue (description), recommendation (fix suggestion), example (code example)"
  },
  {
    "name": "metrics",
    "type": "object",
    "description": "Analysis metrics: total_files, total_lines, complexity_average, issues_count_by_severity, analysis_duration"
  }
]
```

**Micro-Skill Output (read-file)**:
```json
"outputs": [
  {
    "name": "content",
    "type": "string",
    "description": "File contents as string (or error if read failed)"
  },
  {
    "name": "metadata",
    "type": "object",
    "description": "File metadata: size (bytes), encoding (detected), modified_date (ISO string), is_binary (boolean)"
  },
  {
    "name": "success",
    "type": "boolean",
    "description": "True if read succeeded, false if error occurred"
  },
  {
    "name": "error",
    "type": "object",
    "description": "Error details if success=false: code (error code), message (human readable), context (diagnostic info, suggestions)"
  }
]
```

**Best Practices**:
- Describe exact format and structure
- For objects/arrays, list fields
- For structured documents, list sections
- Always include success/error indicators
- Provide examples in description

---

## Discovery & Routing

### capabilities (REQUIRED)

**Type**: `array<string>`
**Count**: 5-10 tags recommended
**Importance**: ⭐⭐⭐ CRITICAL for discovery

**Purpose**: Enable multi-index lookup and semantic search.

**Strategy**:
```
Primary capability + Domain terms + Use case keywords + Synonyms + Related terms
```

**Rules**:
- 5-10 capabilities is optimal
- Use lowercase-with-hyphens
- Be specific (not generic)
- Include synonyms
- Add common search terms
- Think about what users would search for

**Examples**:

**code-analysis**:
```json
"capabilities": [
  "code-analysis",              // Primary
  "security-audit",             // Domain term
  "quality-assessment",         // Domain term
  "vulnerability-scanning",     // Use case
  "refactoring-recommendations", // Use case
  "code-smell-detection",       // Specific capability
  "complexity-analysis",        // Specific capability
  "best-practices",             // General term
  "static-analysis",            // Synonym
  "code-review"                 // Synonym
]
```

**content-analysis**:
```json
"capabilities": [
  "content-analysis",
  "brand-voice-audit",
  "seo-optimization",
  "readability-assessment",
  "tone-detection",
  "messaging-effectiveness",
  "audience-engagement",
  "content-quality"
]
```

**read-file**:
```json
"capabilities": [
  "file-operations",
  "read",
  "load-file",
  "file-io",
  "encoding-detection"
]
```

**Discovery Impact**:
```javascript
// User query: "check code security"
// Registry matches against:
capabilities.includes("security") → ✅ code-analysis (high score)
capabilities.includes("code") → ✅ code-analysis (medium score)

// User query: "improve brand voice"
capabilities.includes("brand-voice") → ✅ content-analysis (high score)
capabilities.includes("messaging") → ✅ content-analysis (medium score)
```

**Common Mistakes**:
```json
❌ ["skill", "analysis", "tool"]           // Too generic
❌ ["a", "b", "c"]                         // Not descriptive
❌ ["code-analysis-security-quality-..."] // Single long string
✅ ["code-analysis", "security", "quality"] // Proper tags
```

---

## Dependencies & Chaining

### dependencies (OPTIONAL)

**Type**: `array<string>`
**Purpose**: List micro-skills this skill requires.

**Format**: Array of micro-skill names

**Examples**:
```json
// Skill dependencies
"dependencies": [
  "read-file",
  "write-file",
  "search-codebase",
  "parse-ast",
  "detect-patterns"
]

// Micro-skill dependencies (rare)
"dependencies": [
  "read-file"  // If composite micro-skill
]
```

**Usage**:
- Registry can check if all dependencies available
- Documentation can show required micro-skills
- Maestro can verify chain completeness

---

### suggestedNextSkills (OPTIONAL)

**Type**: `array<SuggestionObject>`
**Purpose**: Declarative workflow suggestions.

**SuggestionObject Schema**:
```json
{
  "skill": "string",         // Next skill name
  "reason": "string",        // Why this is suggested
  "priority": "string",      // "high", "medium", "low"
  "condition": "string",     // Optional: when to suggest
  "params": object           // Optional: parameter template
}
```

**Examples**:
```json
"suggestedNextSkills": [
  {
    "skill": "data-validation",
    "reason": "Validate parsed data for quality and completeness",
    "priority": "high",
    "condition": "parsing_successful && record_count > 0"
  },
  {
    "skill": "content-analysis",
    "reason": "Analyze extracted content for brand voice",
    "priority": "medium",
    "params": {
      "content": "{{ current_result.extracted_text }}",
      "focus": "brand-voice"
    }
  }
]
```

---

## Configuration

### errorHandling (OPTIONAL - Micro-Skills)

**Type**: `object`
**Purpose**: Configure autonomous retry behavior.

**Schema**:
```json
{
  "retriableErrors": ["ERROR_CODE_1", "ERROR_CODE_2"],
  "retryStrategy": "exponential" | "linear" | "immediate",
  "maxAttempts": number,
  "backoffConfig": {
    "initialDelay": number,  // milliseconds
    "maxDelay": number      // milliseconds
  }
}
```

**Example**:
```json
"errorHandling": {
  "retriableErrors": ["EBUSY", "EAGAIN", "ETIMEDOUT"],
  "retryStrategy": "exponential",
  "maxAttempts": 3,
  "backoffConfig": {
    "initialDelay": 100,
    "maxDelay": 1000
  }
}
```

---

### estimatedComplexity (OPTIONAL)

**Type**: `string`
**Allowed Values**: `"low"`, `"medium"`, `"high"`

**Purpose**: Set expectations for execution time/resources.

**Guidelines**:
- `"low"`: < 1 second, simple operation
- `"medium"`: 1-10 seconds, moderate processing
- `"high"`: > 10 seconds, complex analysis

**Examples**:
```json
"estimatedComplexity": "low"     // read-file
"estimatedComplexity": "medium"  // data-validation
"estimatedComplexity": "high"    // code-analysis (large codebase)
```

---

### metadata (OPTIONAL)

**Type**: `object`
**Purpose**: Custom metadata for documentation, tracking.

**Common Fields**:
```json
"metadata": {
  "lastUpdated": "2025-11-13",
  "documentation": "SKILL.md",
  "references": [
    "reference1.md",
    "reference2.md"
  ],
  "changelog": "CHANGELOG.md",
  "tests": "TEST_SCENARIOS.md"
}
```

---

## Validation

### Manifest Validation Checklist

Use this before submitting:

```bash
# 1. JSON syntax valid
jq . skill-name.skill.json

# 2. Required fields present
jq 'has("name") and has("type") and has("tier") and has("description") and has("inputs") and has("outputs") and has("capabilities")' skill-name.skill.json

# 3. Type/tier consistency
jq 'if .type == "skill" then .tier == 2 else .tier == 3 end' skill-name.skill.json

# 4. Description length
jq '.description | length' skill-name.skill.json
# Should be 100-1000

# 5. Capabilities count
jq '.capabilities | length' skill-name.skill.json
# Should be 5-10
```

### Common Validation Errors

**Error**: `name` contains uppercase
```json
❌ "name": "CodeAnalysis"
✅ "name": "code-analysis"
```

**Error**: `type` and `tier` mismatch
```json
❌ { "type": "skill", "tier": 3 }
✅ { "type": "skill", "tier": 2 }
```

**Error**: `description` too short
```json
❌ "description": "Analyzes code"  // 14 chars
✅ "description": "Analyzes JavaScript/TypeScript codebases for quality issues..."  // 100+ chars
```

**Error**: `capabilities` too generic
```json
❌ "capabilities": ["tool", "analysis"]
✅ "capabilities": ["code-analysis", "security-audit", "quality-assessment"]
```

---

## Complete Examples

### Tier 2 Skill (code-analysis)

See: `.claude/skills/code-analysis/code-analysis.skill.json`

### Tier 3 Micro-Skill (read-file)

See: `.claude/skills/micro-skills/read-file/read-file.skill.json`

---

**Document Status**: Complete Manifest Reference
**For**: Skill Developers
**Version**: 1.0
**Last Updated**: 2025-11-13
