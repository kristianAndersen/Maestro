# Claude Code Chat (ccchat) - Implementation Plan

## Context

Two problems, one system:

**Problem 1 - Council:** You're working with Claude and hit a non-trivial decision. Claude should be able to autonomously spawn a council of blind advisors to debate and reach consensus.

**Problem 2 - Peer chat:** You're migrating an old codebase to a new one. You have Claude running in both projects. Agent A (new code) should be able to ask Agent B (old code): "I'm implementing auth this way, does that align with how the old system works?" Agent B can check its own project files and answer with real context.

**Solution:** A real-time WebSocket chat that supports both modes:
- **Council mode** - on-demand blind advisors spawned for a question
- **Peer mode** - persistent project-bound agents chatting across projects

The chat format is key: context builds organically through conversation. A council member can ask "what framework?" and get an answer. Agent B can ask "which auth endpoint?" and check its own codebase.

This must work with **vanilla Claude Code** - no Maestro, no special frameworks.

## How It Works

### Council Mode (blind advisors)
```
User: "Should we use SSR or CSR for this app?"

Claude: Let me consult the council...
        [starts server, spawns 3 blind council members, posts question]
        [council asks clarifying questions, Claude answers in chat]
        [council debates, reaches consensus]

Claude: The council recommends SSR. Here's their reasoning:
        - Architect: SSR for SEO + initial load at 10k users
        - Pragmatist: Next.js App Router, start SSR
        - Critic: Agreed, CSR only for dashboard-heavy apps
```

### Peer Mode (cross-project agents)
```
Agent A (new-codebase):
  "I reimplemented the payment flow using Stripe webhooks instead of
   polling. The old code returned {status, txId} from processPayment().
   Does my new return shape {status, transactionId, webhookId} break
   any downstream consumers?"

Agent B (old-codebase):
  [checks old code files]
  "Yes - the dashboard at /admin/transactions.js destructures {txId}
   directly. You'll need to either keep txId as an alias or update
   the dashboard. Here's the exact line: transactions.js:47"
```

## Architecture

```
┌─────────────────────┐   ┌─────────────────────┐   ┌──────────────┐
│ Your Claude Code     │   │ Claude Code          │   │ Spawned      │
│ (project-new/)       │   │ (project-old/)       │   │ Council      │
│ Agent: "new-app"     │   │ Agent: "old-app"     │   │ Members      │
│ Has: project files   │   │ Has: project files   │   │ (blind)      │
│ Role: peer           │   │ Role: peer           │   │ Role: council│
└────────┬─────────────┘   └────────┬─────────────┘   └──────┬───────┘
         │ ws                       │ ws                      │ ws
         └───────────┬──────────────┴──────────────┬──────────┘
                     │                             │
              ┌──────┴────────┐             ┌──────┴──────┐
              │ ccchat-server │────────────→│   SQLite    │
              │ :3737         │             │   ccchat.db │
              └───────────────┘             └─────────────┘
```

**Rooms** separate conversations:
- `general` - default room for peer-to-peer chat
- `council-<uuid>` - ephemeral rooms for council sessions
- Custom rooms (e.g., `migration`, `auth-review`) for topic-based peer chat

## Technology Choices

| Choice | Why |
|--------|-----|
| **WebSocket (`ws` lib)** | Bidirectional, lightweight, no STUN/TURN overhead |
| **SQLite (`better-sqlite3`)** | Zero-config persistence, no external deps |
| **Node.js ESM** | Available (v22.13.1), stable `better-sqlite3` support |
| **`claude -p`** | Spawns headless Claude Code instances for council members |
| **Port 3737** | Configurable via `CCCHAT_PORT` env var |

## File Structure

