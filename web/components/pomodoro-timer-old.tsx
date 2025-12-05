"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  // fetchAllSessions is no longer needed for adjustment logic, only for initial load (removed from this file for clarity)
  fetchUserDetails,
  updateUserProfile,
  predictFocusState,
  saveSession,
} from "@/lib/api"; // Ensure these paths are correct for your project

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export default function PomodoroTimer() {
  const { theme, resolvedTheme } = useTheme();
  const { user } = useAuth(); // Custom hook for authentication
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default Pomodoro duration
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(100); // Progress for the circular timer
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref for the setTimeout ID

  // Durations, now dynamically adjusted
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  // For focus prediction logic
  const [minuteCounter, setMinuteCounter] = useState(0); // Tracks minutes passed in current pomodoro
  const [focusPredictions, setFocusPredictions] = useState<string[]>([]); // Stores "focused"/"unfocused" for each minute

  // User preferences
  const [preferences, setPreferences] = useState({
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notifications: false,
    soundEffects: false, // Sound effects logic would be added separately
  });

  // useRef to hold preferences without re-rendering effects that depend on them
  const preferencesRef = useRef(preferences);
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const modeChangedManually = useRef(false); // Flag to prevent auto-start when user manually switches tabs

  // Runs once on component mount to load user preferences
  useEffect(() => {
    setMounted(true);
    loadDurationsAndPrefs();
  }, []);

  // Fetches user details and sets initial durations/preferences
  const loadDurationsAndPrefs = async () => {
    const res = await fetchUserDetails();
    // In this revised logic, we are not fetching all sessions for initial duration setting,
    // as dynamic adjustments are now based only on the immediate last session.
    // Initial load will use saved user preferences or defaults.

    if (res.success) {
      const prefs = res.user.preferences || {};

      // Set durations from user preferences or fall back to defaults
      setFocusDuration(prefs.focusDuration || 25);
      setShortBreak(prefs.shortBreakDuration || 5);
      setLongBreak(prefs.longBreakDuration || 15);
      setPreferences({
        autoStartBreaks: prefs.autoStartBreaks ?? false, // Use nullish coalescing for default false
        autoStartPomodoros: prefs.autoStartPomodoros ?? false,
        notifications: prefs.notifications ?? false,
        soundEffects: prefs.soundEffects ?? false,
      });
    }
    setLoading(false); // Finished loading initial data
  };

  // Main timer logic: decrement timeLeft, update progress, trigger focus prediction
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(async () => {
        const nextTime = timeLeft - 1;
        setTimeLeft(nextTime);
        setProgress((nextTime / getCurrentDuration()) * 100); // Update progress for the circle

        // Logic for triggering focus state prediction every full minute during a pomodoro
        // `nextTime % 60 === 0` checks if it's a new whole minute mark (e.g., 24:00, 23:00)
        // `nextTime !== getCurrentDuration()` prevents a prediction right at the start (0 seconds elapsed)
        if (mode === "pomodoro" && nextTime % 60 === 0 && nextTime !== getCurrentDuration()) {
          try {
            // Simulate EEG data for the prediction API call
            const mockEEG = Array.from({ length: 6 }, () => Array(320).fill(Math.random()));
            const prediction = await predictFocusState(mockEEG); // Call external API for prediction
            if (prediction.success) {
              setFocusPredictions((prev) => [...prev, prediction.result]); // Add prediction to array
            }
          } catch (error) {
            console.error("Error predicting focus state:", error);
            // Fallback if prediction API fails, using a random outcome
            const fallback = Math.random() > 0.5 ? "focused" : "unfocused";
            setFocusPredictions((prev) => [...prev, fallback]);
          }
          setMinuteCounter((prev) => prev + 1); // Increment minute counter
        }
      }, 1000); // Run every second
    } else if (isActive && timeLeft === 0) {
      // If timer runs out and is active, handle the end of the timer
      handleTimerEnd();
    }

    // Cleanup function: clears the timeout if the component unmounts or dependencies change
    return () => clearTimeout(timerRef.current!);
  }, [isActive, timeLeft, mode, focusDuration, shortBreak, longBreak]); // Dependencies: ensure effect re-runs if these change

  // Resets timeLeft and progress whenever duration settings change (e.g., user updates settings, or adjustment happens)
  useEffect(() => {
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);
    setIsActive(false); // Stop timer when durations change
  }, [focusDuration, shortBreak, longBreak]);

  // Adjusts timeLeft and active state when the mode changes (Pomodoro, Short Break, Long Break)
  useEffect(() => {
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);

    // Prevents auto-start if the mode was changed manually by the user
    if (modeChangedManually.current) {
      setIsActive(false);
      modeChangedManually.current = false;
      return;
    }

    // Auto-start based on preferences
    const prefs = preferencesRef.current;
    if (mode === "pomodoro" && prefs.autoStartPomodoros) {
      setIsActive(true);
    } else if ((mode === "shortBreak" || mode === "longBreak") && prefs.autoStartBreaks) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [mode]);

  // Helper to get the current duration in seconds based on the active mode
  const getCurrentDuration = () => {
    if (mode === "pomodoro") return focusDuration * 60;
    if (mode === "shortBreak") return shortBreak * 60;
    if (mode === "longBreak") return longBreak * 60;
    return 25 * 60; // Default fallback
  };

  // NEW LOGIC FOR DYNAMIC DURATION ADJUSTMENT based on current session's focus ratio
  const adjustDurations = async (currentSessionFocusPredictions: string[]) => {
    const totalPredictions = currentSessionFocusPredictions.length;
    if (totalPredictions === 0) {
      console.warn("No focus predictions for the last session, no duration adjustment.");
      return;
    }

    const focusedCount = currentSessionFocusPredictions.filter((p) => p === "focused").length;
    // Calculate the ratio of focused minutes within THIS specific Pomodoro session
    const ratio = focusedCount / totalPredictions; 

    const latestDuration = focusDuration; // Get the current focus duration

    // NEW ADJUSTMENT FORMULA: Allows for both increase and decrease
    const maxAdjustmentPerSession = 5; // Max 5 minutes up or down in one session
    const adjustmentFactor = maxAdjustmentPerSession * 2; // Scales the (ratio - 0.5) to give +/- maxAdjustmentPerSession
    
    // (ratio - 0.5):
    // - If ratio = 1 (100% focused), this is +0.5
    // - If ratio = 0.5 (50% focused), this is 0
    // - If ratio = 0 (0% focused), this is -0.5
    const adjustmentAmount = (ratio - 0.5) * adjustmentFactor;

    let newCalculatedFocus = latestDuration + adjustmentAmount;
    
    // CLAMPING: Ensure new duration is within 15 to 35 minutes
    const clampedFocus = Math.min(35, Math.max(15, Math.round(newCalculatedFocus * 100) / 100));

    // Calculate new break durations proportionally based on the new clamped focus
    const newShort = Math.round((clampedFocus / 5) * 100) / 100;
    const newLong = Math.round((clampedFocus * 3 / 5) * 100) / 100;

    // Update state with new durations
    setFocusDuration(clampedFocus);
    setShortBreak(newShort);
    setLongBreak(newLong);

    // Save the updated preferences to the user's profile in the database
    if (user) {
      try {
        await updateUserProfile({
          name: user.name!, // Assuming user.name is always available if user exists
          email: user.email, // Assuming user.email is always available
          preferences: {
            ...preferencesRef.current, // Keep existing preferences
            focusDuration: clampedFocus,
            shortBreakDuration: newShort,
            longBreakDuration: newLong,
          },
        });
      } catch (err) {
        console.error("Failed to update user profile with new durations", err);
      }
    }

    // Set the time for the NEXT mode to start with the newly adjusted duration
    const durationInSec =
      (mode === "pomodoro" ? clampedFocus : mode === "shortBreak" ? newShort : newLong) * 60;
    setTimeLeft(Math.round(durationInSec));
    setProgress(100);
  };

  // Handles actions when the timer reaches zero
  const handleTimerEnd = async () => {
    setIsActive(false); // Stop the timer

    if (mode === "pomodoro") {
      const focusedCount = focusPredictions.filter((p) => p === "focused").length;
      // Determine overall result for this specific Pomodoro session (for saving & notification)
      const sessionResult: "focused" | "unfocused" =
        focusedCount >= Math.ceil(focusPredictions.length / 2) ? "focused" : "unfocused";

      // Save this session's result and duration to the database
      await saveSession(sessionResult, getCurrentDuration());

      // Adjust durations for the NEXT Pomodoro based on THIS session's predictions
      await adjustDurations(focusPredictions); // Pass the raw predictions array

      // Handle browser notifications
      if (preferencesRef.current.notifications && "Notification" in window) {
        const notify = () =>
          new Notification("Pomodoro done", { body: `You were ${sessionResult}` });

        if (Notification.permission === "granted") notify();
        else Notification.requestPermission().then((perm) => perm === "granted" && notify());
      }
    }

    // Clear predictions and minute counter for the next cycle
    setFocusPredictions([]);
    setMinuteCounter(0);

    // Transition to the next mode (e.g., Pomodoro -> Short Break -> Pomodoro etc.)
    // NOTE: The current logic `shortBreak >= longBreak ? "shortBreak" : "longBreak"`
    // will always choose shortBreak if its duration is >= longBreak.
    // A more typical Pomodoro cycle is Pomodoro -> Short Break (x3) -> Pomodoro -> Long Break.
    // You might want to implement a counter for pomodoros to switch to long break
    // after a certain number of short breaks.
    setMode(
      mode === "pomodoro"
        ? "shortBreak" // Simplified for this example, always goes to short break
        : "pomodoro"
    );
  };

  // Toggles the timer's active state (play/pause)
  const toggleTimer = () => setIsActive((prev) => !prev);

  // Resets the timer to its current mode's full duration and stops it
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(Math.round(getCurrentDuration()));
    setProgress(100);
    setFocusPredictions([]); // Clear predictions on reset
    setMinuteCounter(0);
  };

  // Formats seconds into MM:SS string
  const formatTime = (s: number) => {
    const totalSeconds = Math.round(s);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // UI styling variables
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const isDarkMode = mounted && (resolvedTheme === "dark" || theme === "dark");
  const textClass = isDarkMode ? "text-white drop-shadow-md" : "text-blue-600 font-bold";

  // Render nothing until component is mounted and data is loaded
  if (loading || !mounted) return null;

  return (
    <Card
      className={cn(
        "w-full max-w-md mx-auto border-2",
        isDarkMode
          ? "bg-black/40 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          : "bg-white/80 border-blue-200 shadow-md"
      )}
    >
      <CardContent className="p-6 flex flex-col items-center">
        {/* Tabs for selecting timer mode */}
        <Tabs
          value={mode}
          onValueChange={(v) => {
            modeChangedManually.current = true; // Mark as manual change
            setMode(v as TimerMode);
          }}
          className="w-full mb-6"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Circular Progress Timer Display */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full" viewBox="0 0 256 256">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              strokeWidth="4"
              stroke="rgba(168,85,247,0.1)"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              strokeWidth="4"
              stroke="rgba(168,85,247,0.8)"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 128 128)" // Start from top
              className="transition-all duration-1000" // Smooth transition for progress
            />
          </svg>
          {/* Time text in the center */}
          <div className={`text-5xl tabular-nums z-10 ${textClass}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex gap-4 mb-6">
          <Button onClick={toggleTimer} aria-label={isActive ? "Pause timer" : "Play timer"}>
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button variant="outline" onClick={resetTimer} aria-label="Reset timer">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Current Duration Display */}
        <div className="w-full text-center mt-2">
          <Label className="text-muted-foreground">
            {mode === "pomodoro" && (
              <>
                Focus Duration: <strong>{Math.floor(focusDuration)} min {Math.round((focusDuration % 1) * 60)} sec</strong>
              </>
            )}
            {mode === "shortBreak" && (
              <>
                Short Break: <strong>{Math.floor(shortBreak)} min {Math.round((shortBreak % 1) * 60)} sec</strong>
              </>
            )}
            {mode === "longBreak" && (
              <>
                Long Break: <strong>{Math.floor(longBreak)} min {Math.round((longBreak % 1) * 60)} sec</strong>
              </>
            )}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}