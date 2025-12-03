# Agent Registry (Index)

This is a lightweight index of all available agents. The agent_delegator reads this index first, then loads detail files only when needed for true progressive disclosure.

## How to Add New Agents

1. Create the agent file under `.claude/agents/`
2. Create a detail file: `assets/agents/{agent_name}.md`
3. Add one line to the registry below
4. Done!

---

## Available Agents

| Agent | Specialization | Primary Tools | Detail File |
|-------|----------------|---------------|-------------|
| **4d_evaluation** | Quality assessment using 4D framework (Product, Process, Performance) | Skill, Read, Grep, Bash | [4d_evaluation.md](agents/4d_evaluation.md) |
| **agent_creator** | Meta-orchestrator for creating new agents and skills through intent discovery | Task, AskUserQuestion, Skill, Write, Edit | [agent_creator.md](agents/agent_creator.md) |
| **delegater** | Multi-agent execution coordination, workflow orchestration | Task, Read, TodoWrite, Skill | [delegater.md](agents/delegater.md) |
| **orchestrator** | Intelligent skill + agent routing | Skill, Task, All tools | [orchestrator.md](agents/orchestrator.md) |
| **web_retriever** | External data retrieval with fetch skill best practices | WebFetch, Bash, Read, Write, Skill | [web_retriever.md](agents/web_retriever.md) |


---

## Quick Match Guide

**How agent_delegator uses this index:**

1. **Read this index** - Fast scan of all available agents
2. **Match specialization** - Does task match agent's focus?
3. **Check tools** - Does agent have required tools?
4. **Load detail file** - Read full details only if needed
5. **Delegate** - Use Task tool to delegate

**Match Priority:**
1. **Specialization match** - Task type fits agent's design
2. **Tool availability** - Agent has required tools
3. **Scope match** - Task complexity fits agent's capability

---

## Task Type Quick Reference

| Task Type | Primary Agent | Alternative |
|-----------|--------------|-------------|
| Create agent/skill | agent_creator | N/A |
| Evaluate quality | 4d_evaluation | N/A |
| Fetch external data | web_retriever | general-purpose |
| Web scraping | web_retriever | general-purpose |
| API calls | web_retriever | general-purpose |
| Download files | web_retriever | general-purpose |
| Find code/files | Explore | general-purpose |
| Plan feature | Plan | general-purpose |
| Implement feature | general-purpose | orchestrator |
| Learn Claude Code | claude-code-guide | N/A |
| Complex orchestration | orchestrator | general-purpose |
| Test delegation | test-agwent | N/A |

---

## Tool Requirements Quick Reference

| Tools Needed | Recommended Agents |
|--------------|-------------------|
| File modifications (Write/Edit) | general-purpose, orchestrator |
| Read-only exploration | Explore, Plan, claude-code-guide |
| Web access (WebFetch) | web_retriever, general-purpose, orchestrator |
| Command execution (Bash) | general-purpose, orchestrator, web_retriever |
| Skill activation | orchestrator, test-agwent, web_retriever |
| Agent spawning (Task) | general-purpose, orchestrator |

---

## Adding New Agents Template

```markdown
| **agent_name** | One-line specialization | primary, tools, list | [agent_name.md](agents/agent_name.md) |
```

Example:
```markdown
| **test-runner** | Automated testing and validation | Bash, Read, Write | [test-runner.md](agents/test-runner.md) |
```

---

## Registry Metadata

**Last Updated:** 2025-11-28
**Total Agents:** 5
**Built-in Agents:** 2
**Custom Agents:** 5
**Architecture:** Progressive disclosure (index → detail files)
**Maintained By:** agent_delegator system