```
/Users/awesome/dev/devtest/ccchat/
├── package.json
├── CLAUDE.md
├── server/
│   ├── index.js              # WebSocket + HTTP server
│   ├── db.js                 # SQLite schema & queries
│   └── consensus.js          # Consensus state machine
├── client/
│   └── ccchat-client.js      # Shared client lib (connect, send, read, poll)
├── scripts/
│   ├── start-server.js       # Ensure server is running
│   ├── spawn-council.js      # Spawn N headless Claude Code council members
│   ├── send.js               # Send a message to chat
│   ├── read.js               # Read messages (with cursor tracking)
│   ├── ask.js                # Post a question (triggers consensus flow)
│   ├── vote.js               # Agree/disagree on a proposed answer
│   ├── status.js             # Show agents, active questions, consensus state
│   └── poll-consensus.js     # Block until consensus reached or timeout
├── council/
│   ├── prompts.js            # Council member role prompts
│   └── council-skill.md      # Minimal skill injected into council members
├── hooks/
│   └── ccchat-poll.js        # UserPromptSubmit hook - checks for unread
├── .claude/
│   ├── settings.json         # Hook registration
│   └── skills/
│       └── ccchat/
│           └── SKILL.md      # Main skill - council + peer chat
└── test/
    └── smoke.js              # Integration test
```

## Implementation Phases

### Phase 1: Server + DB

**`server/db.js`** - SQLite at `~/.claude/ccchat/ccchat.db`

Tables:
- `agents` (name PK, role TEXT, project_path TEXT, first_seen, last_seen, online INTEGER)
- `messages` (id UUID PK, seq INTEGER, type, from_agent, to_agent, room, content, parent_id, timestamp)
- `consensus` (question_id PK, state, proposed_answer_id, participants JSON, votes JSON, created_at, updated_at, timeout_at)
- `read_cursors` (agent_name TEXT, room TEXT, last_seq INTEGER, PRIMARY KEY(agent_name, room))

The `project_path` on agents lets peers know what project each agent is working in. The room-scoped `read_cursors` lets agents track reads per room (general vs council vs custom).

Key functions: `nextSeq()`, `insertMessage()`, `getMessagesSince(seq, room)`, `getUnreadCount(agent, room)`, `updateCursor(agent, room, seq)`, `upsertAgent()`, `getConsensus()`, `updateConsensus()`, `getOnlineAgents()`, `getAgentsByRoom()`

**`server/consensus.js`** - State machine

```
OPEN ──(answer)──→ PROPOSED ──(vote)──→ DEBATING ──(all agree)──→ REACHED
                                            │
                                       (timeout)──→ TIMEOUT
```

- Participants = agents in the room when question is asked
- All participants must agree for consensus
- Disagree re-opens debate with counter-argument
- Default timeout: 5 min for council, 30 min for peer questions

**`server/index.js`** - WebSocket server on `ws://127.0.0.1:3737`

- PID file at `~/.claude/ccchat/server.pid`
- HTTP `GET /health` endpoint
- HTTP `GET /status` endpoint (JSON - agents, rooms, active questions)
- Ping/pong every 30s for connection health
- Auto-shutdown after 4h idle (stays warm for peer chat)
- Message dispatch: join, message, question, answer, agree, disagree, read, status, ping
- Room-scoped broadcasting: messages only go to agents in the same room
- Agent presence tracking: join/leave notifications per room

### Phase 2: Client Library

**`client/ccchat-client.js`** - Used by all scripts and hooks

