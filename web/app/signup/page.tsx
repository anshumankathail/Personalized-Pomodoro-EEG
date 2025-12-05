// ✅ File: app/signup/page.tsx
"use client";

import { SignupForm } from "@/components/signup-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Pomodoro App</h1>
          <p className="text-muted-foreground mt-2">Create a new account</p>
        </div>
        <SignupForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
