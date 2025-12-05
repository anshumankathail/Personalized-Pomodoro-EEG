/**
 * Focus Monitor Presets
 * 
 * Common configuration presets for the Focus Monitor component.
 * Import and use these in your dashboard for quick setup.
 */

import { FocusMonitorConfig } from './focus-config';

/**
 * Standard preset: 5 checks per minute (every 12 seconds)
 * Shows last 3 minutes of data
 */
export const PRESET_STANDARD: Partial<FocusMonitorConfig> = {
  updateInterval: 12,
  maxDataPoints: 15,
  useAPI: false,
};

/**
 * Fast preset: 10 checks per minute (every 6 seconds)
 * Shows last 3 minutes of data
 */
export const PRESET_FAST: Partial<FocusMonitorConfig> = {
  updateInterval: 6,
  maxDataPoints: 30,
  useAPI: false,
};

/**
 * Slow preset: 3 checks per minute (every 20 seconds)
 * Shows last 3 minutes of data
 */
export const PRESET_SLOW: Partial<FocusMonitorConfig> = {
  updateInterval: 20,
  maxDataPoints: 9,
  useAPI: false,
};

/**
 * Long history preset: 5 checks per minute (every 12 seconds)
 * Shows last 5 minutes of data
 */
export const PRESET_LONG_HISTORY: Partial<FocusMonitorConfig> = {
  updateInterval: 12,
  maxDataPoints: 25,
  useAPI: false,
};

/**
 * Short history preset: 10 checks per minute (every 6 seconds)
 * Shows last 1 minute of data
 */
export const PRESET_SHORT_HISTORY: Partial<FocusMonitorConfig> = {
  updateInterval: 6,
  maxDataPoints: 10,
  useAPI: false,
};

/**
 * API-ready preset: Standard timing with API enabled
 * Configure apiEndpoint separately
 */
export const PRESET_API: Partial<FocusMonitorConfig> = {
  updateInterval: 12,
  maxDataPoints: 15,
  useAPI: true,
  // Set apiEndpoint when using this preset
};

/**
 * High-frequency preset: 12 checks per minute (every 5 seconds)
 * Shows last 2 minutes of data
 */
export const PRESET_HIGH_FREQUENCY: Partial<FocusMonitorConfig> = {
  updateInterval: 5,
  maxDataPoints: 24,
  useAPI: false,
};

/**
 * Demo preset: Very fast updates for demonstrations
 * 20 checks per minute (every 3 seconds)
 * Shows last 1 minute of data
 */
export const PRESET_DEMO: Partial<FocusMonitorConfig> = {
  updateInterval: 3,
  maxDataPoints: 20,
  useAPI: false,
};

/**
 * Helper function to create a custom preset
 */
export function createCustomPreset(
  updatesPerMinute: number,
  durationMinutes: number,
  useAPI: boolean = false
): Partial<FocusMonitorConfig> {
  const updateInterval = Math.round(60 / updatesPerMinute);
  const maxDataPoints = updatesPerMinute * durationMinutes;

  return {
    updateInterval,
    maxDataPoints,
    useAPI,
  };
}

/**
 * Example usage:
 * 
 * import { PRESET_STANDARD, PRESET_FAST } from '@/lib/focus-presets';
 * 
 * <FocusMonitor config={PRESET_STANDARD} />
 * <FocusMonitor config={PRESET_FAST} />
 * 
 * // Or create custom
 * const myPreset = createCustomPreset(8, 4); // 8 checks/min, 4 minutes
 * <FocusMonitor config={myPreset} />
 */
