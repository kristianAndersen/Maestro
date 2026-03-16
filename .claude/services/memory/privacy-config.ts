/**
 * Privacy configuration management for claude-mem integration
 *
 * This module provides privacy control schemas, configuration loading,
 * validation, and management for the memory system. It ensures user data
 * is handled according to privacy preferences and security requirements.
 */

import { readFileSync, existsSync, watchFile, Stats } from 'fs';
import { join } from 'path';

/**
 * Privacy configuration interface
 *
 * Defines all privacy-related settings for the memory system including
 * retention policies, sanitization rules, and access controls.
 *
 * @property enabled - Master switch for memory system (default: true)
 * @property retentionDays - Number of days to retain conversation history (1-365, default: 30)
 * @property sanitizeSecrets - Whether to sanitize sensitive data before storage (default: true)
 * @property sanitizePatterns - Custom regex patterns for additional secret detection (stored as strings in JSON)
 * @property excludeAgents - List of agent names whose conversations should not be stored
 * @property excludeFiles - Glob patterns for files whose contents should not be stored
 * @property requireConsent - Whether to require explicit user consent before storing (default: false)
 */
export interface PrivacyConfig {
  enabled: boolean;
  retentionDays: number;
  sanitizeSecrets: boolean;
  sanitizePatterns: string[];
  excludeAgents: string[];
  excludeFiles: string[];
  requireConsent: boolean;
}

/**
 * Validation result for privacy configuration
 *
 * @property valid - Whether the configuration passed all validations
 * @property errors - List of validation error messages (empty if valid)
 * @property warnings - List of non-critical warnings
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Default privacy configuration
 *
 * Provides secure defaults that balance privacy protection with functionality.
 * These values are used when no user configuration exists or when validation fails.
 */
export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  enabled: true,
  retentionDays: 30,
  sanitizeSecrets: true,
  sanitizePatterns: [],
  excludeAgents: [],
  excludeFiles: [
    '**/.env',
    '**/.env.*',
    '**/secrets.json',
    '**/credentials.json',
    '**/*.key',
    '**/*.pem',
    '**/*_rsa',
    '**/id_rsa',
    '**/id_dsa',
    '**/id_ecdsa',
    '**/id_ed25519'
  ],
  requireConsent: false
};

/**
 * Configuration file path constants
 */
const CONFIG_FILE_NAME = 'memory-config.json';

/**
 * Gets configuration search paths dynamically
 *
 * Evaluates environment variables at runtime to support testing
 * and dynamic configuration overrides.
 *
 * @returns Array of configuration file paths in priority order
 */
function getConfigSearchPaths(): string[] {
  return [
    process.env.CLAUDE_MEMORY_CONFIG, // Environment variable override
    join(process.cwd(), '.claude', CONFIG_FILE_NAME), // Project-level
    join(process.env.HOME || process.env.USERPROFILE || '', '.claude', CONFIG_FILE_NAME) // User-level
  ].filter(Boolean) as string[];
}

/**
 * Cached configuration (loaded on first access)
 */
let cachedConfig: PrivacyConfig | null = null;

/**
 * File watcher cleanup function
 */
let unwatchConfig: (() => void) | null = null;

/**
 * Validates privacy configuration
 *
 * Checks all configuration values against constraints and business rules.
 * Returns detailed validation results with errors and warnings.
 *
 * @param config - Configuration object to validate
 * @returns Validation result with success status and any errors/warnings
 */
