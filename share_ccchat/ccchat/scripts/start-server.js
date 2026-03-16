#!/usr/bin/env node
import { ensureServer, HTTP_URL } from '../client/ccchat-client.js';

try {
  await ensureServer();
  const res = await fetch(`${HTTP_URL}/health`);
  console.log(`ccchat server: ${await res.text()} (${HTTP_URL})`);
} catch (e) {
  console.error(`Failed to start server: ${e.message}`);
  process.exit(1);
}
