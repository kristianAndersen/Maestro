#!/usr/bin/env node
// Setup ccchat for any project in one command.
//
// Usage:
//   node /path/to/ccchat/scripts/setup.js                     # setup current directory
//   node /path/to/ccchat/scripts/setup.js --name my-agent      # custom agent name
//   node /path/to/ccchat/scripts/setup.js --room migration     # join a specific room
//   node /path/to/ccchat/scripts/setup.js --global              # install globally for all projects
//   node /path/to/ccchat/scripts/setup.js --uninstall           # remove ccchat from project

import { existsSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, unlinkSync, rmSync } from 'fs';
import { join, dirname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CCCHAT_ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  const next = args[idx + 1];
  return (next && !next.startsWith('--')) ? next : true;
}
const isGlobal = args.includes('--global');
const isUninstall = args.includes('--uninstall');
const agentName = getFlag('name') || basename(process.cwd());
const room = getFlag('room') || 'general';
const projectDir = isGlobal ? null : process.cwd();

// ── Helpers ─────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function safeSymlink(target, linkPath) {
  try {
    if (existsSync(linkPath)) {
      const current = readFileSync(linkPath, 'utf8').length ? linkPath : null;
      // Remove old link/file if it exists
      rmSync(linkPath, { recursive: true, force: true });
    }
    symlinkSync(target, linkPath);
    return true;
  } catch (e) {
    console.error(`  Failed to symlink ${linkPath}: ${e.message}`);
    return false;
  }
}

function mergeSettings(settingsPath, hookCommand, stopHookCommand, leaveHookCommand) {
  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch { /* start fresh */ }
  }

  if (!settings.hooks) settings.hooks = {};

  // UserPromptSubmit hook
  if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];
  const hookExists = settings.hooks.UserPromptSubmit.some(entry =>
    entry.hooks?.some(h => h.command?.includes('ccchat-poll.js'))
  );
  if (!hookExists) {
    settings.hooks.UserPromptSubmit.push({
      hooks: [{ type: 'command', command: hookCommand }]
    });
  }

  // Stop hook (auto-detect unread messages)
  if (!settings.hooks.Stop) settings.hooks.Stop = [];
  const stopExists = settings.hooks.Stop.some(entry =>
    entry.hooks?.some(h => h.command?.includes('ccchat-stop.js'))
  );
  if (!stopExists) {
    settings.hooks.Stop.push({
      hooks: [{ type: 'command', command: stopHookCommand }]
    });
  }

  // SessionEnd hook (clean up on exit)
  if (!settings.hooks.SessionEnd) settings.hooks.SessionEnd = [];
  const leaveExists = settings.hooks.SessionEnd.some(entry =>
    entry.hooks?.some(h => h.command?.includes('ccchat-leave.js'))
  );
  if (!leaveExists) {
    settings.hooks.SessionEnd.push({
      hooks: [{ type: 'command', command: leaveHookCommand }]
    });
  }

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

function removeFromSettings(settingsPath) {
  if (!existsSync(settingsPath)) return;
  try {
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    if (settings.hooks?.UserPromptSubmit) {
      settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(entry =>
        !entry.hooks?.some(h => h.command?.includes('ccchat-poll.js'))
      );
      if (settings.hooks.UserPromptSubmit.length === 0) delete settings.hooks.UserPromptSubmit;
    }
    if (settings.hooks?.Stop) {
      settings.hooks.Stop = settings.hooks.Stop.filter(entry =>
        !entry.hooks?.some(h => h.command?.includes('ccchat-stop.js'))
      );
      if (settings.hooks.Stop.length === 0) delete settings.hooks.Stop;
    }
    if (settings.hooks?.SessionEnd) {
      settings.hooks.SessionEnd = settings.hooks.SessionEnd.filter(entry =>
        !entry.hooks?.some(h => h.command?.includes('ccchat-leave.js'))
      );
      if (settings.hooks.SessionEnd.length === 0) delete settings.hooks.SessionEnd;
    }
    if (settings.hooks && Object.keys(settings.hooks).length === 0) delete settings.hooks;
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  } catch { /* ok */ }
}

// ── Global install ──────────────────────────────────────────

