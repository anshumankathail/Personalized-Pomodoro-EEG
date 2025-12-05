// app/dashboard/history/page.tsx
"use client";
import { SessionHistory } from "@/components/session-history"; // ✅ correct

export default function HistoryPage() {
  return (
    <div className="p-6">
      <SessionHistory />
    </div>
  );
}