```javascript
export const SERVER_URL = `ws://127.0.0.1:${process.env.CCCHAT_PORT || 3737}`;
export function isServerAlive()              // Check PID + process.kill(pid, 0)
export async function ensureServer()         // Spawn server detached if not running
export function connect(timeoutMs)           // Returns Promise<WebSocket|null>
export function request(ws, payload, timeout) // Send + await typed response
export function close(ws)                    // Graceful close
```

Agent identity stored at `~/.claude/ccchat/agent-${ppid}.json`:
```json
{ "name": "new-app", "role": "peer", "rooms": ["general", "migration"], "projectPath": "/Users/awesome/dev/new-app" }
```

Keyed by parent PID so same terminal session = same agent.

### Phase 3: Council Spawner

**`scripts/spawn-council.js`**

Usage: `node scripts/spawn-council.js --members 3 --question-id q-xxx --room council-xxx`

1. Reads role definitions from `council/prompts.js`
2. Spawns headless Claude Code instances:
   ```bash
   claude -p "<prompt with council-skill.md + role + room + question-id>" \
     --allowedTools "Bash(node /path/scripts/*)" \
     --no-input
   ```
3. Council members are **blind** - spawned in `/tmp` or a scratch dir, no project access
4. Their only tools are the ccchat scripts
5. Returns PIDs for monitoring

**`council/prompts.js`** - Role definitions

```javascript
export const ROLES = {
  architect: {
    name: "architect",
    description: "Senior software architect. Scalability, maintainability, clean design.",
  },
  pragmatist: {
    name: "pragmatist",
    description: "Practical engineer. Ship fast, keep it simple, avoid over-engineering.",
  },
  critic: {
    name: "critic",
    description: "Devil's advocate. Challenge assumptions, find edge cases, identify risks.",
  },
  security: {
    name: "security",
    description: "Security specialist. Vulnerabilities, attack surfaces, secure defaults.",
  },
  performance: {
    name: "performance",
    description: "Performance engineer. Speed, memory, scalability bottlenecks.",
  }
};
```

**`council/council-skill.md`** - Injected into each council member's prompt

Teaches them to:
- Join room, read the question
- Discuss by sending messages
- Propose an answer
- Vote agree/disagree with reasoning
- Protocol: read → discuss → propose → vote → exit

### Phase 4: CLI Scripts

Each script is standalone, uses `ccchat-client.js`, auto-calls `ensureServer()`.

| Script | Usage | Purpose |
|--------|-------|---------|
| `start-server.js` | `node scripts/start-server.js` | Start server, print health |
| `spawn-council.js` | `node scripts/spawn-council.js --members 3 --question-id q-xxx` | Spawn blind council |
| `send.js` | `node scripts/send.js "msg" [--to x] [--room r] [--join name role]` | Send message or join |
| `read.js` | `node scripts/read.js [--since seq] [--room r] [--limit n]` | Read messages |
| `ask.js` | `node scripts/ask.js "question" [--room r] [--timeout 5]` | Post question |
| `vote.js` | `node scripts/vote.js <qid> agree\|disagree [reason]` | Cast vote |
| `status.js` | `node scripts/status.js` | Agents, rooms, questions |
| `poll-consensus.js` | `node scripts/poll-consensus.js <qid> [--timeout 300]` | Block until consensus |

### Phase 5: Poll Hook

**`hooks/ccchat-poll.js`** - `UserPromptSubmit` hook

This is what makes **peer mode** work. On every user prompt in any connected project:

1. Read stdin JSON for `sessionId`
2. Load agent identity from `~/.claude/ccchat/agent-${ppid}.json`
3. If no identity → silent exit (not registered yet)
4. If identity exists → connect, fetch unread across all joined rooms
5. Print banner:

```
╔════════════════════════════════════════════════════════════════╗
║  CCCHAT: 3 unread messages                                    ║
║                                                                ║
║  [general]                                                     ║
║  [14:32] new-app: Does the old auth return txId or            ║
║          transactionId?                                        ║
║                                                                ║
║  [migration]                                                   ║
║  [14:35] new-app (QUESTION): Does my new payment return       ║
║          shape break downstream consumers?                     ║
║  ⚡ Answer needed on question #q-abc                           ║
╚════════════════════════════════════════════════════════════════╝
```

6. The skill instructions tell Claude to **act on these messages** - read the question, check its own project files, and respond in the chat.

This means: Agent B's user types anything → hook shows the question from Agent A → Claude reads the question → checks old codebase → sends answer back via chat scripts. **No extra user action needed beyond their normal prompting.**

### Phase 6: Main Skill

**`.claude/skills/ccchat/SKILL.md`**

```yaml
---
name: ccchat
description: >
  Multi-agent chat system. Two modes: (1) Summon a blind council of experts
  for architecture decisions and trade-offs. (2) Chat with other Claude Code
  agents working on different projects - great for migrations, cross-team
  coordination, and knowledge sharing. Activate when you see unread chat
  messages in the banner, when you need expert input, or when you need to
  ask another agent about their project.
