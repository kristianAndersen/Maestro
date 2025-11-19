# Harry 

The skill wizard agent.

---
Harry is a interactive wizard that helps a user build agents and skills and commands, but also update and heal agents, skills, commands. Harry is auto detected as the rest of the  agents by Maestro., And he follows the Mestro framework and the 4D methodology a
---

### Example 1. use of Harry:
A user prompts domain specific thing and Maestro cannot find the agent or skill to match that
Maestro will launch Harry.

Harry will greet the user , Hi im harry im a wizard!

Then Harry will let the user know that what he/she want to achieve is not yet part of Maestro so the user needs to build a new agent for that purpose . 

Harry then activates the *create-meta-prompts agent+skill for that purpous 
When the users input has ben refined thru the create-meta-prompts agent Harry can the activate
* create-subagents agent
* create-agent-skills agent
* create-hooks agent
* create-command agent

togheter the create agents will refine and create a new agent+skills following the Maestro framework and the 4D methodology And implement the new agent+skill+hooks and commands also update the 
subagent-skill-discovery.js + maestro-agent-suggester.js + skill-rules.json and any other file that the auto suggestion functionality needs. And when the process is complete it will launch the new agent.


### Example 2. use of Harry :
A user prompts domain specific thing and Maestro finds the agent or but the agent needs a skill to complete the users request , Maestro will launch Harry.

Harry will greet you , Hi im harry im a wizard!

Then Harry will let the user know that what he/she want to achieve is not yet part of Maestro so the user needs to build a new skill for that purpose . 

Harry then activates the *create-meta-prompts agent+skill for that purpous 
When the users input has ben refined thru the create-meta-prompts agent Harry can the activate
* create-agent-skills agent
* create-hooks agent
* create-command agent

 togheter the create agents will refine and create a new skills following the Maestro framework and the 4D methodology And implement the new skill+hooks and commands also update the 
subagent-skill-discovery.js + maestro-agent-suggester.js + skill-rules.json and any other file that the auto suggestion functionality needs. And when the process is complete it will launch the appropiate agent with the new skill.

### Example 3. use of Harry :
A user might want to update/tweak an agent or a skill. 
They can start harry by using the custom command harry.

Harry will greet the user , Hi im harry im a wizard what can i do for you?
and present the user wit options.

1. [] create agent.
2. [] update agent.
3. [] create skill.
4. [] update skill.
5. [] create command.
6. [] update command.

The user the chose what to do eg. 2. [√] update agent.

And harry uses the the apporiate agent agentUpdater and maybe the create-meta-prompts agent to refine the users request and when all is done the agent is ready if no "dependencie" skills or hooks has changed for the agnet then the job is done if more than just the agent is affected by the change the HArry makes shure that all apporpiate files are updatet and when all is done the user will have a message that the agent have been updated

for updating skills and commands the prosses is the same.


I also want to implement an auto audit/healing prosses for the new agent/skills/commands
that check that everything follows the Maestro Framework, the 4Dmetodology and at the sametime abides to claud code best practices for structure, conciseness, progressive disclosure, and effectiveness.

---

### Suggestions for Improvement & Missing Explanations

Here are some suggestions to further refine the "Harry" concept, aligning it even more closely with the Maestro framework's principles and ensuring robust implementation:

#### 1. Define Harry as a True Maestro-Style Agent

The current `harry.md` describes what Harry does but isn't yet a formal agent definition.

*   **Recommendation:** Restructure `harry.md` to be the actual system prompt for the Harry agent. This should follow the pure XML format used by other Maestro agents and auditor agents, including:
    *   **`<role>`**: Clearly define Harry's persona (e.g., "You are Harry, an interactive wizard agent that orchestrates the creation, modification, and healing of Maestro components...").
    *   **`<workflow>`**: Detail the decision-making process for handling new agent/skill requests and update requests.
    *   **`<constraints>`**: Set clear boundaries (e.g., "NEVER create files directly. ALWAYS delegate creation and auditing to specialized sub-agents. MUST use the `AskUserQuestion` tool for interactive menus.").
    *   **`<output_format>`**: Specify how Harry should report its progress and final results to Maestro.

#### 2. Emphasize Orchestration, Not Direct Execution

The document states Harry "activates" other agents. To align perfectly with Maestro's "conductor" philosophy, this should be framed as **delegation** using the `Task` tool.

*   **Recommendation:** Explicitly state in Harry's persona that its primary tool for creating or modifying components is the `Task` tool, delegating to specialized "creator" or "updater" sub-agents. Harry should orchestrate the creation process, not perform it directly.

#### 3. Detail the "Creator Agent" Conversion

The existing resources in `taches-cc-resources-main` are skills and slash commands. The plan mentions they need to be "converted to agents." This is a critical step for Maestro integration.

*   **Recommendation:** Outline the conversion plan for each "creator" skill. For example:
    *   **`create-agent-skill-agent.md`**: A new sub-agent in `.claude/agents/` will wrap the logic currently in `taches-cc-resources-main/skills/create-agent-skills/SKILL.md`.
    *   Its persona will be based on the existing skill, adapted to function as a standalone agent.
    *   This agent will be responsible for the full lifecycle of skill creation (generating structure, writing content).
    *   This process should be repeated for `create-subagents`, `create-hooks`, and `create-command`.

#### 4. Close the Loop on the Audit/Healing Process

The auto-audit idea is powerful. To make it even more robust, formalize a closed feedback loop that mirrors Maestro's 4-D evaluation.

*   **Recommendation:** Integrate auditing as a mandatory step in Harry's post-creation workflow:
    1.  After a new component is created by a creator agent, Harry's **next mandatory step** is to delegate to the corresponding auditor agent (e.g., `skill-auditor`).
    2.  Harry receives and parses the auditor's structured report and score.
    3.  If the score is below a defined threshold, Harry automatically initiates a "healing" loop. It re-delegates to the *original creator agent*, providing the auditor's feedback as a "refinement request."
    4.  This iterative loop (creation → audit → refinement → re-audit) continues until the component passes the audit, ensuring high-quality components are always integrated.

#### 5. De-risk and Standardize Registry Updates

`harry.md` mentions updating `.js` files for `subagent-skill-discovery.js` and `maestro-agent-suggester.js`. Modifying executable code directly is risky for an automated agent. The `MAESTRO_BLUEPRINT.md` already suggests a safer pattern.

*   **Recommendation:** Refactor the suggestion scripts (`subagent-skill-discovery.js`, `maestro-agent-suggester.js`) to *read from* simple JSON registries (e.g., `agent-registry.json`, `skill-rules.json`), as detailed in the `MAESTRO_BLUEPRINT.md`.
*   With this change, the creator agents only need to append new entries to these JSON files, which is a much simpler, safer, and more structured operation than parsing and editing JavaScript code.

#### 6. Clarify Interactive Elements

For menu-driven interactions (Example 3), the mechanism for user input should be specified.

*   **Recommendation:** Explicitly state that Harry will use the `AskUserQuestion` tool to present options to the user and capture their selections. This is the standard Claude Code tool for interactive choices.

By addressing these points, Harry can become a seamlessly integrated, highly effective, and robust meta-orchestrator within the Maestro framework.