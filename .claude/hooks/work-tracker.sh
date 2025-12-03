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

# Extract tool name and all file/path candidates using Node for robust JSON handling
readarray -t parsed <<<"$(printf '%s' "$payload" | node - <<'NODE'
const fs = require('fs');

const raw = fs.readFileSync(0, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}

const tool = data.tool || data.name || data.command || data.event || '';
const candidates = new Set();

const add = (value) => {
  if (typeof value === 'string' && value.trim()) {
    candidates.add(value.trim());
  }
};

['file', 'file_path', 'path', 'target', 'uri'].forEach((key) => add(data[key]));

const collect = (item) => {
  if (!item) return;
  if (typeof item === 'string') {
    add(item);
    return;
  }
  if (typeof item === 'object') {
    ['file', 'file_path', 'path', 'target', 'uri'].forEach((key) => add(item[key]));
  }
};

if (Array.isArray(data.files)) data.files.forEach(collect);
if (Array.isArray(data.paths)) data.paths.forEach(collect);
if (Array.isArray(data.targets)) data.targets.forEach(collect);

console.log(tool || '');
for (const file of candidates) {
  console.log(file);
}
NODE
)"

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
} >/dev/null 2>&1

exit 0
