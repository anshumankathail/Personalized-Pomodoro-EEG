"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface Session {
  _id: string;
  result: "focused" | "unfocused";
  duration: number; // in seconds
  timestamp: string;
}

export default function DetailedAnalyticsChart({ sessions }: { sessions: Session[] }) {
  const data = sessions.map((s) => ({
    timestamp: format(new Date(s.timestamp), "dd MMM, HH:mm"),
    focused: s.result === "focused" ? Math.round(s.duration / 60) : 0,
    unfocused: s.result === "unfocused" ? Math.round(s.duration / 60) : 0,
  }));

  const fontStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: "700", // bold
  };

  return (
    <div className="w-full h-[400px] font-inter">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 30, right: 30, bottom: 70, left: 10 }} // increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            interval={Math.max(Math.floor(data.length / 8), 0)}
            height={70} // increased height to fit rotated labels
            tick={{
              fontSize: 14,
              fill: "#374151",
              fontFamily: fontStyle.fontFamily,
              fontWeight: fontStyle.fontWeight,
            }}
            tickMargin={12}
            angle={-45}       // rotate labels 45 degrees counter-clockwise
            textAnchor="end"  // align text to end for readability
          />
          <YAxis
            label={{
              value: "Duration (min)",
              angle: -90,
              position: "insideLeft",
              fontSize: 14,
              fill: "#374151",
              fontFamily: fontStyle.fontFamily,
              fontWeight: fontStyle.fontWeight,
            }}
            tick={{
              fontSize: 14,
              fill: "#374151",
              fontFamily: fontStyle.fontFamily,
              fontWeight: fontStyle.fontWeight,
            }}
          />
          <Tooltip
            labelStyle={{ fontSize: 14, fontFamily: fontStyle.fontFamily, fontWeight: fontStyle.fontWeight }}
            itemStyle={{ fontSize: 14, fontFamily: fontStyle.fontFamily, fontWeight: fontStyle.fontWeight }}
            formatter={(value: number) => `${value} min`}
          />
          <Legend
            wrapperStyle={{
              fontSize: 16,
              fontFamily: fontStyle.fontFamily,
              fontWeight: fontStyle.fontWeight,
              color: "#4B5563",
              paddingTop: 20,
            }}
          />
          <Line
            type="monotone"
            dataKey="focused"
            stroke="#8B5CF6" // Purple
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#8B5CF6" }}
            name="Focused"
          />
          <Line
            type="monotone"
            dataKey="unfocused"
            stroke="#EF4444" // Red
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#EF4444" }}
            name="Unfocused"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
