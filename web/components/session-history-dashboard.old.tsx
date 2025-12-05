"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchAllSessions } from "@/lib/api";
import DetailedAnalyticsChart from "@/components/DetailedAnalyticsChart";

type Session = {
  _id: string;
  result: "focused" | "unfocused";
  duration: number;
  timestamp: string;
};

export function SessionHistory() {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    const loadSessions = async () => {
      const res = await fetchAllSessions();
      if (res.success) {
        setSessions(res.sessions);
      }
    };
    loadSessions();
  }, []);

  const getFilteredSessions = () => {
    const daysMap = { week: 7, month: 30, year: 365 };
    const days = daysMap[timeRange];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return sessions.filter((s) => new Date(s.timestamp) >= cutoff);
  };

  const filtered = getFilteredSessions();
  const focusSessions = filtered.filter((s) => s.result === "focused");
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const avgFocusRate = filtered.length
    ? Math.round((focusSessions.length / filtered.length) * 100)
    : 0;

  const chartData = Array(7).fill(0);
  filtered.forEach((s) => {
    const day = new Date(s.timestamp).getDay();
    chartData[day] += s.duration;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const hr = Math.floor(min / 60);
    const rem = min % 60;
    return hr > 0 ? `${hr}h ${rem}m` : `${rem}m`;
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Session History</h2>
        <Select defaultValue="week" onValueChange={(value) => setTimeRange(value as "week" | "month" | "year")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Focus Sessions */}
        <Card className={cn("overflow-hidden", theme === "dark" ? "bg-black/40 border-purple-500/30" : "bg-white/80 border-blue-200")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Focus Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{focusSessions.length}</div>
            <p className="text-sm text-muted-foreground">{timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This year"}</p>
          </CardContent>
        </Card>

        {/* Focus Time */}
        <Card className={cn("overflow-hidden", theme === "dark" ? "bg-black/40 border-purple-500/30" : "bg-white/80 border-blue-200")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Focus Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(totalFocusTime)}</div>
            <p className="text-sm text-muted-foreground">{timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This year"}</p>
          </CardContent>
        </Card>

        {/* Average Focus */}
        <Card className={cn("overflow-hidden", theme === "dark" ? "bg-black/40 border-purple-500/30" : "bg-white/80 border-blue-200")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgFocusRate}%</div>
            <p className="text-sm text-muted-foreground">{timeRange === "week" ? "This week" : timeRange === "month" ? "This month" : "This year"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Sessions Table */}
        <TabsContent value="sessions">
          <Card className={cn("overflow-hidden", theme === "dark" ? "bg-black/40 border-purple-500/30" : "bg-white/80 border-blue-200")}>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell>{formatDate(s.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={s.result === "focused" ? "default" : "secondary"}>{s.result}</Badge>
                      </TableCell>
                      <TableCell>{formatDuration(s.duration)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Analytics */}
        <TabsContent value="analytics">
          <Card className={cn("overflow-hidden", theme === "dark" ? "bg-black/40 border-purple-500/30" : "bg-white/80 border-blue-200")}>
            <CardContent className="p-6">
              <DetailedAnalyticsChart sessions={filtered} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}