# Intent Discovery Skill

## Purpose

This skill provides comprehensive guidance for discovering user intent, understanding their domain, identifying their paradigm, and extracting requirements for creating new framework components. It enables adaptive questioning that progressively refines understanding through the user's own language and context.

**This skill is completely domain-agnostic** - it works equally well for a farmer tracking crops, a teacher managing students, a business owner organizing inventory, or a developer building software. The user's words reveal their domain, not our assumptions.

## When to Use This Skill

This skill automatically activates when:
- Creating new agents or skills (via agent_creator)
- User request is ambiguous or lacks details
- Need to understand context-specific requirements
- Clarifying scope before building components
- Determining what type of component to create

## Quick Start

For 80% of intent discovery sessions, follow these principles:

1. **Listen to their language** - User's words reveal their domain and paradigm
2. **Ask why before what** - Understand the problem before designing the solution
3. **Context from conversation** - Don't assume, let them describe their world
4. **Start broad, narrow progressively** - Begin with open questions, refine based on answers
5. **Validate understanding** - Summarize in THEIR terms and confirm before proceeding

## Core Principles

### 1. **Domain Agnostic Listening**
Never assume the user's field. A "test" could be a medical test, student test, or software test. Let them define it.

### 2. **User Language First**
Use the terminology they use. If they say "clients," mirror "clients" (not "customers" or "users").

### 3. **Adaptive Questioning**
Tailor questions based on previous answers. Respond to what the user reveals, not a fixed script.

### 4. **Progressive Refinement**
Start with high-level understanding, drill down only where needed. Don't gather exhaustive details upfront.

### 5. **Context-Driven Discovery**
Understand their context through their own description - their work, their tools, their processes, their challenges.

### 6. **Scope Boundaries**
Define what's IN scope and OUT of scope early to prevent scope creep.

## Discovery Patterns

### Pattern 1: The Purpose Question (Universal)

**Start with WHY:**
```
"What are you trying to accomplish?"
"What problem are you facing?"
"What task takes too much time or effort?"
"What are you trying to make easier?"
```

**Extract:**
- Core problem statement (in their words)
- Current pain points
- Desired outcome

**Works for ANY domain:**
- Farmer: "I need to track when to water each field"
- Teacher: "I want to organize student assignments by deadline"
- Developer: "I need to test API endpoints automatically"
- Chef: "I want to manage ingredient inventory for recipes"

### Pattern 2: The Context Question (Universal)

**Understand their world:**
```
"Tell me about your work/task - what does a typical day involve?"
"What kind of information do you work with?"
"What tools or processes do you currently use?"
"Walk me through how you do this now"
```

**Extract:**
- Their domain (emerges naturally from description)
- Current workflow and tools
- Terminology they use
- Scale and complexity

**Examples:**
- "I track 50 acres of maize, beans, and coffee" → Farming domain emerges
- "I have 120 students across 4 classes" → Education domain emerges
- "We have REST APIs for user management" → Software domain emerges

### Pattern 3: The Operation Question (Universal)

**Identify key activities:**
```
"What do you need to do with this information?"
"What actions do you take repeatedly?"
"What decisions do you make based on this?"
"What would you want this component to help you do?"
```

**Extract:**
- Key operations (create, track, analyze, notify, etc.)
- Frequency and patterns
- Decision points

**Universal operations:**
- Create/Add (new records, entries, items)
- Read/Find (look up information)
- Update/Modify (change existing data)
- Delete/Remove (clean up old items)
- Analyze/Calculate (derive insights)
- Notify/Alert (trigger actions)

### Pattern 4: The Scope Question (Universal)

**Define boundaries:**
```
"What specifically should this handle?"
"What should this NOT do?"
"Where does this fit in your overall workflow?"
"Is this for one specific task or multiple related tasks?"
```

**Extract:**
- Clear boundaries
- Explicit exclusions
- Specialization vs generalization

### Pattern 5: The Component Type Question (Universal)

**Determine executor vs guide:**
```
"Do you need something that DOES this for you, or GUIDES you through doing it?"
"Should this take action automatically, or help you make decisions?"
"Are you looking for automation or advice?"
```

**Translate to framework:**
- "Does it for me" / "Automates" → AGENT (needs tools to execute)
- "Guides me" / "Advises" → SKILL (provides knowledge/patterns)
- "Both" → SKILL for guidance + AGENT that uses the skill

**Examples:**
- "Automatically send alerts when soil moisture drops" → Agent (needs to execute)
- "Help me decide when to harvest based on weather" → Skill (provides guidance)
- "Check all assignments and flag incomplete ones" → Agent (executes task)
- "Best practices for lesson planning" → Skill (knowledge)

### Pattern 6: The Integration Question (Universal)

**Understand context and triggers:**
```
"When should this activate or be available?"
"What signals that you need this?"
"Does this work alone or with other things?"
"How will you know to use this?"
```

