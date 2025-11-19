# Skill Wizard - Best Practices and Philosophy

This document explains the design principles and best practices behind the Skill Wizard, ensuring it aligns with Maestro's core philosophy and the 4-D methodology.

---

## 1. Embracing the 4-D Methodology

The Skill Wizard's conversational flow is structured to guide you through the 4-D framework, ensuring that every new skill is conceived with Maestro's principles in mind.

### DELEGATION (Maestro → You → Wizard)
- **Wizard's Role**: Maestro delegates the task of "skill creation" to you. The wizard acts as your guide, helping you articulate the new skill's purpose and how Maestro should delegate to it.
- **Your Input**: By answering the wizard's questions, you are defining the parameters for Maestro's future delegation to your new skill.

### DESCRIPTION (You → Wizard → Skill Manifest)
- **Wizard's Role**: The wizard helps you craft a rich, semantically searchable description and capabilities list for your skill. This is the "Process Description" for creating the skill's identity.
- **Your Input**: Your detailed answers to the wizard's questions directly form the `description` and `capabilities` fields in your skill's manifest, which are crucial for automatic discovery.

### DISCERNMENT (You Evaluate the Plan)
- **Wizard's Role**: The wizard presents a summary of the skill's manifest based on your input. This acts as a "quality gate" for the skill's definition.
- **Your Input**: You perform the "Discernment" by evaluating whether the summarized plan accurately captures your intent and meets Maestro's standards for clarity and completeness.

### DILIGENCE (Wizard Executes the Plan)
- **Wizard's Role**: Upon your confirmation, the wizard diligently executes the plan by generating the skill's directory structure, `SKILL.md`, and updating `skill-rules.json`.
- **Your Input**: Your confirmation signals that the plan has passed your discernment, allowing the wizard to proceed with confidence.

---

## 2. Domain Agnosticism

Just like Maestro itself, the Skill Wizard is designed to be completely domain-agnostic. It does not lean towards code analysis, marketing, or any specific field.

- **Neutral Language**: The wizard's questions are phrased in a way that applies equally to any domain.
- **Diverse Examples**: All examples provided by the wizard (e.g., for skill names, descriptions, capabilities, resources) are intentionally diverse, spanning code, marketing, data, and other fields. This encourages you to think broadly about your skill's application.
- **Focus on Structure, Not Content**: The wizard's primary goal is to help you define the *structure* and *metadata* of your skill, leaving the domain-specific *content* for you to fill in later.

---

## 3. Semantic Discovery First

The wizard prioritizes creating a skill manifest that enables **automatic, semantic discovery** by the Maestro registry.

- **Rich Description**: The wizard emphasizes crafting a detailed `description` field, as this is the primary input for the registry's semantic search algorithms.
- **Capabilities as Tags**: The `capabilities` field is treated as a set of high-level tags or areas of expertise, further aiding the registry in matching user intent.
- **Reduced Reliance on Hardcoded Triggers**: While `skill-rules.json` still exists for explicit keyword/intent patterns, the wizard guides you towards a description-driven discovery model, aligning with the Maestro Marketplace vision.

---

## 4. Progressive Disclosure

The wizard helps you set up your skill to follow the principle of progressive disclosure, managing context efficiently.

- **Concise Manifest**: The generated `SKILL.md` frontmatter and `skill-rules.json` entry will be concise, providing just enough metadata for Maestro to decide whether to invoke the skill.
- **Bundled Resources**: The wizard helps you plan for `scripts/`, `references/`, and `assets/` directories, encouraging you to keep the main `SKILL.md` lean and move detailed information to these external resources, which are loaded only when needed.

---

## 5. Automation and Boilerplate Generation

The wizard automates the tedious parts of skill creation, allowing you to focus on the skill's core logic.

- **Directory Structure**: Automatically creates the correct skill directory and subdirectories.
- **`SKILL.md` Template**: Generates a pre-filled `SKILL.md` with placeholders for you to complete, ensuring adherence to Maestro's structural guidelines.
- **`skill-rules.json` Entry**: Automatically adds the necessary entry to the global `skill-rules.json`, making your skill immediately discoverable.
- **Placeholder Resources**: Creates empty files for any `scripts`, `references`, or `assets` you specify, saving you manual setup time.

---

By adhering to these principles, the Skill Wizard ensures that every new skill created is not just functional, but also a first-class citizen in the Maestro ecosystem, ready for intelligent orchestration and automatic discovery.
