"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

type Props = {
  nextPath: string;
};

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
  const [streakData, setStreakData] = useState<{ currentStreak: number; longestStreak: number } | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("codeverse-token");
    if (token) {
      fetch("/api/auth/streak", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => setStreakData(d))
        .catch(() => {});
    }
  }, []);

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

  async function handleGoogleSuccess(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
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
  }

  return (
    <div className="grid min-h-[calc(100svh-4rem)] place-items-center px-4 py-12 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Resume your streak and keep building.</h1>
          <p className="mt-4 leading-7 text-slate-300">This demo now issues signed session tokens and validates them through the shared API layer.</p>
          <div className="mt-10 rounded-2xl bg-white/10 p-5">
            <p className="text-3xl font-black">{streakData ? `${streakData.currentStreak} days` : "—"}</p>
            <p className="text-sm text-slate-300">current learning streak</p>
            <p className="mt-2 text-xs text-slate-400">Best: {streakData ? `${streakData.longestStreak} days` : "—"}</p>
          </div>
        </div>
        <form className="p-8" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-black">Sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use any valid email and password for the demo environment. Admin access can be configured through environment variables.</p>
          <label className="mt-6 block text-sm font-bold">
            Email
            <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800">
              <Mail className="size-4 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="student@codeverse.dev"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </span>
          </label>
          <label className="mt-4 block text-sm font-bold">
            Password
            <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800">
              <Lock className="size-4 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
          </label>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <button
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-ink"
            disabled={loading}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <div className="mt-4">
            {googleLoading ? (
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-black dark:border-slate-800">
                <Loader2 className="size-5 animate-spin" /> Connecting...
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed.")}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                width="100%"
              />
            )}
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 dark:bg-slate-900">or</span></div>
          </div>
          <p className="text-center text-sm text-slate-500">
            New here? <Link className="font-black text-brand-700 dark:text-cyan-300" href="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginForm({ nextPath }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  if (!clientId) return <LoginFormInner nextPath={nextPath} />;
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginFormInner nextPath={nextPath} />
    </GoogleOAuthProvider>
  );
}
