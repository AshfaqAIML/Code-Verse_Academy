"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type Props = {
  nextPath: string;
};

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function doLogin(token: string, user: { name: string; email: string; role: string }, router: ReturnType<typeof useRouter>, nextPath: string) {
  window.localStorage.setItem("codeverse-token", token);
  window.localStorage.setItem("codeverse-user", JSON.stringify(user));
  window.dispatchEvent(new Event("codeverse-auth"));
  fetch("/api/auth/streak", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }).catch(() => {});
  router.push(nextPath);
  router.refresh();
}

function LoginFormInner({ nextPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const clientId = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : undefined;

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Google sign-in failed.");
      }

      doLogin(data.token, data.user, router, nextPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }, [router, nextPath]);

  async function handleGoogleSignIn() {
    if (!clientId) return;
    setGoogleLoading(true);

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
        });
        (window.google.accounts.id as any).prompt?.();
        setTimeout(() => setGoogleLoading(false), 3000);
      } else {
        setGoogleLoading(false);
      }
    };
    script.onerror = () => setGoogleLoading(false);
    document.body.appendChild(script);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      doLogin(data.token, data.user, router, nextPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/20 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">CodeVerse Academy</h1>
          <p className="text-sm text-slate-400 mt-1">Your personal productivity operating system</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to continue your journey</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition placeholder:text-slate-600"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 pr-10 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition placeholder:text-slate-600"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-slate-400 hover:text-cyan-400 transition">
                Forgot password?
              </Link>
            </div>

            {error ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <button
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900/60 px-3 text-xs text-slate-500">Or</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || !clientId}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              GOOGLE_ICON
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-cyan-400 hover:text-cyan-300 transition" href="/register">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginForm({ nextPath }: Props) {
  return <LoginFormInner nextPath={nextPath} />;
}
