# Agent Discovery System - Quick Reference

**Purpose:** How Maestro automatically discovers which agent to use for user requests

---

## The Problem You Asked About

**Question:** "How does Maestro auto-detect agents?"

**Answer:** Through the **Agent Discovery System** - a parallel to skill auto-activation, but for agent selection.

---

## How It Works

### 1. Agent Registry (`agent-registry.json`)

Just like skills have `skill-rules.json`, agents have `agent-registry.json`:

```json
{
  "version": "1.0",
  "agents": {
    "write": {
      "purpose": "Code and file modifications",
      "triggers": {
        "keywords": ["add", "modify", "change", "update", "fix", "create"],
        "intentPatterns": ["add.*to", "modify.*file", "fix.*bug"],
        "operations": ["write", "edit", "modify", "create"]
      },
      "complexity": "medium",
      "autonomy": "medium"
    }
  }
}
```

### 2. Hook: `maestro-agent-suggester.js`

Runs **before Maestro sees the user request** (UserPromptSubmit hook):

```javascript
#!/usr/bin/env node
// Pseudo-code for illustration

const userRequest = getUserPrompt();
const registry = loadAgentRegistry();

// Match request against agent triggers
const matches = findMatchingAgents(userRequest, registry);

if (matches.length > 0) {
  // Inject suggestion into Maestro's context
  console.log(`
    🎯 AGENT SUGGESTION
    RECOMMENDED AGENT: ${matches[0].name}
    Reason: ${matches[0].reason}

    REMINDER: Maestro delegates, never codes directly.
  `);
}
```

### 3. Maestro Receives Suggestion

Before Maestro responds to the user, it sees:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 AGENT SUGGESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

User request detected: "Add error handling to auth service"

RECOMMENDED AGENT: Write
Reason: Request contains "add" (write operation) and targets code modification

REMINDER: Maestro delegates, never codes directly.
Use Task tool to spawn Write agent with comprehensive direction.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Maestro Delegates

Maestro sees the suggestion and delegates:

```
🎼 Maestro: Delegating to Write agent
📋 Reason: Code modification with error handling requirements
```

---

## Complete Flow

```
User: "Add error handling to authentication service"
    ↓
[maestro-agent-suggester.js hook fires]
    ↓
Analyzes: "add" keyword → Write agent
          "error handling" → domain detected
    ↓
Injects into Maestro's context:
    "🎯 AGENT SUGGESTION: Write agent"
    "Reason: add keyword + code modification"
    ↓
Maestro reads suggestion
    ↓
Maestro delegates to Write agent using Task tool
    ↓
[subagent-skill-discovery.js hook fires in Write agent context]
    ↓
Analyzes Write agent's task: "error handling"
    ↓
Injects into Write agent's context:
    "🎯 SKILL SUGGESTION: Write skill, error-tracking skill"
    ↓
Write agent uses skills and executes task
    ↓
Write agent returns output to Maestro
    ↓
[evaluation-reminder.js hook fires]
    ↓
Reminds Maestro to evaluate before accepting
    ↓
Maestro runs 4D-Evaluation agent
    ↓
Evaluation passes → Maestro confirms to user
```

---

## Key Components

### Agent Registry Location
`.claude/agents/agent-registry.json`

### Hook Location
`.claude/hooks/maestro-agent-suggester.js`

### When It Runs
**UserPromptSubmit** - Before Maestro sees user request

### What It Does
1. Reads agent-registry.json
2. Matches user request against triggers
3. Injects suggestion into Maestro's context
4. Reminds Maestro to delegate (never code directly)

---

## Trigger Matching Logic

**Three matching strategies:**

1. **Keywords:** Simple string matching
   - User says "add" → Matches Write agent (keyword: "add")
   - User says "find" → Matches BaseResearch agent (keyword: "find")

2. **Intent Patterns:** Regex matching
   - User says "fix the bug in..." → Matches Write agent (pattern: "fix.*bug")
   - User says "analyze the code" → Matches Read agent (pattern: "analyze.*code")

3. **Operations:** Action verb detection
   - User says "modify the file" → Matches Write agent (operation: "modify")
   - User says "search for..." → Matches BaseResearch agent (operation: "search")

**Scoring:** Hook calculates match strength and suggests best match first

---

## Fallback Logic

**If no agent matches:**
- Maestro uses BaseResearch to decompose the task
- Maestro asks user for clarification

**If multiple agents match:**
- Hook suggests primary match with alternatives
- Maestro chooses based on complexity and context

**If user request is vague:**
- Maestro uses AskUserQuestion tool
- Gets clarification before delegating

---

## Comparison: Agent Discovery vs Skill Discovery

| Feature | Agent Discovery | Skill Discovery |
|---------|----------------|-----------------|
| **Registry** | `agent-registry.json` | `skill-rules.json` |
| **Hook** | `maestro-agent-suggester.js` | `subagent-skill-discovery.js` |
| **Context** | Maestro (top level) | Subagent (delegated) |
| **Purpose** | Suggest which agent to use | Suggest which skill to load |
| **When** | User → Maestro | Maestro → Subagent |
| **Output** | Agent recommendation | Skill recommendation |

---

## Example: agent-registry.json Entry

```json
{
  "write": {
    "purpose": "Code and file modifications",
    "triggers": {
      "keywords": [
        "add", "modify", "change", "update", "fix",
        "create", "implement", "write", "edit"
      ],
      "intentPatterns": [
        "add.*to",
        "modify.*file",
        "fix.*bug",
        "implement.*feature",
        "create.*new"
      ],
      "operations": ["write", "edit", "modify", "create"]
    },
    "complexity": "medium",
    "autonomy": "medium"
  }
}
```

**Field explanations:**
- `keywords`: Simple words that indicate this agent
- `intentPatterns`: Regex for detecting intent
- `operations`: Action verbs that map to agent
- `complexity`: Helps Maestro estimate task difficulty
- `autonomy`: How much agent can work independently

---

## Adding Custom Agents

**To add a new custom agent:**

1. Create agent file: `.claude/agents/my-custom-agent.md`

2. Add entry to `agent-registry.json`:
   ```json
   {
     "my-custom-agent": {
       "purpose": "What this agent does",
       "triggers": {
         "keywords": ["custom", "specific", "words"],
         "intentPatterns": ["pattern.*here"],
         "operations": ["custom-action"]
       },
       "complexity": "medium",
       "autonomy": "high"
     }
   }
   ```

3. Hook automatically picks it up (no code changes needed)

4. Maestro will suggest it when triggers match

---

## Benefits of Agent Discovery

✅ **Maestro doesn't need hardcoded logic** - Everything driven by registry

✅ **Easy to extend** - Add new agents by updating JSON file

✅ **Transparent** - Maestro shows why it chose an agent

✅ **Reminder enforcement** - Hook reminds Maestro to delegate

✅ **Framework agnostic** - Registry has no tech bias

✅ **Parallel to skills** - Same pattern for agents and skills

---

## Summary

**Agent Discovery = Skill Discovery for Agents**

- **Registry:** `agent-registry.json` defines all agents and their triggers
- **Hook:** `maestro-agent-suggester.js` analyzes requests and suggests agents
- **Context:** Injects suggestions into Maestro's context before it responds
- **Result:** Maestro always knows which agent to use, delegation becomes systematic

**This ensures Maestro NEVER has to guess which agent to use - the system tells it.**

---

See `MAESTRO_BLUEPRINT.md` sections:
- "Agent Discovery System" (page ~25)
- "Hook System Architecture" (page ~26)
- "Agent Discovery Flow" (page ~27)
