"use client";

import { Copy, Link2 } from "lucide-react";
import { useState } from "react";

type CopyLinkButtonProps = {
  id: string;
  className?: string;
};

export function CopyLinkButton({ id, className = "" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).catch(() => undefined);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy link to this section"
      title="Copy link to this section"
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-cyan-300 ${className}`}
    >
      {copied ? <Link2 className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Link"}
    </button>
  );
}