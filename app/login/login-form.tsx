"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Github, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";

type Props = {
  nextPath: string;
};

export default function LoginForm({ nextPath }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      window.localStorage.setItem("codeverse-token", data.token);
      window.localStorage.setItem("codeverse-user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("codeverse-auth"));
      router.push(nextPath);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
            <p className="text-3xl font-black">21 days</p>
            <p className="text-sm text-slate-300">current learning streak</p>
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
          <button type="button" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-black dark:border-slate-800">
            <Github className="size-5" /> Continue with GitHub
          </button>
          <p className="mt-6 text-center text-sm text-slate-500">
            New here? <Link className="font-black text-brand-700 dark:text-cyan-300" href="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
