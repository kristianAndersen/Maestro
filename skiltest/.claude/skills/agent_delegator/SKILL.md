---
name: agent_delegator
description: Analyzes task requirements and routes to the most appropriate specialized agent
tools: Task, Read
---

# Agent Delegator

## Purpose

This skill acts as an intelligent router that analyzes task requirements and delegates execution to the most appropriate specialized agent. It maintains separation of concerns by keeping routing logic separate from agent definitions.

**Key Distinction:**
- **skill_delegator** routes to specialized *knowledge* (best practices, patterns)
- **agent_delegator** routes to specialized *executors* (capabilities, tools, permissions)

## How It Works

1. **Analyze** the task requirements (tools needed, complexity, scope)
2. **Read** `assets/agent_map.md` to get the registry of available agents
3. **Match** task requirements against agent capabilities
4. **Delegate** execution to the best matching agent using the Task tool
5. **Return** results from the delegated agent

## Routing Algorithm

```
Step 1: Understand task requirements
        - What tools are needed?
        - What permissions are required?
        - What is the scope/complexity?
        - Is this exploratory or implementation?

Step 2: Read assets/agent_map.md to load agent registry

Step 3: For each agent in registry:
        - Check if agent has required tools
        - Check if agent's specialization matches task type
        - Calculate capability match score

Step 4: Select agent with best capability match

Step 5: Use Task tool to delegate to selected agent
```

## Capability Matching

**High Match (delegate immediately):**
- Agent has all required tools
- Agent's specialization perfectly matches task type
- Task complexity matches agent's design scope

**Medium Match (likely delegate):**
- Agent has most required tools
- Agent's specialization is related to task
- Task is within agent's capability range

**Low Match (consider alternatives):**
- Agent missing critical tools
- Agent's specialization doesn't match
- Task outside agent's design scope

## When to Use This Skill

Use agent_delegator when:
- Task requires specialized agent capabilities
- Multiple agents available, need to pick the right one
- Task complexity requires dedicated agent execution
- Specific tool combinations are needed

Don't use agent_delegator when:
- Current agent can handle the task directly
- Task is trivial (simple tool call)
- Only one agent option exists
- Already executing within a specialized agent

## Decision Factors

### 1. Tool Requirements
Which tools does the task need?
- WebFetch, WebSearch → Agents with web access
- Glob, Grep, Read → Agents for code exploration
- Edit, Write → Agents with file modification permissions
- Bash → Agents with command execution

### 2. Task Type
What kind of task is this?
- **Exploration** → Explore agent (codebase understanding)
- **Planning** → Plan agent (multi-step design)
- **Implementation** → general-purpose agent (execution)
- **Documentation lookup** → claude-code-guide agent

### 3. Scope & Complexity
How complex is the task?
- **Simple single-step** → Current agent or general-purpose
- **Multi-step exploration** → Explore agent
- **Large feature planning** → Plan agent
- **Complex implementation** → general-purpose agent

### 4. Permission Requirements
What permissions are needed?
- **Read-only exploration** → Explore agent
- **File modifications** → Agents with Edit/Write tools
- **External network access** → Agents with WebFetch/WebSearch
- **Command execution** → Agents with Bash tool

## Delegation Pattern

```
1. Identify task requirements
2. Read assets/agent_map.md
3. Match requirements to agent capabilities
4. Use Task tool to delegate:

   Task(
     subagent_type="selected_agent_name",
     description="Brief task description",
     prompt="Detailed instructions for the agent"
   )

5. Receive and return agent results
```

## Resources

- **`assets/agent_map.md`** - Complete registry of all available agents with capabilities, tools, and specializations
- **`assets/examples.md`** - Real-world examples of task delegation decisions

## Quick Start

For most delegations:

```
1. Task arrives
2. Read assets/agent_map.md
3. Find agent that matches task type + has required tools
4. Use Task tool to delegate to that agent
5. Return agent's results
```

## Important Notes

- **Registry is source of truth** - Always read agent_map.md before deciding
- **Match capabilities, not names** - Choose based on what the agent can do
- **Agents can use skills** - Consider which agents have access to which skills
- **Update the map, not this file** - When adding agents, only update the registry
- **Trust agent specialization** - Agents are designed for specific purposes
- **Avoid over-delegation** - If current agent can do it, do it directly
