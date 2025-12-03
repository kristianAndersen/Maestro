---
name: skill_delegator
description: Analyzes user requests and routes to the most appropriate specialized skill
tools: Skill, Read
---

# Skill Delegator

## Purpose

This skill acts as an intelligent router that analyzes user requests and activates the most appropriate specialized skill for the task. It maintains separation of concerns by keeping routing logic separate from skill definitions.

## How It Works

1. **Analyze** the user's request to identify the task type
2. **Read** `assets/skill_map.md` to get the current registry of available skills
3. **Match** the request against skill patterns defined in the registry
4. **Activate** the best matching skill using the Skill tool
5. **Delegate** execution to the activated skill

## Routing Algorithm

```
Step 1: Parse user request for key verbs and nouns
Step 2: Read assets/skill_map.md to load skill registry
Step 3: For each skill in registry:
        - Check if request matches skill patterns
        - Check if keywords are present
        - Calculate confidence score
Step 4: Select skill with highest confidence
Step 5: If confidence > threshold:
        - Use Skill tool to activate the skill
        Else:
        - Inform user no specialized skill available
```

## Confidence Scoring

**High Confidence (activate immediately):**
- Multiple keyword matches
- Clear action verb match
- Domain-specific terms present

**Medium Confidence (likely match):**
- Some keyword matches
- General action verb
- Context suggests this domain

**Low Confidence (skip):**
- Few or no keyword matches
- Ambiguous request
- Could apply to multiple skills

## When to Use This Skill

This skill should be activated:
- At the start of a new user request
- When task type is unclear
- To ensure specialized knowledge is applied

This skill should NOT be activated:
- For trivial tasks (simple file reads, basic commands)
- When a skill is already active
- For multi-step tasks where skill was already selected

## Decision Process

1. **Read the registry first** - Always check `assets/skill_map.md` before making decisions
2. **Match patterns** - Look for keyword matches and pattern indicators
3. **Be decisive** - Choose the best match, don't overthink
4. **Prefer specialization** - If a skill exists for the task, use it
5. **Graceful fallback** - If no match, acknowledge and proceed with general tools

## Resources

- **`assets/skill_map.md`** - Complete registry of all available skills with patterns, keywords, and indicators
- **`assets/examples.md`** - Real-world examples of user requests and their skill routing decisions

## Quick Start

For most requests, follow this simple flow:

```
1. User makes a request
2. Read assets/skill_map.md
3. Find the skill that matches the request pattern
4. Use Skill tool to activate that skill
5. Let the specialized skill guide implementation
```

## Important Notes

- **Always read the skill map** - Don't assume which skills are available
- **Registry is the source of truth** - All skill definitions live in assets/skill_map.md
- **Update the map, not this file** - When adding new skills, only update the registry
- **Keep it simple** - The routing logic stays generic, the data stays in assets
