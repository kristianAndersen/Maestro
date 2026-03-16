/**
 * Unit tests for Maestro memory system parser
 *
 * Tests message role detection and agent delegation parsing functions
 */

import { describe, test, expect } from "bun:test";
import { detectMessageRole, parseAgentDelegation, parseToolCalls, parse4DEvaluation, extractMetadata, parseConversation } from "../parser";

describe("detectMessageRole", () => {
  describe("System messages", () => {
    test("detects system messages with <system> tag", () => {
      const content = "<system>System initialization complete</system>";
      expect(detectMessageRole(content)).toBe("system");
    });

    test("detects system messages with System: prefix", () => {
      const content = "System: Loading configuration...";
      expect(detectMessageRole(content)).toBe("system");
    });

    test("detects system reminders", () => {
      const content = "<system_reminder>Remember to evaluate outputs</system_reminder>";
      expect(detectMessageRole(content)).toBe("system");
    });

    test("detects claudeMd context messages", () => {
      const content = "# claudeMd\nCodebase and user instructions are shown below.";
      expect(detectMessageRole(content)).toBe("system");
    });
  });

  describe("Maestro messages", () => {
    test("detects Maestro from analyzing emoji", () => {
      const content = "🎼 Analyzing your request...";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro from planning emoji", () => {
      const content = "📋 Planning delegation strategy";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro from delegating emoji", () => {
      const content = "📤 Delegating to file-writer agent";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro from evaluating emoji", () => {
      const content = "🔍 Evaluating agent output...";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro from refining emoji", () => {
      const content = "🔄 Refining approach based on feedback";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro from complete emoji", () => {
      const content = "✅ Task complete and verified";
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("detects Maestro with 3P delegation format", () => {
      const content = `
📤 Delegating to file-writer

**PRODUCT** (What to deliver):
- Create new configuration file

**PROCESS** (How to work):
- Read existing configs for reference

**PERFORMANCE** (Excellence criteria):
- Follow YAML best practices
      `;
      expect(detectMessageRole(content)).toBe("maestro");
    });
  });

  describe("User messages", () => {
    test("detects slash commands", () => {
      const content = "/maestro create a new feature";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects polite requests with 'please'", () => {
      const content = "Please help me debug this code";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects questions with 'can you'", () => {
      const content = "Can you explain how this works?";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects questions ending with ?", () => {
      const content = "What files were modified in the last commit?";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects imperative commands", () => {
      const content = "Create a new authentication service";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects build requests", () => {
      const content = "Build a REST API for user management";
      expect(detectMessageRole(content)).toBe("user");
    });

    test("detects fix requests", () => {
      const content = "Fix the bug in the login handler";
      expect(detectMessageRole(content)).toBe("user");
    });
  });

  describe("Agent messages", () => {
    test("detects file-writer agent from report with write emoji", () => {
      const content = `
Task: Create configuration file

Skills Used: write

Actions Taken:
1. ✍️ Wrote content to config.yaml (45 lines)
      `;
      expect(detectMessageRole(content)).toBe("file-writer");
    });

    test("detects file-reader agent from report", () => {
      const content = `
Task: Read and analyze source code

Skills Used: read

Actions Taken:
1. Reading file /src/main.ts
2. Content analysis complete
      `;
      expect(detectMessageRole(content)).toBe("file-reader");
    });

    test("detects base-research agent from report", () => {
      const content = `
Task: Research authentication patterns

Skills Used: base-research

Actions Taken:
1. Searched authoritative sources
2. Research findings compiled

Research findings:
- OAuth 2.0 is industry standard
- Sources examined: 15 articles
      `;
      expect(detectMessageRole(content)).toBe("base-research");
    });

    test("detects base-analysis agent from report", () => {
      const content = `
Task: Analyze code quality

Skills Used: base-analysis

Actions Taken:
1. Reviewed code structure
2. Performed quality assessment

Analysis results:
- Quality assessment: Good
- No critical issues found
      `;
      expect(detectMessageRole(content)).toBe("base-analysis");
    });

    test("detects fetch agent from report", () => {
      const content = `
Task: Fetch API documentation

Skills Used: fetch

Actions Taken:
1. Fetched data from https://api.example.com/docs
2. External source verified
      `;
      expect(detectMessageRole(content)).toBe("fetch");
    });

    test("detects 4d-evaluation agent from verdict", () => {
      const content = `
Task: Evaluate agent output

Skills Used: 4d-evaluation

Actions Taken:
1. Analyzed agent output
2. Applied 4-D framework

Verdict: EXCELLENT

The work meets all excellence criteria.
      `;
      expect(detectMessageRole(content)).toBe("4d-evaluation");
    });

    test("detects generic agent when type unknown", () => {
      const content = `
Task: Perform custom operation

Skills Used: custom-skill

Actions Taken:
1. Completed the task successfully
      `;
      expect(detectMessageRole(content)).toBe("agent");
    });
  });

  describe("Assistant messages", () => {
    test("detects assistant from tool invocation", () => {
      const content = "<function_calls><invoke name=\"Read\">...</invoke></function_calls>";
      expect(detectMessageRole(content)).toBe("assistant");
    });

    test("detects assistant from generic response", () => {
      const content = "I'll help you with that. Let me analyze the code first.";
      expect(detectMessageRole(content)).toBe("assistant");
    });

    test("defaults to assistant for ambiguous content", () => {
      const content = "Here's the information you requested.";
      expect(detectMessageRole(content)).toBe("assistant");
    });
  });

  describe("Edge cases", () => {
    test("handles empty string", () => {
      expect(detectMessageRole("")).toBe("assistant");
    });

    test("handles whitespace-only content", () => {
      expect(detectMessageRole("   \n\t  ")).toBe("assistant");
    });

    test("handles mixed content with multiple markers", () => {
      const content = `
🎼 Analyzing request...

User asked: Can you help?
      `;
      // Maestro emoji at start takes precedence
      expect(detectMessageRole(content)).toBe("maestro");
    });

    test("handles content with 3P format but no emoji", () => {
      const content = `
Delegating to file-writer

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Follow best practices

**PERFORMANCE** (Excellence criteria):
- High quality output
      `;
      // Has 3P format but no Maestro emoji, so it's an agent delegation
      expect(detectMessageRole(content)).toBe("agent");
    });
  });
});

describe("parseAgentDelegation", () => {
  describe("Valid delegations", () => {
    test("parses delegation with Task tool pattern", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PRODUCT** (What to deliver):
- Create configuration file for authentication service
- Expected deliverables format: YAML

**PROCESS** (How to work):
1. Read existing configuration files
2. Follow YAML best practices
3. Include comments for documentation

**PERFORMANCE** (Excellence criteria):
- Valid YAML syntax
- All required fields present
- Clear documentation
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("file-writer");
      expect(result?.product).toContain("Create configuration file");
      expect(result?.process).toContain("Read existing configuration files");
      expect(result?.performance).toContain("Valid YAML syntax");
    });

    test("parses delegation with XML-style Task invocation", () => {
      const content = `
<invoke name="Task">
<parameter name="subagent_type">base-research</parameter>
<parameter name="prompt">
**PRODUCT** (What to deliver):
- Research authentication patterns
- Provide comprehensive analysis

**PROCESS** (How to work):
1. Search for industry standards
2. Compare different approaches
3. Identify best practices

**PERFORMANCE** (Excellence criteria):
- At least 5 authoritative sources
- Clear comparison matrix
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("base-research");
      expect(result?.product).toContain("Research authentication patterns");
    });

    test("parses delegation with slash command", () => {
      const content = `
/agent file-reader

**PRODUCT** (What to deliver):
- Read and summarize main.ts file

**PROCESS** (How to work):
1. Use Read tool to access file
2. Extract key functionality
3. Identify dependencies

**PERFORMANCE** (Excellence criteria):
- Complete function inventory
- Clear dependency map
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("file-reader");
    });

    test("parses delegation with delegation statement", () => {
      const content = `
Delegating to base-analysis agent

**PRODUCT** (What to deliver):
- Analyze code quality of authentication module

**PROCESS** (How to work):
1. Review code structure
2. Check for security vulnerabilities
3. Assess maintainability

**PERFORMANCE** (Excellence criteria):
- Comprehensive security assessment
- Actionable recommendations
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("base-analysis");
    });

    test("parses delegation with emoji delegation marker", () => {
      const content = `
📤 Delegating to fetch

**PRODUCT** (What to deliver):
- Retrieve API documentation from external source

**PROCESS** (How to work):
1. Fetch from URL
2. Validate response
3. Parse content

**PERFORMANCE** (Excellence criteria):
- Complete documentation retrieved
- No errors during fetch
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("fetch");
    });

    test("extracts timestamp from delegation", () => {
      const content = `
Task tool with subagent_type='file-writer'
Timestamp: 2025-12-16T10:30:00.000Z

**PRODUCT** (What to deliver):
- Create new file

**PROCESS** (How to work):
- Follow conventions

**PERFORMANCE** (Excellence criteria):
- High quality
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.timestamp).toBe("2025-12-16T10:30:00.000Z");
    });

    test("identifies Maestro as delegator when emoji present", () => {
      const content = `
📤 Delegating to file-writer

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Use Write tool

**PERFORMANCE** (Excellence criteria):
- Complete file
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.delegatedBy).toBe("maestro");
    });

    test("handles multiline 3P sections", () => {
      const content = `
Task tool with subagent_type='base-research'

**PRODUCT** (What to deliver):
- Comprehensive research on microservices architecture
- Include pros and cons
- Provide real-world examples
- Expected format: Markdown report

**PROCESS** (How to work):
1. Search for authoritative sources (books, papers, blogs)
2. Focus on scalability and maintainability aspects
3. Compare with monolithic architecture
4. Identify common patterns and anti-patterns
5. Collect case studies from major companies

**PERFORMANCE** (Excellence criteria):
- Minimum 10 authoritative sources cited
- Clear comparison table included
- At least 3 real-world case studies
- Actionable recommendations provided
- Well-structured markdown with headers
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("base-research");
      expect(result?.product).toContain("Comprehensive research");
      expect(result?.product).toContain("real-world examples");
      expect(result?.process).toContain("Search for authoritative sources");
      expect(result?.process).toContain("case studies");
      expect(result?.performance).toContain("Minimum 10 authoritative sources");
      expect(result?.performance).toContain("Well-structured markdown");
    });
  });

  describe("Invalid delegations", () => {
    test("returns null for empty string", () => {
      expect(parseAgentDelegation("")).toBeNull();
    });

    test("returns null when PRODUCT missing", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PROCESS** (How to work):
- Follow best practices

**PERFORMANCE** (Excellence criteria):
- High quality
      `;

      expect(parseAgentDelegation(content)).toBeNull();
    });

    test("returns null when PROCESS missing", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PRODUCT** (What to deliver):
- Create file

**PERFORMANCE** (Excellence criteria):
- High quality
      `;

      expect(parseAgentDelegation(content)).toBeNull();
    });

    test("returns null when PERFORMANCE missing", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Follow best practices
      `;

      expect(parseAgentDelegation(content)).toBeNull();
    });

    test("returns null when agent name cannot be determined", () => {
      const content = `
Some random content with 3P format

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Follow best practices

**PERFORMANCE** (Excellence criteria):
- High quality
      `;

      expect(parseAgentDelegation(content)).toBeNull();
    });

    test("returns null for non-delegation content", () => {
      const content = "This is just a regular message without any delegation.";
      expect(parseAgentDelegation(content)).toBeNull();
    });
  });

  describe("Edge cases", () => {
    test("handles nested delegation (inter-agent)", () => {
      const content = `
Task: Research API patterns

Skills Used: base-research

I need to delegate to fetch for external data.

Task tool with subagent_type='fetch'

**PRODUCT** (What to deliver):
- Retrieve API documentation

**PROCESS** (How to work):
- Use fetch tool

**PERFORMANCE** (Excellence criteria):
- Complete docs
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("fetch");
      expect(result?.delegatedBy).toBe("agent");
    });

    test("handles delegation with code blocks in sections", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PRODUCT** (What to deliver):
- Create TypeScript interface

**PROCESS** (How to work):
1. Define interface structure
2. Use this pattern:
\`\`\`typescript
interface User {
  id: string;
  name: string;
}
\`\`\`

**PERFORMANCE** (Excellence criteria):
- Valid TypeScript syntax
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.agentName).toBe("file-writer");
      // Code block should be in PROCESS section
      expect(result?.process).toContain("interface User");
    });

    test("generates timestamp when not present", () => {
      const content = `
Task tool with subagent_type='file-writer'

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Use Write tool

**PERFORMANCE** (Excellence criteria):
- Complete
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.timestamp).toBeDefined();
      // Should be valid ISO 8601
      expect(() => new Date(result!.timestamp)).not.toThrow();
    });

    test("handles whitespace variations in 3P sections", () => {
      const content = `
Task tool with subagent_type='file-reader'

**PRODUCT**  (What to deliver):

- Read the file
- Analyze contents


**PROCESS**   (How to work):

1. Open file
2. Parse content


**PERFORMANCE**    (Excellence criteria):

- Accurate parsing
      `;

      const result = parseAgentDelegation(content);
      expect(result).not.toBeNull();
      expect(result?.product).toContain("Read the file");
      expect(result?.process).toContain("Open file");
      expect(result?.performance).toContain("Accurate parsing");
    });
  });
});

