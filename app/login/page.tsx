import type { ReactNode } from "react";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = Array.isArray(resolvedSearchParams?.next) ? resolvedSearchParams?.next[0] : resolvedSearchParams?.next;

  return <LoginForm nextPath={typeof nextPath === "string" && nextPath.trim() ? nextPath : "/dashboard"} />;
}
