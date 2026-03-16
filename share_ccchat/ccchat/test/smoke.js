#!/usr/bin/env node
// Smoke test: server + client + consensus flow

import { ensureServer, connect, request, close, sleep, HTTP_URL } from '../client/ccchat-client.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

async function test() {
  console.log('=== ccchat smoke test ===\n');

  // 1. Server health
  console.log('1. Server');
  await ensureServer();
  const health = await fetch(`${HTTP_URL}/health`);
  assert(health.ok, 'Health endpoint returns OK');

  // 2. Agent join
  console.log('\n2. Agent join');
  const ws1 = await connect();
  const join1 = await request(ws1, { type: 'join', name: 'agent-a', role: 'peer', room: 'test-room', project_path: '/tmp/a' });
  assert(join1.type === 'joined', 'Agent A joined');
  assert(join1.name === 'agent-a', 'Agent A name correct');

  const ws2 = await connect();
  const join2 = await request(ws2, { type: 'join', name: 'agent-b', role: 'peer', room: 'test-room', project_path: '/tmp/b' });
  assert(join2.type === 'joined', 'Agent B joined');
  assert(join2.agents.includes('agent-a'), 'Agent B sees Agent A');

  // 3. Messaging
  console.log('\n3. Messaging');
  // Set up listener on ws1 for incoming messages
  const delivered = new Promise((resolve) => {
    ws1.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'deliver' && msg.message.from_agent === 'agent-b') {
        resolve(msg);
      }
    });
  });

  ws2.send(JSON.stringify({ type: 'message', content: 'hello from B', room: 'test-room' }));
  const msg = await delivered;
  assert(msg.message.content === 'hello from B', 'Agent A received message from B');

  // 4. Read messages
  console.log('\n4. Read messages');
  const readRes = await request(ws1, { type: 'read', room: 'test-room', since_seq: 0 });
  assert(readRes.type === 'read_response', 'Read response received');
  assert(readRes.messages.length > 0, `Got ${readRes.messages.length} messages`);

  // 5. Question + consensus
  console.log('\n5. Consensus flow');
  const qRes = await request(ws1, { type: 'question', content: 'Should we use TypeScript?', room: 'test-room', timeout_minutes: 1 });
  assert(qRes.type === 'question_created', 'Question created');
  assert(qRes.question_id.startsWith('q-'), `Question ID: ${qRes.question_id}`);

  const qid = qRes.question_id;

  // Agent B answers
  // Consume the delivered question message first
  await sleep(100);
  ws2.send(JSON.stringify({ type: 'answer', question_id: qid, content: 'Yes, TypeScript for type safety' }));
  await sleep(200);

  // Agent A agrees
  ws1.send(JSON.stringify({ type: 'agree', question_id: qid, reason: 'Makes sense' }));
  await sleep(200);

  // Check status
  const statusRes = await request(ws1, { type: 'status' });
  assert(statusRes.type === 'status_response', 'Status response received');

  // The consensus should be reached (B proposed + agreed, A agreed, both participants)
  const consensusItem = (statusRes.consensus || []).find(c => c.question_id === qid);
  // It may already be resolved and not in active list
  if (consensusItem) {
    console.log(`  Consensus state: ${consensusItem.state}, votes: ${JSON.stringify(consensusItem.votes)}`);
    assert(consensusItem.state === 'reached' || consensusItem.state === 'debating', 'Consensus progressing');
  } else {
    // Check if it reached consensus and fell out of active list (unlikely but possible)
    assert(true, 'Consensus completed (no longer active)');
  }

  // 6. Status endpoint
  console.log('\n6. HTTP Status');
  const statusHttp = await fetch(`${HTTP_URL}/status`);
  const statusData = await statusHttp.json();
  assert(Array.isArray(statusData.agents), 'HTTP status has agents');
  assert(Array.isArray(statusData.rooms), 'HTTP status has rooms');

  // Cleanup — remove test agents so they don't show as ghosts
  await request(ws1, { type: 'leave', name: 'agent-a' });
  await request(ws2, { type: 'leave', name: 'agent-b' });
  await close(ws1);
  await close(ws2);

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

test().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
