# Orchestrator Workflow Enforcement Hooks

## Overview

These hooks enforce the mandatory workflow patterns defined in the orchestrator agent, ensuring proper delegation and quality assessment. They transform the orchestrator's workflow from guidelines into deterministic requirements.

## Hooks Implemented

### 1. Delegation Enforcement (PreToolUse)
Ensures orchestrator uses proper delegation workflow before executing work directly.

### 2. 4D Evaluation Quality Gate (SubagentStop)
Ensures all agents pass completed work through quality assessment before delivering results.

## Hook Configuration

### Hook 1: Delegation Enforcement
- **Type**: PreToolUse
- **Trigger**: Before orchestrator uses Write/Edit/Task tools
- **Action**: Verify delegation workflow was followed, block if skipped

### Hook 2: 4D Evaluation Quality Gate
- **Type**: SubagentStop
- **Trigger**: When any subagent completes its work
- **Action**: Verify 4D evaluation was performed, block if missing

## Files

1. **`.claude/hooks/enforce-delegation.sh`** - Delegation enforcement script
2. **`.claude/hooks/enforce-4d-evaluation.sh`** - Quality gate enforcement script
3. **`.claude/settings.local.json`** - Hook registration (both hooks)
4. **`.claude/hooks/README.md`** - This documentation

## How They Work Together

```
User Request
     ↓
┌────────────────────────────────────┐
│  Orchestrator receives task        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  PreToolUse Hook (Delegation)      │
│  Checks: Did orchestrator consult  │
│  skill_delegator / agent_delegator?│
└────────────┬───────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
   BLOCK          ALLOW
   (Fix it)    (Continue)
                   │
                   ▼
┌────────────────────────────────────┐
│  Orchestrator delegates to agent   │
│  Agent executes work               │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  SubagentStop Hook (Quality Gate)  │
│  Checks: Did agent run 4D eval?    │
└────────────┬───────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
   BLOCK          ALLOW
   (Evaluate)  (Deliver)
```

## Hook 1: Delegation Enforcement

### Detection Logic

Analyzes session messages to ensure orchestrator followed delegation workflow:

1. **Checks for skill_delegator activation** - Did it consult for knowledge?
2. **Checks for agent_delegator activation** - Did it consult for capabilities?
3. **Blocks direct execution** - Write/Edit without delegation

### Enforcement Rules

**HARD BLOCK** - Orchestrator attempts Write/Edit without consulting delegators:
- Returns `approval: "deny"`
- Provides detailed workflow instructions
- Forces orchestrator to follow proper delegation

**SOFT WARNING** - Orchestrator delegates with Task but skipped agent_delegator:
- Returns `approval: "ask"`
- User can approve if confident
- Encourages best practice

**ALWAYS ALLOW**:
- Delegating to skill_delegator or agent_delegator
- Using Read/Grep/Glob for analysis
- Using Skill tool to activate skills
- Using AskUserQuestion for clarification

## Hook 2: 4D Evaluation Quality Gate

### Detection Logic

The hook analyzes the agent's transcript to detect evidence of 4D evaluation:

1. **Task tool call to 4d_evaluation** - `subagent_type.*4d_evaluation`
2. **Verdict keywords** - `EXCELLENT` or `NEEDS REFINEMENT`
3. **Quality gate mentions** - Explicit references to quality gates

### Exemptions

The following agents are automatically exempted:

- **4d_evaluation** - The evaluator itself
- **Explore** - Read-only codebase exploration
- **claude-code-guide** - Documentation lookup

Additionally, pure read-only operations (Pattern E) are exempted based on transcript analysis.

### Blocking Behavior

If no evidence of 4D evaluation is found, the hook:

1. **Blocks agent completion** (exit code 2)
2. **Returns structured JSON** with:
   - `approval: "deny"`
   - Clear explanation of the violation
   - Detailed remediation instructions
   - Exact delegation format to use

### Approval Flow

```
┌─────────────────────────┐
│  Agent completes work   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  SubagentStop hook      │
│  (enforce-4d-eval.sh)   │
└───────────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────┐
│ Allow?  │    │ Deny?    │
└────┬────┘    └────┬─────┘
     │              │
     │              ▼
     │     ┌──────────────────┐
     │     │ Block with error │
     │     │ Provide guidance │
     │     └──────────────────┘
     │
     ▼
┌──────────────────┐
│ Continue normal  │
│ delivery to user │
└──────────────────┘
```