**Extract:**
- Trigger patterns (in their language/context)
- Integration points
- Dependencies

## Questioning Strategies

### Funnel Approach (Broad to Narrow)

```
Level 1 (Purpose): "What are you trying to accomplish?"
    ↓
Level 2 (Context): "Tell me about your work/situation"
    ↓
Level 3 (Operations): "What do you need to do with this?"
    ↓
Level 4 (Scope): "What specifically should this handle?"
    ↓
Level 5 (Details): "Any constraints or special requirements?"
```

### Reflective Strategy (Mirror Their Language)

```
1. User: "I need to track my inventory"
2. You: "Tell me about your inventory - what items are you tracking?"
3. User: "Medical supplies - bandages, syringes, medications"
4. You: "Got it - medical supplies. What do you need to do with this tracking?"
5. User: "Know when supplies are low and need reordering"
6. You: "So monitor quantities and alert when below threshold. Should this automatically create reorder requests or just notify you?"
```

### Validation Loop (Confirm Understanding)

```
1. Ask question
2. Receive answer
3. Summarize in THEIR terminology
4. Confirm: "Did I understand correctly?"
5. Refine if needed
6. Move to next question
```

## Requirements Document Structure

**Output from intent discovery session:**

```markdown
# Component Requirements

## Problem Statement
{What user is trying to accomplish, in their own words}

## Context
{User's domain: emerges from their description}
{Their current workflow and tools}
{Scale: how much data, how often, how many}

## Key Operations
1. {Operation 1 - in user's terminology}
2. {Operation 2}
3. {Operation 3}
...

## Component Type
{Agent | Skill | Both}

**Rationale:**
{Why this type fits - based on automation vs guidance need}

**For Agents - Tools Required:**
{Bash - if needs to execute commands}
{Read - if needs to read files/data}
{Write - if needs to create files/records}
{Edit - if needs to modify existing files}
{WebFetch - if needs to get external data}
{AskUserQuestion - if needs interactive decisions}
{etc.}

## Trigger Patterns
{How user will activate this - in their words}
{Keywords from their domain}
{File patterns if relevant to their work}
{Situations when this should activate}

## Scope
**In Scope:**
- {What this component handles}

**Out of Scope:**
- {What this component does NOT handle}

## Integration
{How this fits in their workflow}
{Dependencies on other components if any}
{When this gets used relative to other tasks}

## Constraints
{Limitations they mentioned}
{Requirements they specified}
{Performance or scale needs}

## Quality Criteria
{How user will know this is successful}
{Expected behaviors and outcomes in their terms}

## Examples
{Concrete examples from user's own use case}
```

## Universal Questioning Examples

### Example 1: Farmer Needing Irrigation Agent

```
Q: "What are you trying to accomplish?"
A: "I need to know when to water my fields"

Q: "Tell me about your fields - what are you growing?"
A: "I have 50 acres: maize, beans, and coffee. Different crops need different watering schedules"

Q: "What information do you use to decide when to water?"
A: "Rainfall, soil moisture, and crop type"

Q: "Do you need something that TELLS you when to water, or actually CONTROLS the watering?"
A: "Just tells me - I control the irrigation manually"

Q: "Should this check automatically and alert you, or should you ask it when you're wondering?"
A: "Check automatically and send me alerts"

RESULT:
- Context: Farming, 50 acres, multiple crop types
- Operations: Monitor rainfall, check soil moisture, calculate watering needs, send alerts
- Component: Agent (needs to execute checks and send alerts)
- Tools: Read (weather/soil data), Bash (send alerts), possibly WebFetch (weather API)
- Triggers: Time-based (daily checks), or moisture-level based
```

### Example 2: Teacher Needing Assignment Skill

```
Q: "What problem are you facing?"
A: "I spend too much time organizing student assignments"

Q: "Tell me about your assignments - how many students, what kind of work?"
A: "120 students, 4 classes. Essays, problem sets, projects with different due dates"

Q: "What do you need to do with the assignments?"
A: "Track who submitted what, grade them, identify missing work, calculate class averages"

Q: "Do you need automation to DO this, or guidance on BEST PRACTICES for organizing it?"
A: "Both - guidance on how to set it up, then automation to track and flag issues"

Q: "What specifically should the automation handle?"
A: "Check submission folders, flag missing assignments, calculate who's behind"

RESULT:
- Context: Education, 120 students, 4 classes, multiple assignment types
- Operations: Track submissions, identify missing work, calculate statistics
- Component: SKILL (best practices for setup) + AGENT (automation for checking)
- Tools for Agent: Read (submission folders), Bash (check files), possibly Write (reports)
- Triggers: Keywords like "assignment", "student", "grade", or file patterns like "submissions/*.pdf"
```

### Example 3: Business Owner Needing Inventory Agent

