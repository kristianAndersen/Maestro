#!/bin/bash
# Hook: SubagentStop - Enforce 4D Evaluation Quality Gate
# This hook ensures agents complete 4D evaluation before delivering results

# Read JSON input from stdin
INPUT=$(cat)

# Extract agent type and transcript
AGENT_TYPE=$(echo "$INPUT" | jq -r '.subagent_type // "unknown"')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript // ""')

# Skip enforcement for specific agent types that don't need evaluation
SKIP_AGENTS=("4d_evaluation" "Explore" "claude-code-guide")
for skip in "${SKIP_AGENTS[@]}"; do
  if [[ "$AGENT_TYPE" == "$skip" ]]; then
    # Allow these agents to complete without evaluation
    echo '{"approval": "allow"}'
    exit 0
  fi
done

# Check if transcript contains evidence of 4D evaluation
# Look for:
# 1. Task tool call to 4d_evaluation agent
# 2. Mentions of "EXCELLENT" or "NEEDS REFINEMENT" verdicts
# 3. Quality gate completion

HAS_4D_CALL=$(echo "$TRANSCRIPT" | grep -i "subagent_type.*4d_evaluation" || true)
HAS_VERDICT=$(echo "$TRANSCRIPT" | grep -iE "(verdict.*EXCELLENT|verdict.*NEEDS REFINEMENT)" || true)
HAS_QUALITY_GATE=$(echo "$TRANSCRIPT" | grep -i "quality gate" || true)

# If any evidence of 4D evaluation exists, allow completion
if [[ -n "$HAS_4D_CALL" ]] || [[ -n "$HAS_VERDICT" ]] || [[ -n "$HAS_QUALITY_GATE" ]]; then
  echo '{"approval": "allow"}'
  exit 0
fi

# Check if this is a read-only operation (Pattern E)
IS_READ_ONLY=$(echo "$TRANSCRIPT" | grep -iE "(read.*(file|config|documentation)|informational.*(query|request)|no.*(deliverable|implementation))" || true)

if [[ -n "$IS_READ_ONLY" ]]; then
  # Pattern E: Read-only operations don't need quality gate
  echo '{"approval": "allow"}'
  exit 0
fi

# No evidence of 4D evaluation found - BLOCK and provide feedback
cat <<EOF
{
  "approval": "deny",
  "explanation": "🚫 Quality Gate Violation: 4D Evaluation Missing",
  "systemMessage": "**MANDATORY QUALITY GATE FAILURE**

The $AGENT_TYPE agent completed work without passing through the required 4D evaluation quality gate.

According to the orchestrator workflow (Step 5):
- **ALL finished work must pass through 4d_evaluation**
- Only skip for: Pure read operations, informational queries

**Required Action:**
1. Delegate completed work to 4d_evaluation agent using Task tool
2. Include COMPLETE work product (not just metadata)
3. Apply coaching feedback if verdict is NEEDS REFINEMENT
4. Iterate through healing loop (max 3 attempts)
5. Only deliver after receiving EXCELLENT verdict OR max iterations

**Delegation Format:**
\`\`\`
Task tool with subagent_type='4d_evaluation' and prompt:
PRODUCT:
- Task: Evaluate {description}
- Original Requirement: {what was requested}
- Complete Work Product: {PASTE FULL OUTPUT HERE}
- Expected: Quality assessment with verdict

PROCESS:
1. Activate 4d_evaluation skill
2. Examine complete work product using 4D framework
3. Assess Product, Process, Performance dimensions
4. Return verdict with evidence and coaching

PERFORMANCE:
- Evidence-based assessment
- All three dimensions evaluated
- Constructive coaching if NEEDS REFINEMENT
\`\`\`

**This is not optional.** Resume the agent and complete the quality gate process."
}
EOF

exit 2