describe("parseToolCalls", () => {
  describe("Valid tool calls", () => {
    test("parses single tool call with parameters and result", () => {
      const content = `
<function_calls>
<invoke name="Read">
<parameter name="file_path">/src/main.ts</parameter>
</invoke>
</function_calls>

<function_results>
export function main() {
  console.log("Hello World");
}
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Read");
      expect(result[0].parameters.file_path).toBe("/src/main.ts");
      expect(result[0].result).toContain("Hello World");
      expect(result[0].success).toBe(true);
      expect(result[0].errorMessage).toBeUndefined();
    });

    test("parses multiple parallel tool calls", () => {
      const content = `
<function_calls>
<invoke name="Grep">
<parameter name="pattern">TODO</parameter>
<parameter name="output_mode">files_with_matches</parameter>
</invoke>
<invoke name="Glob">
<parameter name="pattern">**/*.ts</parameter>
</invoke>
</function_calls>

<function_results>
src/file1.ts
src/file2.ts
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(2);
      expect(result[0].toolName).toBe("Grep");
      expect(result[0].parameters.pattern).toBe("TODO");
      expect(result[0].parameters.output_mode).toBe("files_with_matches");
      expect(result[1].toolName).toBe("Glob");
      expect(result[1].parameters.pattern).toBe("**/*.ts");
    });

    test("parses tool call with multiline parameter values", () => {
      const content = `
<function_calls>
<invoke name="Write">
<parameter name="file_path">/config/app.yaml</parameter>
<parameter name="content">server:
  port: 8080
  host: localhost
database:
  url: postgres://localhost/db</parameter>
</invoke>
</function_calls>

<function_results>
File written successfully
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Write");
      expect(result[0].parameters.content).toContain("server:");
      expect(result[0].parameters.content).toContain("database:");
      expect(result[0].result).toContain("successfully");
    });

    test("parses boolean and number parameter types", () => {
      const content = `
<function_calls>
<invoke name="Grep">
<parameter name="pattern">error</parameter>
<parameter name="-i">true</parameter>
<parameter name="head_limit">10</parameter>
</invoke>
</function_calls>

<function_results>
Found 5 matches
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].parameters["-i"]).toBe(true);
      expect(result[0].parameters.head_limit).toBe(10);
      expect(typeof result[0].parameters["-i"]).toBe("boolean");
      expect(typeof result[0].parameters.head_limit).toBe("number");
    });

    test("parses JSON parameter values", () => {
      const content = `
<function_calls>
<invoke name="CustomTool">
<parameter name="config">{"debug": true, "level": 3}</parameter>
<parameter name="tags">["test", "dev"]</parameter>
</invoke>
</function_calls>

<function_results>
Configuration applied
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].parameters.config).toEqual({ debug: true, level: 3 });
      expect(result[0].parameters.tags).toEqual(["test", "dev"]);
    });

    test("parses Bash tool call with command", () => {
      const content = `
<function_calls>
<invoke name="Bash">
<parameter name="command">ls -la /src</parameter>
<parameter name="description">List source directory contents</parameter>
</invoke>
</function_calls>

<function_results>
total 48
drwxr-xr-x  5 user  staff   160 Dec 16 10:30 .
drwxr-xr-x  8 user  staff   256 Dec 16 10:29 ..
-rw-r--r--  1 user  staff  1234 Dec 16 10:30 main.ts
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Bash");
      expect(result[0].parameters.command).toBe("ls -la /src");
      expect(result[0].result).toContain("main.ts");
    });

    test("parses Skill tool call", () => {
      const content = `
<function_calls>
<invoke name="Skill">
<parameter name="skill">write</parameter>
</invoke>
</function_calls>

<function_results>
Launching skill: write
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Skill");
      expect(result[0].parameters.skill).toBe("write");
      expect(result[0].result).toContain("Launching skill");
      expect(result[0].success).toBe(true);
    });

    test("parses Task tool call with subagent delegation", () => {
      const content = `
<function_calls>
<invoke name="Task">
<parameter name="subagent_type">file-writer</parameter>
<parameter name="prompt">Create config file

**PRODUCT** (What to deliver):
- New YAML configuration

**PROCESS** (How to work):
- Follow YAML best practices

**PERFORMANCE** (Excellence criteria):
- Valid syntax</parameter>
</invoke>
</function_calls>

<function_results>
Task: Create config file

Skills Used: write

Actions Taken:
1. Created config.yaml (25 lines)

Evidence:
File: /config/config.yaml (CREATED)
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Task");
      expect(result[0].parameters.subagent_type).toBe("file-writer");
      expect(result[0].parameters.prompt).toContain("PRODUCT");
      expect(result[0].result).toContain("config.yaml");
    });
  });

  describe("Error handling", () => {
    test("parses tool call with error result", () => {
      const content = `
<function_calls>
<invoke name="Read">
<parameter name="file_path">/nonexistent/file.txt</parameter>
</invoke>
</function_calls>

<function_results>
Error: File not found: /nonexistent/file.txt
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(false);
      expect(result[0].errorMessage).toContain("File not found");
    });

    test("parses tool call with exception", () => {
      const content = `
<function_calls>
<invoke name="Bash">
<parameter name="command">invalid-command</parameter>
</invoke>
</function_calls>

<function_results>
Exception: command not found: invalid-command
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(false);
      expect(result[0].errorMessage).toContain("command not found");
    });

    test("parses tool call with 'failed' in result", () => {
      const content = `
<function_calls>
<invoke name="Write">
<parameter name="file_path">/protected/file.txt</parameter>
<parameter name="content">test</parameter>
</invoke>
</function_calls>

<function_results>
Write operation failed: Permission denied
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(false);
      expect(result[0].errorMessage).toContain("Permission denied");
    });

    test("handles tool call with missing function_results", () => {
      const content = `
<function_calls>
<invoke name="Grep">
<parameter name="pattern">search</parameter>
</invoke>
</function_calls>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Grep");
      expect(result[0].result).toBeNull();
      expect(result[0].success).toBe(true);
    });
  });

  describe("Edge cases", () => {
    test("returns empty array for empty content", () => {
      expect(parseToolCalls("")).toEqual([]);
    });

    test("returns empty array for content without tool calls", () => {
      const content = "This is just a regular message without any tool invocations.";
      expect(parseToolCalls(content)).toEqual([]);
    });

    test("handles malformed XML gracefully", () => {
      const content = `
<function_calls>
<invoke name="Read">
<parameter name="file_path">/src/file.ts
</invoke>
</function_calls>
      `;

      // Should not throw, but may return empty or partial results
      expect(() => parseToolCalls(content)).not.toThrow();
    });

    test("handles tool call with no parameters", () => {
      const content = `
<function_calls>
<invoke name="Status">
</invoke>
</function_calls>

<function_results>
All systems operational
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].toolName).toBe("Status");
      expect(result[0].parameters).toEqual({});
    });

    test("handles multiple function_calls blocks in same message", () => {
      const content = `
First action:

<function_calls>
<invoke name="Read">
<parameter name="file_path">/file1.ts</parameter>
</invoke>
</function_calls>

<function_results>
File 1 content
</function_results>

Second action:

<function_calls>
<invoke name="Read">
<parameter name="file_path">/file2.ts</parameter>
</invoke>
</function_calls>

<function_results>
File 2 content
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(2);
      expect(result[0].parameters.file_path).toBe("/file1.ts");
      expect(result[1].parameters.file_path).toBe("/file2.ts");
    });

    test("preserves whitespace in multiline parameters", () => {
      const content = `
<function_calls>
<invoke name="Write">
<parameter name="content">function test() {
  return {
    key: "value"
  };
}</parameter>
</invoke>
</function_calls>

<function_results>
Written
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].parameters.content).toContain("  return {");
      expect(result[0].parameters.content).toContain("    key:");
    });

    test("handles parameters with special characters", () => {
      const content = `
<function_calls>
<invoke name="Grep">
<parameter name="pattern">function.*\(.*\)</parameter>
<parameter name="glob">*.{js,ts}</parameter>
</invoke>
</function_calls>

<function_results>
Matches found
</function_results>
      `;

      const result = parseToolCalls(content);
      expect(result).toHaveLength(1);
      expect(result[0].parameters.pattern).toBe("function.*(.*)");
      // Note: Backslashes in XML are not double-escaped during parsing
      expect(result[0].parameters.glob).toBe("*.{js,ts}");
    });
  });
});

describe("parse4DEvaluation", () => {
  describe("Valid evaluations", () => {
    test("parses complete evaluation with EXCELLENT verdict", () => {
      const content = `
Task: Evaluate file-writer output

Skills Used: 4d-evaluation

Actions Taken:
1. Analyzed agent output
2. Applied 4-D framework

Quality Assessment:
- Product: File created correctly with all required fields
- Process: Followed best practices for YAML formatting
- Performance: Meets excellence standards for configuration files

Verdict: EXCELLENT

The work is complete and meets all criteria.
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.verdict).toBe("EXCELLENT");
      expect(result?.dimensions.productDiscernment).toContain("created correctly");
      expect(result?.dimensions.processDiscernment).toContain("best practices");
      expect(result?.dimensions.performanceDiscernment).toContain("excellence standards");
      expect(result?.refinementNeeded).toBeUndefined();
    });

    test("parses complete evaluation with NEEDS REFINEMENT verdict", () => {
      const content = `
Task: Evaluate base-research output

Skills Used: 4d-evaluation

Actions Taken:
1. Reviewed research findings
2. Assessed source quality

Quality Assessment:
- Product: Research incomplete, missing key sources
- Process: Rushed approach, skipped validation
- Performance: Falls short of excellence bar

Verdict: NEEDS REFINEMENT

Refinement Needed:
- Add at least 5 more authoritative sources
- Verify all claims with citations
- Expand analysis section with deeper insights
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.verdict).toBe("NEEDS REFINEMENT");
      expect(result?.dimensions.productDiscernment).toContain("incomplete");
      expect(result?.dimensions.processDiscernment).toContain("Rushed");
      expect(result?.dimensions.performanceDiscernment).toContain("Falls short");
      expect(result?.refinementNeeded).toContain("Add at least 5 more");
      expect(result?.refinementNeeded).toContain("Verify all claims");
    });

    test("parses evaluation with Delegation and Description dimensions", () => {
      const content = `
Task: Full 4-D evaluation

Quality Assessment:
- Delegation: Correct agent selected for file operations
- Description: Clear task specification with 3P format
- Product: Deliverables match requirements exactly
- Process: Sound methodology with proper verification
- Performance: Exceeds excellence standards

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.dimensions.delegation).toContain("Correct agent");
      expect(result?.dimensions.description).toContain("Clear task");
      expect(result?.dimensions.productDiscernment).toContain("match requirements");
      expect(result?.dimensions.processDiscernment).toContain("Sound methodology");
      expect(result?.dimensions.performanceDiscernment).toContain("Exceeds");
    });

    test("extracts evaluated agent from 'Evaluating' statement", () => {
      const content = `
Evaluating file-writer output...

Quality Assessment:
- Product: Good
- Process: Good
- Performance: Good

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.evaluatedAgent).toBe("file-writer");
    });

    test("extracts evaluated agent from Task line", () => {
      const content = `
Task: Evaluate base-research agent output

Quality Assessment:
- Product: Acceptable
- Process: Good
- Performance: Meets standards

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.evaluatedAgent).toBe("base-research");
    });

    test("parses evaluation with alternate dimension format (no 'Discernment' suffix)", () => {
      const content = `
Quality Assessment:
- Product: Meets all requirements
- Process: Thorough and systematic
- Performance: Excellence achieved

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.dimensions.productDiscernment).toContain("Meets all");
      expect(result?.dimensions.processDiscernment).toContain("Thorough");
      expect(result?.dimensions.performanceDiscernment).toContain("Excellence");
    });

    test("parses evaluation with standalone dimension entries (no Quality Assessment section)", () => {
      const content = `
Evaluation Results:

Product Discernment: Complete implementation with all features
Process Discernment: Best practices followed throughout
Performance Discernment: Exceeds all excellence criteria

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.dimensions.productDiscernment).toContain("Complete implementation");
      expect(result?.dimensions.processDiscernment).toContain("Best practices");
      expect(result?.dimensions.performanceDiscernment).toContain("Exceeds all");
    });

    test("extracts timestamp when present", () => {
      const content = `
Timestamp: 2025-12-16T15:45:30.000Z

Quality Assessment:
- Product: Good
- Process: Good
- Performance: Good

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.timestamp).toBe("2025-12-16T15:45:30.000Z");
    });

    test("parses evaluation with Coaching section for refinement", () => {
      const content = `
Quality Assessment:
- Product: Incomplete feature set
- Process: Adequate but not thorough
- Performance: Below excellence bar

Verdict: NEEDS REFINEMENT

Coaching:
Focus on completing all required features before claiming done.
Add comprehensive error handling.
Include unit tests for all new functions.
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.verdict).toBe("NEEDS REFINEMENT");
      expect(result?.refinementNeeded).toContain("completing all required features");
      expect(result?.refinementNeeded).toContain("error handling");
      expect(result?.refinementNeeded).toContain("unit tests");
    });

    test("parses evaluation with refinement text directly after verdict", () => {
      const content = `
Quality Assessment:
- Product: Missing key components
- Process: Skipped important steps
- Performance: Needs improvement

Verdict: NEEDS REFINEMENT
The implementation is missing error handling and validation.
Add try-catch blocks and input validation before resubmitting.
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.refinementNeeded).toContain("error handling");
      expect(result?.refinementNeeded).toContain("try-catch blocks");
    });
  });

  describe("Invalid evaluations", () => {
    test("returns null for empty content", () => {
      expect(parse4DEvaluation("")).toBeNull();
    });

    test("returns null when no verdict present", () => {
      const content = `
Quality Assessment:
- Product: Good work
- Process: Solid approach
- Performance: High quality

This looks good overall.
      `;

      expect(parse4DEvaluation(content)).toBeNull();
    });

    test("returns null when verdict keyword missing", () => {
      const content = `
Quality Assessment:
- Product: Complete
- Process: Thorough
- Performance: Excellent

Result: The work is done well.
      `;

      expect(parse4DEvaluation(content)).toBeNull();
    });

    test("returns null for non-evaluation content", () => {
      const content = "This is just a regular message without any evaluation.";
      expect(parse4DEvaluation(content)).toBeNull();
    });
  });

  describe("Edge cases", () => {
    test("handles evaluation with partial dimensions (only Product)", () => {
      const content = `
Quality Assessment:
- Product: Meets requirements

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.dimensions.productDiscernment).toBeDefined();
      expect(result?.dimensions.processDiscernment).toBeUndefined();
      expect(result?.dimensions.performanceDiscernment).toBeUndefined();
    });

    test("handles evaluation with no Quality Assessment section", () => {
      const content = `
Evaluating the output...

Verdict: EXCELLENT

Everything looks good.
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.verdict).toBe("EXCELLENT");
      expect(Object.keys(result?.dimensions || {}).length).toBe(0);
    });

    test("handles messages that mention verdict but aren't evaluations", () => {
      const content = `
I will evaluate this and provide a verdict later.
The verdict could be EXCELLENT or NEEDS REFINEMENT.
      `;

      // This should return null because it doesn't have "Verdict:" followed by the actual verdict
      expect(parse4DEvaluation(content)).toBeNull();
    });

    test("handles evaluation with mixed case in dimension names", () => {
      const content = `
Quality Assessment:
- product: Complete
- PROCESS: Thorough
- PeRfOrMaNcE: Excellent

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.dimensions.productDiscernment).toBeDefined();
      expect(result?.dimensions.processDiscernment).toBeDefined();
      expect(result?.dimensions.performanceDiscernment).toBeDefined();
    });

    test("generates timestamp when not present in content", () => {
      const content = `
Quality Assessment:
- Product: Good

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.timestamp).toBeDefined();
      // Should be valid ISO 8601
      expect(() => new Date(result!.timestamp)).not.toThrow();
    });

    test("handles evaluation with extra whitespace", () => {
      const content = `

Quality Assessment:

- Product:    Excellent work


- Process:   Well executed


- Performance:     Exceeds standards


Verdict:   EXCELLENT

      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.verdict).toBe("EXCELLENT");
      expect(result?.dimensions.productDiscernment).toBe("Excellent work");
      expect(result?.dimensions.processDiscernment).toBe("Well executed");
      expect(result?.dimensions.performanceDiscernment).toBe("Exceeds standards");
    });

    test("handles evaluation without agent identification", () => {
      const content = `
Quality Assessment:
- Product: Complete
- Process: Sound
- Performance: Excellent

Verdict: EXCELLENT
      `;

      const result = parse4DEvaluation(content);
      expect(result).not.toBeNull();
      expect(result?.evaluatedAgent).toBeUndefined();
    });
  });
});

