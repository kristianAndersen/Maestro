---
name: hallucination-detection
description: Provides a framework for detecting hallucinations (non-existent methods, incorrect signatures, fictional features) in generated code and configurations. Essential for the 4D-Evaluation agent.
---

# Hallucination Detection Skill

## Purpose
This skill provides a systematic framework for identifying and flagging hallucinations in AI-generated outputs, particularly code, configurations, and API usage. It is a critical component of the **Product Discernment** and **Process Discernment** quality gates.

## When to Use This Skill
This skill should be activated **every time** the `4D-Evaluation` agent is invoked. Its checklists are fundamental to verifying the correctness and reliability of a subagent's work.

## Core Principles of Detection
1.  **Verify, Don't Assume:** Never accept a function, method, or parameter without evidence of its existence in the project or official documentation.
2.  **Check the Source:** Ground all generated code against the actual project files, dependencies, and established patterns.
3.  **Question Convenience:** Be extra skeptical of overly convenient helper functions or API features that seem too good to be true.
4.  **Version Matters:** Ensure that any version-specific syntax or features align with the versions specified in the project's dependency files (e.g., `package.json`, `requirements.txt`).

## Quick Reference: Hallucination Checklist

Use this checklist during every evaluation:

- [ ] **Non-Existent Methods/Functions:** Does `functionName()` actually exist in the specified library or file?
- [ ] **Incorrect Parameter Signatures:** Are the number, order, and types of arguments for `function(arg1, arg2)` correct?
- [ ] **Made-Up Configuration Options:** Is `new-config-option: value` a real, documented option in the configuration schema?
- [ ] **Fictional Library Features:** Does the library in use actually support the convenient `.doEverything()` method that was generated?
- [ ] **Wrong Syntax for Version:** Is this syntax valid for the specific version of the framework/library being used (e.g., `v1.x` vs `v2.x`)?
- [ ] **Inconsistent Naming:** Does the generated code invent new naming conventions instead of following existing ones in the codebase?

## Resources (Progressive Disclosure)
For a deeper guide on specific types of hallucinations, load this resource:
- `resources/hallucination-patterns.md`: Provides detailed examples and detection strategies for different domains (API/Library, Configuration, Database, Security).

## Anti-Patterns (What to Watch For)
- **"It Should Exist":** Code that relies on methods that are logical but unverified.
- **"Convenient Helpers":** The sudden appearance of perfectly-suited helper functions without a corresponding definition.
- **"API Magic":** Assuming an API will return a perfectly structured object without checking its documentation or existing usage patterns.
- **"Version Blindness":** Using the latest syntax or features without checking the project's actual dependencies.

## Applying the Skill in 4-D Evaluation

### During "Product Discernment":
- **Correctness:** Use the checklist to verify that all generated code is based on reality. A single hallucinated method call makes the product incorrect.
- **Elegance:** Hallucinations are the opposite of elegance; they introduce imaginary complexity.

### During "Process Discernment":
- **Thoroughness:** A thorough process includes grounding the generated code against source files and documentation. Flag any "hallucination gaps" in the subagent's reasoning.
- **Appropriate Techniques:** Using a non-existent function is an inappropriate technique.
