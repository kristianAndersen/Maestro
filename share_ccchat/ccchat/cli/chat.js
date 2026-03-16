#!/usr/bin/env node
// Terminal chat UI for ccchat
// Usage: node cli/chat.js --name "human" --room general [--watch]

import { ensureServer, connect, request, close } from '../client/ccchat-client.js';
import { createInterface } from 'readline';
import WebSocket from 'ws';

const args = process.argv.slice(2);
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

const name = getFlag('name') || `human-${process.pid}`;
const room = getFlag('room') || 'general';
const watchOnly = args.includes('--watch');

// ANSI colors
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

const agentColors = {};
const colorList = [C.blue, C.green, C.cyan, C.magenta, C.red];
let colorIdx = 0;

function agentColor(agentName) {
  if (!agentColors[agentName]) {
    agentColors[agentName] = colorList[colorIdx % colorList.length];
    colorIdx++;
  }
  return agentColors[agentName];
}

function formatTime(ts) {
  if (!ts) return '     ';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function printMessage(m) {
  const ts = formatTime(m.timestamp);
  const agent = m.from_agent || 'system';
  const color = m.type === 'system' ? C.yellow : agentColor(agent);

  if (m.type === 'question') {
    console.log(`${C.yellow}${C.bold}  ? [${ts}] ${agent}: ${m.content} [${m.question_id || ''}]${C.reset}`);
  } else if (m.type === 'answer') {
    console.log(`${C.green}${C.bold}  A [${ts}] ${agent}: ${m.content}${C.reset}`);
  } else if (m.type === 'system') {
    console.log(`${C.dim}  * [${ts}] ${m.content}${C.reset}`);
  } else if (m.type === 'agree' || m.type === 'disagree') {
    const icon = m.type === 'agree' ? '+' : '-';
    console.log(`${C.yellow}  ${icon} [${ts}] ${agent}: ${m.content}${C.reset}`);
  } else {
    console.log(`${color}  [${ts}] ${agent}: ${m.content}${C.reset}`);
  }
}

function printBanner(agentCount) {
  const line = '─'.repeat(60);
  console.log(`${C.dim}┌─── ccchat ─── room: ${room} ─── ${agentCount} agents online ${'─'.repeat(Math.max(0, 35 - room.length))}┐${C.reset}`);
}

function printEvent(text) {
  console.log(`${C.yellow}  ★ ${text}${C.reset}`);
}

async function main() {
  await ensureServer();
  const ws = await connect();

  // Join
  const joinRes = await request(ws, { type: 'join', name, role: 'peer', room, project_path: process.cwd() });
  printBanner((joinRes.agents?.length || 0) + 1);

  if (joinRes.unread > 0) {
    console.log(`${C.dim}  (${joinRes.unread} unread messages)${C.reset}`);
  }

  // Load history
  const history = await request(ws, { type: 'read', room, since_seq: 0, limit: 50 });
  for (const m of (history.messages || [])) {
    printMessage(m);
  }

  console.log(`${C.dim}${'─'.repeat(62)}${C.reset}`);

  // Listen for real-time messages
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    switch (msg.type) {
      case 'deliver':
        printMessage(msg.message);
        break;
      case 'agent_joined':
        printEvent(`${msg.name} joined ${msg.room}`);
        break;
      case 'agent_left':
        printEvent(`${msg.name} left ${msg.room}`);
        break;
      case 'consensus_update':
        if (msg.state === 'reached') {
          printEvent(`CONSENSUS REACHED on ${msg.question_id}`);
        } else if (msg.state === 'timeout') {
          printEvent(`CONSENSUS TIMEOUT on ${msg.question_id}`);
        } else {
          printEvent(`Consensus ${msg.question_id}: ${msg.state} - votes: ${JSON.stringify(msg.votes)}`);
        }
        break;
    }
  });

  if (watchOnly) {
    console.log(`${C.dim}  (watch mode - press Ctrl+C to exit)${C.reset}`);
    return; // Keep running, just watching
  }

  // Input
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: `${C.dim}> ${C.reset}` });
  rl.prompt();

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) { rl.prompt(); return; }

    if (trimmed === '/quit' || trimmed === '/exit') {
      close(ws).then(() => process.exit(0));
      return;
    }

    if (trimmed === '/rooms' || trimmed === '/status') {
      ws.send(JSON.stringify({ type: 'status' }));
      rl.prompt();
      return;
    }

    if (trimmed.startsWith('/join ')) {
      const newRoom = trimmed.slice(6).trim();
      ws.send(JSON.stringify({ type: 'join', name, role: 'peer', room: newRoom }));
      console.log(`${C.dim}  Joining ${newRoom}...${C.reset}`);
      rl.prompt();
      return;
    }

    if (trimmed.startsWith('/ask ')) {
      const question = trimmed.slice(5).trim();
      ws.send(JSON.stringify({ type: 'question', content: question, room, timeout_minutes: 5 }));
      rl.prompt();
      return;
    }

    if (trimmed.startsWith('/vote ')) {
      const parts = trimmed.slice(6).trim().split(/\s+/);
      const qid = parts[0];
      const vote = parts[1];
      const reason = parts.slice(2).join(' ');
      if (qid && ['agree', 'disagree'].includes(vote)) {
        ws.send(JSON.stringify({ type: vote, question_id: qid, reason: reason || undefined }));
      } else {
        console.log(`${C.dim}  Usage: /vote <qid> agree|disagree [reason]${C.reset}`);
      }
      rl.prompt();
      return;
    }

    // Regular message
    ws.send(JSON.stringify({ type: 'message', content: trimmed, room }));
    rl.prompt();
  });

  rl.on('close', () => {
    close(ws).then(() => process.exit(0));
  });
}

main().catch(e => { console.error(e.message); process.exit(1); });
