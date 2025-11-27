#!/usr/bin/env node

/**
 * Session Change Detector Hook
 *
 * Purpose: Workaround for SessionEnd-not-firing bug in Claude Code v2.0.55
 * Trigger: UserPromptSubmit (MUST RUN FIRST before other hooks)
 *
 * Problem: SessionEnd event doesn't fire, causing stale context data to persist
 * Solution: Detect session changes at UserPromptSubmit and clean up context BEFORE
 *           other hooks can recreate phantom activeDomain/lastEditedFile
 *
 * Detection Strategy:
 * - Compare current session metadata (sessionId, timestamp) vs context.json
 * - Detect session change if:
 *   1. Different sessionId
 *   2. Time gap > 30 minutes
 *
 * Reset Logic on Session Change:
 * - Clear: activeDomain, lastEditedFile, skillTracking.recommended
 * - Preserve: historicalMetrics, evaluation compliance data
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTEXT_FILE_PATH = join(__dirname, '..', 'context.json');
const LOG_FILE_PATH = join(__dirname, 'session-change-detector.log');
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Logs debugging information to session-change-detector.log
 */
function log(message) {
  try {
    const timestamp = new Date().toISOString();
    appendFileSync(LOG_FILE_PATH, `[${timestamp}] ${message}\n`, 'utf8');
  } catch (error) {
    // Silent fail - logging is best effort
  }
}

/**
 * Reads stdin to get session metadata
 * Expected format: JSON with sessionId and timestamp fields
 */
async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

/**
 * Loads context.json with error handling
 */
function loadContext() {
  if (!existsSync(CONTEXT_FILE_PATH)) {
    log('No context.json found - first run');
    return null;
  }

  try {
    const content = readFileSync(CONTEXT_FILE_PATH, 'utf8');
    const context = JSON.parse(content);
    return context;
  } catch (error) {
    log(`ERROR: Failed to load context.json: ${error.message}`);
    return null;
  }
}

/**
 * Saves context.json with error handling
 */
function saveContext(context) {
  try {
    writeFileSync(CONTEXT_FILE_PATH, JSON.stringify(context, null, 2), 'utf8');
    log('Context saved successfully');
    return true;
  } catch (error) {
    log(`ERROR: Failed to save context.json: ${error.message}`);
    return false;
  }
}

/**
 * Extracts session metadata from stdin
 * Handles various input formats gracefully
 */
function extractSessionMetadata(stdinData) {
  try {
    // Try parsing as JSON first
    const data = JSON.parse(stdinData);
    return {
      sessionId: data.sessionId || null,
      timestamp: data.timestamp || new Date().toISOString()
    };
  } catch {
    // If not JSON, generate session ID from timestamp
    const now = new Date();
    return {
      sessionId: `session-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now.toISOString()
    };
  }
}

/**
 * Determines if a session change has occurred
 */
function detectSessionChange(context, currentMetadata) {
  if (!context) {
    log('No previous context - treating as new session');
    return true;
  }

  // Check if sessionId changed
  const previousSessionId = context.skillTracking?.sessionId || context.lastSessionId;
  if (previousSessionId && currentMetadata.sessionId &&
      previousSessionId !== currentMetadata.sessionId) {
    log(`Session ID changed: ${previousSessionId} → ${currentMetadata.sessionId}`);
    return true;
  }

  // Check if time gap exceeds 30 minutes
  const lastPromptTime = context.skillTracking?.lastPromptTime || context.lastUpdated;
  if (lastPromptTime) {
    const lastTime = new Date(lastPromptTime);
    const currentTime = new Date(currentMetadata.timestamp);
    const timeDiff = currentTime - lastTime;

    if (timeDiff > SESSION_TIMEOUT_MS) {
      log(`Time gap detected: ${Math.round(timeDiff / 1000 / 60)} minutes (threshold: 30)`);
      return true;
    }
  }

  log('No session change detected');
  return false;
}

/**
 * Resets session-specific data while preserving historical metrics
 */
function resetSessionData(context, currentMetadata) {
  log('Resetting session-specific data');

  // Preserve historical/cumulative data (handle null context for first run)
  const historicalMetrics = (context && context.historicalMetrics) ? {
    totalSessions: context.historicalMetrics.totalSessions || 0,
    totalDelegations: context.historicalMetrics.totalDelegations || 0,
    averageCompliance: context.historicalMetrics.averageCompliance || "100"
  } : {
    totalSessions: 0,
    totalDelegations: 0,
    averageCompliance: "100"
  };

  const evaluationTracking = (context && context.evaluationTracking) ? {
    totalDelegations: context.evaluationTracking.totalDelegations || 0,
    evaluatedDelegations: context.evaluationTracking.evaluatedDelegations || 0,
    skippedEvaluations: context.evaluationTracking.skippedEvaluations || 0,
    complianceRate: context.evaluationTracking.complianceRate || 100
  } : {
    totalDelegations: 0,
    evaluatedDelegations: 0,
    skippedEvaluations: 0,
    complianceRate: 100
  };

  // Increment session count
  historicalMetrics.totalSessions = (historicalMetrics.totalSessions || 0) + 1;

  // Build fresh context with session data cleared
  const cleanContext = {
    lastSessionId: currentMetadata.sessionId,
    lastSessionEnd: new Date().toISOString(),
    historicalMetrics,
    evaluationTracking,
    skillTracking: {
      recommended: [], // CLEAR cached skills
      used: [],
      sessionStart: currentMetadata.timestamp,
      sessionId: currentMetadata.sessionId,
      lastPromptTime: currentMetadata.timestamp,
      promptCount: 0,
      domainHistory: []
    },
    // CLEAR session-specific context
    activeDomain: undefined, // Explicitly undefined to remove field
    lastEditedFile: undefined, // Explicitly undefined to remove field
    lastUpdated: currentMetadata.timestamp
  };

  log(`Session reset complete. New session ID: ${currentMetadata.sessionId}`);
  return cleanContext;
}

/**
 * Main execution
 */
async function main() {
  try {
    // Read stdin for session metadata
    const stdinData = await readStdin();
    const currentMetadata = extractSessionMetadata(stdinData);

    log(`Processing session: ${currentMetadata.sessionId}`);

    // Load existing context
    const context = loadContext();

    // Detect if session changed
    const sessionChanged = detectSessionChange(context, currentMetadata);

    if (sessionChanged) {
      // Reset session-specific data
      const cleanContext = resetSessionData(context, currentMetadata);

      // Save cleaned context
      if (saveContext(cleanContext)) {
        log('✓ Context cleaned successfully for new session');
      } else {
        log('✗ Failed to save cleaned context');
      }
    } else {
      // No session change - just update metadata
      if (context) {
        context.skillTracking = context.skillTracking || {};
        context.skillTracking.lastPromptTime = currentMetadata.timestamp;
        context.skillTracking.promptCount = (context.skillTracking.promptCount || 0) + 1;
        context.lastUpdated = currentMetadata.timestamp;
        saveContext(context);
      }
    }

    // Silent exit - this hook doesn't produce user-facing output
    process.exit(0);

  } catch (error) {
    log(`FATAL ERROR: ${error.message}\n${error.stack}`);
    // Silent exit even on error to avoid breaking hook chain
    process.exit(0);
  }
}

main();
