/**
 * Focus Monitor Configuration
 * 
 * This file contains configuration and types for the Focus Monitor component.
 * Update these settings to customize the behavior of the focus monitoring system.
 */

/**
 * Focus state value (binary)
 * 0 = Unfocused
 * 1 = Focused
 */
export type FocusState = 0 | 1;

/**
 * Data point for focus monitoring
 */
export interface FocusDataPoint {
  timestamp: number;
  focus: FocusState;
}

/**
 * Configuration for the Focus Monitor
 */
export interface FocusMonitorConfig {
  /** Interval in seconds between focus checks (default: 12 seconds = 5 times per minute) */
  updateInterval: number;
  
  /** Maximum number of data points to display on the graph */
  maxDataPoints: number;
  
  /** Enable/disable API integration */
  useAPI: boolean;
  
  /** API endpoint to fetch focus data (optional) */
  apiEndpoint?: string;
  
  /** Custom headers for API requests (optional) */
  apiHeaders?: Record<string, string>;
}

/**
 * Default configuration
 */
export const DEFAULT_FOCUS_CONFIG: FocusMonitorConfig = {
  updateInterval: 12, // 5 times per minute
  maxDataPoints: 15, // Show last 15 data points (3 minutes of data at 12s interval)
  useAPI: false, // Use random data by default, set to true when API is ready
  apiEndpoint: undefined,
  apiHeaders: undefined,
};

/**
 * API Response interface (adjust based on your actual API)
 */
export interface FocusAPIResponse {
  success: boolean;
  focus: FocusState;
  timestamp?: number;
  confidence?: number; // Optional: confidence score from ML model
  metadata?: Record<string, any>; // Optional: additional data
}

/**
 * Function to fetch focus data from API
 * Replace this implementation when your API is ready
 */
export async function fetchFocusFromAPI(
  endpoint: string,
  headers?: Record<string, string>
): Promise<FocusState> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: FocusAPIResponse = await response.json();
    
    if (data.success && (data.focus === 0 || data.focus === 1)) {
      return data.focus;
    }
    
    throw new Error('Invalid response format from API');
  } catch (error) {
    console.error('Error fetching focus data from API:', error);
    // Fallback to random value if API fails
    return Math.random() > 0.5 ? 1 : 0;
  }
}

/**
 * Mock EEG data generator for testing
 * Remove or modify this when using real EEG data
 */
export function generateMockEEGData(): number[][] {
  // Simulate 6 channels with 320 samples each
  return Array.from({ length: 6 }, () => 
    Array.from({ length: 320 }, () => Math.random())
  );
}
