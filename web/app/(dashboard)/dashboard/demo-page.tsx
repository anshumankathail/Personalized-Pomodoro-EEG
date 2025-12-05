"use client";

import FocusMonitor from "@/components/focus-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PRESET_STANDARD,
  PRESET_FAST,
  PRESET_SLOW,
  PRESET_HIGH_FREQUENCY,
  PRESET_DEMO,
} from "@/lib/focus-presets";

/**
 * Demo page showing different Focus Monitor configurations side by side
 * Use this to test different presets and see which works best
 * 
 * To use: Create a new route or temporarily replace the dashboard page
 */
export default function FocusMonitorDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Focus Monitor Demo</h1>
        <p className="text-muted-foreground">
          Compare different update frequencies and configurations
        </p>
      </div>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="fast">Fast</TabsTrigger>
          <TabsTrigger value="slow">Slow</TabsTrigger>
          <TabsTrigger value="high">High Freq</TabsTrigger>
          <TabsTrigger value="demo">Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Preset</CardTitle>
              <CardDescription>
                5 checks per minute (every 12 seconds) • Shows 3 minutes of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Recommended for normal usage. Balanced between responsiveness and API load.
              </p>
            </CardContent>
          </Card>
          <FocusMonitor config={PRESET_STANDARD} />
        </TabsContent>

        <TabsContent value="fast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fast Preset</CardTitle>
              <CardDescription>
                10 checks per minute (every 6 seconds) • Shows 3 minutes of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                More responsive updates. Good for real-time monitoring during active sessions.
              </p>
            </CardContent>
          </Card>
          <FocusMonitor config={PRESET_FAST} />
        </TabsContent>

        <TabsContent value="slow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow Preset</CardTitle>
              <CardDescription>
                3 checks per minute (every 20 seconds) • Shows 3 minutes of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Reduced API calls. Use when you want less frequent updates or to conserve resources.
              </p>
            </CardContent>
          </Card>
          <FocusMonitor config={PRESET_SLOW} />
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High Frequency Preset</CardTitle>
              <CardDescription>
                12 checks per minute (every 5 seconds) • Shows 2 minutes of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Very responsive. Best for research or when you need granular data.
              </p>
            </CardContent>
          </Card>
          <FocusMonitor config={PRESET_HIGH_FREQUENCY} />
        </TabsContent>

        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demo Preset</CardTitle>
              <CardDescription>
                20 checks per minute (every 3 seconds) • Shows 1 minute of data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Extremely fast updates. Great for demonstrations and testing.
              </p>
            </CardContent>
          </Card>
          <FocusMonitor config={PRESET_DEMO} />
        </TabsContent>
      </Tabs>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Comparison</CardTitle>
          <CardDescription>Quick reference for all available presets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Preset</th>
                  <th className="text-left p-2">Updates/Min</th>
                  <th className="text-left p-2">Interval</th>
                  <th className="text-left p-2">Data Points</th>
                  <th className="text-left p-2">Time Shown</th>
                  <th className="text-left p-2">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Standard</td>
                  <td className="p-2">5</td>
                  <td className="p-2">12s</td>
                  <td className="p-2">15</td>
                  <td className="p-2">3 min</td>
                  <td className="p-2">General use</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Fast</td>
                  <td className="p-2">10</td>
                  <td className="p-2">6s</td>
                  <td className="p-2">30</td>
                  <td className="p-2">3 min</td>
                  <td className="p-2">Active sessions</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Slow</td>
                  <td className="p-2">3</td>
                  <td className="p-2">20s</td>
                  <td className="p-2">9</td>
                  <td className="p-2">3 min</td>
                  <td className="p-2">Low frequency</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">High Frequency</td>
                  <td className="p-2">12</td>
                  <td className="p-2">5s</td>
                  <td className="p-2">24</td>
                  <td className="p-2">2 min</td>
                  <td className="p-2">Research</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Demo</td>
                  <td className="p-2">20</td>
                  <td className="p-2">3s</td>
                  <td className="p-2">20</td>
                  <td className="p-2">1 min</td>
                  <td className="p-2">Demonstrations</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Long History</td>
                  <td className="p-2">5</td>
                  <td className="p-2">12s</td>
                  <td className="p-2">25</td>
                  <td className="p-2">5 min</td>
                  <td className="p-2">Extended view</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Short History</td>
                  <td className="p-2">10</td>
                  <td className="p-2">6s</td>
                  <td className="p-2">10</td>
                  <td className="p-2">1 min</td>
                  <td className="p-2">Quick glance</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="font-bold text-primary">•</div>
              <div>
                <strong>For production:</strong> Start with PRESET_STANDARD and adjust based on user feedback
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold text-primary">•</div>
              <div>
                <strong>For demos:</strong> Use PRESET_DEMO to show quick state changes
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold text-primary">•</div>
              <div>
                <strong>For research:</strong> Use PRESET_HIGH_FREQUENCY for granular data
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold text-primary">•</div>
              <div>
                <strong>API rate limits:</strong> Use slower presets to reduce server load
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-bold text-primary">•</div>
              <div>
                <strong>Custom needs:</strong> Use <code className="px-1 py-0.5 rounded bg-muted">createCustomPreset()</code> for specific requirements
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
