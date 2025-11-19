---
name: {{skill_name}}
description: {{skill_description}}
type: skill
tier: 2
version: 1.0.0
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
---

# {{skill_title}} - Tactical Orchestrator

**Domain**: [TODO: Specify the domain, e.g., Code Analysis, Marketing Strategy, Data Processing]
**Expertise**: [TODO: Detail the specific domain knowledge this skill provides]
**Role**: Section Leader - Orchestrates micro-skills using Tactical 4-D methodology

---

## Purpose

{{skill_description}}

**What Maestro Delegates:**
- [TODO: Describe the strategic goal or outcome Maestro expects from this skill]
- [TODO: Explain the type of work this skill handles, e.g., "analyzing code for vulnerabilities"]

**What This Skill Delivers:**
- [TODO: List the specific outputs and results, e.g., "a security audit report"]
- [TODO: Describe the quality standards met, e.g., "actionable recommendations, OWASP Top 10 compliance"]

---

## Integration with Maestro

### Receives Strategic Direction

When Maestro delegates to this skill, you receive:

**Product (What to accomplish):**
- Goal: [TODO: What needs to be built/analyzed/created]
- Expected Outcome: [TODO: Deliverable format and content]
- Acceptance Criteria: [TODO: Standards for success]
- Constraints: [TODO: Limitations and requirements]

**Process (How to approach it):**
- Approach: [TODO: Strategic guidance on methodology]
- Considerations: [TODO: Important factors to account for]
- Patterns: [TODO: Existing patterns to follow]

**Performance (Quality expectations):**
- Standards: [TODO: Excellence criteria]
- Verification: [TODO: How to prove correctness]
- Documentation: [TODO: Communication expectations]

---

## Tactical 4-D Methodology

This skill operates as an **orchestrator** using the Tactical 4-D framework:

### 1. DELEGATION (Tactical) - Micro-Skill Selection

**Your responsibility:** Plan which micro-skills to chain and in what sequence.

**Planning Process:**
1. Analyze the strategic goal from Maestro
2. Break down into tactical steps
3. Identify required micro-skills for each step
4. Plan the execution sequence
5. Prepare for potential failure points

**Example Chain:**
```
Goal: [Strategic goal from Maestro]
  ↓
Tactical Plan:
  1. [micro-skill-1]: [What it does] → Output: [data type]
  2. [micro-skill-2]: Use output from step 1 → Output: [data type]
  3. [micro-skill-3]: Process combined data → Output: [final result]
  4. [micro-skill-4]: Verify and validate → Output: [confirmation]
```