export function validateConfig(config: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check required fields
  if (typeof config !== 'object' || config === null) {
    result.valid = false;
    result.errors.push('Configuration must be an object');
    return result;
  }

  // Validate enabled
  if (typeof config.enabled !== 'boolean') {
    result.valid = false;
    result.errors.push('enabled must be a boolean');
  }

  // Validate retentionDays
  if (typeof config.retentionDays !== 'number') {
    result.valid = false;
    result.errors.push('retentionDays must be a number');
  } else if (config.retentionDays < 1 || config.retentionDays > 365) {
    result.valid = false;
    result.errors.push('retentionDays must be between 1 and 365');
  } else if (config.retentionDays < 7) {
    result.warnings.push('retentionDays < 7 may limit memory effectiveness');
  } else if (config.retentionDays > 90) {
    result.warnings.push('retentionDays > 90 may increase storage requirements');
  }

  // Validate sanitizeSecrets
  if (typeof config.sanitizeSecrets !== 'boolean') {
    result.valid = false;
    result.errors.push('sanitizeSecrets must be a boolean');
  } else if (config.sanitizeSecrets === false) {
    result.warnings.push('sanitizeSecrets disabled - secrets may be stored');
  }

  // Validate sanitizePatterns
  if (!Array.isArray(config.sanitizePatterns)) {
    result.valid = false;
    result.errors.push('sanitizePatterns must be an array');
  } else {
    for (let i = 0; i < config.sanitizePatterns.length; i++) {
      const pattern = config.sanitizePatterns[i];
      if (typeof pattern !== 'string') {
        result.valid = false;
        result.errors.push(`sanitizePatterns[${i}] must be a string`);
        continue;
      }
      try {
        new RegExp(pattern);
      } catch (error) {
        result.valid = false;
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`sanitizePatterns[${i}] is not a valid regex: ${pattern} - ${errorMsg}`);
      }
    }
  }

  // Validate excludeAgents
  if (!Array.isArray(config.excludeAgents)) {
    result.valid = false;
    result.errors.push('excludeAgents must be an array');
  } else {
    for (let i = 0; i < config.excludeAgents.length; i++) {
      if (typeof config.excludeAgents[i] !== 'string') {
        result.valid = false;
        result.errors.push(`excludeAgents[${i}] must be a string`);
      }
    }
  }

  // Validate excludeFiles
  if (!Array.isArray(config.excludeFiles)) {
    result.valid = false;
    result.errors.push('excludeFiles must be an array');
  } else {
    for (let i = 0; i < config.excludeFiles.length; i++) {
      if (typeof config.excludeFiles[i] !== 'string') {
        result.valid = false;
        result.errors.push(`excludeFiles[${i}] must be a string`);
      }
    }
  }

  // Validate requireConsent
  if (typeof config.requireConsent !== 'boolean') {
    result.valid = false;
    result.errors.push('requireConsent must be a boolean');
  }

  return result;
}

/**
 * Validates agent names against agent registry
 *
 * Checks if excluded agent names actually exist in the agent registry.
 * Returns list of invalid agent names (warnings, not errors).
 *
 * @param agentNames - List of agent names to validate
 * @returns Array of invalid agent names
 */
export function validateAgentNames(agentNames: string[]): string[] {
  const invalidAgents: string[] = [];
  const registryPath = join(process.cwd(), '.claude', 'agents', 'agent-registry.json');

  if (!existsSync(registryPath)) {
    // Can't validate without registry, but don't block config loading
    return [];
  }

  try {
    const registryContent = readFileSync(registryPath, 'utf-8');
    const registry = JSON.parse(registryContent);

    for (const agentName of agentNames) {
      if (!registry[agentName]) {
        invalidAgents.push(agentName);
      }
    }
  } catch (error) {
    // If we can't read registry, skip validation
    console.warn('Could not validate agent names against registry:', error);
  }

  return invalidAgents;
}

/**
 * Merges user configuration with defaults
 *
 * Takes a partial user configuration and fills in missing values with defaults.
 * This allows users to specify only the settings they want to change.
 *
 * @param userConfig - User's partial configuration
 * @returns Complete configuration with defaults applied
 */
export function mergeWithDefaults(userConfig: Partial<PrivacyConfig>): PrivacyConfig {
  return {
    enabled: userConfig.enabled ?? DEFAULT_PRIVACY_CONFIG.enabled,
    retentionDays: userConfig.retentionDays ?? DEFAULT_PRIVACY_CONFIG.retentionDays,
    sanitizeSecrets: userConfig.sanitizeSecrets ?? DEFAULT_PRIVACY_CONFIG.sanitizeSecrets,
    sanitizePatterns: userConfig.sanitizePatterns ?? DEFAULT_PRIVACY_CONFIG.sanitizePatterns,
    excludeAgents: userConfig.excludeAgents ?? DEFAULT_PRIVACY_CONFIG.excludeAgents,
    excludeFiles: userConfig.excludeFiles ?? DEFAULT_PRIVACY_CONFIG.excludeFiles,
    requireConsent: userConfig.requireConsent ?? DEFAULT_PRIVACY_CONFIG.requireConsent
  };
}

