#!/usr/bin/env bun

/**
 * CLI Tool for Maestro Memory Database Operations
 *
 * This tool provides command-line access to all database operations including:
 * - Database initialization
 * - Full-text search across conversations
 * - Listing and viewing conversations
 * - Database statistics
 * - Importing conversations from parser output
 *
 * Usage:
 *   bun cli-db-tool.ts init
 *   bun cli-db-tool.ts search "keyword"
 *   bun cli-db-tool.ts list
 *   bun cli-db-tool.ts show <conversation-id>
 *   bun cli-db-tool.ts stats
 *   bun cli-db-tool.ts import <file.json>
 */

import { initializeDatabase } from "./init";
import { storeConversation } from "./storage";
import {
  searchAll,
  searchMessages,
  searchDelegations,
  type SearchResult,
} from "./search";
import {
  getRecentConversations,
  getConversationStatsByDate,
  type ConversationSummary,
} from "./queries";
import { getConversationById } from "./retrieval";
import { openDatabase, closeDatabase } from "./connection";
import type { ParsedConversation } from "../memory/types";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

// ANSI color codes for terminal output
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
  white: "\x1b[37m",
};

// Default database path
const DEFAULT_DB_PATH = join(
  process.cwd(),
  ".claude",
  "memory",
  "conversations.db"
);

/**
 * Print colored text to console
 */
function print(text: string, color: keyof typeof colors = "reset"): void {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Print error message and exit
 */
function error(message: string): never {
  print(`\n❌ Error: ${message}`, "red");
  process.exit(1);
}

/**
 * Print success message
 */
function success(message: string): void {
  print(`\n✅ ${message}`, "green");
}

/**
 * Print info message
 */
function info(message: string): void {
  print(message, "cyan");
}

/**
 * Print warning message
 */
function warn(message: string): void {
  print(`⚠️  ${message}`, "yellow");
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Print table row separator
 */
function printSeparator(width: number = 80): void {
  print("─".repeat(width), "dim");
}

/**
 * Print help text
 */
function printHelp(): void {
  print("\n╔══════════════════════════════════════════════════════════════╗", "bright");
  print("║          Maestro Memory Database CLI Tool                   ║", "bright");
  print("╚══════════════════════════════════════════════════════════════╝", "bright");

  print("\nCOMMANDS:", "bright");
  print("\n  init", "green");
  print("    Initialize database at default location", "dim");
  print("    Example: bun cli-db-tool.ts init\n");

  print("  search <query>", "green");
  print("    Full-text search across all conversations", "dim");
  print("    Example: bun cli-db-tool.ts search 'agent delegation'\n");

  print("  list [--limit N]", "green");
  print("    List recent conversations (default: 20)", "dim");
  print("    Example: bun cli-db-tool.ts list --limit 10\n");

  print("  show <conversation-id>", "green");
  print("    Show full conversation details by ID", "dim");
  print("    Example: bun cli-db-tool.ts show abc123...\n");

  print("  stats", "green");
  print("    Show database statistics", "dim");
  print("    Example: bun cli-db-tool.ts stats\n");

  print("  import <file.json>", "green");
  print("    Import conversation from parser JSON output", "dim");
  print("    Example: bun cli-db-tool.ts import session.json\n");

  print("OPTIONS:", "bright");
  print("\n  --json", "yellow");
  print("    Output results in JSON format", "dim");
  print("    Example: bun cli-db-tool.ts list --json\n");

  print("  --db <path>", "yellow");
  print("    Use custom database path", "dim");
  print("    Example: bun cli-db-tool.ts --db /tmp/test.db list\n");

  print("DATABASE LOCATION:", "bright");
  print(`\n  Default: ${DEFAULT_DB_PATH}`, "dim");
  print("");
}

/**
 * Parse command-line arguments
 */
function parseArgs(): {
  command: string;
  args: string[];
  dbPath: string;
  jsonOutput: boolean;
  limit: number;
} {
  const argv = process.argv.slice(2);
  let command = "";
  const args: string[] = [];
  let dbPath = DEFAULT_DB_PATH;
  let jsonOutput = false;
  let limit = 20;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--db" && i + 1 < argv.length) {
      dbPath = argv[++i];
    } else if (arg === "--json") {
      jsonOutput = true;
    } else if (arg === "--limit" && i + 1 < argv.length) {
      limit = parseInt(argv[++i], 10);
      if (isNaN(limit) || limit < 1) {
        error("Invalid limit value. Must be a positive number.");
      }
    } else if (!command) {
      command = arg;
    } else {
      args.push(arg);
    }
  }

  return { command, args, dbPath, jsonOutput, limit };
}

