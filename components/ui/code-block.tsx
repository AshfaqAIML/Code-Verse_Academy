"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink, Terminal } from "lucide-react";
import { useMemo, useState } from "react";

type TokenType = "comment" | "string" | "keyword" | "builtin" | "number" | "decorator" | "plain";

type Token = { type: TokenType; text: string };

type LanguageConfig = {
  label: string;
  comment: string;
  string: string;
  keywords: string;
  builtins: string;
  number: string;
  decorator?: string;
};

const CONFIGS: Record<string, LanguageConfig> = {
  python: {
    label: "Python",
    comment: "#[^\n]*",
    string: `("""[\\s\\S]*?"""|'''[\\s\\S]*?'''|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
    keywords:
      "\\b(?:def|class|from|import|if|elif|else|for|while|return|try|except|finally|with|as|in|not|and|or|is|lambda|pass|break|continue|raise|yield|async|await|global|nonlocal|del|assert|None|True|False)\\b",
    builtins:
      "\\b(?:print|len|range|int|float|str|list|dict|set|tuple|sum|max|min|sorted|enumerate|zip|abs|round|open|input|type|isinstance|map|filter|reversed|super|object|property)\\b",
    number: "\\b\\d+(?:\\.\\d+)?\\b",
    decorator: "@[a-zA-Z_][\\w]*"
  },
  sql: {
    label: "SQL",
    comment: "--[^\n]*",
    string: `'(?:[^'\\\\]|\\\\.)*'`,
    keywords:
      "\\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|VIEW|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|ASC|DESC)\\b",
    builtins: "\\b(?:COUNT|SUM|AVG|MIN|MAX)\\b",
    number: "\\b\\d+(?:\\.\\d+)?\\b"
  },
  javascript: {
    label: "JavaScript",
    comment: "\\/\\/[^\\n]*",
    string: `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\\\\\`]|\\\\.)*\`)`,
    keywords:
      "\\b(?:const|let|var|function|return|if|else|for|while|of|in|new|this|class|extends|import|export|from|async|await|try|catch|finally|throw|switch|case|break|continue|typeof|instanceof|null|undefined|true|false|default)\\b",
    builtins: "\\b(?:console|Math|JSON|Object|Array|String|Number|Promise|Set|Map|document|window)\\b",
    number: "\\b\\d+(?:\\.\\d+)?\\b"
  },
  typescript: {
    label: "TypeScript",
    comment: "\\/\\/[^\\n]*",
    string: `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\\\\\`]|\\\\.)*\`)`,
    keywords:
      "\\b(?:const|let|var|function|return|if|else|for|while|of|in|new|this|class|extends|import|export|from|async|await|try|catch|finally|throw|switch|case|break|continue|typeof|instanceof|null|undefined|true|false|default|interface|type|enum|implements|readonly|public|private)\\b",
    builtins: "\\b(?:console|Math|JSON|Object|Array|String|Number|Promise|Set|Map|document|window)\\b",
    number: "\\b\\d+(?:\\.\\d+)?\\b"
  },
  shell: {
    label: "Shell",
    comment: "#[^\n]*",
    string: `("[^"\\\\]*(?:\\\\.[^"\\\\]*)*"|'[^']*')`,
    keywords: "\\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|source|local)\\b",
    builtins: "\\b(?:echo|cd|ls|mkdir|rm|cp|mv|curl|wget|sudo|apt|brew|npm|pnpm|yarn|pip|uv|docker|git|node|python|npx|fnm|rustup|cargo)\\b",
    number: "\\b\\d+\\b"
  },
  text: {
    label: "Text",
    comment: "a^",
    string: "a^",
    keywords: "a^",
    builtins: "a^",
    number: "a^"
  }
};

const TOKEN_CLASSES: Record<TokenType, string> = {
  comment: "text-slate-500 italic",
  string: "text-emerald-300",
  keyword: "text-cyan-300 font-semibold",
  builtin: "text-violet-300",
  number: "text-amber-300",
  decorator: "text-fuchsia-300",
  plain: "text-slate-200"
};