describe("extractMetadata", () => {
  describe("Basic metadata extraction", () => {
    test("extracts metadata from empty messages array", () => {
      const result = extractMetadata([]);
      
      expect(result.messageCount).toBe(0);
      expect(result.duration).toBe(0);
      expect(result.skillsUsed).toEqual([]);
      expect(result.filesModified).toEqual([]);
      expect(result.primaryAgent).toBeUndefined();
      expect(result.tokenUsage).toBeUndefined();
    });

    test("extracts metadata from single message", () => {
      const messages = [
        {
          role: "user",
          content: "Create a new file",
          timestamp: "2025-12-16T10:00:00.000Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.messageCount).toBe(1);
      expect(result.startTime).toBe("2025-12-16T10:00:00.000Z");
      expect(result.endTime).toBe("2025-12-16T10:00:00.000Z");
      expect(result.duration).toBe(0);
    });

    test("extracts start and end timestamps from multiple messages", () => {
      const messages = [
        {
          role: "user",
          content: "Request",
          timestamp: "2025-12-16T10:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Response 1",
          timestamp: "2025-12-16T10:01:00.000Z",
        },
        {
          role: "assistant",
          content: "Response 2",
          timestamp: "2025-12-16T10:05:00.000Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.startTime).toBe("2025-12-16T10:00:00.000Z");
      expect(result.endTime).toBe("2025-12-16T10:05:00.000Z");
      expect(result.messageCount).toBe(3);
      expect(result.duration).toBe(5 * 60 * 1000); // 5 minutes in ms
    });

    test("handles out-of-order timestamps", () => {
      const messages = [
        {
          role: "user",
          content: "Message 2",
          timestamp: "2025-12-16T10:05:00.000Z",
        },
        {
          role: "assistant",
          content: "Message 1",
          timestamp: "2025-12-16T10:00:00.000Z",
        },
        {
          role: "assistant",
          content: "Message 3",
          timestamp: "2025-12-16T10:10:00.000Z",
        },
      ];

      const result = extractMetadata(messages);
      
      // Should find earliest and latest regardless of order
      expect(result.startTime).toBe("2025-12-16T10:00:00.000Z");
      expect(result.endTime).toBe("2025-12-16T10:10:00.000Z");
      expect(result.duration).toBe(10 * 60 * 1000); // 10 minutes
    });
  });

  describe("Primary agent detection", () => {
    test("detects primary agent from message roles", () => {
      const messages = [
        { role: "user", content: "Request", timestamp: "2025-12-16T10:00:00Z" },
        { role: "maestro", content: "Delegating", timestamp: "2025-12-16T10:01:00Z" },
        { role: "file-writer", content: "Working...", timestamp: "2025-12-16T10:02:00Z" },
        { role: "file-writer", content: "Complete", timestamp: "2025-12-16T10:03:00Z" },
        { role: "maestro", content: "Evaluating", timestamp: "2025-12-16T10:04:00Z" },
      ];

      const result = extractMetadata(messages);
      
      // file-writer appears twice, should be primary
      expect(result.primaryAgent).toBe("file-writer");
    });

    test("returns undefined when only system roles present", () => {
      const messages = [
        { role: "user", content: "Request", timestamp: "2025-12-16T10:00:00Z" },
        { role: "assistant", content: "Response", timestamp: "2025-12-16T10:01:00Z" },
        { role: "system", content: "Info", timestamp: "2025-12-16T10:02:00Z" },
      ];

      const result = extractMetadata(messages);
      
      expect(result.primaryAgent).toBeUndefined();
    });

    test("excludes maestro from primary agent detection", () => {
      const messages = [
        { role: "maestro", content: "Delegating 1", timestamp: "2025-12-16T10:00:00Z" },
        { role: "maestro", content: "Delegating 2", timestamp: "2025-12-16T10:01:00Z" },
        { role: "maestro", content: "Delegating 3", timestamp: "2025-12-16T10:02:00Z" },
        { role: "base-research", content: "Working", timestamp: "2025-12-16T10:03:00Z" },
      ];

      const result = extractMetadata(messages);
      
      // Even though maestro appears more, it's excluded
      expect(result.primaryAgent).toBe("base-research");
    });

    test("handles tie in agent frequency", () => {
      const messages = [
        { role: "file-writer", content: "Working", timestamp: "2025-12-16T10:00:00Z" },
        { role: "base-research", content: "Working", timestamp: "2025-12-16T10:01:00Z" },
      ];

      const result = extractMetadata(messages);
      
      // Should return one of them (first encountered wins in our implementation)
      expect(result.primaryAgent).toBeDefined();
      expect(["file-writer", "base-research"]).toContain(result.primaryAgent);
    });
  });

  describe("Skills extraction", () => {
    test("extracts skills from Skill tool invocations", () => {
      const messages = [
        {
          role: "assistant",
          content: `<invoke name="Skill"><parameter name="skill">write</parameter></invoke>`,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.skillsUsed).toContain("write");
    });

    test("extracts skills from activation mentions", () => {
      const messages = [
        {
          role: "assistant",
          content: "Activated Write skill to help with file modifications",
          timestamp: "2025-12-16T10:00:00Z",
        },
        {
          role: "assistant",
          content: "Using read skill for file analysis",
          timestamp: "2025-12-16T10:01:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.skillsUsed).toContain("write");
      expect(result.skillsUsed).toContain("read");
    });

    test("extracts skills from agent report Skills Used section", () => {
      const messages = [
        {
          role: "file-writer",
          content: `
Task: Create configuration file

Skills Used: [write, base-analysis]

Actions Taken:
1. Created config.yaml
          `,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.skillsUsed).toContain("write");
      expect(result.skillsUsed).toContain("base-analysis");
    });

    test("handles multiple skill mentions with deduplication", () => {
      const messages = [
        {
          role: "assistant",
          content: "Activated Write skill",
          timestamp: "2025-12-16T10:00:00Z",
        },
        {
          role: "assistant",
          content: "Using write skill again",
          timestamp: "2025-12-16T10:01:00Z",
        },
        {
          role: "assistant",
          content: `<invoke name="Skill"><parameter name="skill">write</parameter></invoke>`,
          timestamp: "2025-12-16T10:02:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      // Should only appear once despite multiple mentions
      expect(result.skillsUsed.filter(s => s === "write")).toHaveLength(1);
    });

    test("returns empty array when no skills used", () => {
      const messages = [
        {
          role: "user",
          content: "Simple request",
          timestamp: "2025-12-16T10:00:00Z",
        },
        {
          role: "assistant",
          content: "Simple response",
          timestamp: "2025-12-16T10:01:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.skillsUsed).toEqual([]);
    });
  });

  describe("Files modified extraction", () => {
    test("extracts files from Write tool invocations", () => {
      const messages = [
        {
          role: "assistant",
          content: `<invoke name="Write"><parameter name="file_path">/src/config.yaml</parameter></invoke>`,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.filesModified).toContain("/src/config.yaml");
    });

    test("extracts files from Edit tool invocations", () => {
      const messages = [
        {
          role: "assistant",
          content: `<invoke name="Edit"><parameter name="file_path">/src/main.ts</parameter></invoke>`,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.filesModified).toContain("/src/main.ts");
    });

    test("extracts files from Evidence sections", () => {
      const messages = [
        {
          role: "file-writer",
          content: `
Task: Create files

Evidence:
File: /config/app.yaml (CREATED)
File: /src/utils.ts (MODIFIED)
          `,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.filesModified).toContain("/config/app.yaml");
      expect(result.filesModified).toContain("/src/utils.ts");
    });

    test("extracts files from Actions Taken with timestamps", () => {
      const messages = [
        {
          role: "file-writer",
          content: `
Actions Taken:
1. [2025-12-16T10:00:00Z] Write: /src/new-file.ts
2. [2025-12-16T10:01:00Z] Edit: /src/existing.ts
          `,
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.filesModified).toContain("/src/new-file.ts");
      expect(result.filesModified).toContain("/src/existing.ts");
    });

    test("handles multiple file modifications with deduplication", () => {
      const messages = [
        {
          role: "assistant",
          content: `<invoke name="Write"><parameter name="file_path">/src/file.ts</parameter></invoke>`,
          timestamp: "2025-12-16T10:00:00Z",
        },
        {
          role: "assistant",
          content: `<invoke name="Edit"><parameter name="file_path">/src/file.ts</parameter></invoke>`,
          timestamp: "2025-12-16T10:01:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      // Should only appear once despite multiple operations
      expect(result.filesModified.filter(f => f === "/src/file.ts")).toHaveLength(1);
    });

    test("ignores non-file-path strings", () => {
      const messages = [
        {
          role: "assistant",
          content: "File: description without path\nEdit: just some text",
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      // Strings without / or \ should not be included
      expect(result.filesModified).toEqual([]);
    });

    test("returns empty array when no files modified", () => {
      const messages = [
        {
          role: "user",
          content: "Just a question",
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.filesModified).toEqual([]);
    });
  });

  describe("Token usage extraction", () => {
    test("extracts token usage from message metadata", () => {
      const messages = [
        {
          role: "assistant",
          content: "Response",
          timestamp: "2025-12-16T10:00:00Z",
          metadata: {
            tokenUsage: {
              total: 1000,
              input: 600,
              output: 400,
            },
          },
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.tokenUsage).toBeDefined();
      expect(result.tokenUsage?.total).toBe(1000);
      expect(result.tokenUsage?.input).toBe(600);
      expect(result.tokenUsage?.output).toBe(400);
    });

    test("sums token usage across multiple messages", () => {
      const messages = [
        {
          role: "assistant",
          content: "Response 1",
          timestamp: "2025-12-16T10:00:00Z",
          metadata: {
            tokenUsage: { total: 500, input: 300, output: 200 },
          },
        },
        {
          role: "assistant",
          content: "Response 2",
          timestamp: "2025-12-16T10:01:00Z",
          metadata: {
            tokenUsage: { total: 800, input: 500, output: 300 },
          },
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.tokenUsage?.total).toBe(1300);
      expect(result.tokenUsage?.input).toBe(800);
      expect(result.tokenUsage?.output).toBe(500);
    });

    test("extracts token usage from content patterns", () => {
      const messages = [
        {
          role: "assistant",
          content: "Token usage: 15000/200000; 185000 remaining",
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.tokenUsage).toBeDefined();
      expect(result.tokenUsage?.total).toBe(15000);
      // Heuristic: 60% input, 40% output
      expect(result.tokenUsage?.input).toBe(9000);
      expect(result.tokenUsage?.output).toBe(6000);
    });

    test("returns undefined when no token usage available", () => {
      const messages = [
        {
          role: "user",
          content: "Request",
          timestamp: "2025-12-16T10:00:00Z",
        },
      ];

      const result = extractMetadata(messages);
      
      expect(result.tokenUsage).toBeUndefined();
    });
  });
});

describe("parseConversation", () => {
  describe("Empty and invalid input", () => {
    test("handles empty string", () => {
      const result = parseConversation("");
      
      expect(result.messages).toEqual([]);
      expect(result.delegations).toEqual([]);
      expect(result.toolCalls).toEqual([]);
      expect(result.evaluations).toEqual([]);
      expect(result.metadata.messageCount).toBe(0);
    });

    test("handles whitespace-only string", () => {
      const result = parseConversation("   \n\t  ");
      
      expect(result.messages).toEqual([]);
      expect(result.metadata.messageCount).toBe(0);
    });
  });

  describe("JSON format parsing", () => {
    test("parses JSON with messages array", () => {
      const rawContent = JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Create a file",
            timestamp: "2025-12-16T10:00:00Z",
          },
          {
            role: "assistant",
            content: "I'll help with that",
            timestamp: "2025-12-16T10:01:00Z",
          },
        ],
      });

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe("user");
      expect(result.messages[0].content).toBe("Create a file");
      expect(result.messages[1].role).toBe("assistant");
      expect(result.metadata.messageCount).toBe(2);
    });

    test("parses direct JSON array of messages", () => {
      const rawContent = JSON.stringify([
        { role: "user", content: "Request", timestamp: "2025-12-16T10:00:00Z" },
        { role: "assistant", content: "Response", timestamp: "2025-12-16T10:01:00Z" },
      ]);

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(2);
      expect(result.metadata.messageCount).toBe(2);
    });

    test("detects roles when missing from JSON", () => {
      const rawContent = JSON.stringify({
        messages: [
          { content: "/maestro do something", timestamp: "2025-12-16T10:00:00Z" },
          { content: "🎼 Analyzing request", timestamp: "2025-12-16T10:01:00Z" },
        ],
      });

      const result = parseConversation(rawContent);
      
      expect(result.messages[0].role).toBe("user"); // Slash command
      expect(result.messages[1].role).toBe("maestro"); // Emoji
    });

    test("generates timestamps when missing from JSON", () => {
      const rawContent = JSON.stringify({
        messages: [
          { role: "user", content: "Request" },
        ],
      });

      const result = parseConversation(rawContent);
      
      expect(result.messages[0].timestamp).toBeDefined();
      expect(() => new Date(result.messages[0].timestamp)).not.toThrow();
    });
  });

  describe("Plain text parsing", () => {
    test("parses messages separated by horizontal rules", () => {
      const rawContent = `
User request here
---
Assistant response 1
---
Assistant response 2
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].content).toContain("User request");
      expect(result.messages[1].content).toContain("response 1");
      expect(result.messages[2].content).toContain("response 2");
    });

    test("parses messages separated by triple newlines", () => {
      const rawContent = `
First message


Second message


Third message
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(3);
    });

    test("treats single block as one message when no delimiters", () => {
      const rawContent = "This is a single message without any delimiters.";

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe(rawContent);
    });

    test("auto-detects roles from content", () => {
      const rawContent = `
/maestro create file
---
🎼 Analyzing request
---
Task: Create file

Skills Used: write
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages[0].role).toBe("user");
      expect(result.messages[1].role).toBe("maestro");
      expect(result.messages[2].role).toBe("agent");
    });

    test("generates sequential timestamps for plain text", () => {
      const rawContent = `
Message 1
---
Message 2
---
Message 3
      `;

      const result = parseConversation(rawContent);
      
      // Timestamps should be sequential (seconds incremented)
      const ts1 = new Date(result.messages[0].timestamp).getTime();
      const ts2 = new Date(result.messages[1].timestamp).getTime();
      const ts3 = new Date(result.messages[2].timestamp).getTime();
      
      expect(ts2).toBeGreaterThan(ts1);
      expect(ts3).toBeGreaterThan(ts2);
    });
  });

  describe("Full conversation integration", () => {
    test("parses conversation with delegations", () => {
      const rawContent = `
/maestro create config file
---
📤 Delegating to file-writer

**PRODUCT** (What to deliver):
- Create config.yaml

**PROCESS** (How to work):
- Use YAML best practices

**PERFORMANCE** (Excellence criteria):
- Valid syntax
---
Task: Create config file

Skills Used: write

Actions Taken:
1. Created config.yaml
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(3);
      expect(result.delegations).toHaveLength(1);
      expect(result.delegations[0].agentName).toBe("file-writer");
      expect(result.delegations[0].product).toContain("config.yaml");
    });

    test("parses conversation with tool calls", () => {
      const rawContent = `
User request
---
<function_calls>
<invoke name="Read">
<parameter name="file_path">/src/file.ts</parameter>
</invoke>
</function_calls>

<function_results>
File content here
</function_results>
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(2);
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].toolName).toBe("Read");
      expect(result.toolCalls[0].parameters.file_path).toBe("/src/file.ts");
    });

    test("parses conversation with evaluations", () => {
      const rawContent = `
Agent output
---
Quality Assessment:
- Product: Excellent
- Process: Sound
- Performance: Exceeds standards

Verdict: EXCELLENT
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(2);
      expect(result.evaluations).toHaveLength(1);
      expect(result.evaluations[0].verdict).toBe("EXCELLENT");
    });

    test("parses complex conversation with all elements", () => {
      const rawContent = `
/maestro analyze this code
---
🎼 Analyzing request
---
📤 Delegating to base-analysis

**PRODUCT** (What to deliver):
- Code quality analysis

**PROCESS** (How to work):
- Review structure
- Check best practices

**PERFORMANCE** (Excellence criteria):
- Comprehensive report
---
<function_calls>
<invoke name="Read">
<parameter name="file_path">/src/code.ts</parameter>
</invoke>
</function_calls>

<function_results>
Code content
</function_results>
---
Task: Analyze code

Skills Used: base-analysis, read

Actions Taken:
1. Read file /src/code.ts
2. Performed analysis

Evidence:
Analysis complete
---
Quality Assessment:
- Product: Thorough analysis provided
- Process: Systematic approach
- Performance: Excellent quality

Verdict: EXCELLENT
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages.length).toBeGreaterThan(3);
      expect(result.delegations).toHaveLength(1);
      expect(result.toolCalls).toHaveLength(1);
      expect(result.evaluations).toHaveLength(1);
      
      // Check metadata
      expect(result.metadata.messageCount).toBe(result.messages.length);
      expect(result.metadata.skillsUsed).toContain("base-analysis");
      // File was only read, not modified, so should not be in filesModified
    });

    test("extracts comprehensive metadata from conversation", () => {
      const rawContent = JSON.stringify({
        messages: [
          {
            role: "user",
            content: "Request",
            timestamp: "2025-12-16T10:00:00Z",
          },
          {
            role: "maestro",
            content: `📤 Delegating to file-writer

**PRODUCT** (What to deliver):
- Create file

**PROCESS** (How to work):
- Use Write tool

**PERFORMANCE** (Excellence criteria):
- Valid`,
            timestamp: "2025-12-16T10:01:00Z",
          },
          {
            role: "file-writer",
            content: `Task: Create file
Skills Used: [write]
Actions Taken:
1. Write: /src/new-file.ts`,
            timestamp: "2025-12-16T10:02:00Z",
          },
        ],
      });

      const result = parseConversation(rawContent);
      
      expect(result.metadata.startTime).toBe("2025-12-16T10:00:00Z");
      expect(result.metadata.endTime).toBe("2025-12-16T10:02:00Z");
      expect(result.metadata.duration).toBe(2 * 60 * 1000); // 2 minutes
      expect(result.metadata.primaryAgent).toBe("file-writer");
      expect(result.metadata.skillsUsed).toContain("write");
      expect(result.metadata.filesModified).toContain("/src/new-file.ts");
      expect(result.metadata.messageCount).toBe(3);
    });
  });

  describe("Edge cases", () => {
    test("handles invalid JSON gracefully", () => {
      const rawContent = "{invalid json}";

      const result = parseConversation(rawContent);
      
      // Should parse as plain text, not throw
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe("{invalid json}");
    });

    test("handles empty messages in JSON array", () => {
      const rawContent = JSON.stringify({
        messages: [
          { role: "user", content: "Valid message", timestamp: "2025-12-16T10:00:00Z" },
          { role: "assistant", content: "", timestamp: "2025-12-16T10:01:00Z" },
        ],
      });

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(2);
      expect(result.messages[1].content).toBe("");
    });

    test("handles messages with only whitespace", () => {
      const rawContent = `
Valid message
---
   

   
---
Another valid message
      `;

      const result = parseConversation(rawContent);
      
      // Empty/whitespace chunks should be filtered out
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].content).toContain("Valid message");
      expect(result.messages[1].content).toContain("Another valid");
    });

    test("handles multiple delegations in single conversation", () => {
      const rawContent = `
📤 file-writer

**PRODUCT** (What to deliver):
- Task 1

**PROCESS** (How to work):
- Process 1

**PERFORMANCE** (Excellence criteria):
- Standard 1
---
📤 base-research

**PRODUCT** (What to deliver):
- Task 2

**PROCESS** (How to work):
- Process 2

**PERFORMANCE** (Excellence criteria):
- Standard 2
      `;

      const result = parseConversation(rawContent);

      expect(result.delegations).toHaveLength(2);
      expect(result.delegations[0].agentName).toBe("file-writer");
      expect(result.delegations[0].product).toContain("Task 1");
      expect(result.delegations[1].agentName).toBe("base-research");
      expect(result.delegations[1].product).toContain("Task 2");
    });
    test("handles multiple tool calls in single message", () => {
      const rawContent = `
<function_calls>
<invoke name="Read"><parameter name="file_path">/file1.ts</parameter></invoke>
<invoke name="Read"><parameter name="file_path">/file2.ts</parameter></invoke>
</function_calls>

<function_results>
Results
</function_results>
      `;

      const result = parseConversation(rawContent);
      
      expect(result.toolCalls).toHaveLength(2);
      expect(result.toolCalls[0].parameters.file_path).toBe("/file1.ts");
      expect(result.toolCalls[1].parameters.file_path).toBe("/file2.ts");
    });

    test("handles conversation with no extractable elements", () => {
      const rawContent = `
Just a normal conversation
---
With regular text
---
Nothing special here
      `;

      const result = parseConversation(rawContent);
      
      expect(result.messages).toHaveLength(3);
      expect(result.delegations).toEqual([]);
      expect(result.toolCalls).toEqual([]);
      expect(result.evaluations).toEqual([]);
    });
  });
});
