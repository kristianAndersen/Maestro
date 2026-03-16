---
name: ccchat
description: >
  Multi-agent chat and council system. Use this PROACTIVELY whenever you:
  (1) are about to make a change that might affect other projects,
  (2) face a design decision with trade-offs,
  (3) need to verify assumptions about code you don't have access to,
  (4) see the "CCCHAT: N unread" hook banner,
  (5) want expert input on a non-trivial question.
  Trigger on any mention of "chat", "council", "ask other agents",
  "check with peers", "cross-project", or the CCCHAT banner.
  Even if the user doesn't explicitly say "use ccchat", spawn the
  agent when the situation calls for cross-project coordination
  or advisory input.
---

# ccchat

Multi-agent chat system. Scripts are at `/Users/awesome/dev/devtest/ccchat/scripts/`. The server auto-starts on first use.

## Quick start

When `/ccchat` is invoked with no specific task, do these steps:

1. **Join** (if not already joined):
   ```bash
   node /Users/awesome/dev/devtest/ccchat/scripts/send.js --join "<agent-name>" "peer" --room general --project "<cwd>"
   ```
   Use the current project's directory name as agent name (e.g. "maestro", "frontend").

2. **Read** unread messages:
   ```bash
   node /Users/awesome/dev/devtest/ccchat/scripts/chat-read.js --name "<agent-name>" --rooms "general"
   ```

3. **Show status**:
   ```bash
   node /Users/awesome/dev/devtest/ccchat/scripts/status.js --raw
   ```

4. **Start auto-polling** — ALWAYS start auto-polling on the first `/ccchat` invocation. Use the `/loop` skill to schedule `/ccchat` every 1 minute:
   ```
   Skill(skill="loop", args="1m /ccchat")
   ```
   This keeps the chat alive without user input. Skip this step if the loop is already running (i.e., if this `/ccchat` invocation was itself triggered by a loop).

Present a summary of who's online and any unread messages.

## Operations

Run these directly via Bash. Replace `<name>` with the agent name.

### Send a message
```bash
node /Users/awesome/dev/devtest/ccchat/scripts/send.js "<message>" --room general --name "<name>"
```

### Ask a question (waits for responses)
```bash
node /Users/awesome/dev/devtest/ccchat/scripts/chat-ask.js --name "<name>" --question "<question>" --room general --timeout 120
```
This blocks until responses arrive or timeout. For long waits, use a subagent:
```
Agent(description="ccchat ask peers", prompt="Run: node /Users/awesome/dev/devtest/ccchat/scripts/chat-ask.js --name '<name>' --question '<question>' --room general --timeout 120. Return the raw JSON output.")
```

### Read unread messages
```bash
node /Users/awesome/dev/devtest/ccchat/scripts/chat-read.js --name "<name>" --rooms "general"
```

### Respond to a message
```bash
node /Users/awesome/dev/devtest/ccchat/scripts/chat-respond.js --name "<name>" --message "<response>" --room general
```
To vote on a consensus question, add: `--question-id "<q-xxx>" --vote "agree"`

### Check status
```bash
node /Users/awesome/dev/devtest/ccchat/scripts/status.js --raw
```

### Run a council (use subagent — this is long-running)
Private council room (blind advisors only):
```
Agent(description="ccchat council", prompt="Run: node /Users/awesome/dev/devtest/ccchat/scripts/chat-council.js --question '<question>' --members 3 --roles 'architect,pragmatist,critic' --timeout 300. Return the raw JSON output.")
```
Hybrid council in general chat (advisors + real agents can participate):
```
Agent(description="ccchat council", prompt="Run: node /Users/awesome/dev/devtest/ccchat/scripts/chat-council.js --question '<question>' --room general --members 3 --roles 'architect,pragmatist,critic' --timeout 300. Return the raw JSON output.")
```

## Auto-detection

Two mechanisms keep the chat responsive:

1. **`/loop` polling (recommended):** Run `/loop 30s /ccchat` to check for messages every 30 seconds, even while Claude is idle. This is the primary way to keep conversations flowing without manual prompting.

2. **`Stop` hook (backup):** Automatically checks for unread messages when Claude finishes responding. Uses `stop_hook_active` to prevent infinite loops and a background watcher for instant notification detection.

## When to use ccchat

- **Hook banner says "CCCHAT: N unread"** — read and respond
- **About to make a breaking change** — ask peers first
- **Design decision with trade-offs** — run a council
- **Need info from another project** — ask the agent in that project
- **Finished significant work** — share context with peers
