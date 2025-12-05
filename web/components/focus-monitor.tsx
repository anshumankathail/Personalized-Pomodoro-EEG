"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings, Upload, X, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FocusState,
  FocusDataPoint,
  FocusMonitorConfig,
  DEFAULT_FOCUS_CONFIG,
  fetchFocusFromAPI,
} from "@/lib/focus-config";
import { useTimer } from "@/lib/timer-context";
import { FileDataManager } from "@/lib/file-data-manager";
import { useToast } from "@/hooks/use-toast";
import { predictFocusState } from "@/lib/api";

interface FocusMonitorProps {
  /** Configuration object (optional, uses defaults if not provided) */
  config?: Partial<FocusMonitorConfig>;
  /** Custom function to fetch focus data (overrides API endpoint) */
  fetchFocusData?: () => Promise<FocusState>;
  /** Callback when focus state changes */
  onFocusChange?: (focus: FocusState) => void;
  /** Callback when monitoring starts/stops */
  onMonitoringStateChange?: (isMonitoring: boolean) => void;
}

export default function FocusMonitor({
  config,
  fetchFocusData,
  onFocusChange,
  onMonitoringStateChange,
}: FocusMonitorProps) {
  const { isTimerActive, triggerFocusUpdate } = useTimer();

  // Merge provided config with defaults
  const finalConfig: FocusMonitorConfig = {
    ...DEFAULT_FOCUS_CONFIG,
    ...config,
  };

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [focusData, setFocusData] = useState<FocusDataPoint[]>([]);
  const [currentFocus, setCurrentFocus] = useState<FocusState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileDataManager] = useState(() => new FileDataManager(320));
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isFileMode, setIsFileMode] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get random focus state (fallback when no API is provided)
  const getRandomFocusState = (): FocusState => {
    return Math.random() > 0.5 ? 1 : 0;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await fileDataManager.loadFile(file);
      setUploadedFileName(file.name);
      setIsFileMode(true);
      fileDataManager.reset();
      setCurrentPrediction(null);
      
      toast({
        title: "File loaded successfully",
        description: `${fileDataManager.getTotalRows()} rows loaded from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Error loading file",
        description: error instanceof Error ? error.message : "Failed to load file",
        variant: "destructive",
      });
    }
  };

  // Remove uploaded file and reset state
  const handleRemoveFile = () => {
    setUploadedFileName(null);
    setIsFileMode(false);
    setCurrentPrediction(null);
    fileDataManager.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Generate fake EEG data for testing
  const generateFakeEEGData = (): number[][] => {
    if (isFileMode && fileDataManager.hasData()) {
      const windowData = fileDataManager.getNext6Rows();
      if (windowData) {
        return windowData;
      }
      // If no more data, loop back
      fileDataManager.reset();
      return fileDataManager.getNext6Rows() || Array(6).fill(null).map(() => 
        Array(320).fill(0).map(() => Math.random() * 2 - 1)
      );
    }
    
    // Demo mode: random data (normalized between -1 and 1)
    return Array(6).fill(null).map(() => 
      Array(320).fill(0).map(() => Math.random() * 2 - 1)
    );
  };

  // Fetch focus state from API or use random fallback
  const getFocusState = async (): Promise<FocusState> => {
    setIsLoading(true);
    try {
      // Priority 1: Use file-based prediction if in file mode
      if (isFileMode) {
        const fakeData = generateFakeEEGData();
        const response = await predictFocusState(fakeData);

        if (response.success && response.result) {
          const prediction = response.result;
          setCurrentPrediction(prediction);
          return prediction === 'focused' ? 1 : 0;
        }
      }

      // Priority 2: Use custom fetch function if provided
      if (fetchFocusData) {
        const result = await fetchFocusData();
        return result;
      }

      // Priority 3: Use API endpoint if configured
      if (finalConfig.useAPI && finalConfig.apiEndpoint) {
        const result = await fetchFocusFromAPI(
          finalConfig.apiEndpoint,
          finalConfig.apiHeaders
        );
        return result;
      }

      // Priority 4: Fall back to random data
      return getRandomFocusState();
    } catch (error) {
      console.error("Error fetching focus data:", error);
      return getRandomFocusState();
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new data point to the graph
  const addDataPoint = async () => {
    const focus = await getFocusState();
    const dataPoint: FocusDataPoint = {
      timestamp: Date.now(),
      focus,
    };

    setCurrentFocus(focus);
    
    // Call the onChange callback if provided
    if (onFocusChange) {
      onFocusChange(focus);
    }

    setFocusData((prev) => {
      const updated = [...prev, dataPoint];
      // Keep only the most recent maxDataPoints
      if (updated.length > finalConfig.maxDataPoints) {
        return updated.slice(updated.length - finalConfig.maxDataPoints);
      }
      return updated;
    });
  };

  // Start monitoring
  const handleStart = () => {
    setIsMonitoring(true);
    if (onMonitoringStateChange) {
      onMonitoringStateChange(true);
    }
    // Immediately get first data point
    addDataPoint();
  };

  // Pause monitoring
  const handlePause = () => {
    setIsMonitoring(false);
    if (onMonitoringStateChange) {
      onMonitoringStateChange(false);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Send focus percentage to timer when pausing
    if (focusData.length > 0) {
      const focusPercentage = Math.round(
        (focusData.filter((d) => d.focus === 1).length / focusData.length) * 100
      );
      triggerFocusUpdate(focusPercentage);
    }
  };

  // Stop monitoring (called by timer context)
  const handleStop = () => {
    handlePause();
  };

  // Reset monitoring
  const handleReset = () => {
    handlePause();
    setFocusData([]);
    setCurrentFocus(null);
  };

  // Set up interval when monitoring starts
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        addDataPoint();
      }, finalConfig.updateInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, finalConfig.updateInterval, isFileMode]);

  // Add this effect to sync with timer
  useEffect(() => {
    if (isTimerActive && !isMonitoring) {
      handleStart();
    } else if (!isTimerActive && isMonitoring) {
      handleStop();
    }
  }, [isTimerActive]);

  // Calculate focus statistics
  const focusStats = {
    total: focusData.length,
    focused: focusData.filter((d) => d.focus === 1).length,
    percentage:
      focusData.length > 0
        ? Math.round((focusData.filter((d) => d.focus === 1).length / focusData.length) * 100)
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Mode Indicator & File Upload */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isFileMode ? 'bg-green-500' : 'bg-blue-500'} animate-pulse`} />
          <span className="text-sm font-medium">
            {isFileMode ? 'File Mode' : 'Demo Mode'}
          </span>
          {isFileMode && uploadedFileName && (
            <span className="text-xs text-muted-foreground">
              (Row {fileDataManager.getCurrentIndex()} / {fileDataManager.getTotalRows()})
            </span>
          )}
          {currentPrediction && (
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              currentPrediction === 'focused' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
              {currentPrediction.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {uploadedFileName ? (
            <div className="flex items-center gap-2 text-sm bg-background px-3 py-1.5 rounded-md border">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="max-w-[150px] truncate">{uploadedFileName}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={handleRemoveFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV/XLSX
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-time focus tracking</span>
            <div className="flex items-center gap-2">
              {!isMonitoring ? (
                <Button
                  onClick={handleStart}
                  size="sm"
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  size="sm"
                  variant="secondary"
                  className="gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Updates every {finalConfig.updateInterval}s
            {finalConfig.useAPI && finalConfig.apiEndpoint && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                API Connected
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">Current State:</span>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-3 w-3 rounded-full bg-muted-foreground animate-pulse" />
              ) : (
                <div
                  className={cn(
                    "h-3 w-3 rounded-full transition-colors",
                    currentFocus === 1
                      ? "bg-green-500 shadow-lg shadow-green-500/50"
                      : currentFocus === 0
                      ? "bg-red-500 shadow-lg shadow-red-500/50"
                      : "bg-muted-foreground"
                  )}
                />
              )}
              <span className="font-semibold">
                {isLoading
                  ? "Checking..."
                  : currentFocus === 1
                  ? "Focused"
                  : currentFocus === 0
                  ? "Unfocused"
                  : "Not Started"}
              </span>
            </div>
          </div>

          {/* Focus Stats */}
          {focusData.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{focusStats.total}</div>
                <div className="text-xs text-muted-foreground">Total Checks</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {focusStats.focused}
                </div>
                <div className="text-xs text-muted-foreground">Focused</div>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{focusStats.percentage}%</div>
                <div className="text-xs text-muted-foreground">Focus Rate</div>
              </div>
            </div>
          )}

          {/* Graph */}
          <div className="relative h-48 border rounded-lg bg-card p-4">
            {focusData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Start monitoring to see focus data
              </div>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid lines */}
                <line
                  x1="0"
                  y1="50"
                  x2="100"
                  y2="50"
                  stroke="currentColor"
                  strokeWidth="0.2"
                  opacity="0.3"
                  className="text-muted-foreground"
                />
                <line
                  x1="0"
                  y1="10"
                  x2="100"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="0.2"
                  opacity="0.3"
                  className="text-muted-foreground"
                />
                <line
                  x1="0"
                  y1="90"
                  x2="100"
                  y2="90"
                  stroke="currentColor"
                  strokeWidth="0.2"
                  opacity="0.3"
                  className="text-muted-foreground"
                />

                {/* Data visualization using step function for binary data */}
                {focusData.map((point, index) => {
                  const x = (index / (finalConfig.maxDataPoints - 1)) * 100;
                  const y = point.focus === 1 ? 10 : 90;
                  const nextX = index < focusData.length - 1 
                    ? ((index + 1) / (finalConfig.maxDataPoints - 1)) * 100 
                    : 100;
                
                  return (
                    <g key={point.timestamp}>
                      {/* Horizontal line (current state) */}
                      <line
                        x1={x}
                        y1={y}
                        x2={nextX}
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={cn(
                          "transition-all",
                          point.focus === 1 ? "text-green-500" : "text-red-500"
                        )}
                      />
                    
                      {/* Vertical line (state transition) */}
                      {index < focusData.length - 1 && 
                       focusData[index + 1].focus !== point.focus && (
                        <line
                          x1={nextX}
                          y1={y}
                          x2={nextX}
                          y2={focusData[index + 1].focus === 1 ? 10 : 90}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="2,2"
                          opacity="0.5"
                          className={cn(
                            "transition-all",
                            focusData[index + 1].focus === 1 ? "text-green-500" : "text-red-500"
                          )}
                        />
                      )}
                    
                      {/* Data point circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="currentColor"
                        className={cn(
                          "transition-all",
                          point.focus === 1
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Focused (1)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>Unfocused (0)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