export function detectLanguage(code: string): string {
  const trimmed = code.trimStart();
  if (/^(from |import |def |class |print\(|for |while |if |with |try:|except|lambda |@)/.test(trimmed)) return "python";
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|WITH)\b/i.test(trimmed)) return "sql";
  if (/^(#!\/|echo |curl |wsl |sudo |apt |brew |npm |pnpm |uv |pip |docker |git )/.test(trimmed) || /^#\s*(macos|ubuntu|windows)/i.test(trimmed)) return "shell";
  if (/(interface\s+\w+|type\s+\w+\s*=|\benum\s+\w+|:\s*string\b|:\s*number\b|\bconst\b.*:\s*\w+)/.test(trimmed)) return "typescript";
  if (/^(const |let |var |function |import |export |console\.|<!DOCTYPE|<html|<body|class\s)/.test(trimmed) || /=>/.test(trimmed)) return "javascript";
  return "text";
}

function buildTokenRegex(config: LanguageConfig): RegExp {
  const parts = [
    `(?<comment>${config.comment})`,
    `(?<string>${config.string})`,
    config.decorator ? `(?<decorator>${config.decorator})` : null,
    `(?<keyword>${config.keywords})`,
    `(?<builtin>${config.builtins})`,
    `(?<number>${config.number})`
  ].filter(Boolean);
  return new RegExp(parts.join("|"), "gm");
}

const REGEX_CACHE = new Map<string, RegExp>();

function tokenRegexFor(language: string): RegExp {
  const cached = REGEX_CACHE.get(language);
  if (cached) return cached;
  const config = CONFIGS[language] ?? CONFIGS.text;
  const regex = buildTokenRegex(config);
  REGEX_CACHE.set(language, regex);
  return regex;
}

export function highlightCode(code: string, language: string): Token[] {
  if (language === "text") return [{ type: "plain", text: code }];
  const regex = tokenRegexFor(language);
  const tokens: Token[] = [];
  let lastIndex = 0;
  regex.lastIndex = 0;
  for (const match of code.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "plain", text: code.slice(lastIndex, index) });
    }
    const groups = match.groups as Record<string, string | undefined>;
    const type = (["comment", "string", "decorator", "keyword", "builtin", "number"] as const).find((key) => groups[key] !== undefined) ?? "plain";
    tokens.push({ type, text: match[0] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < code.length) {
    tokens.push({ type: "plain", text: code.slice(lastIndex) });
  }
  return tokens;
}

function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } catch {
    // Copying is best-effort; ignore failures.
  }
  document.body.removeChild(textarea);
}

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  label?: string;
  className?: string;
};

export function CodeBlock({ code, language, showLineNumbers = true, label, className = "" }: CodeBlockProps) {
  const normalized = useMemo(() => normalizeCode(code), [code]);
  const detected = useMemo(() => (language && CONFIGS[language] ? language : detectLanguage(normalized)), [normalized, language]);
  const config = CONFIGS[detected] ?? CONFIGS.text;
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => normalized.split("\n"), [normalized]);
  const isShell = detected === "shell";
  const canRun = detected === "python" || detected === "javascript";

  const runUrl = useMemo(() => {
    if (!canRun) return "";
    try {
      const encoded = btoa(unescape(encodeURIComponent(normalized)));
      return `/python-compiler?code=${encoded}&lang=${detected}`;
    } catch {
      return "";
    }
  }, [canRun, normalized, detected]);

  function handleCopy() {
    copyText(normalized);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <figure className={`my-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 ${className}`}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
          {isShell ? <Terminal className="size-3.5" /> : <span className="size-1.5 rounded-full bg-brand-500" />}
          {label ?? config.label}
        </span>
        <span className="inline-flex items-center gap-1.5">
          {canRun ? (
            <Link
              href={runUrl}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-300 transition hover:bg-slate-800 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ExternalLink className="size-3.5" />
              Run in playground
            </Link>
          ) : null}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </span>
      </figcaption>
      <pre className="max-h-[560px] overflow-auto p-4 text-[13.5px] leading-6">
        <code className="font-mono">
          {lines.map((line, lineIndex) => {
            const tokens = highlightCode(line, detected);
            return (
              <span key={lineIndex} className="block whitespace-pre">
                {showLineNumbers ? (
                  <span className="mr-4 inline-block w-6 select-none text-right text-slate-600">{lineIndex + 1}</span>
                ) : null}
                {tokens.length === 0 ? "\u00a0" : tokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
                    {token.text}
                  </span>
                ))}
              </span>
            );
          })}
        </code>
      </pre>
    </figure>
  );
}