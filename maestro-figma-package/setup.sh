#!/bin/bash
# Maestro Figma Bridge — Setup Script
# Copies the Figma integration into your Claude Code project

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-.}"

echo -e "${BLUE}🎼 Maestro Figma Bridge — Setup${NC}"
echo ""

# Check bun
if ! command -v node &>/dev/null; then
  echo -e "${YELLOW}⚠ Node.js or Bun required. Install one:${NC}"
  echo "  Node: https://nodejs.org (v22+)"
  echo "  Bun:  curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# Create target dirs
mkdir -p "$TARGET/.claude/agents"
mkdir -p "$TARGET/.claude/scripts"
mkdir -p "$TARGET/.claude/plugins/figma"
mkdir -p "$TARGET/.claude/skills/figma/assets"

# Copy files
cp "$SCRIPT_DIR/.claude/scripts/figma-bridge.js" "$TARGET/.claude/scripts/"
cp "$SCRIPT_DIR/.claude/scripts/figma-relay.js" "$TARGET/.claude/scripts/"
cp "$SCRIPT_DIR/.claude/plugins/figma/"* "$TARGET/.claude/plugins/figma/"
cp "$SCRIPT_DIR/.claude/agents/figma.md" "$TARGET/.claude/agents/"
cp "$SCRIPT_DIR/.claude/skills/figma/SKILL.md" "$TARGET/.claude/skills/figma/"
cp "$SCRIPT_DIR/.claude/skills/figma/assets/"* "$TARGET/.claude/skills/figma/assets/"

# Make scripts executable
chmod +x "$TARGET/.claude/scripts/figma-bridge.js"
chmod +x "$TARGET/.claude/scripts/figma-relay.js"

echo -e "${GREEN}✅ Files installed to $TARGET/.claude/${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "  1. Start the relay server:"
echo "     bun $TARGET/.claude/scripts/figma-relay.js"
echo ""
echo "  2. Load the plugin in Figma:"
echo "     Figma → Plugins → Development → Import plugin from manifest"
echo "     Select: $TARGET/.claude/plugins/figma/manifest.json"
echo ""
echo "  3. Connect the plugin (click Connect in Figma)"
echo "     Copy the channel ID shown in the plugin"
echo ""
echo "  4. Test the connection:"
echo "     bun $TARGET/.claude/scripts/figma-bridge.js --channel=\"YOUR_CHANNEL\" --command=ping"
echo ""
echo "  5. Start Claude Code — the figma agent and skill will auto-activate"
echo "     when you mention Figma, design, or banner work."
echo ""
echo -e "${YELLOW}Tip:${NC} Add the agent to settings.json for auto-suggestions:"
echo '  {"agent": "figma"} in .claude/settings.json'