---
```

The skill body covers both workflows:

**Council workflow:**
1. Decide to consult (non-trivial decision, user asks for input)
2. `node scripts/start-server.js`
3. `node scripts/send.js --join "main" "requester" --room council-<uuid>`
4. `node scripts/ask.js "question" --room council-<uuid> --timeout 5`
5. `node scripts/spawn-council.js --members 3 --question-id <qid> --room council-<uuid>`
6. Poll with `read.js`, answer clarifying questions via `send.js`
7. `node scripts/poll-consensus.js <qid> --timeout 300`
8. Present consensus + individual reasoning to user

**Peer workflow:**
1. Register once: `node scripts/send.js --join "<name>" "peer" --room general`
2. When banner shows unread messages → read them with `read.js`
3. If a question is directed at you or your project → check your files and answer
4. To ask another agent: `node scripts/ask.js "question" --room general`
5. To send a message: `node scripts/send.js "message" --room general --to <agent>`
6. React to consensus requests: vote agree/disagree with reasoning

**Key instructions:**
- When you see the unread banner, address chat messages before the user's request (or integrate them)
- For council: pick roles relevant to the question type
- For peers: share enough context but remember other agents can check their own files
- Always present dissenting opinions alongside consensus

### Phase 7: Project Config

**`CLAUDE.md`** (in ccchat project):
```
# ccchat - Claude Code Chat

Multi-agent chat: council mode (blind advisors) + peer mode (cross-project).
Server auto-starts on first use. All scripts in /scripts/.

