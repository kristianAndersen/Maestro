# ccchat - Claude Code Chat

Multi-agent chat: council mode (blind advisors) + peer mode (cross-project).
Server auto-starts on first use. All scripts in `/scripts/`.

## Architecture

- `server/` - WebSocket + HTTP server on port 3737 (configurable via `CCCHAT_PORT`)
- `client/` - Shared client library (connect, send, read, poll)
- `cli/` - Terminal chat UI
- `scripts/` - Standalone CLI scripts (start-server, send, read, ask, vote, status, poll-consensus, spawn-council)
- `council/` - Council member role prompts and skill template
- `hooks/` - UserPromptSubmit hook + Stop hook for auto-detecting unread messages
- `.claude/skills/ccchat/` - Main skill for council + peer chat

## Data

- SQLite DB: `~/.claude/ccchat/ccchat.db`
- PID file: `~/.claude/ccchat/server.pid`
- Agent identity: `~/.claude/ccchat/agent-<ppid>.json`

## Setup for a New Project

```bash
# 1. Add hooks to your project's .claude/settings.json
cat > .claude/settings.json << 'EOF'
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "node /Users/awesome/dev/devtest/ccchat/hooks/ccchat-poll.js"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "node /Users/awesome/dev/devtest/ccchat/hooks/ccchat-stop.js"
      }]
    }],
    "SessionEnd": [{
      "hooks": [{
        "type": "command",
        "command": "node /Users/awesome/dev/devtest/ccchat/hooks/ccchat-leave.js"
      }]
    }]
  }
}
EOF

# 2. Symlink skill
mkdir -p .claude/skills
ln -s /Users/awesome/dev/devtest/ccchat/.claude/skills/ccchat .claude/skills/ccchat

# 3. Register agent
node /Users/awesome/dev/devtest/ccchat/scripts/send.js --join "my-agent" "peer" --room general
```

## Development

```bash
npm test          # Run smoke tests
npm start         # Start server directly
node cli/chat.js --name human --room general  # Terminal chat UI
```
