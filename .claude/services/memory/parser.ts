/**
 * Maestro memory system parser
 *
 * Parses conversation history to extract structured information about
 * messages, agent delegations, tool calls, and 4-D evaluations.
 */

import type {
  ConversationMessage,
  AgentDelegation,
  ToolCall,
  EvaluationResult,
  ConversationMetadata,
  ParsedConversation,
} from "./types";

import * as fs from "fs";
import * as path from "path";

/**
 * Log directory for parser errors
 */
const LOG_DIR = path.join(process.cwd(), ".claude", "logs");
const LOG_FILE = path.join(LOG_DIR, "parser.log");

/**
 * Ensures log directory exists
 */
function ensureLogDirectory(): void {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (error) {
    // Silently fail - logging is not critical to parser function
    console.error("Failed to create log directory:", error);
  }
}

/**
 * Logs parser errors to file
 */
function logParserError(context: string, error: unknown, additionalInfo?: Record<string, any>): void {
  try {
    ensureLogDirectory();

    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const logEntry = {
      timestamp,
      context,
      error: errorMessage,
      stack: errorStack,
      ...additionalInfo,
    };

    const logLine = JSON.stringify(logEntry) + "\n";
    fs.appendFileSync(LOG_FILE, logLine, "utf-8");

    // Also log to console for immediate visibility
    console.error(`[Parser Error] ${context}:`, errorMessage);
    if (additionalInfo) {
      console.error("Additional context:", additionalInfo);
    }
  } catch (logError) {
    // If logging fails, at least show in console
    console.error("Failed to write to parser log:", logError);
    console.error("Original error:", error);
  }
}

/**
 * Detects the role/participant from a message's content
 *
 * Analyzes message patterns to identify if it's from:
 * - user
 * - assistant (Claude/generic)
 * - specific agent (maestro, file-writer, base-research, etc.)
 * - system
 *
 * @param content - The message content to analyze
 * @returns The detected role as a string
 */
export function detectMessageRole(content: string): string {
  try {
    // Handle empty or whitespace-only content
    if (!content || content.trim().length === 0) {
      return "assistant";
    }

    const trimmedContent = content.trim();

    // Check for system messages (usually start with specific markers)
    // System messages often contain configuration, context, or metadata
    if (
      trimmedContent.startsWith("<system>") ||
      trimmedContent.startsWith("System:") ||
      trimmedContent.includes("<system_reminder>") ||
      trimmedContent.includes("claudeMd") ||
      trimmedContent.includes("Codebase and user instructions")
    ) {
      return "system";
    }

    // Check for subagent report format FIRST (before Maestro emojis)
    // Subagents return structured reports starting with "Task:"
    // This must come before emoji check because agent reports can contain emojis
    const taskReportPattern = /^Task:\s+/m;
    if (taskReportPattern.test(trimmedContent)) {
      // Try to detect which specific agent from common patterns
      if (trimmedContent.includes("Skills Used:") && trimmedContent.includes("Actions Taken:")) {
        // Standard subagent report format - try to identify specific agent

        // file-writer: Look for write operations and file creation patterns
        if (trimmedContent.match(/✍️|File:.*\(CREATED\|MODIFIED\)/)) {
          return "file-writer";
        }

        // file-reader: Look for read operations and content analysis (NOT the 📖 emoji alone)
        if (trimmedContent.match(/Reading file|Content analysis/i)) {
          return "file-reader";
        }

        // base-research: Look for research patterns
        if (trimmedContent.match(/Research findings|Sources examined/i)) {
          return "base-research";
        }

        // base-analysis: Look for analysis patterns
        if (trimmedContent.match(/Analysis results|Quality assessment/i)) {
          return "base-analysis";
        }

        // fetch: Look for external data retrieval (NOT the 🌐 emoji alone)
        if (trimmedContent.match(/Fetched data|External source/i)) {
          return "fetch";
        }

        // 4d-evaluation: Look for evaluation verdict
        if (trimmedContent.match(/Verdict:|EXCELLENT|NEEDS REFINEMENT/)) {
          return "4d-evaluation";
        }

        // Default to "agent" if we can't identify specific type
        return "agent";
      }

      return "agent";
    }

    // Check for Maestro emoji markers (indicates Maestro conductor is active)
    // This must come AFTER agent report check to avoid false positives
    // Only check for Maestro-specific emojis at the start or in delegation context
    // 🎼 = Analyzing, 📋 = Planning, 📤 = Delegating, 🔍 = Evaluating, 🔄 = Refining, ✅ = Complete
    const maestroEmojiPattern = /^[🎼📋📤🔍🔄✅]|^\s*[🎼📋📤🔍🔄✅]/;
    if (maestroEmojiPattern.test(trimmedContent)) {
      return "maestro";
    }

    // Check for user prompt patterns
    // Users typically ask questions, make requests, or give commands
    const userPatterns = [
      /^\/\w+/,                    // Slash commands like /maestro, /diary
      /^(please|can you|could you|would you|i need|i want|help|show me|tell me)/i,
      /\?$/m,                      // Questions ending with ?
      /^(create|build|make|write|implement|add|update|fix|debug|analyze)/i,
    ];

    for (const pattern of userPatterns) {
      if (pattern.test(trimmedContent)) {
        return "user";
      }
    }

    // Check if content looks like a delegation (PRODUCT, PROCESS, PERFORMANCE)
    // This indicates Maestro or another agent is delegating work
    if (
      trimmedContent.includes("PRODUCT") &&
      trimmedContent.includes("PROCESS") &&
      trimmedContent.includes("PERFORMANCE")
    ) {
      // If it's a delegation, check who's delegating
      // Use strict pattern for Maestro emoji at start
      if (maestroEmojiPattern.test(trimmedContent)) {
        return "maestro";
      }
      return "agent"; // Could be inter-agent delegation
    }

    // Check for tool invocations (indicates assistant/agent activity)
    const toolInvocationPattern = /<function_calls>|<invoke name=/;
    if (toolInvocationPattern.test(trimmedContent)) {
      return "assistant";
    }

    // Default to assistant for any content that doesn't match specific patterns
    return "assistant";
  } catch (error) {
    logParserError("detectMessageRole", error, { contentLength: content?.length });
    // Return safe default on error
    return "assistant";
  }
}

