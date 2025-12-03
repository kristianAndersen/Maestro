#!/bin/bash
# Hook: PreToolUse - Enforce Proper Delegation in Orchestrator
# Ensures orchestrator uses skill_delegator/agent_delegator before executing work

# Read JSON input from stdin
INPUT=$(cat)

# Extract relevant information
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
SUBAGENT_TYPE=$(echo "$INPUT" | jq -r '.subagent_type // ""')
SESSION_MESSAGES=$(echo "$INPUT" | jq -r '.session_messages // ""')

# Only enforce for orchestrator agent
if [[ "$SUBAGENT_TYPE" != "orchestrator" ]]; then
  # Not orchestrator, allow all tools
  echo '{"approval": "allow"}'
  exit 0
fi

# Count number of messages in session (rough startup detection)
MESSAGE_COUNT=$(echo "$SESSION_MESSAGES" | jq -r 'length // 0' 2>/dev/null || echo "0")

# Allow initial startup (first 6 messages minimum)
# Flow: spawn(1) -> intro(2) -> user prompt(3) -> orchestrator response(4) -> analysis(5-6)
# Orchestrator needs time to introduce itself, wait for user prompt, and begin analysis
if [[ "$MESSAGE_COUNT" -lt 6 ]]; then
  echo '{"approval": "allow"}'
  exit 0
fi

# Always allow read-only and delegation tools for orchestrator
# Orchestrator SHOULD use these tools - they're part of its job
case "$TOOL_NAME" in
  "Read"|"Grep"|"Glob"|"Bash(ls:*)"|"Bash(cat:*)"|"AskUserQuestion"|"Skill")
    echo '{"approval": "allow"}'
    exit 0
    ;;
esac

# Check if this is a work execution tool (Write, Edit, Task to non-delegator agents)
case "$TOOL_NAME" in
  "Write"|"Edit"|"NotebookEdit")
    # Orchestrator is trying to modify code directly
    # Check if it has consulted delegators first

    HAS_SKILL_DELEGATOR=$(echo "$SESSION_MESSAGES" | grep -i "skill_delegator" || true)
    HAS_AGENT_DELEGATOR=$(echo "$SESSION_MESSAGES" | grep -i "agent_delegator" || true)

    if [[ -z "$HAS_SKILL_DELEGATOR" ]] && [[ -z "$HAS_AGENT_DELEGATOR" ]]; then
      # Orchestrator is doing work without consulting delegators
      cat <<EOF
{
  "approval": "deny",
  "explanation": "⚠️ Orchestrator Workflow Violation: Missing Delegation Step",
  "systemMessage": "**ORCHESTRATOR DELEGATION REQUIREMENT**

The orchestrator is attempting to execute work directly without following its required delegation workflow.

**Orchestrator's Primary Role:**
The orchestrator is a COORDINATOR, not an executor. It must:
1. Analyze the request
2. **Consult skill_delegator** (for knowledge/patterns)
3. **Consult agent_delegator** (for capabilities/tools)
4. Delegate to appropriate skill + agent combination
5. Let specialists do the work

**Violation Detected:**
Orchestrator attempted to use $TOOL_NAME directly without:
- Activating skill_delegator to find relevant skills
- Activating agent_delegator to find appropriate agents

**Required Workflow (from orchestrator.md):**

For tasks requiring implementation:
1. Use Skill tool to activate 'skill_delegator'
2. Use Skill tool to activate recommended skill (if applicable)
3. Use Skill tool to activate 'agent_delegator'
4. Use Task tool to delegate to recommended agent
5. Let the specialist agent execute the work

**Example - Creating an Agent:**
- Request: Create an agent that uses fetch skill
- Step 1: Activate skill_delegator → No special skill needed
- Step 2: Activate agent_delegator → Identifies agent_creator
- Step 3: Delegate to agent_creator using Task tool
- Step 4: agent_creator does the work
- Step 5: Quality gate (4D evaluation)

**Orchestrator should ONLY use these tools directly:**
- Skill (for activating delegators and skills)
- Task (for delegating to agents)
- Read (for understanding context)
- Grep/Glob (for initial analysis)
- AskUserQuestion (for clarification)

**DO NOT use directly:**
- Write, Edit, NotebookEdit (that's for executor agents)
- Bash (unless trivial/read-only)
- WebFetch (activate fetch skill + delegate)

**Next Action:**
Follow the orchestrator workflow:
1. Activate skill_delegator
2. Activate agent_delegator
3. Delegate to appropriate agent
4. Let them do the work"
}
EOF
      exit 2
    fi
    ;;

  "Task")
    # Orchestrator is delegating - this is good!
    # But check if it consulted agent_delegator first

    TASK_AGENT=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // ""')

    # Skip check for delegator agents themselves
    if [[ "$TASK_AGENT" == "skill_delegator" ]] || [[ "$TASK_AGENT" == "agent_delegator" ]]; then
      echo '{"approval": "allow"}'
      exit 0
    fi

    # For other agents, verify agent_delegator was consulted
    HAS_AGENT_DELEGATOR=$(echo "$SESSION_MESSAGES" | grep -i "agent_delegator" || true)

    if [[ -z "$HAS_AGENT_DELEGATOR" ]]; then
      cat <<EOF
{
  "approval": "ask",
  "explanation": "⚠️ Orchestrator delegating to $TASK_AGENT without consulting agent_delegator",
  "systemMessage": "**DELEGATION WITHOUT CONSULTATION**

The orchestrator is delegating to '$TASK_AGENT' agent without first consulting agent_delegator.

**Best Practice:**
1. Activate agent_delegator skill
2. Let agent_delegator recommend the best agent
3. Delegate to recommended agent

**Current Action:**
Direct delegation to $TASK_AGENT without recommendation.

**Options:**
- **Allow**: If you're confident $TASK_AGENT is correct for this task
- **Deny**: Force orchestrator to consult agent_delegator first

This is a recommendation, not a hard requirement."
}
EOF
      exit 0
    fi
    ;;
esac

# All other tools allowed
echo '{"approval": "allow"}'
exit 0
