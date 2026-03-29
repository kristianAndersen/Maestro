#!/bin/bash
# Maestro Statusline - displays session context in Claude Code terminal
# Receives JSON session data on stdin

DATA=$(cat)

# Extract fields with safe defaults
AGENT=$(echo "$DATA" | jq -r '.agent.name // "maestro"')
MODEL=$(echo "$DATA" | jq -r '.model.display_name // .model.id // "unknown"')
CTX_PCT=$(echo "$DATA" | jq -r '.context_window.used_percentage // 0')
COST=$(echo "$DATA" | jq -r '.cost.total_cost_usd // 0')
DURATION_MS=$(echo "$DATA" | jq -r '.cost.total_duration_ms // 0')
LINES_ADD=$(echo "$DATA" | jq -r '.cost.total_lines_added // 0')
LINES_REM=$(echo "$DATA" | jq -r '.cost.total_lines_removed // 0')
RATE_5H=$(echo "$DATA" | jq -r '.rate_limits.five_hour.used_percentage // empty')
RATE_7D=$(echo "$DATA" | jq -r '.rate_limits.seven_day.used_percentage // empty')

# Colors
RESET="\033[0m"
DIM="\033[2m"
BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
CYAN="\033[36m"
MAGENTA="\033[35m"

# Context bar color based on usage
if [ "$(echo "$CTX_PCT > 85" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
  CTX_COLOR="$RED"
elif [ "$(echo "$CTX_PCT > 60" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
  CTX_COLOR="$YELLOW"
else
  CTX_COLOR="$GREEN"
fi

# Build progress bar (10 chars wide)
CTX_INT=${CTX_PCT%.*}
CTX_INT=${CTX_INT:-0}
FILLED=$((CTX_INT / 10))
EMPTY=$((10 - FILLED))
BAR=""
for ((i=0; i<FILLED; i++)); do BAR+="█"; done
for ((i=0; i<EMPTY; i++)); do BAR+="░"; done

# Format duration as HH:MM:SS
DURATION_SEC=$((${DURATION_MS%.*} / 1000))
HOURS=$((DURATION_SEC / 3600))
MINS=$(( (DURATION_SEC % 3600) / 60 ))
SECS=$((DURATION_SEC % 60))
if [ "$HOURS" -gt 0 ]; then
  DURATION_FMT=$(printf "%dh%02dm" "$HOURS" "$MINS")
else
  DURATION_FMT=$(printf "%dm%02ds" "$MINS" "$SECS")
fi

# Format cost
COST_FMT=$(printf "$%.2f" "$COST")

# Build rate limit string
RATE_STR=""
if [ -n "$RATE_5H" ]; then
  # Color based on rate limit usage
  if [ "$(echo "$RATE_5H > 80" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
    RATE_COLOR="$RED"
  elif [ "$(echo "$RATE_5H > 50" | bc -l 2>/dev/null || echo 0)" = "1" ]; then
    RATE_COLOR="$YELLOW"
  else
    RATE_COLOR="$GREEN"
  fi
  RATE_5H_INT=${RATE_5H%.*}
  RATE_STR="${RATE_COLOR}5h:${RATE_5H_INT}%${RESET}"
  if [ -n "$RATE_7D" ]; then
    RATE_7D_INT=${RATE_7D%.*}
    RATE_STR="${RATE_STR} ${DIM}7d:${RATE_7D_INT}%${RESET}"
  fi
fi

# Line 1: Agent + Context + Model
echo -e "${BOLD}${MAGENTA}🎼 ${AGENT}${RESET} ${DIM}|${RESET} ${CTX_COLOR}${BAR} ${CTX_INT}%${RESET} ${DIM}|${RESET} ${CYAN}${MODEL}${RESET}"

# Line 2: Cost + Duration + Lines + Rate limits
LINE2="${DIM}${COST_FMT}${RESET} ${DIM}|${RESET} ${DIM}⏱${RESET} ${DURATION_FMT} ${DIM}|${RESET} ${GREEN}+${LINES_ADD}${RESET}${DIM}/${RESET}${RED}-${LINES_REM}${RESET}"
if [ -n "$RATE_STR" ]; then
  LINE2="${LINE2} ${DIM}|${RESET} ${RATE_STR}"
fi
echo -e "$LINE2"
