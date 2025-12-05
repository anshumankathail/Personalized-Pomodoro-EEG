"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-provider";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PUBLIC_PATHS = ["/login", "/signup"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isLoading && !user && !isPublicPath) {
      router.push("/login");
    }

    if (!isLoading && user && isPublicPath) {
      router.push("/");
    }
  }, [user, isLoading, router, pathname, isPublicPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}