/**
 * Parses agent delegation from message content
 *
 * Extracts 3P format delegation (PRODUCT, PROCESS, PERFORMANCE) and
 * identifies the target agent being delegated to.
 *
 * @param content - The message content to parse
 * @returns AgentDelegation object if delegation found, null otherwise
 */
export function parseAgentDelegation(content: string): AgentDelegation | null {
  try {
    // Return null for empty content
    if (!content || content.trim().length === 0) {
      return null;
    }

    // Check if content contains 3P format markers
    const has3PFormat =
      content.includes("PRODUCT") &&
      content.includes("PROCESS") &&
      content.includes("PERFORMANCE");

    if (!has3PFormat) {
      return null;
    }

    // Try to extract the agent name from various patterns
    let agentName: string | null = null;

    // Pattern 1: Task tool invocation with subagent_type parameter
    // Example: Task tool with subagent_type='file-writer'
    const taskToolPattern = /Task tool with subagent_type=['"]([^'"]+)['"]/;
    const taskToolMatch = content.match(taskToolPattern);
    if (taskToolMatch) {
      agentName = taskToolMatch[1];
    }

    // Pattern 2: XML-style Task invocation
    // Example: invoke name="Task" with parameter name="subagent_type" value="file-writer"
    const xmlTaskPattern = /<parameter name="subagent_type">([^<]+)<\/parameter>/;
    const xmlTaskMatch = content.match(xmlTaskPattern);
    if (!agentName && xmlTaskMatch) {
      agentName = xmlTaskMatch[1];
    }

    // Pattern 3: Slash command delegation
    // Example: /agent file-writer
    const slashCommandPattern = /\/agent\s+([a-z0-9-]+)/;
    const slashCommandMatch = content.match(slashCommandPattern);
    if (!agentName && slashCommandMatch) {
      agentName = slashCommandMatch[1];
    }

    // Pattern 4: Delegation statement
    // Example: "Delegating to file-writer agent" or "📤 Delegating to file-writer"
    // Fixed: Capture the agent name after "to", not "Delegating"
    const delegationStatementPattern = /(?:Delegating to|📤\s*Delegating to)\s+([a-z0-9-]+)(?:\s+agent)?/i;
    const delegationStatementMatch = content.match(delegationStatementPattern);
    if (!agentName && delegationStatementMatch) {
      agentName = delegationStatementMatch[1];
    }

    // Pattern 5: Simplified emoji + agent name pattern
    // Example: "📤 fetch" (emoji followed by agent name)
    const emojiAgentPattern = /📤\s+([a-z0-9-]+)/;
    const emojiAgentMatch = content.match(emojiAgentPattern);
    if (!agentName && emojiAgentMatch) {
      agentName = emojiAgentMatch[1];
    }

    // If we still don't have an agent name, return null (can't determine target)
    if (!agentName) {
      return null;
    }

    // Extract PRODUCT section
    // Capture everything from "PRODUCT" (with optional markers) to "PROCESS"
    const productPattern = /\*\*PRODUCT\*\*[^\n]*\n([\s\S]*?)(?=\*\*PROCESS\*\*)/;
    const productMatch = content.match(productPattern);
    const product = productMatch ? productMatch[1].trim() : "";

    // Extract PROCESS section
    // Capture everything from "PROCESS" to "PERFORMANCE"
    const processPattern = /\*\*PROCESS\*\*[^\n]*\n([\s\S]*?)(?=\*\*PERFORMANCE\*\*)/;
    const processMatch = content.match(processPattern);
    const process = processMatch ? processMatch[1].trim() : "";

    // Extract PERFORMANCE section
    // Capture everything from "PERFORMANCE" to end or next major section
    const performancePattern = /\*\*PERFORMANCE\*\*[^\n]*\n([\s\S]*?)(?=\n\n[A-Z#]|\n```|$)/;
    const performanceMatch = content.match(performancePattern);
    const performance = performanceMatch ? performanceMatch[1].trim() : "";

    // Extract timestamp if present (ISO 8601 format)
    // Example: 2025-12-16T10:30:00Z or 2025-12-16T10:30:00.000Z
    const timestampPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)/;
    const timestampMatch = content.match(timestampPattern);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();

    // Try to detect who is delegating
    let delegatedBy: string | undefined;

    // Check for Maestro emoji markers (at the start of lines)
    if (/^[🎼📋📤🔍🔄✅]|^\s*[🎼📋📤🔍🔄✅]/m.test(content)) {
      delegatedBy = "maestro";
    } else if (content.includes("Task:") && content.includes("Skills Used:")) {
      // Could be inter-agent delegation from a subagent report
      // Try to extract the delegating agent from report structure
      const taskMatch = content.match(/Task:\s+([^\n]+)/);
      if (taskMatch) {
        delegatedBy = "agent"; // Generic inter-agent delegation
      }
    }

    return {
      agentName,
      product,
      process,
      performance,
      timestamp,
      delegatedBy,
    };
  } catch (error) {
    logParserError("parseAgentDelegation", error, { contentLength: content?.length });
    return null;
  }
}

/**
 * Parses tool calls from message content
 *
 * Extracts all tool invocations including:
 * - Tool name (Read, Write, Edit, Grep, Glob, Bash, Task, Skill)
 * - Parameters passed to the tool
 * - Results returned by the tool
 * - Success/failure status
 *
 * @param content - The message content to parse
 * @returns Array of ToolCall objects (empty if none found)
 */
export function parseToolCalls(content: string): ToolCall[] {
  try {
    // Return empty array for empty content
    if (!content || content.trim().length === 0) {
      return [];
    }

    const toolCalls: ToolCall[] = [];

    // Look for <function_calls> blocks
    const functionCallsPattern = /<function_calls>([\s\S]*?)<\/function_calls>/g;
    const functionCallsMatches = content.matchAll(functionCallsPattern);

    for (const functionCallsMatch of functionCallsMatches) {
      const functionCallsBlock = functionCallsMatch[1];

      // Extract individual tool invocations within the block
      const invokePattern = /<invoke name="([^"]+)">([\s\S]*?)<\/invoke>/g;
      const invokeMatches = functionCallsBlock.matchAll(invokePattern);

      for (const invokeMatch of invokeMatches) {
        try {
          const toolName = invokeMatch[1];
          const invokeContent = invokeMatch[2];

          // Extract parameters
          const parameters: Record<string, any> = {};
          const paramPattern = /<parameter name="([^"]+)">([^]*?)<\/parameter>/g;
          const paramMatches = invokeContent.matchAll(paramPattern);

          for (const paramMatch of paramMatches) {
            const paramName = paramMatch[1];
            let paramValue: any = paramMatch[2].trim();

            // Try to parse as JSON if it looks like JSON
            if (
              (paramValue.startsWith("{") && paramValue.endsWith("}")) ||
              (paramValue.startsWith("[") && paramValue.endsWith("]"))
            ) {
              try {
                paramValue = JSON.parse(paramValue);
              } catch {
                // Keep as string if JSON parse fails
              }
            }

            // Try to parse booleans and numbers
            if (paramValue === "true") paramValue = true;
            if (paramValue === "false") paramValue = false;
            if (paramValue === "null") paramValue = null;
            if (!isNaN(Number(paramValue)) && paramValue !== "") {
              const numValue = Number(paramValue);
              if (numValue.toString() === paramValue) {
                paramValue = numValue;
              }
            }

            parameters[paramName] = paramValue;
          }

          // Now look for the result of this tool call
          // Results appear in <function_results> blocks after the <function_calls>
          let result: any = null;
          let success = true;
          let errorMessage: string | undefined;

          // Try to find the corresponding function_results block
          // It should appear after the function_calls block
          const afterCallsIndex = functionCallsMatch.index! + functionCallsMatch[0].length;
          const remainingContent = content.substring(afterCallsIndex);

          // Look for the first <function_results> block
          const resultsPattern = /<function_results>([\s\S]*?)<\/function_results>/;
          const resultsMatch = remainingContent.match(resultsPattern);

          if (resultsMatch) {
            result = resultsMatch[1].trim();

            // Check if result indicates an error
            if (
              result.includes("Error:") ||
              result.includes("error:") ||
              result.includes("failed") ||
              result.includes("Failed") ||
              result.includes("Exception:")
            ) {
              success = false;
              // Try to extract error message
              const errorPatterns = [
                /Error:\s*([^\n]+)/,
                /error:\s*([^\n]+)/,
                /Exception:\s*([^\n]+)/,
                /failed:\s*([^\n]+)/i,
              ];
              for (const errorPattern of errorPatterns) {
                const errorMatch = result.match(errorPattern);
                if (errorMatch) {
                  errorMessage = errorMatch[1].trim();
                  break;
                }
              }
              if (!errorMessage) {
                errorMessage = result;
              }
            }
          }

          // Extract timestamp (use current time if not found)
          const timestamp = new Date().toISOString();

          const toolCall: ToolCall = {
            toolName,
            parameters,
            result,
            timestamp,
            success,
            ...(errorMessage && { errorMessage }),
          };

          toolCalls.push(toolCall);
        } catch (invokeError) {
          logParserError("parseToolCalls:invoke", invokeError, {
            toolName: invokeMatch?.[1],
          });
          // Continue processing other tool calls even if one fails
        }
      }
    }

    return toolCalls;
  } catch (error) {
    logParserError("parseToolCalls", error, { contentLength: content?.length });
    // Return empty array on error - partial data is better than no data
    return [];
  }
}