## Setup for a new project
1. Add hook to .claude/settings.json (see Installation section)
2. Symlink skill: ln -s /path/to/ccchat/.claude/skills/ccchat .claude/skills/ccchat
3. Register: node /path/to/ccchat/scripts/send.js --join "agent-name" "peer"
```

**`.claude/settings.json`** (in ccchat project and any connected project):
```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "node /Users/awesome/dev/devtest/ccchat/hooks/ccchat-poll.js"
      }]
    }]
  }
}
```

## Message Protocol

**Client → Server:**
```json
{ "type": "join", "name": "new-app", "role": "peer", "room": "general", "project_path": "/path/to/project" }
{ "type": "message", "content": "Hello", "room": "general", "to": null }
{ "type": "message", "content": "Hey old-app", "room": "general", "to": "old-app" }
{ "type": "question", "content": "Does my new auth break anything?", "room": "general", "timeout_minutes": 30 }
{ "type": "answer", "question_id": "q-xxx", "content": "Yes, dashboard uses txId..." }
{ "type": "agree", "question_id": "q-xxx", "reason": "Confirmed" }
{ "type": "disagree", "question_id": "q-xxx", "reason": "Actually..." }
{ "type": "read", "since_seq": 0, "room": "general", "limit": 50 }
{ "type": "status" }
```

**Server → Client:**
```json
{ "type": "joined", "name": "new-app", "agents": ["old-app"], "unread": 2 }
{ "type": "deliver", "message": { "id", "seq", "type", "from_agent", "content", "room", "timestamp" } }
{ "type": "read_response", "messages": [...], "has_more": false }
{ "type": "consensus_update", "question_id": "q-xxx", "state": "reached", "votes": {...} }
{ "type": "status_response", "agents": [...], "rooms": [...], "consensus": [...] }
{ "type": "agent_joined", "name": "old-app", "role": "peer", "room": "general" }
{ "type": "agent_left", "name": "old-app", "room": "general" }
```

## Peer Chat Lifecycle

```
Agent A (new-codebase)           Server              Agent B (old-codebase)
    │                              │                        │
    ├─── join "new-app" ─────────→│                        │
    │                              │←── join "old-app" ────┤
    │                              │                        │
    ├─── question: "Does my       │                        │
    │    new payment shape         │                        │
    │    break consumers?" ──────→│──── deliver ──────────→│
    │                              │                        │
    │                              │    [B's user prompts]  │
    │                              │    [hook shows banner] │
    │                              │    [B checks old code] │
    │                              │                        │
    │                              │←── answer: "Yes,      ┤
    │←── deliver ─────────────────┤    dashboard:47 uses   │
    │                              │    txId directly"      │
    │                              │                        │
    ├─── "thanks, I'll add an    │                        │
    │     alias" ────────────────→│──── deliver ──────────→│
    │                              │                        │
```

## Council Session Lifecycle

```
Main Claude                    Server                     Council (blind)
    │                            │                              │
    ├─── ensureServer() ────────→│                              │
    ├─── join "main" ───────────→│                              │
    ├─── post question ─────────→│                              │
    ├─── spawn-council.js ───────┼─────────────────────────────→│
    │                            │←── join architect ───────────┤
    │                            │←── join pragmatist ──────────┤
    │                            │←── join critic ──────────────┤
    │                            │                              │
    │                            │←── "what's the traffic?" ────┤
    │←── deliver ────────────────┤                              │
    ├─── "~10k users, SEO" ────→│──── deliver ────────────────→│
    │                            │                              │
    │                            │←── answer: "SSR because..." ─┤
    │                            │←── agree (all 3) ────────────┤
    │←── consensus_update ───────┤                              │
    │                            │              council exits ──┤
    ├─── present to user         │                              │
```

## Installation for Any Project

```bash
# 1. Add the poll hook to your project
cd /path/to/your-project
# Add to .claude/settings.json (create if needed):
# { "hooks": { "UserPromptSubmit": [{ "hooks": [{ "type": "command",
#   "command": "node /Users/awesome/dev/devtest/ccchat/hooks/ccchat-poll.js" }] }] } }

# 2. Symlink the skill
mkdir -p .claude/skills
ln -s /Users/awesome/dev/devtest/ccchat/.claude/skills/ccchat .claude/skills/ccchat

# 3. Register (Claude does this automatically on first use)
node /Users/awesome/dev/devtest/ccchat/scripts/send.js --join "my-agent" "peer" --room general
```

## Verification

1. **Server**: `node server/index.js` → `curl http://localhost:3737/health` → OK
2. **Peer chat**: Two terminals, two agents, send messages back and forth
3. **Council**: Spawn council with test question, watch debate + consensus
4. **Hook**: Open Claude Code with hook, type anything → unread banner appears
5. **Cross-project**: Agent A (project-new) asks, Agent B (project-old) answers
6. **Smoke test**: `node test/smoke.js` - all scenarios programmatically

## Build Order

1. `package.json` + `npm install ws better-sqlite3`
2. `server/db.js` - SQLite schema + queries
3. `server/consensus.js` - state machine
4. `server/index.js` - WebSocket server
5. `client/ccchat-client.js` - shared client
6. `scripts/` - start-server, send, read, ask, vote, status, poll-consensus
7. `test/smoke.js` - verify server + client + consensus
8. `council/prompts.js` + `council/council-skill.md` - role definitions
9. `scripts/spawn-council.js` - council spawner
10. `hooks/ccchat-poll.js` - unread message hook
11. `.claude/skills/ccchat/SKILL.md` - main skill (council + peer)
12. `.claude/settings.json` + `CLAUDE.md` - project config
