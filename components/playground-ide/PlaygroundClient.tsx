"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PlaygroundIDE = dynamic(() => import("./PlaygroundIDE"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[80vh] items-center justify-center bg-slate-900 text-white">
      <div className="animate-pulse">Loading CodeVerse IDE...</div>
    </div>
  )
});

type PlaygroundClientProps = {
  projectId?: string;
};

type PlaygroundSession = {
  token: string | null;
  user: { email: string; name: string; role: string } | null;
  ready: boolean;
};

function readSession(): PlaygroundSession {
  if (typeof window === "undefined") {
    return { token: null, user: null, ready: false };
  }

  const token = window.localStorage.getItem("codeverse-token");
  const rawUser = window.localStorage.getItem("codeverse-user");

  try {
    return {
      token,
      user: rawUser ? JSON.parse(rawUser) : null,
      ready: true
    };
  } catch {
    return {
      token,
      user: null,
      ready: true
    };
  }
}

export default function PlaygroundClient({ projectId }: PlaygroundClientProps) {
  const [session, setSession] = useState<PlaygroundSession>({ token: null, user: null, ready: false });

  useEffect(() => {
    const syncSession = () => setSession(readSession());
    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("codeverse-auth", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("codeverse-auth", syncSession);
    };
  }, []);

  return (
    <PlaygroundIDE
      projectId={projectId}
      user={session.user ? { ...session.user, token: session.token ?? undefined } : undefined}
      isAuthenticated={Boolean(session.token && session.user)}
    />
  );
}
