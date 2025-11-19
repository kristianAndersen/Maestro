#!/bin/bash

# work-tracker.sh
# PostToolUse hook: Logs tool usage to .maestro-work-log.txt
# Receives JSON from stdin with tool name and file path information

# Read JSON from stdin
input=$(cat)

# Extract tool name and file path from JSON
# Handle various JSON formats that might be provided
tool=$(echo "$input" | grep -o '"tool"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
file=$(echo "$input" | grep -o '"file"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Alternative field names that might be used
if [ -z "$file" ]; then
    file=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

if [ -z "$file" ]; then
    file=$(echo "$input" | grep -o '"path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# Only log if we have both tool and file information
if [ -n "$tool" ] && [ -n "$file" ]; then
    # Get ISO 8601 timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Log to .maestro-work-log.txt in the repo root
    # Use absolute path to ensure we write to the correct location
    log_file="/Users/awesome/dev/devtest/Maestro/.maestro-work-log.txt"

    # Append log entry
    echo "[$timestamp] $tool: $file" >> "$log_file"
fi

# Silent operation - no output to stdout/stderr
exit 0
