#!/usr/bin/env bun
/**
 * CLI tool for testing the Maestro memory parser
 *
 * Usage:
 *   bun cli-test-parser.ts <file-path> [--json|--summary]
 *   bun cli-test-parser.ts --help
 *
 * Examples:
 *   bun cli-test-parser.ts ../../sessions/session-123.json
 *   bun cli-test-parser.ts ../../sessions/session-123.json --json
 *   bun cli-test-parser.ts conversation.txt --summary
 */

import * as fs from "fs";
import * as path from "path";
import { parseConversation } from "./parser";
import type { ParsedConversation } from "./types";

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Formats a duration in milliseconds to human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Formats a timestamp to human-readable format
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString();
}

/**
 * Prints help information
 */
function printHelp(): void {
  console.log(`
${colors.bright}Maestro Memory Parser - CLI Testing Tool${colors.reset}

${colors.cyan}USAGE:${colors.reset}
  bun cli-test-parser.ts <file-path> [options]

${colors.cyan}OPTIONS:${colors.reset}
  --json        Output full parsed JSON structure
  --summary     Output human-readable summary (default)
  --help        Show this help message

${colors.cyan}EXAMPLES:${colors.reset}
  ${colors.dim}# Parse a session file and show summary${colors.reset}
  bun cli-test-parser.ts ../../sessions/08b6fe33-5ba6-48bd-a06c-361fd8520e68.backup.json

  ${colors.dim}# Output full JSON structure${colors.reset}
  bun cli-test-parser.ts ../../sessions/session-123.json --json

  ${colors.dim}# Parse a plain text conversation${colors.reset}
  bun cli-test-parser.ts conversation.txt

${colors.cyan}FILE FORMATS:${colors.reset}
  The parser supports multiple input formats:
  - JSON session files (from .claude/sessions/)
  - Plain text conversations with delimiters
  - Direct message arrays in JSON

${colors.cyan}OUTPUT:${colors.reset}
  ${colors.green}--summary${colors.reset} (default): Human-readable report with:
    - Message count and roles breakdown
    - Agent delegations found
    - Tool calls executed
    - 4-D evaluations performed
    - Metadata (skills used, files modified, duration)
    - Validation report (what was found, what was missed)

  ${colors.green}--json${colors.reset}: Complete parsed structure as JSON for:
    - Programmatic processing
    - Debugging parser output
    - Integration testing
`);
}

/**
 * Prints summary of parsed conversation
 */
