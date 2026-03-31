#!/bin/bash
set -euo pipefail

# work-tracker.sh
# PostToolUse hook: Logs tool usage to .codex-work-log.txt (and .maestro-work-log.txt for compatibility)
# Receives JSON from stdin with tool name and file path information

# Read JSON payload from stdin
payload="$(cat)"

# Exit early if nothing was provided
if [ -z "${payload//[[:space:]]/}" ]; then
  exit 0
fi

# Extract tool name and all file/path candidates using jq for fast JSON parsing
# Handles multiple field names and deduplicates results
output="$(printf '%s' "$payload" | jq -r '
  # Extract tool name from multiple possible fields
  def tool_name:
    .tool // .name // .command // .event // "";

  # Extract candidate file/path values from various fields
  def extract_candidates:
    [
      # Top-level fields
      .file, .file_path, .path, .target, .uri,
      # Array fields (files, paths, targets)
      (if .files then .files[] else empty end |
        if type == "string" then .
        elif type == "object" then (.file, .file_path, .path, .target, .uri)
        else empty end),
      (if .paths then .paths[] else empty end |
        if type == "string" then .
        elif type == "object" then (.file, .file_path, .path, .target, .uri)
        else empty end),
      (if .targets then .targets[] else empty end |
        if type == "string" then .
        elif type == "object" then (.file, .file_path, .path, .target, .uri)
        else empty end)
    ]
    # Filter out nulls and empty strings, trim whitespace, deduplicate
    | map(select(. != null and . != ""))
    | map(gsub("^\\s+|\\s+$"; ""))
    | map(select(. != ""))
    | unique
    | .[];

  # Output tool name first, then all file paths (one per line)
  tool_name, extract_candidates
' 2>/dev/null || echo "")"

# Abort if parsing failed
if [ -z "$output" ]; then
  exit 0
fi

# Read output into array (compatible with older bash)
parsed=()
while IFS= read -r line; do
  parsed+=("$line")
done <<< "$output"

# Abort if parsing failed
if [ "${#parsed[@]}" -eq 0 ]; then
  exit 0
fi

tool_name="${parsed[0]:-}"
files=("${parsed[@]:1}")

# Build log entry
timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
log_primary="$repo_root/.codex-work-log.txt"
log_compat="$repo_root/.maestro-work-log.txt"

if [ "${#files[@]}" -gt 0 ]; then
  file_list="${files[0]}"
  for file in "${files[@]:1}"; do
    file_list+=", $file"
  done
else
  file_list="(no file reported)"
fi

log_entry="[$timestamp] ${tool_name:-unknown tool}: $file_list"

# Write to both Codex and Maestro logs quietly
{
  echo "$log_entry" >> "$log_primary"
  if [ "$log_primary" != "$log_compat" ]; then
    echo "$log_entry" >> "$log_compat"
  fi
} >/dev/null 2>&1 || true  # Never exit non-zero on log write failure — hook must not break tool results

exit 0