/**
 * Parses 4-D evaluation from message content
 *
 * Extracts evaluation results following the 4-D framework:
 * - Delegation assessment
 * - Description assessment
 * - Product/Process/Performance Discernment
 * - Final verdict (EXCELLENT or NEEDS REFINEMENT)
 *
 * @param content - The message content to parse
 * @returns EvaluationResult object if evaluation found, null otherwise
 */
export function parse4DEvaluation(content: string): EvaluationResult | null {
  try {
    // Return null for empty content
    if (!content || content.trim().length === 0) {
      return null;
    }

    // Check if this looks like an evaluation report
    // Must have "Verdict:" and either "EXCELLENT" or "NEEDS REFINEMENT"
    const hasVerdict =
      content.includes("Verdict:") &&
      (content.includes("EXCELLENT") || content.includes("NEEDS REFINEMENT"));

    if (!hasVerdict) {
      return null;
    }

    // Extract verdict
    let verdict: "EXCELLENT" | "NEEDS REFINEMENT" = "NEEDS REFINEMENT";
    const verdictPattern = /Verdict:\s*(EXCELLENT|NEEDS REFINEMENT)/;
    const verdictMatch = content.match(verdictPattern);
    if (verdictMatch) {
      verdict = verdictMatch[1] as "EXCELLENT" | "NEEDS REFINEMENT";
    }

    // Extract quality assessment dimensions
    const dimensions: EvaluationResult["dimensions"] = {};

    // Look for "Quality Assessment:" section
    const qualityAssessmentPattern = /Quality Assessment:([\s\S]*?)(?=\n\n[A-Z]|\nVerdict:|$)/;
    const qualityAssessmentMatch = content.match(qualityAssessmentPattern);

    if (qualityAssessmentMatch) {
      const qualitySection = qualityAssessmentMatch[1];

      // Extract Product Discernment
      const productPattern = /-\s*Product(?:\s+Discernment)?:\s*([^\n]+)/i;
      const productMatch = qualitySection.match(productPattern);
      if (productMatch) {
        dimensions.productDiscernment = productMatch[1].trim();
      }

      // Extract Process Discernment
      const processPattern = /-\s*Process(?:\s+Discernment)?:\s*([^\n]+)/i;
      const processMatch = qualitySection.match(processPattern);
      if (processMatch) {
        dimensions.processDiscernment = processMatch[1].trim();
      }

      // Extract Performance Discernment
      const performancePattern = /-\s*Performance(?:\s+Discernment)?:\s*([^\n]+)/i;
      const performanceMatch = qualitySection.match(performancePattern);
      if (performanceMatch) {
        dimensions.performanceDiscernment = performanceMatch[1].trim();
      }
    } else {
      // Try alternate format: standalone dimension entries
      const productPattern = /Product(?:\s+Discernment)?:\s*([^\n]+)/i;
      const productMatch = content.match(productPattern);
      if (productMatch) {
        dimensions.productDiscernment = productMatch[1].trim();
      }

      const processPattern = /Process(?:\s+Discernment)?:\s*([^\n]+)/i;
      const processMatch = content.match(processPattern);
      if (processMatch) {
        dimensions.processDiscernment = processMatch[1].trim();
      }

      const performancePattern = /Performance(?:\s+Discernment)?:\s*([^\n]+)/i;
      const performanceMatch = content.match(performancePattern);
      if (performanceMatch) {
        dimensions.performanceDiscernment = performanceMatch[1].trim();
      }
    }

    // Extract Delegation dimension
    const delegationPattern = /-?\s*Delegation:\s*([^\n]+)/i;
    const delegationMatch = content.match(delegationPattern);
    if (delegationMatch) {
      dimensions.delegation = delegationMatch[1].trim();
    }

    // Extract Description dimension
    const descriptionPattern = /-?\s*Description:\s*([^\n]+)/i;
    const descriptionMatch = content.match(descriptionPattern);
    if (descriptionMatch) {
      dimensions.description = descriptionMatch[1].trim();
    }

    // Extract refinement coaching if verdict is NEEDS REFINEMENT
    let refinementNeeded: string | undefined;
    if (verdict === "NEEDS REFINEMENT") {
      // Look for "Refinement Needed:" or "Coaching:" section
      const refinementPatterns = [
        /(?:Refinement Needed|Coaching):([\s\S]*?)(?=\n\n[A-Z]|$)/i,
        /Verdict:\s*NEEDS REFINEMENT\s*\n([\s\S]*?)(?=\n\n[A-Z]|$)/,
      ];

      for (const refinementPattern of refinementPatterns) {
        const refinementMatch = content.match(refinementPattern);
        if (refinementMatch) {
          refinementNeeded = refinementMatch[1].trim();
          break;
        }
      }
    }

    // Try to detect which agent was evaluated
    let evaluatedAgent: string | undefined;

    // Pattern 1: "Evaluating <agent> output"
    const evaluatingPattern = /Evaluating\s+([a-z0-9-]+)\s+(?:agent\s+)?output/i;
    const evaluatingMatch = content.match(evaluatingPattern);
    if (evaluatingMatch) {
      evaluatedAgent = evaluatingMatch[1];
    }

    // Pattern 2: Look at the Task: line in the report
    if (!evaluatedAgent) {
      const taskPattern = /Task:\s*Evaluate\s+([a-z0-9-]+)/i;
      const taskMatch = content.match(taskPattern);
      if (taskMatch) {
        evaluatedAgent = taskMatch[1];
      }
    }

    // Extract timestamp if present
    const timestampPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)/;
    const timestampMatch = content.match(timestampPattern);
    const timestamp = timestampMatch ? timestampMatch[1] : new Date().toISOString();

    const evaluation: EvaluationResult = {
      verdict,
      dimensions,
      timestamp,
      ...(refinementNeeded && { refinementNeeded }),
      ...(evaluatedAgent && { evaluatedAgent }),
    };

    return evaluation;
  } catch (error) {
    logParserError("parse4DEvaluation", error, { contentLength: content?.length });
    return null;
  }
}