function printSummary(parsed: ParsedConversation, filePath: string): void {
  console.log(`\n${colors.bright}${colors.cyan}=== Parser Results for ${path.basename(filePath)} ===${colors.reset}\n`);

  // Messages summary
  console.log(`${colors.bright}${colors.blue}MESSAGES${colors.reset} (${parsed.messages.length} total)`);
  if (parsed.messages.length > 0) {
    const roleCounts: Record<string, number> = {};
    for (const msg of parsed.messages) {
      roleCounts[msg.role] = (roleCounts[msg.role] || 0) + 1;
    }
    console.log(`  Role breakdown:`);
    for (const [role, count] of Object.entries(roleCounts).sort((a, b) => b[1] - a[1])) {
      const icon =
        role === "user" ? "👤" :
        role === "maestro" ? "🎼" :
        role === "system" ? "⚙️" :
        role === "assistant" ? "🤖" :
        "🔧"; // agent
      console.log(`    ${icon} ${colors.green}${role}${colors.reset}: ${count} message${count !== 1 ? "s" : ""}`);
    }
  } else {
    console.log(`  ${colors.yellow}⚠ No messages extracted${colors.reset}`);
  }

  // Delegations summary
  console.log(`\n${colors.bright}${colors.blue}DELEGATIONS${colors.reset} (${parsed.delegations.length} total)`);
  if (parsed.delegations.length > 0) {
    for (let i = 0; i < parsed.delegations.length; i++) {
      const delegation = parsed.delegations[i];
      const delegatedByLabel = delegation.delegatedBy ? ` (by ${delegation.delegatedBy})` : "";
      console.log(`  ${i + 1}. ${colors.cyan}${delegation.agentName}${colors.reset}${delegatedByLabel}`);
      console.log(`     Product: ${delegation.product.substring(0, 60)}${delegation.product.length > 60 ? "..." : ""}`);
    }
  } else {
    console.log(`  ${colors.dim}No delegations found${colors.reset}`);
  }

  // Tool calls summary
  console.log(`\n${colors.bright}${colors.blue}TOOL CALLS${colors.reset} (${parsed.toolCalls.length} total)`);
  if (parsed.toolCalls.length > 0) {
    const toolCounts: Record<string, number> = {};
    const successCount = parsed.toolCalls.filter(t => t.success).length;
    const failureCount = parsed.toolCalls.length - successCount;

    for (const tool of parsed.toolCalls) {
      toolCounts[tool.toolName] = (toolCounts[tool.toolName] || 0) + 1;
    }

    console.log(`  Success rate: ${colors.green}${successCount}${colors.reset} / ${colors.red}${failureCount} failed${colors.reset}`);
    console.log(`  Tool breakdown:`);
    for (const [tool, count] of Object.entries(toolCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${colors.cyan}${tool}${colors.reset}: ${count}×`);
    }

    // Show failed tool calls if any
    const failures = parsed.toolCalls.filter(t => !t.success);
    if (failures.length > 0) {
      console.log(`  ${colors.red}Failed calls:${colors.reset}`);
      for (const failure of failures) {
        console.log(`    ${colors.yellow}${failure.toolName}${colors.reset}: ${failure.errorMessage?.substring(0, 60) || "Unknown error"}`);
      }
    }
  } else {
    console.log(`  ${colors.dim}No tool calls found${colors.reset}`);
  }

  // Evaluations summary
  console.log(`\n${colors.bright}${colors.blue}4-D EVALUATIONS${colors.reset} (${parsed.evaluations.length} total)`);
  if (parsed.evaluations.length > 0) {
    for (let i = 0; i < parsed.evaluations.length; i++) {
      const evaluation = parsed.evaluations[i];
      const verdictColor = evaluation.verdict === "EXCELLENT" ? colors.green : colors.yellow;
      const evaluatedLabel = evaluation.evaluatedAgent ? ` for ${evaluation.evaluatedAgent}` : "";
      console.log(`  ${i + 1}. ${verdictColor}${evaluation.verdict}${colors.reset}${evaluatedLabel}`);

      if (evaluation.dimensions.productDiscernment) {
        console.log(`     Product: ${evaluation.dimensions.productDiscernment.substring(0, 60)}${evaluation.dimensions.productDiscernment.length > 60 ? "..." : ""}`);
      }
      if (evaluation.refinementNeeded) {
        console.log(`     ${colors.yellow}Refinement needed${colors.reset}: ${evaluation.refinementNeeded.substring(0, 60)}...`);
      }
    }
  } else {
    console.log(`  ${colors.dim}No evaluations found${colors.reset}`);
  }

  // Metadata summary
  console.log(`\n${colors.bright}${colors.blue}METADATA${colors.reset}`);
  const meta = parsed.metadata;
  console.log(`  Start: ${colors.cyan}${formatTimestamp(meta.startTime)}${colors.reset}`);
  console.log(`  End: ${colors.cyan}${formatTimestamp(meta.endTime)}${colors.reset}`);
  console.log(`  Duration: ${colors.cyan}${formatDuration(meta.duration)}${colors.reset}`);
  if (meta.primaryAgent) {
    console.log(`  Primary agent: ${colors.green}${meta.primaryAgent}${colors.reset}`);
  }

  if (meta.skillsUsed && meta.skillsUsed.length > 0) {
    console.log(`  Skills used: ${colors.magenta}${meta.skillsUsed.join(", ")}${colors.reset}`);
  }

  if (meta.filesModified && meta.filesModified.length > 0) {
    console.log(`  Files modified (${meta.filesModified.length}):`);
    for (const file of meta.filesModified.slice(0, 5)) {
      console.log(`    ${colors.dim}${file}${colors.reset}`);
    }
    if (meta.filesModified.length > 5) {
      console.log(`    ${colors.dim}... and ${meta.filesModified.length - 5} more${colors.reset}`);
    }
  }

  if (meta.tokenUsage) {
    console.log(`  Token usage: ${colors.cyan}${meta.tokenUsage.total.toLocaleString()}${colors.reset} (${meta.tokenUsage.input.toLocaleString()} in / ${meta.tokenUsage.output.toLocaleString()} out)`);
  }

  // Validation report
  console.log(`\n${colors.bright}${colors.blue}VALIDATION REPORT${colors.reset}`);
  const hasMessages = parsed.messages.length > 0;
  const hasDelegations = parsed.delegations.length > 0;
  const hasToolCalls = parsed.toolCalls.length > 0;
  const hasEvaluations = parsed.evaluations.length > 0;
  const hasMetadata = meta.messageCount > 0;

  console.log(`  ${hasMessages ? colors.green + "✓" : colors.red + "✗"} Messages extracted${colors.reset}`);
  console.log(`  ${hasDelegations ? colors.green + "✓" : colors.dim + "○"} Delegations found${colors.reset}`);
  console.log(`  ${hasToolCalls ? colors.green + "✓" : colors.dim + "○"} Tool calls found${colors.reset}`);
  console.log(`  ${hasEvaluations ? colors.green + "✓" : colors.dim + "○"} Evaluations found${colors.reset}`);
  console.log(`  ${hasMetadata ? colors.green + "✓" : colors.red + "✗"} Metadata extracted${colors.reset}`);

  if (!hasDelegations && !hasToolCalls && !hasEvaluations) {
    console.log(`\n  ${colors.yellow}ℹ Note: No delegations, tool calls, or evaluations found.${colors.reset}`);
    console.log(`  ${colors.dim}This may be normal for simple conversations or user-only messages.${colors.reset}`);
  }

  console.log(); // Final newline
}

/**
 * Prints full JSON output
 */
function printJSON(parsed: ParsedConversation): void {
  console.log(JSON.stringify(parsed, null, 2));
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  const filePath = args[0];
  const outputMode = args.includes("--json") ? "json" : "summary";

  // Validate file path
  if (!filePath) {
    console.error(`${colors.red}Error: No file path provided${colors.reset}`);
    console.error(`Run with --help for usage information`);
    process.exit(1);
  }

  // Resolve absolute path
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    console.error(`${colors.red}Error: File not found: ${absolutePath}${colors.reset}`);
    process.exit(1);
  }

  // Check if file is readable
  try {
    fs.accessSync(absolutePath, fs.constants.R_OK);
  } catch (error) {
    console.error(`${colors.red}Error: Cannot read file: ${absolutePath}${colors.reset}`);
    console.error(`Permission denied or file is not readable`);
    process.exit(1);
  }

  // Read file content
  let rawContent: string;
  try {
    rawContent = fs.readFileSync(absolutePath, "utf-8");
  } catch (error) {
    console.error(`${colors.red}Error reading file: ${error}${colors.reset}`);
    process.exit(1);
  }

  // Check if file is empty
  if (rawContent.trim().length === 0) {
    console.error(`${colors.yellow}Warning: File is empty${colors.reset}`);
    console.error(`File: ${absolutePath}`);
    process.exit(1);
  }

  // Parse the conversation
  let parsed: ParsedConversation;
  try {
    const startTime = performance.now();
    parsed = parseConversation(rawContent);
    const endTime = performance.now();
    const parseTime = endTime - startTime;

    if (outputMode === "summary") {
      console.log(`${colors.dim}Parsed in ${parseTime.toFixed(2)}ms${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error parsing conversation: ${error}${colors.reset}`);
    if (error instanceof Error && error.stack) {
      console.error(`${colors.dim}${error.stack}${colors.reset}`);
    }
    process.exit(1);
  }

  // Output results
  if (outputMode === "json") {
    printJSON(parsed);
  } else {
    printSummary(parsed, absolutePath);
  }

  // Check for parser log file and mention it
  const logPath = path.join(process.cwd(), ".claude", "logs", "parser.log");
  if (fs.existsSync(logPath)) {
    const logStats = fs.statSync(logPath);
    if (logStats.size > 0) {
      console.log(`${colors.yellow}ℹ Parser log file contains errors: ${logPath}${colors.reset}`);
      console.log(`${colors.dim}  Log size: ${(logStats.size / 1024).toFixed(2)} KB${colors.reset}`);
    }
  }
}

// Run CLI
main().catch((error) => {
  console.error(`${colors.red}Unexpected error: ${error}${colors.reset}`);
  process.exit(1);
});