/**
 * Initialize database command
 */
function cmdInit(dbPath: string): void {
  try {
    info(`Initializing database at: ${dbPath}`);
    initializeDatabase(dbPath);
    success(`Database initialized successfully!`);

    // Verify database is accessible
    const db = openDatabase(dbPath);
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    closeDatabase(db);

    print("\nTables created:", "bright");
    tables.forEach((table) => print(`  • ${table.name}`, "dim"));
  } catch (err) {
    error(`Failed to initialize database: ${(err as Error).message}`);
  }
}

/**
 * Search command
 */
function cmdSearch(
  dbPath: string,
  query: string,
  jsonOutput: boolean
): void {
  if (!query) {
    error("Search query is required. Usage: search <query>");
  }

  if (!existsSync(dbPath)) {
    error(`Database not found at: ${dbPath}\nRun 'init' first.`);
  }

  try {
    const results = searchAll(dbPath, query, 50);

    if (jsonOutput) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    if (results.length === 0) {
      warn(`No results found for: "${query}"`);
      return;
    }

    print(`\n🔍 Found ${results.length} result(s) for: "${query}"`, "bright");
    printSeparator();

    results.forEach((result, index) => {
      print(`\n${index + 1}. [${result.type.toUpperCase()}]`, "cyan");
      print(`   Conversation: ${result.conversationId}`, "dim");
      print(`   Timestamp: ${formatTimestamp(result.timestamp)}`, "dim");
      if (result.agent) {
        print(`   Agent: ${result.agent}`, "yellow");
      }
      print(`\n   ${truncate(result.snippet, 120)}`, "white");
      printSeparator(60);
    });

    print("");
  } catch (err) {
    error(`Search failed: ${(err as Error).message}`);
  }
}

/**
 * List conversations command
 */
function cmdList(
  dbPath: string,
  limit: number,
  jsonOutput: boolean
): void {
  if (!existsSync(dbPath)) {
    error(`Database not found at: ${dbPath}\nRun 'init' first.`);
  }

  try {
    const conversations = getRecentConversations(dbPath, limit);

    if (jsonOutput) {
      console.log(JSON.stringify(conversations, null, 2));
      return;
    }

    if (conversations.length === 0) {
      warn("No conversations found in database.");
      return;
    }

    print(`\n📋 Recent conversations (${conversations.length}):`, "bright");
    printSeparator();

    conversations.forEach((conv, index) => {
      print(`\n${index + 1}. ${conv.id}`, "cyan");
      print(`   Started: ${formatTimestamp(conv.startTime)}`, "dim");
      print(`   Duration: ${Math.round(conv.duration / 1000)}s`, "dim");
      print(`   Messages: ${conv.messageCount}`, "dim");
      if (conv.primaryAgent) {
        print(`   Agent: ${conv.primaryAgent}`, "yellow");
      }
      if (conv.skillsUsed && conv.skillsUsed.length > 0) {
        print(`   Skills: ${conv.skillsUsed.join(", ")}`, "magenta");
      }
      if (conv.filesModified && conv.filesModified.length > 0) {
        const files = conv.filesModified.slice(0, 3).join(", ");
        const more = conv.filesModified.length > 3
          ? ` (+${conv.filesModified.length - 3} more)`
          : "";
        print(`   Files: ${files}${more}`, "green");
      }
    });

    print("");
  } catch (err) {
    error(`Failed to list conversations: ${(err as Error).message}`);
  }
}

/**
 * Show conversation details command
 */
