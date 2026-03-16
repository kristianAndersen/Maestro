/**
 * TypeScript type definitions for Maestro memory system parser
 *
 * This module defines the core data structures used to parse and represent
 * conversation history, agent delegations, tool calls, and evaluations.
 */

/**
 * Represents a single message in a conversation
 *
 * @property role - The participant role (user, assistant, system, or specific agent name)
 * @property content - The message content/text
 * @property timestamp - ISO 8601 timestamp of when the message was sent
 * @property metadata - Optional additional data (tokens used, model info, etc.)
 */
export interface ConversationMessage {
  role: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Represents an agent delegation following the 3P format (PRODUCT, PROCESS, PERFORMANCE)
 *
 * @property agentName - Name of the specialized agent being delegated to
 * @property product - What to deliver (objectives, targets, deliverables)
 * @property process - How to work (approach, skills, constraints)
 * @property performance - Excellence criteria (standards, evidence, return format)
 * @property timestamp - ISO 8601 timestamp of when delegation occurred
 * @property delegatedBy - Optional name of the delegating agent (defaults to "maestro")
 */
export interface AgentDelegation {
  agentName: string;
  product: string;
  process: string;
  performance: string;
  timestamp: string;
  delegatedBy?: string;
}

/**
 * Represents a tool invocation and its result
 *
 * @property toolName - Name of the tool used (Read, Write, Edit, Grep, Bash, etc.)
 * @property parameters - Input parameters passed to the tool
 * @property result - Output/result returned by the tool
 * @property timestamp - ISO 8601 timestamp of when tool was invoked
 * @property success - Whether the tool call succeeded
 * @property errorMessage - Optional error message if tool call failed
 */
export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Represents a 4-D evaluation result
 *
 * @property verdict - Final assessment: "EXCELLENT" or "NEEDS REFINEMENT"
 * @property dimensions - Scores for each 4-D dimension (Delegation, Description, Product/Process/Performance Discernment)
 * @property refinementNeeded - If verdict is NEEDS REFINEMENT, describes what needs improvement
 * @property timestamp - ISO 8601 timestamp of when evaluation occurred
 * @property evaluatedAgent - Name of the agent whose work was evaluated
 */
export interface EvaluationResult {
  verdict: "EXCELLENT" | "NEEDS REFINEMENT";
  dimensions: {
    delegation?: string;
    description?: string;
    productDiscernment?: string;
    processDiscernment?: string;
    performanceDiscernment?: string;
  };
  refinementNeeded?: string;
  timestamp: string;
  evaluatedAgent?: string;
}

/**
 * Metadata about a conversation session
 *
 * @property startTime - ISO 8601 timestamp of conversation start
 * @property endTime - ISO 8601 timestamp of conversation end
 * @property primaryAgent - The main agent active in this conversation (if identifiable)
 * @property skillsUsed - List of skills that were activated during the conversation
 * @property filesModified - List of file paths that were modified
 * @property messageCount - Total number of messages exchanged
 * @property duration - Duration of conversation in milliseconds
 * @property tokenUsage - Optional token usage statistics
 */
export interface ConversationMetadata {
  startTime: string;
  endTime: string;
  primaryAgent?: string;
  skillsUsed: string[];
  filesModified: string[];
  messageCount: number;
  duration: number;
  tokenUsage?: {
    total: number;
    input: number;
    output: number;
  };
}

/**
 * Complete parsed representation of a conversation
 *
 * @property messages - All messages in chronological order
 * @property delegations - All agent delegations that occurred
 * @property toolCalls - All tool invocations that occurred
 * @property evaluations - All 4-D evaluations performed
 * @property metadata - Conversation metadata and statistics
 */
export interface ParsedConversation {
  messages: ConversationMessage[];
  delegations: AgentDelegation[];
  toolCalls: ToolCall[];
  evaluations: EvaluationResult[];
  metadata: ConversationMetadata;
}