/**
 * Extracts conversation metadata from parsed messages
 *
 * Computes statistics and metadata about the conversation:
 * - Start/end timestamps
 * - Primary agent active
 * - Skills used
 * - Files modified
 * - Message count and duration
 * - Token usage (if available)
 *
 * @param messages - Array of parsed conversation messages
 * @returns ConversationMetadata object with computed statistics
 */
export function extractMetadata(
  messages: ConversationMessage[]
): ConversationMetadata {
  try {
    // Handle empty messages array
    if (!messages || messages.length === 0) {
      return {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        primaryAgent: undefined,
        skillsUsed: [],
        filesModified: [],
        messageCount: 0,
        duration: 0,
      };
    }

    // Find earliest and latest timestamps
    let startTime = messages[0].timestamp;
    let endTime = messages[0].timestamp;

    for (const message of messages) {
      if (message.timestamp < startTime) {
        startTime = message.timestamp;
      }
      if (message.timestamp > endTime) {
        endTime = message.timestamp;
      }
    }

    // Detect primary agent from message roles
    // Count frequency of each agent role
    const agentCounts: Record<string, number> = {};
    for (const message of messages) {
      const role = message.role;
      // Only count agent roles, not user/assistant/system
      if (
        role !== "user" &&
        role !== "assistant" &&
        role !== "system" &&
        role !== "maestro"
      ) {
        agentCounts[role] = (agentCounts[role] || 0) + 1;
      }
    }

    // Find the most frequent agent
    let primaryAgent: string | undefined;
    let maxCount = 0;
    for (const [agent, count] of Object.entries(agentCounts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryAgent = agent;
      }
    }

    // Extract skills used from tool calls and content
    const skillsSet = new Set<string>();
    for (const message of messages) {
      try {
        const content = message.content;

        // Look for Skill tool invocations
        const skillInvocationPattern = /<invoke name="Skill">[\s\S]*?<parameter name="skill">([^<]+)<\/parameter>/g;
        const skillMatches = content.matchAll(skillInvocationPattern);
        for (const match of skillMatches) {
          skillsSet.add(match[1].trim());
        }

        // Also look for skill activation mentions in content
        // Example: "Activated Write skill" or "Using read skill"
        const skillActivationPattern = /(?:Activated|Using|Activating)\s+([a-z0-9-]+)\s+skill/gi;
        const activationMatches = content.matchAll(skillActivationPattern);
        for (const match of activationMatches) {
          skillsSet.add(match[1].toLowerCase());
        }

        // Look for "Skills Used:" section in agent reports
        // Handle both formats: "Skills Used: [skill1, skill2]" and "Skills Used: skill1, skill2"
        const skillsUsedBracketPattern = /Skills Used:\s*\[([^\]]+)\]/;
        // Fixed regex: removed unnecessary escape for [
        const skillsUsedNoBracketPattern = /Skills Used:\s*([^\n[]+?)(?:\n|$)/;

        const bracketMatch = content.match(skillsUsedBracketPattern);
        const noBracketMatch = content.match(skillsUsedNoBracketPattern);

        const skillsUsedMatch = bracketMatch || noBracketMatch;
        if (skillsUsedMatch) {
          const skillsList = skillsUsedMatch[1].split(",");
          for (const skill of skillsList) {
            const trimmedSkill = skill.trim().replace(/['"]/g, "");
            if (trimmedSkill) {
              skillsSet.add(trimmedSkill);
            }
          }
        }
      } catch (messageError) {
        logParserError("extractMetadata:skills", messageError, {
          messageRole: message.role,
        });
        // Continue processing other messages
      }
    }
    const skillsUsed = Array.from(skillsSet);

    // Extract files modified from Write/Edit tool calls
    const filesSet = new Set<string>();
    for (const message of messages) {
      try {
        const content = message.content;

        // Look for Write tool calls with file_path parameter
        const writePattern = /<invoke name="Write">[\s\S]*?<parameter name="file_path">([^<]+)<\/parameter>/g;
        const writeMatches = content.matchAll(writePattern);
        for (const match of writeMatches) {
          filesSet.add(match[1].trim());
        }

        // Look for Edit tool calls with file_path parameter
        const editPattern = /<invoke name="Edit">[\s\S]*?<parameter name="file_path">([^<]+)<\/parameter>/g;
        const editMatches = content.matchAll(editPattern);
        for (const match of editMatches) {
          filesSet.add(match[1].trim());
        }

        // Also look for file paths in "Actions Taken:" or "Evidence:" sections
        // Example: "File: /path/to/file.ts (CREATED)" or "[2025-12-16] Write: /path/file.js"
        const fileEvidencePattern = /(?:File:|Write:|Edit:)\s+([^\s\n(]+(?:\.[\w]+)?)/g;
        const evidenceMatches = content.matchAll(fileEvidencePattern);
        for (const match of evidenceMatches) {
          const filePath = match[1].trim();
          // Basic validation: should look like a file path (contains / or \)
          if (filePath.includes("/") || filePath.includes("\\")) {
            filesSet.add(filePath);
          }
        }
      } catch (messageError) {
        logParserError("extractMetadata:files", messageError, {
          messageRole: message.role,
        });
        // Continue processing other messages
      }
    }
    const filesModified = Array.from(filesSet);

    // Count total messages
    const messageCount = messages.length;

    // Calculate duration in milliseconds
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const duration = endDate.getTime() - startDate.getTime();

    // Extract token usage if available in metadata
    let totalTokens = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    for (const message of messages) {
      try {
        if (message.metadata?.tokenUsage) {
          const usage = message.metadata.tokenUsage;
          if (typeof usage.total === "number") totalTokens += usage.total;
          if (typeof usage.input === "number") inputTokens += usage.input;
          if (typeof usage.output === "number") outputTokens += usage.output;
        }

        // Also look for token usage in content (e.g., "Token usage: 1000/200000")
        const tokenPattern = /Token usage:\s*(\d+)\/(\d+);\s*(\d+)\s+remaining/;
        const tokenMatch = message.content.match(tokenPattern);
        if (tokenMatch) {
          const used = parseInt(tokenMatch[1], 10);
          if (!isNaN(used)) {
            // Approximate split between input/output (rough heuristic: 60% input, 40% output)
            inputTokens += Math.floor(used * 0.6);
            outputTokens += Math.floor(used * 0.4);
            totalTokens += used;
          }
        }
      } catch (messageError) {
        logParserError("extractMetadata:tokens", messageError, {
          messageRole: message.role,
        });
        // Continue processing other messages
      }
    }

    const tokenUsage =
      totalTokens > 0
        ? {
            total: totalTokens,
            input: inputTokens,
            output: outputTokens,
          }
        : undefined;

    return {
      startTime,
      endTime,
      primaryAgent,
      skillsUsed,
      filesModified,
      messageCount,
      duration,
      ...(tokenUsage && { tokenUsage }),
    };
  } catch (error) {
    logParserError("extractMetadata", error, { messageCount: messages?.length });
    // Return minimal valid metadata on error
    return {
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      primaryAgent: undefined,
      skillsUsed: [],
      filesModified: [],
      messageCount: messages?.length || 0,
      duration: 0,
    };
  }
}

/**
 * Parses a complete conversation from raw content
 *
 * Main entry point for parsing. Processes raw conversation text/JSON and
 * extracts all structured information:
 * - Messages with roles and content
 * - Agent delegations
 * - Tool calls and results
 * - 4-D evaluations
 * - Conversation metadata
 *
 * Includes comprehensive error handling with graceful degradation.
 * Will return partial results if some parsing steps fail.
 *
 * @param rawContent - Raw conversation content (text or JSON string)
 * @returns ParsedConversation object with all extracted information
 */
export function parseConversation(rawContent: string): ParsedConversation {
  // Initialize empty result structure for graceful degradation
  let messagesArray: ConversationMessage[] = [];
  let delegations: AgentDelegation[] = [];
  let toolCalls: ToolCall[] = [];
  let evaluations: EvaluationResult[] = [];

  try {
    // Handle empty or invalid input
    if (!rawContent || rawContent.trim().length === 0) {
      const emptyMetadata = extractMetadata([]);
      return {
        messages: [],
        delegations: [],
        toolCalls: [],
        evaluations: [],
        metadata: emptyMetadata,
      };
    }

    // Try to parse as JSON first (session file format)
    try {
      const parsed = JSON.parse(rawContent);

      // Check if it's a session file with a messages array
      if (Array.isArray(parsed.messages)) {
        // Convert session messages to ConversationMessage format
        for (const msg of parsed.messages) {
          try {
            const role = msg.role || detectMessageRole(msg.content || "");
            const content = msg.content || "";
            const timestamp = msg.timestamp || new Date().toISOString();

            messagesArray.push({
              role,
              content,
              timestamp,
              metadata: msg.metadata || {},
            });
          } catch (msgError) {
            logParserError("parseConversation:message", msgError, {
              messageIndex: messagesArray.length,
            });
            // Continue processing other messages
          }
        }
      } else if (Array.isArray(parsed)) {
        // Direct array of messages
        for (const msg of parsed) {
          try {
            const role = msg.role || detectMessageRole(msg.content || "");
            const content = msg.content || "";
            const timestamp = msg.timestamp || new Date().toISOString();

            messagesArray.push({
              role,
              content,
              timestamp,
              metadata: msg.metadata || {},
            });
          } catch (msgError) {
            logParserError("parseConversation:message", msgError, {
              messageIndex: messagesArray.length,
            });
            // Continue processing other messages
          }
        }
      }
    } catch (jsonError) {
      // Not JSON, treat as plain text conversation
      try {
        // Split by common message delimiters
        // Try various formats: "---", blank lines, or role markers

        // Split on horizontal rules (---) or double newlines
        const chunks = rawContent.split(/\n---+\n|\n\n\n+/);

        let messageIndex = 0;
        for (const chunk of chunks) {
          try {
            const trimmedChunk = chunk.trim();
            if (trimmedChunk.length === 0) continue;

            // Detect role from content
            const role = detectMessageRole(trimmedChunk);

            // Use current timestamp with incrementing seconds for ordering
            const baseTimestamp = new Date();
            baseTimestamp.setSeconds(baseTimestamp.getSeconds() + messageIndex);
            const timestamp = baseTimestamp.toISOString();

            messagesArray.push({
              role,
              content: trimmedChunk,
              timestamp,
            });

            messageIndex++;
          } catch (chunkError) {
            logParserError("parseConversation:chunk", chunkError, {
              chunkIndex: messageIndex,
            });
            // Continue processing other chunks
          }
        }

        // If no delimiters found, treat entire content as single message
        if (messagesArray.length === 0) {
          const role = detectMessageRole(rawContent);
          messagesArray.push({
            role,
            content: rawContent.trim(),
            timestamp: new Date().toISOString(),
          });
        }
      } catch (textError) {
        logParserError("parseConversation:plaintext", textError, {
          contentLength: rawContent.length,
        });
        // If plain text parsing fails, create a single message with the entire content
        messagesArray.push({
          role: "assistant",
          content: rawContent.trim(),
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Validate that we have at least some messages
    if (messagesArray.length === 0) {
      logParserError("parseConversation:validation", new Error("No messages extracted"), {
        contentLength: rawContent.length,
      });
    }

    // Now extract structured information from all messages
    for (const message of messagesArray) {
      const content = message.content;

      // Parse agent delegations (with error handling per message)
      try {
        const delegation = parseAgentDelegation(content);
        if (delegation) {
          delegations.push(delegation);
        }
      } catch (delegationError) {
        logParserError("parseConversation:delegation", delegationError, {
          messageRole: message.role,
        });
        // Continue processing other extraction types
      }

      // Parse tool calls (with error handling per message)
      try {
        const tools = parseToolCalls(content);
        if (tools.length > 0) {
          toolCalls.push(...tools);
        }
      } catch (toolError) {
        logParserError("parseConversation:toolCalls", toolError, {
          messageRole: message.role,
        });
        // Continue processing other extraction types
      }

      // Parse 4-D evaluations (with error handling per message)
      try {
        const evaluation = parse4DEvaluation(content);
        if (evaluation) {
          evaluations.push(evaluation);
        }
      } catch (evaluationError) {
        logParserError("parseConversation:evaluation", evaluationError, {
          messageRole: message.role,
        });
        // Continue processing other extraction types
      }
    }

    // Extract metadata from messages (with error handling)
    let metadata: ConversationMetadata;
    try {
      metadata = extractMetadata(messagesArray);
    } catch (metadataError) {
      logParserError("parseConversation:metadata", metadataError, {
        messageCount: messagesArray.length,
      });
      // Use minimal metadata on error
      metadata = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        primaryAgent: undefined,
        skillsUsed: [],
        filesModified: [],
        messageCount: messagesArray.length,
        duration: 0,
      };
    }

    return {
      messages: messagesArray,
      delegations,
      toolCalls,
      evaluations,
      metadata,
    };
  } catch (error) {
    // Catastrophic error - log and return minimal valid structure
    logParserError("parseConversation:catastrophic", error, {
      contentLength: rawContent?.length,
      messagesExtracted: messagesArray.length,
    });

    return {
      messages: messagesArray, // Return whatever messages we managed to extract
      delegations,
      toolCalls,
      evaluations,
      metadata: extractMetadata(messagesArray), // Will handle empty array gracefully
    };
  }
}
