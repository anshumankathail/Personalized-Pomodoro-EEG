'use client';

import type React from "react";
import { Navbar } from "@/components/navbar"; // <-- Named import here
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
