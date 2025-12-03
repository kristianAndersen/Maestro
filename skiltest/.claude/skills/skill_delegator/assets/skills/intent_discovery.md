# intent_discovery Skill

## Domain

**Universal / Domain-Agnostic**

This skill provides knowledge for discovering user intent and gathering requirements across ANY domain - from farming to software development, from education to business management, from art to science.

## Activation Triggers

**Keywords:**
- "create agent", "create skill", "new agent", "new skill"
- "requirements", "intent", "what do you need"
- "understand", "clarify", "tell me more"
- Component creation contexts

**Use Cases:**
- agent_creator needs to understand what user wants to build
- User request is ambiguous or lacks detail
- Need to clarify scope before creating components
- Determining whether to build agent, skill, or both
- Understanding user's domain through their own language

**File Patterns:**
- N/A (this is conversational, not file-based)

## Core Knowledge

### Universal Questioning Principles

**1. Listen for Domain (don't assume):**
- "Test" could mean: medical test, student test, software test, soil test
- "Client" could mean: legal client, therapy client, software client, business client
- Let user's language reveal their world

**2. Mirror Their Terminology:**
- If they say "inventory" use "inventory" (not "stock" or "database")
- If they say "students" use "students" (not "users" or "clients")
- Speak their language, not technical jargon

**3. Operations Are Universal:**
- Create/Add - works for crops, students, API endpoints, artworks
- Track/Monitor - works for irrigation, assignments, server health, sales
- Alert/Notify - works for weather, deadlines, errors, appointments
- Analyze/Calculate - works for yields, grades, metrics, budgets

**4. Agent vs Skill (universal concept):**
- "Does this for me automatically" = Agent (executor with tools)
- "Guides me through doing it" = Skill (knowledge/patterns)
- Both = Skill provides guidance, Agent uses it to execute

### Essential Questions (Work for Anyone)

**Opening:**
1. "What are you trying to accomplish?"
2. "Tell me about your work/situation"
3. "What takes too much time or effort?"

**Understanding:**
4. "What do you need to do with this information?"
5. "Should this act automatically or guide you?"
6. "What specifically should this handle?"

**Scoping:**
7. "What should this NOT do?"
8. "When would you use this?"
9. "Any constraints or requirements?"

### Adaptive Branching (Based on User's Words)

Listen for their context, then ask relevant follow-ups:

- They mention quantities/amounts → Ask about thresholds, tracking, alerts
- They mention deadlines/schedules → Ask about timing, reminders, automation
- They mention decisions → Ask if they want guidance or automated choices
- They mention repetitive tasks → Ask about frequency, triggers, conditions

## Integration with Agents

**Primary User:**
- **agent_creator** - Activates this skill in step 2 of workflow

**How It Works:**
1. agent_creator receives request to create component
2. agent_creator activates intent_discovery skill (using Skill tool)
3. intent_discovery guides agent_creator through adaptive questioning
4. Result: Structured requirements document ready for component creation

## Resources Provided

**Main Resource:**
- `SKILL.md` - Complete guidance on domain-agnostic discovery

**Future Assets (progressive disclosure):**
- `assets/question_templates.md` - Ready-to-use question sets for common patterns
- `assets/validation_checklist.md` - How to confirm understanding
- `assets/requirement_examples.md` - Sample requirements from diverse domains

## Example Activations

### Example 1: Farmer Creating Irrigation Agent

```
agent_creator: *activates intent_discovery skill*

Following intent_discovery guidance:

Q: "What are you trying to accomplish?"
A: "Track when to water my fields"

Q: "Tell me about your fields"
A: "50 acres: maize, beans, coffee. Different watering schedules"

Domain revealed: Agriculture (not assumed - they told us)

Q: "Should this check automatically and alert you, or guide you on best practices?"
A: "Check automatically and alert me"

Component type identified: Agent (automatic execution)

Q: "What should this check?"
A: "Rainfall, soil moisture, crop type"

Operations identified: Monitor weather, check soil data, calculate needs, send alerts

Requirements captured → Ready for agent creation
```

### Example 2: Teacher Creating Assignment Skill

```
agent_creator: *activates intent_discovery skill*

Following intent_discovery guidance:

Q: "What problem are you facing?"
A: "Organizing student assignments"

Q: "Tell me about your assignments"
A: "120 students, 4 classes. Essays, problem sets, different due dates"

Domain revealed: Education (emerged from their description)

Q: "Do you need automation or guidance?"
A: "Guidance on how to set it up well"

Component type identified: Skill (knowledge/patterns)

Q: "What specifically should this guide you through?"
A: "Folder structure, naming conventions, tracking submissions, grading workflow"

Content identified: Organization patterns, best practices, workflow templates

Requirements captured → Ready for skill creation
```

### Example 3: Shop Owner Creating Inventory Agent

```
agent_creator: *activates intent_discovery skill*

Following intent_discovery guidance:

Q: "What are you trying to make easier?"
A: "Managing inventory for my grocery store"

Q: "Tell me about your store"
A: "Small grocery - produce, packaged goods, household items. About 200 products"

Domain revealed: Retail (they described it, we didn't guess)

Q: "What takes too much time?"
A: "Knowing what's low, what to reorder, what expires soon"

Q: "Should this automatically reorder, or alert you to decide?"
A: "Alert me - I decide based on budget"

Component type identified: Agent (automated checking + alerts)

Operations: Track quantities, flag low stock, identify expiring items, alert owner

Requirements captured → Ready for agent creation
```

## Success Patterns

**Good Discovery Session:**
- ✓ User feels heard (you used their words)
- ✓ Domain emerged naturally (not assumed)
- ✓ Operations clear in their context
- ✓ Component type matches their need (automation vs guidance)
- ✓ Scope well-defined
- ✓ Requirements actionable

**Poor Discovery Session:**
- ✗ Asked about "framework" to a non-developer
- ✗ Used jargon user didn't introduce
- ✗ Assumed domain without listening
- ✗ Fixed questionnaire regardless of answers
- ✗ Requirements too technical for user's context

## Key Takeaway

**The user brings the domain. We bring the questions.**

A farmer, teacher, and developer all get the SAME opening questions:
- "What are you trying to accomplish?"
- "Tell me about your work"
- "Should this act automatically or guide you?"

Their ANSWERS reveal completely different domains, but the discovery process is identical.
