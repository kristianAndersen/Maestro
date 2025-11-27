#!/usr/bin/env node

/**
 * Feature Flag System for Maestro Framework
 *
 * Provides centralized feature flag management with multiple configuration sources:
 * 1. Environment variables (highest priority)
 * 2. Config file (.claude/feature-flags.json)
 * 3. Default values (lowest priority)
 *
 * Usage:
 *   import { isEnabled } from './lib/feature-flags.js';
 *
 *   if (isEnabled('DEFER_LOADING')) {
 *     // defer_loading code
 *   }
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default feature flags
const DEFAULT_FLAGS = {
  DEFER_LOADING: true,           // defer_loading with smart caching
  SKILL_DISCOVERY: true,         // Skill discovery hook
  AGENT_SUGGESTIONS: true,       // Agent suggestion hook
  WORK_TRACKING: true,           // Work tracker hook
  CONTEXT_TRACKING: true,        // Context.json persistence
  DOMAIN_HISTORY_CLEANUP: true   // Domain history cleanup (max 100 entries)
};

/**
 * Load feature flags from config file
 */
function loadConfigFile() {
  try {
    const configPath = join(__dirname, '..', 'feature-flags.json');
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Fail silently - use defaults
    console.error(`[FeatureFlags] Warning: Could not load feature-flags.json: ${error.message}`);
  }
  return {};
}

/**
 * Load feature flags from environment variables
 * Environment variable format: MAESTRO_FEATURE_<FLAG_NAME>=true|false
 */
function loadEnvironmentFlags() {
  const envFlags = {};

  for (const key in DEFAULT_FLAGS) {
    const envKey = `MAESTRO_FEATURE_${key}`;
    if (process.env[envKey] !== undefined) {
      envFlags[key] = process.env[envKey] === 'true';
    }
  }

  return envFlags;
}

/**
 * Get merged feature flags (env > config > defaults)
 */
function getFlags() {
  const configFlags = loadConfigFile();
  const envFlags = loadEnvironmentFlags();

  return {
    ...DEFAULT_FLAGS,
    ...configFlags,
    ...envFlags
  };
}

/**
 * Check if a feature flag is enabled
 *
 * @param {string} flagName - Feature flag name (e.g., 'DEFER_LOADING')
 * @returns {boolean} - true if enabled, false if disabled
 */
export function isEnabled(flagName) {
  const flags = getFlags();
  return flags[flagName] === true;
}

/**
 * Get all feature flags (for debugging)
 *
 * @returns {Object} - All feature flags with their values
 */
export function getAllFlags() {
  return getFlags();
}

/**
 * Check if feature flag exists
 *
 * @param {string} flagName - Feature flag name
 * @returns {boolean} - true if flag is defined
 */
export function flagExists(flagName) {
  return flagName in DEFAULT_FLAGS;
}

// CLI interface for debugging
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Maestro Feature Flags:');
  console.log(JSON.stringify(getAllFlags(), null, 2));
}
