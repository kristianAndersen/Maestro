# Figma Bridge Control

Manage the Maestro Figma Bridge — start/stop relay, connect to plugin, check status.

## Usage

Parse the user's argument to determine the action:

### `start` — Start the relay server
```bash
# Check if already running
curl -s http://localhost:3055/status 2>/dev/null && echo "ALREADY_RUNNING" || echo "NOT_RUNNING"
```
- If NOT_RUNNING: start with `Bash(command="bun .claude/scripts/figma-relay.js", run_in_background=true)`
- If ALREADY_RUNNING: tell the user, show status

### `stop` — Stop the relay server
```bash
# Find and kill the relay process
pkill -f "figma-relay.js" && echo "Relay stopped" || echo "No relay running"
```

### `status` — Show relay and connection info
```bash
curl -s http://localhost:3055/status 2>/dev/null || echo "Relay not running"
```

### `connect <channel>` — Join a Figma plugin channel and test
```bash
bun .claude/scripts/figma-bridge.js --channel="CHANNEL_ID" --command=ping
```

### No argument — Show help
If invoked with no argument, show:
```
🎼 Maestro Figma Bridge

  /figma start              Start the relay server
  /figma stop               Stop the relay server  
  /figma status             Check relay & connection status
  /figma connect <channel>  Connect and test a channel

  Relay: bun .claude/scripts/figma-relay.js (port 3055)
  Bridge: bun .claude/scripts/figma-bridge.js --channel=ID --command=CMD
```
