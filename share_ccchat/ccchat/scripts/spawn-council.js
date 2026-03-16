#!/usr/bin/env node
// Usage: node spawn-council.js --question-id q-xxx --room council-xxx [--members 3] [--roles architect,pragmatist,critic]

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ROLES, DEFAULT_COUNCIL, getRoles } from '../council/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCRIPTS_PATH = __dirname;
const SKILL_TEMPLATE = readFileSync(join(__dirname, '..', 'council', 'council-skill.md'), 'utf8');

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const questionId = getFlag('question-id');
const room = getFlag('room');
const memberCount = parseInt(getFlag('members') || '3', 10);
const roleNames = getFlag('roles')?.split(',').map(r => r.trim()) || DEFAULT_COUNCIL.slice(0, memberCount);

if (!questionId || !room) {
  console.error('Usage: node spawn-council.js --question-id q-xxx --room council-xxx [--members 3] [--roles architect,pragmatist,critic]');
  process.exit(1);
}

const roles = getRoles(roleNames);
const pids = [];

for (const role of roles) {
  const agentName = `${role.name}-${questionId.slice(2, 8)}`;

  const skill = SKILL_TEMPLATE
    .replace(/\{\{ROLE_NAME\}\}/g, role.name)
    .replace(/\{\{ROLE_DESCRIPTION\}\}/g, role.description)
    .replace(/\{\{SCRIPTS_PATH\}\}/g, SCRIPTS_PATH)
    .replace(/\{\{AGENT_NAME\}\}/g, agentName)
    .replace(/\{\{ROOM\}\}/g, room)
    .replace(/\{\{QUESTION_ID\}\}/g, questionId);

  const prompt = `${skill}

Now execute the protocol. Start by joining the room, reading the question, and participating in the discussion. Use Bash to run the node scripts listed above. Remember: you have NO project file access - you are a blind advisor giving input based only on the discussion.`;

  // Unset CLAUDECODE to allow spawning nested Claude instances
  const childEnv = { ...process.env };
  delete childEnv.CLAUDECODE;

  const child = spawn('claude', [
    '-p', prompt,
    '--allowedTools', 'Bash',
    '--dangerously-skip-permissions',
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: '/tmp',
    env: childEnv,
  });

  child.unref();
  pids.push({ role: role.name, agent: agentName, pid: child.pid });
  console.log(`Spawned ${role.name} as ${agentName} (pid: ${child.pid})`);
}

console.log(JSON.stringify({ question_id: questionId, room, members: pids }));
