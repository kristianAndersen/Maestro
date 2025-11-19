---
name: skill-name                      # kebab-case, action-oriented
description: Comprehensive description with domain expertise, use cases, and capabilities. Include keywords for discovery.
type: skill
tier: 2
version: 1.0.0
model: sonnet                         # Sonnet for strategic thinking
allowed-tools: []                     # Usually empty, delegates to micro-skills
delegates-to: [micro-skill-1, micro-skill-2]
---

<objective>
**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: [What this skill specializes in - e.g., "File writing specialist with validation and safety"]
**Methodology**: Tactical 4-D
**AI Fluency Mode**: Augmentation (collaborative thinking partner)

[Explain what this skill orchestrates. Be specific about the operation type it handles and the domain expertise it provides.]

**Key Principle**: [Core design philosophy - e.g., "Safety first: validate, backup, write, verify"]

**Scope**: [What this skill covers and doesn't cover]
</objective>

<quick_start>
**Immediate Guidance**:
1. **Identify Goal**: What are you trying to achieve?
2. **Select Pattern**: Choose the workflow below that matches your goal.
3. **Execute**: Follow the steps, validating at each stage.

**Example Usage**:
```javascript
Skill(skill-name, {
  goal: "...",
  params: "..."
})
```
</quick_start>

<context>
**Integration with Maestro**:

### Receives from Maestro (Strategic Direction)
**Product**: What to [action]
**Process**: How to approach it (methodology, safety)
**Performance**: Success criteria and evidence requirements

### Returns to Maestro
Structured JSON with:
- `success`: boolean
- `summary`: Brief description
- `evidence`: Validation proofs
- `error`: Contextual error info (if failed)
</context>

<workflow>
### Tactical 4-D Implementation

#### 1. DELEGATION (Tactical) - Planning
[Explain how this skill decides which micro-skills to use and in what sequence]

**Standard Chain**:
1. `micro-skill-1` → [Purpose]
2. [Domain Logic] → [Strategic Decision]
3. `micro-skill-2` → [Purpose]

#### 2. DESCRIPTION (Tactical) - Configuration
**When delegating, provide clear specifications:**
- Define operation, parameters, and purpose.
- Set expected output structure.

#### 3. DISCERNMENT (Tactical) - Evaluation
**Evaluate each micro-skill result:**
- **Product**: Does output match requirements?
- **Process**: Was approach sound?
- **Performance**: Meets excellence standards?

**Decision Logic**:
- If pass → Proceed
- If recoverable → Apply recovery strategy
- If fatal → Escalate

#### 4. DILIGENCE (Tactical) - Recovery
**5-Level Error Recovery System**:
1. **Retry with Backoff** (Transient errors)
2. **Parameter Adjustment** (Configuration errors)
3. **Alternative Approach** (Method failure)
4. **Partial Success** (Non-critical failure)
5. **Escalate to Maestro** (Unrecoverable)
</workflow>

<advanced_features>
**Script Automation**:
- Use `scripts/` for deterministic logic (Python/Bash).
- Example: `python scripts/validator.py --input file.json`

**Template Generation**:
- Use `assets/` for boilerplate resources.
- Example: Read `assets/template.md` and fill placeholders.

**Wizard-Style Workflows**:
- For complex tasks, use explicit user confirmation gates between steps.
</advanced_features>

<success_criteria>
- [ ] All required micro-skills completed successfully
- [ ] Results validated against domain standards
- [ ] Strategic decisions documented and sound
- [ ] Error handling tested (if errors occurred)
- [ ] Evidence collected and included
- [ ] Output matches expected format
</success_criteria>

<reference_guides>
For detailed information, see:
- **Methodology**: [references/methodology.md](references/methodology.md)
- **Patterns**: [references/patterns.md](references/patterns.md)
</reference_guides>

<notes>
**This is a Tier 2 Skill (Orchestrator)**.
- Makes strategic decisions based on domain expertise.
- Orchestrates multiple micro-skills.
- Implements full Tactical 4-D methodology.
</notes>
