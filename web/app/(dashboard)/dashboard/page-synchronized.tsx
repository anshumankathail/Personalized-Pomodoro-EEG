"use client";

import { useState, useCallback } from "react";
import PomodoroTimer from "@/components/pomodoro-timer-old";
import FocusMonitor from "@/components/focus-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRESET_STANDARD } from "@/lib/focus-presets";
import { FocusState } from "@/lib/focus-config";
import { predictFocusState } from "@/lib/api";

/**
 * Synchronized Dashboard Example
 * 
 * This example shows how to synchronize the Focus Monitor with the Pomodoro Timer:
 * - Start monitoring when timer starts
 * - Stop monitoring when timer stops
 * - Track focus during work sessions only
 * - Display session summary
 */
export default function SynchronizedDashboard() {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<FocusState | null>(null);
  const [sessionData, setSessionData] = useState({
    totalChecks: 0,
    focusedChecks: 0,
    unfocusedChecks: 0,
    focusPercentage: 0,
  });

  // Fetch focus data from API
  const fetchFocusData = useCallback(async (): Promise<FocusState> => {
    try {
      // Generate mock EEG data (replace with real data in production)
      const mockEEG = Array.from({ length: 6 }, () => 
        Array.from({ length: 320 }, () => Math.random())
      );

      // Call prediction API
      const prediction = await predictFocusState(mockEEG);

      if (prediction.success && prediction.result) {
        return prediction.result === "focused" ? 1 : 0;
      }

      // Fallback
      return Math.random() > 0.5 ? 1 : 0;
    } catch (error) {
      console.error("Error predicting focus:", error);
      return Math.random() > 0.5 ? 1 : 0;
    }
  }, []);

  // Handle focus state changes
  const handleFocusChange = useCallback((focus: FocusState) => {
    setCurrentFocus(focus);
    
    // Update session statistics
    setSessionData((prev) => {
      const newTotal = prev.totalChecks + 1;
      const newFocused = focus === 1 ? prev.focusedChecks + 1 : prev.focusedChecks;
      const newUnfocused = focus === 0 ? prev.unfocusedChecks + 1 : prev.unfocusedChecks;
      
      return {
        totalChecks: newTotal,
        focusedChecks: newFocused,
        unfocusedChecks: newUnfocused,
        focusPercentage: Math.round((newFocused / newTotal) * 100),
      };
    });

    // Optional: Trigger alerts for low focus
    if (focus === 0 && sessionData.totalChecks > 3) {
      const recentFocusRate = sessionData.focusPercentage;
      if (recentFocusRate < 40) {
        console.warn("⚠️ Focus rate is low! Consider taking a break.");
        // Could show a notification here
      }
    }
  }, [sessionData.focusPercentage, sessionData.totalChecks]);

  // Handle monitoring state changes
  const handleMonitoringStateChange = useCallback((monitoring: boolean) => {
    setIsMonitoring(monitoring);
    
    // Reset stats when monitoring stops
    if (!monitoring) {
      console.log("Session ended. Final stats:", sessionData);
      // Could save to database here
    }
  }, [sessionData]);

  // Get status badge
  const getStatusBadge = () => {
    if (!isMonitoring) {
      return <Badge variant="outline">Not Monitoring</Badge>;
    }
    
    if (currentFocus === 1) {
      return <Badge className="bg-green-500">Focused</Badge>;
    }
    
    if (currentFocus === 0) {
      return <Badge className="bg-red-500">Unfocused</Badge>;
    }
    
    return <Badge variant="secondary">Checking...</Badge>;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8">
      {/* Header with status */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Focus Time</h1>
          {getStatusBadge()}
        </div>
        <p className="text-muted-foreground">
          Synchronized Pomodoro Timer with Real-time Focus Monitoring
        </p>
      </div>

      {/* Main content: Timer + Monitor */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Pomodoro Timer</CardTitle>
            <CardDescription>
              Focus for 25 minutes, then take a 5 minute break
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PomodoroTimer />
          </CardContent>
        </Card>

        {/* Focus Monitor */}
        <div className="flex flex-col">
          <FocusMonitor
            config={PRESET_STANDARD}
            fetchFocusData={fetchFocusData}
            onFocusChange={handleFocusChange}
            onMonitoringStateChange={handleMonitoringStateChange}
          />
        </div>
      </div>

      {/* Session Statistics */}
      {sessionData.totalChecks > 0 && (
        <div className="w-full max-w-7xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Current Session Stats</CardTitle>
                  <CardDescription>Real-time focus analytics</CardDescription>
                </div>
                <Badge 
                  variant={sessionData.focusPercentage >= 70 ? "default" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  {sessionData.focusPercentage}% Focus
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold">
                    {sessionData.totalChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Checks</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {sessionData.focusedChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">Focused</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {sessionData.unfocusedChecks}
                  </div>
                  <div className="text-sm text-muted-foreground">Unfocused</div>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-3xl font-bold text-primary">
                    {sessionData.focusPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Focus Distribution</span>
                  <span>{sessionData.focusedChecks} of {sessionData.totalChecks}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-500 transition-all duration-300"
                    style={{ 
                      width: `${(sessionData.focusedChecks / sessionData.totalChecks) * 100}%` 
                    }}
                  />
                  <div 
                    className="bg-red-500 transition-all duration-300"
                    style={{ 
                      width: `${(sessionData.unfocusedChecks / sessionData.totalChecks) * 100}%` 
                    }}
                  />
                </div>
              </div>

              {/* Focus quality indicator */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Focus Quality:</span>
                  <span className="text-sm font-semibold">
                    {sessionData.focusPercentage >= 80 ? "Excellent 🌟" :
                     sessionData.focusPercentage >= 60 ? "Good 👍" :
                     sessionData.focusPercentage >= 40 ? "Fair 😐" :
                     "Needs Improvement 📚"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips and Instructions */}
      {!isMonitoring && sessionData.totalChecks === 0 && (
        <div className="w-full max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Click <strong>Play</strong> on the Focus Monitor to start tracking your focus</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Start your Pomodoro Timer when ready to work</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>The monitor will check your focus every 12 seconds</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">4.</span>
                <span>Watch your focus statistics update in real-time</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-primary">5.</span>
                <span>Aim for at least 70% focus rate during work sessions</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
