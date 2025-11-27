#!/bin/bash

# Phase 2 Validation: Remaining 18 Prompts - PHASE 2 TEST
# Resets context.json ONCE at start, then accumulates recommendations

PROJECT_DIR="/Users/awesome/dev/devtest/Maestro"
CONTEXT_FILE="$PROJECT_DIR/.claude/context.json"
HOOK_FILE="$PROJECT_DIR/.claude/hooks/subagent-skill-discovery.js"

# Initial context template (empty, set once)
INITIAL_CONTEXT='{
  "skillTracking": {
    "recommended": [],
    "used": [],
    "sessionStart": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "sessionId": "phase2-session-'$(date +%s%N)'-'$(head -c 6 /dev/urandom | od -An -tx1 | tr -d ' ')'",
    "lastPromptTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "promptCount": 1,
    "domainHistory": []
  },
  "lastUpdated": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
}'

# Array of remaining prompts (3-5, 8-10, 12-20, 22-24)
PROMPTS=(
  "Compare the work-tracker.sh hook with the other hooks to understand the pattern"  # 3
  "Open the skill-rules.json and show me the defer_loading configuration structure"  # 4
  "List all markdown files in the .claude/skills directory"  # 5
  "Examine the 4d-evaluation.md agent and explain the evaluation framework"  # 8
  "Analyze the list.md agent structure and compare with file-reader.md"  # 9
  "Read the open.md agent and summarize its delegation pattern"  # 10
  "Compare read/SKILL.md with write/SKILL.md to understand the skill template pattern"  # 12
  "Read the base-research/SKILL.md and explain its methodology section"  # 13
  "Analyze the 4d-evaluation/SKILL.md for quality assessment patterns"  # 14
  "Open the fetch/SKILL.md and show me the error handling guidance"  # 15
  "Analyze settings.json hook configuration for correctness and completeness"  # 16
  "Read agent-registry.json and explain the agent metadata structure"  # 17
  "Compare the three hook files for consistency in error handling patterns"  # 18
  "Examine the test-skill-a and test-skill-b to understand defer_loading test structure"  # 19
  "Analyze the hallucination-detection skill for completeness"  # 20
  "Update the CLAUDE.md to reflect the latest skill system improvements"  # 22
  "Read the defer-loading-design.md and summarize the key design decisions"  # 23
  "Analyze the baseline-metrics.md for accuracy of token measurements"  # 24
)

PROMPT_IDS=(3 4 5 8 9 10 12 13 14 15 16 17 18 19 20 22 23 24)

echo "================================================================"
echo "PHASE 2 TEST - Remaining 18 Prompts"
echo "Running $(date)"
echo "================================================================"
echo ""

# Reset context.json ONCE at start (persistent session)
echo "$INITIAL_CONTEXT" > "$CONTEXT_FILE"
sleep 0.1

TOTAL_WORDS=0
TOTAL_TOKENS=0

for i in "${!PROMPTS[@]}"; do
  PROMPT_ID="${PROMPT_IDS[$i]}"
  PROMPT="${PROMPTS[$i]}"

  # Run prompt through hook (no reset - accumulates)
  OUTPUT=$("$HOOK_FILE" <<< "$PROMPT" 2>/dev/null)

  # Count words (excluding empty lines)
  WORD_COUNT=$(echo "$OUTPUT" | wc -w)
  TOKEN_COUNT=$((WORD_COUNT * 13 / 10))  # 1.3 ratio

  TOTAL_WORDS=$((TOTAL_WORDS + WORD_COUNT))
  TOTAL_TOKENS=$((TOTAL_TOKENS + TOKEN_COUNT))

  printf "Prompt %2d: %3d words | %3d tokens\n" "$PROMPT_ID" "$WORD_COUNT" "$TOKEN_COUNT"
done

TOTAL_TOKENS_CALC=$((TOTAL_WORDS * 13 / 10))

echo ""
echo "================================================================"
echo "PHASE 2 TOTALS (18 prompts)"
echo "================================================================"
printf "Total words:   %d\n" "$TOTAL_WORDS"
printf "Total tokens:  %d (words × 1.3)\n" "$TOTAL_TOKENS_CALC"
echo ""