if (isGlobal) {
  const globalClaudeDir = join(homedir(), '.claude');
  const hookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-poll.js')}`;
  const stopHookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-stop.js')}`;
  const leaveHookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-leave.js')}`;

  if (isUninstall) {
    console.log('Removing ccchat globally...\n');
    const settingsPath = join(globalClaudeDir, 'settings.json');
    removeFromSettings(settingsPath);
    try { rmSync(join(globalClaudeDir, 'agents', 'ccchat.md'), { force: true }); } catch {}
    try { rmSync(join(globalClaudeDir, 'skills', 'ccchat'), { recursive: true, force: true }); } catch {}
    console.log('Done. ccchat removed from global config.');
    process.exit(0);
  }

  console.log('Installing ccchat globally...\n');

  // Agent
  ensureDir(join(globalClaudeDir, 'agents'));
  safeSymlink(
    join(CCCHAT_ROOT, '.claude', 'agents', 'ccchat.md'),
    join(globalClaudeDir, 'agents', 'ccchat.md')
  );
  console.log('  + Agent:    ~/.claude/agents/ccchat.md');

  // Skill
  ensureDir(join(globalClaudeDir, 'skills'));
  safeSymlink(
    join(CCCHAT_ROOT, '.claude', 'skills', 'ccchat'),
    join(globalClaudeDir, 'skills', 'ccchat')
  );
  console.log('  + Skill:    ~/.claude/skills/ccchat/');

  // Hooks
  const settingsPath = join(globalClaudeDir, 'settings.json');
  mergeSettings(settingsPath, hookCmd, stopHookCmd, leaveHookCmd);
  console.log('  + Hooks:    ~/.claude/settings.json (UserPromptSubmit + Stop + SessionEnd)');

  console.log('\nccchat is now available in ALL Claude Code sessions.');
  console.log('To register an agent in a project, run:');
  console.log(`  node ${join(CCCHAT_ROOT, 'scripts', 'send.js')} --join "my-agent" "peer" --room general\n`);
  process.exit(0);
}

// ── Project-level install ───────────────────────────────────

const claudeDir = join(projectDir, '.claude');
const hookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-poll.js')}`;
const stopHookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-stop.js')}`;
const leaveHookCmd = `node ${join(CCCHAT_ROOT, 'hooks', 'ccchat-leave.js')}`;

if (isUninstall) {
  console.log(`Removing ccchat from ${projectDir}...\n`);
  removeFromSettings(join(claudeDir, 'settings.json'));
  try { rmSync(join(claudeDir, 'agents', 'ccchat.md'), { force: true }); } catch {}
  try { rmSync(join(claudeDir, 'skills', 'ccchat'), { recursive: true, force: true }); } catch {}
  console.log('Done. ccchat removed from this project.');
  process.exit(0);
}

console.log(`Setting up ccchat in ${projectDir}...\n`);

// Agent
ensureDir(join(claudeDir, 'agents'));
safeSymlink(
  join(CCCHAT_ROOT, '.claude', 'agents', 'ccchat.md'),
  join(claudeDir, 'agents', 'ccchat.md')
);
console.log('  + Agent:    .claude/agents/ccchat.md');

// Skill
ensureDir(join(claudeDir, 'skills'));
safeSymlink(
  join(CCCHAT_ROOT, '.claude', 'skills', 'ccchat'),
  join(claudeDir, 'skills', 'ccchat')
);
console.log('  + Skill:    .claude/skills/ccchat/');

// Hooks (merge into existing settings.json)
mergeSettings(join(claudeDir, 'settings.json'), hookCmd, stopHookCmd, leaveHookCmd);
console.log('  + Hooks:    .claude/settings.json (UserPromptSubmit + Stop + SessionEnd)');

// Register agent
console.log(`\n  Registering as "${agentName}" in room "${room}"...`);
try {
  execSync(`node ${join(CCCHAT_ROOT, 'scripts', 'send.js')} --join "${agentName}" "peer" --room "${room}" --project "${projectDir}"`, {
    stdio: 'pipe',
    timeout: 15000,
  });
  console.log(`  + Agent:    "${agentName}" registered in room "${room}"`);
} catch (e) {
  console.log(`  ~ Skipped registration (server not running). Register later with:`);
  console.log(`    node ${join(CCCHAT_ROOT, 'scripts', 'send.js')} --join "${agentName}" "peer" --room "${room}"`);
}

console.log('\nDone! ccchat is ready in this project.\n');