function cmdShow(
  dbPath: string,
  conversationId: string,
  jsonOutput: boolean
): void {
  if (!conversationId) {
    error("Conversation ID is required. Usage: show <conversation-id>");
  }

  if (!existsSync(dbPath)) {
    error(`Database not found at: ${dbPath}\nRun 'init' first.`);
  }

  try {
    const conversation = getConversationById(dbPath, conversationId);

    if (!conversation) {
      error(`Conversation not found: ${conversationId}`);
    }

    if (jsonOutput) {
      console.log(JSON.stringify(conversation, null, 2));
      return;
    }

    print(`\n╔══════════════════════════════════════════════════════════════╗`, "bright");
    print(`║              CONVERSATION DETAILS                            ║`, "bright");
    print(`╚══════════════════════════════════════════════════════════════╝`, "bright");

    print(`\nID: ${conversation.id}`, "cyan");
    print(`Started: ${formatTimestamp(conversation.startTime)}`, "dim");
    print(`Ended: ${formatTimestamp(conversation.endTime)}`, "dim");
    print(`Duration: ${Math.round(conversation.duration / 1000)}s`, "dim");

    if (conversation.primaryAgent) {
      print(`Primary Agent: ${conversation.primaryAgent}`, "yellow");
    }

    if (conversation.skillsUsed && conversation.skillsUsed.length > 0) {
      print(`\nSkills Used (${conversation.skillsUsed.length}):`, "bright");
      conversation.skillsUsed.forEach((skill) => print(`  • ${skill}`, "magenta"));
    }

    if (conversation.filesModified && conversation.filesModified.length > 0) {
      print(`\nFiles Modified (${conversation.filesModified.length}):`, "bright");
      conversation.filesModified.forEach((file) => print(`  • ${file}`, "green"));
    }

    print(`\n${"─".repeat(64)}`, "dim");
    print(`MESSAGES (${conversation.messages.length}):`, "bright");
    print("─".repeat(64), "dim");

    conversation.messages.forEach((msg, index) => {
      const roleColor = msg.role === "user" ? "cyan" : "yellow";
      print(`\n[${index + 1}] ${msg.role} - ${formatTimestamp(msg.timestamp)}`, roleColor);
      print(truncate(msg.content, 500), "white");
    });

    if (conversation.delegations && conversation.delegations.length > 0) {
      print(`\n${"─".repeat(64)}`, "dim");
      print(`DELEGATIONS (${conversation.delegations.length}):`, "bright");
      print("─".repeat(64), "dim");

      conversation.delegations.forEach((delegation, index) => {
        print(`\n[${index + 1}] ${delegation.agentName} - ${formatTimestamp(delegation.timestamp)}`, "magenta");
        print(`   Product: ${truncate(delegation.product, 100)}`, "dim");
        print(`   Process: ${truncate(delegation.process, 100)}`, "dim");
        print(`   Performance: ${truncate(delegation.performance, 100)}`, "dim");
      });
    }

    if (conversation.evaluations && conversation.evaluations.length > 0) {
      print(`\n${"─".repeat(64)}`, "dim");
      print(`EVALUATIONS (${conversation.evaluations.length}):`, "bright");
      print("─".repeat(64), "dim");

      conversation.evaluations.forEach((evaluation, index) => {
        const verdictColor = evaluation.verdict === "EXCELLENT" ? "green" : "yellow";
        print(`\n[${index + 1}] ${evaluation.verdict} - ${formatTimestamp(evaluation.timestamp)}`, verdictColor);
        if (evaluation.evaluatedAgent) {
          print(`   Agent: ${evaluation.evaluatedAgent}`, "dim");
        }
        if (evaluation.refinementNeeded) {
          print(`   Refinement: ${truncate(evaluation.refinementNeeded, 100)}`, "dim");
        }
      });
    }

    if (conversation.toolCalls && conversation.toolCalls.length > 0) {
      print(`\n${"─".repeat(64)}`, "dim");
      print(`TOOL CALLS (${conversation.toolCalls.length}):`, "bright");
      print("─".repeat(64), "dim");

      const toolCounts = conversation.toolCalls.reduce((acc, tool) => {
        acc[tool.toolName] = (acc[tool.toolName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(toolCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([tool, count]) => {
          print(`  • ${tool}: ${count}`, "blue");
        });
    }

    print("");
  } catch (err) {
    error(`Failed to show conversation: ${(err as Error).message}`);
  }
}

/**
 * Database statistics command
 */
function cmdStats(dbPath: string, jsonOutput: boolean): void {
  if (!existsSync(dbPath)) {
    error(`Database not found at: ${dbPath}\nRun 'init' first.`);
  }

  try {
    const db = openDatabase(dbPath);

    // Get counts from each table
    const conversationCount = (
      db.query("SELECT COUNT(*) as count FROM conversations").get() as any
    ).count;
    const messageCount = (
      db.query("SELECT COUNT(*) as count FROM messages").get() as any
    ).count;
    const delegationCount = (
      db.query("SELECT COUNT(*) as count FROM delegations").get() as any
    ).count;
    const evaluationCount = (
      db.query("SELECT COUNT(*) as count FROM evaluations").get() as any
    ).count;
    const toolCallCount = (
      db.query("SELECT COUNT(*) as count FROM tool_calls").get() as any
    ).count;

    // Get agent counts
    const agentStats = db
      .query(
        `SELECT primary_agent, COUNT(*) as count
         FROM conversations
         WHERE primary_agent IS NOT NULL
         GROUP BY primary_agent
         ORDER BY count DESC
         LIMIT 10`
      )
      .all() as { primary_agent: string; count: number }[];

    // Get skill usage
    const skillStats = db
      .query(
        `SELECT skill_name, COUNT(*) as count
         FROM skills_used
         GROUP BY skill_name
         ORDER BY count DESC
         LIMIT 10`
      )
      .all() as { skill_name: string; count: number }[];

    // Get recent activity
    const recentActivity = db
      .query(
        `SELECT DATE(start_time) as date, COUNT(*) as count
         FROM conversations
         GROUP BY DATE(start_time)
         ORDER BY date DESC
         LIMIT 7`
      )
      .all() as { date: string; count: number }[];

    closeDatabase(db);

    if (jsonOutput) {
      const stats = {
        totals: {
          conversations: conversationCount,
          messages: messageCount,
          delegations: delegationCount,
          evaluations: evaluationCount,
          toolCalls: toolCallCount,
        },
        topAgents: agentStats,
        topSkills: skillStats,
        recentActivity,
      };
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    print("\n╔══════════════════════════════════════════════════════════════╗", "bright");
    print("║              DATABASE STATISTICS                             ║", "bright");
    print("╚══════════════════════════════════════════════════════════════╝", "bright");

    print("\nTOTALS:", "bright");
    print(`  Conversations: ${conversationCount}`, "cyan");
    print(`  Messages: ${messageCount}`, "dim");
    print(`  Delegations: ${delegationCount}`, "dim");
    print(`  Evaluations: ${evaluationCount}`, "dim");
    print(`  Tool Calls: ${toolCallCount}`, "dim");

    if (agentStats.length > 0) {
      print("\nTOP AGENTS:", "bright");
      agentStats.forEach((agent) => {
        print(`  ${agent.primary_agent}: ${agent.count} conversations`, "yellow");
      });
    }

    if (skillStats.length > 0) {
      print("\nTOP SKILLS:", "bright");
      skillStats.forEach((skill) => {
        print(`  ${skill.skill_name}: ${skill.count} uses`, "magenta");
      });
    }

    if (recentActivity.length > 0) {
      print("\nRECENT ACTIVITY (Last 7 Days):", "bright");
      recentActivity.forEach((day) => {
        print(`  ${day.date}: ${day.count} conversations`, "green");
      });
    }

    print("");
  } catch (err) {
    error(`Failed to get statistics: ${(err as Error).message}`);
  }
}

/**
 * Import conversation command
 */
function cmdImport(dbPath: string, filePath: string): void {
  if (!filePath) {
    error("File path is required. Usage: import <file.json>");
  }

  if (!existsSync(filePath)) {
    error(`File not found: ${filePath}`);
  }

  if (!existsSync(dbPath)) {
    error(`Database not found at: ${dbPath}\nRun 'init' first.`);
  }

  try {
    info(`Reading file: ${filePath}`);
    const fileContent = readFileSync(filePath, "utf-8");
    const parsed: ParsedConversation = JSON.parse(fileContent);

    info(`Importing conversation...`);
    const conversationId = storeConversation(dbPath, parsed);

    success(`Conversation imported successfully!`);
    print(`\nConversation ID: ${conversationId}`, "cyan");
    print(`Messages: ${parsed.messages.length}`, "dim");
    print(`Delegations: ${parsed.delegations?.length || 0}`, "dim");
    print(`Evaluations: ${parsed.evaluations?.length || 0}`, "dim");
    print(`Tool Calls: ${parsed.toolCalls?.length || 0}`, "dim");
  } catch (err) {
    error(`Import failed: ${(err as Error).message}`);
  }
}

/**
 * Main entry point
 */
function main(): void {
  const { command, args, dbPath, jsonOutput, limit } = parseArgs();

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "init":
      cmdInit(dbPath);
      break;

    case "search":
      cmdSearch(dbPath, args[0], jsonOutput);
      break;

    case "list":
      cmdList(dbPath, limit, jsonOutput);
      break;

    case "show":
      cmdShow(dbPath, args[0], jsonOutput);
      break;

    case "stats":
      cmdStats(dbPath, jsonOutput);
      break;

    case "import":
      cmdImport(dbPath, args[0]);
      break;

    default:
      error(`Unknown command: ${command}\nRun with --help for usage information.`);
  }
}

// Run main function
main();
