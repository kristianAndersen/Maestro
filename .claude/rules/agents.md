# Agent Development Rules

## Agent Catalog

**Core Agents:**
- `maestro.md`: Meta-conductor (opus) — orchestrates all other agents
- `list.md`, `open.md`, `file-reader.md`, `file-writer.md`: File operations (haiku/sonnet)
- `m-file-writer.md`: Resilient file writer with retry and verification (**always use instead of file-writer**)
- `base-research.md`, `base-analysis.md`: Information gathering and evaluation
- `4d-evaluation.md`: Quality assessment — mandatory quality gate
- `fetch.md`: External data retrieval
- `gemini-brain.md`: Context offloading for large-scale operations
- `harry.md`: Meta-orchestrator for framework components
- `agent-refactorer.md`: Code refactoring specialist
- `diary-writer.md`, `reflector.md`: Session memory and learning
- `excel.md`: Spreadsheet operations
- `agent-creator.md`: Agent creation and registry optimization
- `ai-pulse.md`: Twitter/X AI news aggregation
- `figma.md`: Figma design operations
- `ui-ux-designer.md`: Color, typography, layout, WCAG compliance
- `communicator.md`: Inter-session messaging

**Internal Utility Agents** (invoked by Harry):
- Creators: `create-agent.md`, `create-commands.md`, `create-hooks.md`, `create-meta-prompts.md`, `create-subagents.md`
- Auditors: `hook-auditor.md`, `skill-auditor.md`, `slash-command-auditor.md`, `subagent-auditor.md`

**Debate Personas:**
- `emilio.md`: PM — pragmatic constraints
- `ludvig.md`: Systems leader — first principles
- `nicola.md`: Investigator — data and evidence

## Creating/Modifying Agents

- Files must be in `.claude/agents/*.md`
- Register in `agent-registry.json` with triggers (keywords, intentPatterns, operations)
- Add `skills: [skill-name]` frontmatter for native skill preloading
- Add one-line activation instruction: `Activate the X skill before starting work: Skill(skill: "X")`
- Specify tool restrictions in frontmatter
- Include evidence requirements in delegation templates

## Inter-Agent Delegation

Agents can delegate to other agents via Task tool + 3P format:

**Common patterns:**
- base-research → fetch (web data), gemini-brain (large files)
- base-analysis → fetch (docs), base-research (discovery)
- fetch → base-analysis (evaluation), m-file-writer (save data)

**Requirements:** Task tool in tools list, 3P format, integrate results, cite attribution.