## Testing

### Test 1: Orchestrator Skips Delegation (Should Block)

```bash
# Ask orchestrator to create an agent
# Orchestrator tries to Write files directly
# PreToolUse hook should block and force delegation
```

**Expected**:
- PreToolUse hook blocks Write/Edit attempts
- Forces orchestrator to consult agent_delegator
- Orchestrator must delegate to agent_creator

### Test 2: Orchestrator Skips 4D Evaluation (Should Block)

```bash
# Ask orchestrator to create an agent
# Even if it delegates properly, if it skips evaluation
# SubagentStop hook should block completion
```

**Expected**:
- Work completes but SubagentStop hook blocks
- Forces orchestrator to run 4D evaluation
- Must iterate through healing loop if needed

### Test 3: Proper Workflow (Should Pass Both Hooks)

```bash
# Ask orchestrator to create an agent
# Orchestrator:
#   1. Consults agent_delegator ✓
#   2. Delegates to agent_creator ✓
#   3. Runs 4D evaluation ✓
#   4. Applies coaching if needed ✓
#   5. Delivers results ✓
```

**Expected**: Both hooks allow completion

### Test 4: Explore Agent (Should Allow - Exempted)

```bash
# Spawn Explore agent for read-only operation
# Hook should exempt and allow
```

**Expected**: SubagentStop hook allows without requiring evaluation

## Error Message Example

When blocked, the agent receives:

```
🚫 Quality Gate Violation: 4D Evaluation Missing

The orchestrator agent completed work without passing through
the required 4D evaluation quality gate.

According to the orchestrator workflow (Step 5):
- ALL finished work must pass through 4d_evaluation
- Only skip for: Pure read operations, informational queries

Required Action:
1. Delegate completed work to 4d_evaluation agent using Task tool
2. Include COMPLETE work product (not just metadata)
3. Apply coaching feedback if verdict is NEEDS REFINEMENT
4. Iterate through healing loop (max 3 attempts)
5. Only deliver after receiving EXCELLENT verdict OR max iterations

[... detailed delegation format ...]
```

## Benefits

1. **Enforces Quality Standards** - No work bypasses evaluation
2. **Provides Clear Guidance** - Detailed remediation instructions
3. **Automatic Enforcement** - No reliance on LLM memory
4. **Transparent Process** - Clear feedback on why blocked
5. **Smart Exemptions** - Doesn't block read-only operations

## Maintenance

### Adding Exemptions

Edit `enforce-4d-evaluation.sh` and add to `SKIP_AGENTS` array:

```bash
SKIP_AGENTS=("4d_evaluation" "Explore" "claude-code-guide" "your_new_agent")
```

### Adjusting Detection Patterns

Modify the grep patterns in the script:

```bash
HAS_4D_CALL=$(echo "$TRANSCRIPT" | grep -i "your_pattern" || true)
```

### Disabling the Hook

Remove or comment out the hook in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "SubagentStop": []
  }
}
```

## Troubleshooting

**Problem**: Hook blocks legitimate read-only operations
**Solution**: Add patterns to `IS_READ_ONLY` detection or add agent to exemptions

**Problem**: Hook doesn't detect 4D evaluation
**Solution**: Check that evaluation includes keywords: "EXCELLENT", "NEEDS REFINEMENT", or "quality gate"

**Problem**: Hook script not executing
**Solution**: Verify script is executable: `chmod +x .claude/hooks/enforce-4d-evaluation.sh`

## Integration with Orchestrator

This hook implements **Step 5 (Quality Gate)** of the orchestrator workflow:

```
orchestrator.md workflow:
├── Step 1: Analyze Request
├── Step 2: Route to Skills
├── Step 3: Route to Agents
├── Step 4: Execute
├── Step 5: Quality Gate (4D Evaluation) ← ENFORCED BY THIS HOOK
├── Step 6: Healing Loop
└── Step 7: Deliver Results
```

The hook ensures Step 5 cannot be skipped, making the quality gate truly mandatory rather than optional.