```
Q: "What are you trying to make easier?"
A: "Managing inventory for my shop"

Q: "Tell me about your shop - what do you sell?"
A: "Small grocery store - produce, packaged goods, household items. About 200 products"

Q: "What takes too much time with inventory?"
A: "Knowing what's running low, what to reorder, tracking what expires soon"

Q: "Should this automatically track and reorder, or alert you to make decisions?"
A: "Alert me - I decide what to order based on budget and suppliers"

Q: "How often do you need these alerts?"
A: "Daily check would be perfect, plus alert if something is completely out"

RESULT:
- Context: Retail grocery, ~200 products, perishables involved
- Operations: Track quantities, flag low stock, identify expiring items, generate reorder suggestions
- Component: Agent (executes checks and alerts)
- Tools: Read (inventory data), possibly Write (alert reports), Bash (send notifications)
- Triggers: Daily schedule, or keyword "inventory", "stock", "reorder"
```

## Using AskUserQuestion Tool (Domain-Agnostic)

**Understanding component type:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Do you need something that acts automatically, or provides guidance?",
    header: "Type",
    multiSelect: false,
    options: [
      {label: "Acts automatically", description: "Executes tasks, checks things, sends alerts without me asking"},
      {label: "Provides guidance", description: "Gives me advice, best practices, helps me make decisions"},
      {label: "Both", description: "Guides me on setup, then automates the repetitive parts"}
    ]
  }]
})
```

**Understanding operations (universal):**
```javascript
AskUserQuestion({
  questions: [{
    question: "What should this help you do?",
    header: "Operations",
    multiSelect: true,
    options: [
      {label: "Create/Add", description: "Add new items, records, or entries"},
      {label: "Find/Search", description: "Look up information quickly"},
      {label: "Track/Monitor", description: "Watch for changes or patterns"},
      {label: "Alert/Notify", description: "Tell me when something needs attention"},
      {label: "Analyze/Calculate", description: "Derive insights or compute results"},
      {label: "Organize/Sort", description: "Arrange information in useful ways"}
    ]
  }]
})
```

**Understanding scope:**
```javascript
AskUserQuestion({
  questions: [{
    question: "How specialized should this be?",
    header: "Scope",
    multiSelect: false,
    options: [
      {label: "Very specific", description: "Handles one particular task really well"},
      {label: "Moderately focused", description: "Handles a few related tasks"},
      {label: "Broadly capable", description: "Handles many different aspects of this work"}
    ]
  }]
})
```

## Progressive Disclosure in Action

**Phase 1: Essential Understanding (Always Ask)**
- What are you trying to accomplish?
- Tell me about your work/situation
- Should this act automatically or guide you?

**Phase 2: Scoping (Ask Based on Context)**
- What specific operations?
- What's out of scope?
- How specialized vs general?

**Phase 3: Details (Only If Needed)**
- Integration with existing workflow?
- Performance or scale requirements?
- Special constraints or edge cases?

## Anti-Patterns

### ❌ Domain Assumptions
```
BAD: "What programming language?"
BAD: "REST or GraphQL?"
BAD: "What database system?"

GOOD: "Tell me about your work"
GOOD: "What information do you work with?"
GOOD: "How do you currently do this?"
```

### ❌ Technical Jargon
```
BAD: "Do you need CRUD operations?"
BAD: "Should this be stateful or stateless?"
BAD: "What's your tech stack?"

GOOD: "What do you need to do with this information?"
GOOD: "Should this remember previous work or start fresh each time?"
GOOD: "What tools do you currently use?"
```

### ❌ Multiple Choice With Domain Bias
```
BAD:
Options: API Development, Database, Frontend, Testing

GOOD:
"Tell me about your work" (let them describe in their words)
```

### ❌ Solution Before Problem
```
BAD: "What tools should the agent have?"
GOOD: "What are you trying to accomplish?" → derive tools from problem
```

### ❌ Skipping Validation
```
BAD: Gather all info, move directly to creation
GOOD: Summarize in THEIR words, confirm understanding, refine if needed
```

## Quick Reference

**Universal Opening Questions:**
1. What are you trying to accomplish?
2. Tell me about your work/situation
3. What takes too much time or effort?
4. How do you do this now?

**Core Discovery:**
1. What do you need to do with this information? (operations)
2. Should this act automatically or guide you? (agent vs skill)
3. What specifically should this handle? (scope)
4. What should this NOT do? (boundaries)

**Validation:**
- Summarize in THEIR terminology
- Confirm: "Did I understand correctly?"
- Refine based on feedback

**Output:**
- Structured requirements document
- Domain emerges from their language
- Paradigm emerges from their workflow
- Tools derived from operations needed
- Triggers based on their context

**Success Criteria:**
- User's intent is clear
- Context understood through their own description
- Component type determined (agent/skill/both)
- Scope boundaries defined
- Requirements are actionable
- NO domain assumptions imposed