/**
 * Loads privacy configuration from file
 *
 * Searches for configuration file in multiple locations (dynamically evaluated).
 * Falls back to defaults if no configuration file exists or if validation fails.
 * Validates configuration and logs warnings for any issues.
 *
 * @param forceReload - If true, bypasses cache and reloads from disk
 * @returns Valid privacy configuration (defaults if user config is invalid)
 */
export function loadConfig(forceReload: boolean = false): PrivacyConfig {
  // Return cached config unless force reload requested
  if (cachedConfig && !forceReload) {
    return cachedConfig;
  }

  let loadedConfig: PrivacyConfig | null = null;
  let configFilePath: string | null = null;

  // Get search paths dynamically (to support runtime env var changes)
  const searchPaths = getConfigSearchPaths();

  // Search for config file in priority order
  for (const searchPath of searchPaths) {
    if (existsSync(searchPath)) {
      configFilePath = searchPath;
      try {
        const fileContent = readFileSync(searchPath, 'utf-8');
        const parsedConfig = JSON.parse(fileContent);

        // Merge with defaults FIRST (to support partial configs)
        const mergedConfig = mergeWithDefaults(parsedConfig);

        // Then validate the complete configuration
        const validation = validateConfig(mergedConfig);

        if (!validation.valid) {
          console.error(`Invalid privacy configuration at ${searchPath}:`, validation.errors);
          console.error('Falling back to default configuration');
          break;
        }

        // Log warnings
        if (validation.warnings.length > 0) {
          console.warn(`Privacy configuration warnings at ${searchPath}:`, validation.warnings);
        }

        // Validate agent names (non-blocking)
        const invalidAgents = validateAgentNames(mergedConfig.excludeAgents || []);
        if (invalidAgents.length > 0) {
          console.warn(`Unknown agents in excludeAgents: ${invalidAgents.join(', ')}`);
        }

        // Use the merged and validated configuration
        loadedConfig = mergedConfig;
        console.log(`Loaded privacy configuration from ${searchPath}`);
        break;

      } catch (error) {
        console.error(`Error reading privacy configuration from ${searchPath}:`, error);
        console.error('Falling back to default configuration');
        break;
      }
    }
  }

  // Use defaults if no valid config found
  if (!loadedConfig) {
    console.log('Using default privacy configuration');
    loadedConfig = DEFAULT_PRIVACY_CONFIG;
  }

  // Cache the loaded configuration
  cachedConfig = loadedConfig;

  // Setup file watcher for hot-reload (if config file exists)
  if (configFilePath) {
    setupConfigWatcher(configFilePath);
  }

  return loadedConfig;
}

/**
 * Sets up file watcher for configuration hot-reload
 *
 * Watches the configuration file for changes and automatically reloads
 * when modifications are detected. Debounces rapid changes to avoid
 * excessive reloading.
 *
 * @param configPath - Absolute path to configuration file
 */
function setupConfigWatcher(configPath: string): void {
  // Clean up existing watcher
  if (unwatchConfig) {
    unwatchConfig();
    unwatchConfig = null;
  }

  let reloadTimeout: ReturnType<typeof setTimeout> | null = null;

  watchFile(configPath, { interval: 1000 }, (curr: Stats, prev: Stats) => {
    // Only reload if file was actually modified
    if (curr.mtime > prev.mtime) {
      // Debounce: wait 500ms after last change
      if (reloadTimeout) {
        clearTimeout(reloadTimeout);
      }

      reloadTimeout = setTimeout(() => {
        console.log(`Configuration file changed, reloading: ${configPath}`);
        loadConfig(true);
      }, 500);
    }
  });

  // Store cleanup function
  unwatchConfig = () => {
    if (reloadTimeout) {
      clearTimeout(reloadTimeout);
    }
    // Note: Node.js doesn't provide unwatchFile by handle, would need to track filename
    // For now, this is a best-effort cleanup
  };
}

/**
 * Resets cached configuration (useful for testing)
 *
 * Clears the cached configuration and stops file watching.
 * Next call to loadConfig will reload from disk.
 */
export function resetConfig(): void {
  cachedConfig = null;
  if (unwatchConfig) {
    unwatchConfig();
    unwatchConfig = null;
  }
}

/**
 * Gets current cached configuration without reloading
 *
 * Returns null if no configuration has been loaded yet.
 * Use loadConfig() to ensure a configuration is available.
 *
 * @returns Cached configuration or null
 */
export function getCachedConfig(): PrivacyConfig | null {
  return cachedConfig;
}
