"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Clock, Moon, Settings, Sun, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove stored token
    sessionStorage.clear(); // Optional: clear session storage too
    router.push("/login"); // Redirect to login
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/80 dark:border-slate-800">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/dashboard/timer">
                  <Button
                    variant={isActive("/dashboard/timer") ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Timer
                  </Button>
                </Link>
                <Link href="/dashboard/history">
                  <Button
                    variant={isActive("/dashboard/history") ? "default" : "ghost"}
                    className="justify-start w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Session History
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 dark:from-primary dark:to-purple-400">
              FoCoMo
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard/timer">
            <Button variant={isActive("/dashboard/timer") ? "default" : "ghost"}>
              Timer
            </Button>
          </Link>
          <Link href="/dashboard/history">
            <Button variant={isActive("/dashboard/history") ? "default" : "ghost"}>
              Session History
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <Link href="/dashboard/settings" passHref legacyBehavior>
                <DropdownMenuItem asChild>
                  <a className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
