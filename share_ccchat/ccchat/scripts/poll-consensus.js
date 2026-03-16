#!/usr/bin/env node
// Usage: node poll-consensus.js <question-id> [--timeout 300] [--room room]
// Blocks until consensus is reached or timeout. Prints final state.

import { ensureServer, connect, close, sleep } from '../client/ccchat-client.js';

const args = process.argv.slice(2);
const qid = args[0];
function getFlag(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return args[idx + 1];
}

if (!qid) {
  console.error('Usage: node poll-consensus.js <question-id> [--timeout 300]');
  process.exit(1);
}

const timeoutSec = parseInt(getFlag('timeout') || '300', 10);

async function main() {
  await ensureServer();
  const ws = await connect();

  const deadline = Date.now() + timeoutSec * 1000;

  while (Date.now() < deadline) {
    ws.send(JSON.stringify({ type: 'status' }));

    const result = await new Promise((resolve) => {
      const handler = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'status_response') {
          ws.off('message', handler);
          resolve(msg);
        }
      };
      ws.on('message', handler);
    });

    const c = (result.consensus || []).find(q => q.question_id === qid);
    if (!c) {
      // Check if it's already completed (not in active list)
      console.log(JSON.stringify({ question_id: qid, state: 'not_found' }));
      break;
    }

    if (c.state === 'reached' || c.state === 'timeout') {
      console.log(JSON.stringify(c));
      await close(ws);
      return;
    }

    await sleep(3000);
  }

  console.log(JSON.stringify({ question_id: qid, state: 'poll_timeout' }));
  await close(ws);
}

main().catch(e => { console.error(e.message); process.exit(1); });
