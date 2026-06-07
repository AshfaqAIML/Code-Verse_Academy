"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Languages, LogOut, Menu, Moon, PanelLeftOpen, Sparkles, Sun, UserCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/data";
import { useTheme } from "@/components/theme-provider";
import { GlobalSearch } from "@/components/global-search";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [practicePanelOpen, setPracticePanelOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);
  const { theme, toggleTheme } = useTheme();
  const isWorkspaceRoute = pathname.startsWith("/practice") || pathname.startsWith("/playground");
  const hideDesktopSidebar = isWorkspaceRoute && !practicePanelOpen;

  useEffect(() => {
    let cancelled = false;

    const syncAuth = async () => {
      const token = window.localStorage.getItem("codeverse-token");
      if (!token) {
        if (!cancelled) setSignedIn(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          window.localStorage.removeItem("codeverse-token");
          window.localStorage.removeItem("codeverse-user");
          if (!cancelled) setSignedIn(false);
          return;
        }

        if (!cancelled) setSignedIn(true);
      } catch {
        if (!cancelled) setSignedIn(Boolean(window.localStorage.getItem("codeverse-token")));
      }
    };

    void syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener("codeverse-auth", syncAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("codeverse-auth", syncAuth);
    };
  }, [pathname]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const enteringPlayground = pathname.startsWith("/playground") && !previousPath.startsWith("/playground");

    if (enteringPlayground) {
      setPracticePanelOpen(false);
      setOpen(false);
    }

    if (!isWorkspaceRoute) {
      setPracticePanelOpen(false);
    }

    previousPathRef.current = pathname;
  }, [isWorkspaceRoute, pathname]);

  function handleLogout() {
    window.localStorage.removeItem("codeverse-token");
    window.localStorage.removeItem("codeverse-user");
    window.dispatchEvent(new Event("codeverse-auth"));
  }

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/70 bg-white/90 px-4 py-5 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-black/20 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${hideDesktopSidebar ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-11 place-items-center rounded-xl bg-ink text-white dark:bg-white dark:text-ink">
              <Sparkles className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">CodeVerse</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
                Academy
              </span>
            </span>
          </Link>
          <button
            aria-label="Close navigation"
            className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 ${hideDesktopSidebar ? "lg:block" : "lg:hidden"}`}
            onClick={() => {
              setOpen(false);
              setPracticePanelOpen(false);
            }}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-7 rounded-2xl border border-cyan-200/70 bg-cyan-50/80 p-4 text-sm dark:border-cyan-900/60 dark:bg-cyan-950/30">
          <p className="font-semibold text-cyan-900 dark:text-cyan-100">Today&apos;s path</p>
          <p className="mt-1 text-cyan-800/80 dark:text-cyan-200/70">React hooks, SQL windows, ML metrics</p>
          <div className="mt-3 h-2 rounded-full bg-white dark:bg-slate-900">
            <div className="h-2 w-[68%] rounded-full bg-brand-500" />
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  setPracticePanelOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-ink text-white shadow-lg shadow-slate-300/40 dark:bg-white dark:text-ink dark:shadow-black/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={hideDesktopSidebar ? "lg:pl-0" : "lg:pl-72"}>
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-paper/82 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/82">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            {hideDesktopSidebar ? (
              <button
                aria-label="Back to main panel"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                onClick={() => {
                  setPracticePanelOpen(true);
                  setOpen(true);
                }}
              >
                <PanelLeftOpen className="size-4" />
                Back to panel
              </button>
            ) : (
              <button
                aria-label="Open navigation"
                className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden"
                onClick={() => {
                  setOpen(true);
                  setPracticePanelOpen(true);
                }}
              >
                <Menu className="size-5" />
              </button>
            )}
            <GlobalSearch />
            <button
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white md:flex"
              aria-label="Change language"
            >
              <Languages className="size-4" />
              EN
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:text-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:text-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            {signedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink"
                >
                  <UserCircle className="size-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:text-ink dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Log out"
                >
                  <LogOut className="size-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-ink"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
