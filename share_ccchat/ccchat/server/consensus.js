// Consensus state machine:
// OPEN ──(answer)──→ PROPOSED ──(vote)──→ DEBATING ──(all agree)──→ REACHED
//                                              │
//                                         (timeout)──→ TIMEOUT

import { getConsensus, updateConsensus, insertMessage } from './db.js';

export function proposeAnswer(question_id, answer_msg_id, proposed_by) {
  const c = getConsensus(question_id);
  if (!c) throw new Error(`No consensus for question ${question_id}`);
  if (c.state !== 'open' && c.state !== 'debating') {
    throw new Error(`Cannot propose in state: ${c.state}`);
  }
  updateConsensus(question_id, {
    state: 'proposed',
    proposed_answer_id: answer_msg_id,
    proposed_by,
    votes: { [proposed_by]: 'agree' },
  });
  return getConsensus(question_id);
}

export function castVote(question_id, agent_name, vote, reason) {
  const c = getConsensus(question_id);
  if (!c) throw new Error(`No consensus for question ${question_id}`);
  if (c.state !== 'proposed' && c.state !== 'debating') {
    throw new Error(`Cannot vote in state: ${c.state}`);
  }

  const votes = { ...c.votes, [agent_name]: vote };
  const participants = c.participants;

  // Log the vote as a message
  insertMessage({
    type: vote === 'agree' ? 'agree' : 'disagree',
    from_agent: agent_name,
    room: c.room,
    content: reason || (vote === 'agree' ? 'Agreed' : 'Disagreed'),
    question_id,
  });

  // Check if all participants have voted
  const votedAgents = Object.keys(votes);
  const allVoted = participants.length > 0 && participants.every(p => votedAgents.includes(p));
  const allAgree = allVoted && Object.values(votes).every(v => v === 'agree');
  const hasDisagree = Object.values(votes).some(v => v === 'disagree');

  let newState = 'debating';
  if (allAgree) {
    newState = 'reached';
  } else if (hasDisagree && c.state === 'proposed') {
    newState = 'debating'; // Re-open debate
  }

  updateConsensus(question_id, { state: newState, votes });
  return getConsensus(question_id);
}

export async function checkTimeouts() {
  // Called periodically to timeout stale consensus
  const { getDb } = await import('./db.js');
  const d = getDb();
  const now = new Date().toISOString();
  const stale = d.prepare(`
    SELECT question_id FROM consensus
    WHERE state IN ('open', 'proposed', 'debating')
    AND timeout_at < ?
  `).all(now);

  for (const { question_id } of stale) {
    updateConsensus(question_id, { state: 'timeout' });
  }
  return stale.map(s => s.question_id);
}
