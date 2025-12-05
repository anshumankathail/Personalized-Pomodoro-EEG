"use client";

import { useState } from "react";
import PomodoroTimer from "@/components/pomodoro-timer-old";
import FocusMonitor from "@/components/focus-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { predictFocusState } from "@/lib/api";
import { FocusState } from "@/lib/focus-config";

export default function AdvancedDashboardPage() {
  const [focusHistory, setFocusHistory] = useState<{ timestamp: number; focus: FocusState }[]>([]);

  // Custom fetch function that integrates with the existing prediction API
  const fetchFocusData = async (): Promise<FocusState> => {
    try {
      // Generate mock EEG data (6 channels, 320 samples each)
      // In production, this would come from actual EEG sensors
      const mockEEG = Array.from({ length: 6 }, () => 
        Array.from({ length: 320 }, () => Math.random())
      );

      // Call the existing prediction API
      const prediction = await predictFocusState(mockEEG);

      if (prediction.success && prediction.result) {
        // Convert "focused"/"unfocused" string to binary 0/1
        const focusState: FocusState = prediction.result === "focused" ? 1 : 0;
        return focusState;
      }

      // Fallback to random if prediction fails
      return Math.random() > 0.5 ? 1 : 0;
    } catch (error) {
      console.error("Error predicting focus state:", error);
      // Fallback to random value
      return Math.random() > 0.5 ? 1 : 0;
    }
  };

  // Callback when focus state changes
  const handleFocusChange = (focus: FocusState) => {
    // You can use this to sync with other components, analytics, etc.
    setFocusHistory((prev) => [
      ...prev,
      { timestamp: Date.now(), focus }
    ].slice(-50)); // Keep last 50 records
    
    // Could also trigger notifications, update session data, etc.
    console.log("Focus state changed to:", focus === 1 ? "Focused" : "Unfocused");
  };

  // Callback when monitoring state changes
  const handleMonitoringStateChange = (isMonitoring: boolean) => {
    console.log("Monitoring:", isMonitoring);
    // Could sync with timer, update UI, etc.
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Focus Time</h1>
        <p className="text-muted-foreground">
          Use the Pomodoro technique to boost your productivity with real-time focus monitoring
        </p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Pomodoro Timer</CardTitle>
            <CardDescription>Focus for 25 minutes, then take a 5 minute break</CardDescription>
          </CardHeader>
          <CardContent>
            <PomodoroTimer />
          </CardContent>
        </Card>

        {/* Focus Monitor with API Integration */}
        <div className="flex flex-col">
          <FocusMonitor
            fetchFocusData={fetchFocusData}
            onFocusChange={handleFocusChange}
            onMonitoringStateChange={handleMonitoringStateChange}
            config={{
              updateInterval: 12, // 5 times per minute
              maxDataPoints: 15,  // Show last 3 minutes of data
              useAPI: false,      // Using custom fetch function instead
            }}
          />
        </div>
      </div>

      {/* Optional: Display focus history summary */}
      {focusHistory.length > 0 && (
        <div className="w-full max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Summary</CardTitle>
              <CardDescription>
                Overall focus statistics for this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold">
                    {focusHistory.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Checks</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {focusHistory.filter(h => h.focus === 1).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Focused</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {focusHistory.filter(h => h.focus === 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unfocused</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold">
                    {Math.round((focusHistory.filter(h => h.focus === 1).length / focusHistory.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Focus Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