**Micro-Skills You'll Use:**
- [TODO: List micro-skills relevant to this skill's domain, e.g., `read-file`, `write-file`, `search-codebase`, `parse-json`]
- [Add domain-specific micro-skills]

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

**Your responsibility:** Provide clear parameters to each micro-skill.

**For Each Micro-Skill:**
- **Input parameters**: Exact values, paths, patterns
- **Expected output**: Format and content specification
- **Error handling**: What to do if it fails
- **Context**: Why this step is needed

**Example:**
```typescript
// Invoking read-file micro-skill
{{
  operation: "read-file",
  parameters: {{
    file_path: "/path/to/file.ts",
    encoding: "utf-8",
    purpose: "Extract function signatures for analysis"
  }},
  expected_output: {{
    type: "string",
    format: "file content",
    use: "Parse for function definitions"
  }}
}}
```

### 3. DISCERNMENT (Tactical) - Output Evaluation

**Your responsibility:** Evaluate each micro-skill output before proceeding.

**Evaluation Checklist:**

For each micro-skill output, check:
- ✓ **Correctness**: Is the output what we expected?
- ✓ **Completeness**: Is all required data present?
- ✓ **Quality**: Does it meet standards?
- ✓ **Compatibility**: Can next step use this output?

**Decision Points:**
```
Micro-skill returns output
  ↓
Evaluate output (Tactical Discernment)
  ↓
  ├─ If excellent → Proceed to next step
  ├─ If acceptable with issues → Note issues, continue with caution
  ├─ If failed → Apply error recovery (see Diligence)
  └─ If unexpected → Investigate and re-plan
```

**Document Issues:**
- Track what worked and what didn't
- Note any workarounds applied
- Prepare feedback for Maestro if strategic re-evaluation needed

### 4. DILIGENCE (Tactical) - Error Recovery & Re-Planning

**Your responsibility:** Handle errors autonomously within your domain expertise.

**Error Recovery Protocol:**

**Level 1: Retry with Adjustments**
```
Error: File not found at expected path
  ↓
Action: Try alternative paths
  - Check common locations
  - Search with broader pattern
  - Ask micro-skill to search instead
```

**Level 2: Alternative Approach**
```
Error: Parsing failed
  ↓
Action: Switch strategy
  - Try different parser
  - Use text-based extraction instead
  - Break into smaller chunks
```

**Level 3: Escalate to Maestro**
```
Error: All alternatives exhausted
  ↓
Action: Provide context and escalate
  - Summarize what was attempted
  - Explain why it failed
  - Suggest alternatives for Maestro to consider
```

**Re-Planning:**
- Adjust micro-skill sequence based on results
- Skip steps that become unnecessary
- Add steps if gaps discovered
- Maintain strategic goal throughout

---

## Execution Workflow

### Step-by-Step Process

**Phase 1: Receive & Analyze**
```
1. Receive strategic direction from Maestro
2. Analyze goal and requirements
3. Identify success criteria
4. Note constraints and considerations
```

**Phase 2: Plan Tactical Execution**
```
5. Break goal into tactical steps
6. Identify required micro-skills for each step
7. Plan execution sequence
8. Anticipate potential failure points
```

**Phase 3: Execute with Evaluation**
```
9. For each step in plan:
   a. Invoke appropriate micro-skill with parameters
   b. Evaluate output (Tactical Discernment)
   c. If success → proceed
   d. If failure → apply error recovery (see Diligence)
   e. Document results and issues
```

**Phase 4: Aggregate & Return**
```
10. Combine all micro-skill outputs
11. Apply domain expertise to synthesize results
12. Format according to Maestro's expectations
13. Provide evidence of success
14. Return to Maestro for Strategic Discernment
```

---

## Domain Expertise Application

**This skill provides expertise in:** [TODO: Specify the domain, e.g., API Security, Brand Voice Analysis, Financial Reporting]

**Knowledge Areas:**
- [TODO: List specific knowledge areas, e.g., OWASP Top 10, Tone of Voice Metrics, GAAP Standards]
- [Specific knowledge area 2]
- [Specific knowledge area 3]

**How Expertise Guides Decisions:**

**Micro-Skill Selection:**
- [TODO: Describe how domain insights influence which micro-skills to use]
- [TODO: Explain pattern recognition from domain experience]

**Output Evaluation:**
- [TODO: Detail domain-specific quality criteria]
- [TODO: Provide common patterns vs anti-patterns in this domain]

**Error Recovery:**
- [TODO: Describe domain-specific error patterns and known solutions]
- [TODO: List workarounds for common issues in this domain]

**Example:**
```
[TODO: Provide a concrete example showing domain expertise in action]

Scenario: [Specific situation]
Domain Knowledge Applied: [How expertise helps]
Decision Made: [What was chosen and why]
Result: [Outcome]
```

---

## Micro-Skill Invocation Patterns

### Pattern 1: Sequential Chain

**When to use:** Steps depend on previous results

```
Step 1: search-codebase → file_paths[]
Step 2: read-file(file_paths[0]) → content
Step 3: [process-content] → modified_content
Step 4: write-file(modified_content) → success
```

### Pattern 2: Parallel Execution

**When to use:** Independent operations

```
Parallel:
  - read-file(path1) → content1
  - read-file(path2) → content2
  - read-file(path3) → content3
Then:
  - [merge-content](content1, content2, content3) → combined
```

### Pattern 3: Conditional Chain

**When to use:** Different paths based on results

```
Step 1: [check-condition] → result
If result.exists:
  → [update-path]
Else:
  → [create-path]
Then:
  → [continue-with-result]
```

### Pattern 4: Loop with Evaluation

**When to use:** Process multiple items

```
For each item in collection:
  1. [process-item] → result
  2. Evaluate result (Tactical Discernment)
  3. If valid → add to output
  4. If invalid → log error and continue
```

---

## Error Handling Patterns

### Error Type 1: Resource Not Found

**Example:** File doesn't exist

**Recovery:**
```
1. Try alternative locations
2. Search with broader pattern
3. If not found anywhere:
   - Check if file is actually needed (maybe created later)
   - Escalate to Maestro if critical
```

### Error Type 2: Invalid Data

**Example:** Parsing fails

**Recovery:**
```
1. Validate input data
2. Try alternative parser
3. If still fails:
   - Use text-based extraction
   - Escalate with context
```

### Error Type 3: Operation Failed

**Example:** Write permission denied

**Recovery:**
```
1. Check permissions
2. Try alternative location
3. If still fails:
   - Document issue
   - Escalate with context
```

### Error Type 4: Unexpected State

**Example:** System in unexpected condition

**Recovery:**
```
1. Investigate current state
2. Adjust plan to work with current state
3. If cannot proceed:
   - Explain state to Maestro
   - Suggest resolution
```

---

## Communication with Maestro

### Progress Updates

Provide brief progress notes at key points:
```
"Analyzing [item]..."
"Found [number] instances, processing..."
"Applying [technique], validating results..."
```

### Error Escalation

When escalating, provide:
```
Issue: [What failed]
Attempted: [What recovery steps were tried]
Context: [Why this matters to strategic goal]
Recommendation: [Alternative approaches for Maestro to consider]
```

### Success Confirmation

Return structured results with evidence:
```
Result: [What was accomplished]
Evidence: [Tests passed, files created, validation successful]
Notes: [Any caveats or follow-up needed]
```

---

## Examples

### Example 1: [Typical Use Case]

**Maestro Delegates:**
```
Product: [Specific goal]
Process: [Approach guidance]
Performance: [Quality expectations]
```

**Tactical Execution:**
```
1. Plan:
   - Step 1: [micro-skill] → [output]
   - Step 2: [micro-skill] → [output]
   - Step 3: [micro-skill] → [output]

2. Execute:
   [Detailed execution steps with evaluations]

3. Return:
   Result: [Accomplished goal]
   Evidence: [Proof of success]
```

### Example 2: [Edge Case]

**Scenario:** [Unusual situation]

**Challenge:** [What made it difficult]

**Tactical 4-D Application:**
- **Delegation**: [How micro-skills were selected]
- **Description**: [How parameters were adjusted]
- **Discernment**: [How outputs were evaluated differently]
- **Diligence**: [What error recovery was needed]

**Outcome:** [How it was resolved]

---

## Best Practices

### Do's ✓

- ✓ **Plan before executing**: Know your micro-skill chain
- ✓ **Evaluate each output**: Don't assume success
- ✓ **Apply domain expertise**: Use your specialized knowledge
- ✓ **Handle errors autonomously**: Try recovery before escalating
- ✓ **Document issues**: Track what worked and what didn't
- ✓ **Return evidence**: Prove success, don't just claim it
- ✓ **Maintain strategic focus**: Remember Maestro's goal throughout

### Don'ts ✗

- ✗ **Don't skip evaluation**: Every micro-skill output needs checking
- ✗ **Don't escalate prematurely**: Try domain-specific solutions first
- ✗ **Don't ignore errors**: Handle them or document them
- ✗ **Don't lose context**: Remember why each step matters
- ✗ **Don't assume**: Verify outputs match expectations
- ✗ **Don't overcomplicate**: Simplest chain that works is best

---

## Success Criteria

This skill succeeds when:

- ✓ Strategic goal from Maestro is fully achieved
- ✓ All micro-skill outputs were evaluated before use
- ✓ Domain expertise was applied appropriately
- ✓ Errors were handled autonomously when possible
- ✓ Results are correct and complete
- ✓ Evidence of success is provided
- ✓ Code/content meets quality standards

---

## Notes

**Tactical 4-D Summary:**
- **Delegation (Tactical)**: Select and chain micro-skills
- **Description (Tactical)**: Provide clear parameters to micro-skills
- **Discernment (Tactical)**: Evaluate each micro-skill output
- **Diligence (Tactical)**: Error recovery and re-planning

**Remember:**
- You are the **orchestrator** (Section Leader)
- Micro-skills are the **musicians** (they execute)
- Maestro is the **conductor** (provides strategic direction)

**Your job:** Apply domain expertise to orchestrate micro-skills tactically, achieving the strategic goal Maestro delegated to you.

---

**Skill Status**: Template for Maestro Marketplace
**Architecture**: Three-Tier (Conductor → Orchestrator → Musicians)
**Methodology**: Tactical 4-D at Tier 2
**Line Count**: Aim for <500 lines in main SKILL.md (use references/ for deep dives)