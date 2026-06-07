"use client";

import React, { useRef, useEffect, useCallback } from "react";
import type { PlaygroundLibrary } from "./types";

type PreviewPanelProps = {
  html: string;
  css: string;
  javascript: string;
  cdnLibraries: PlaygroundLibrary[];
  autoRun: boolean;
  onConsoleLog: (log: { method: string; args: string[]; timestamp: string }) => void;
  theme: "dark" | "light";
  runTick: number;
};

const PreviewPanel = ({ html, css, javascript, cdnLibraries, autoRun, onConsoleLog, theme, runTick }: PreviewPanelProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generatePreview = useCallback(() => {
    if (!iframeRef.current) return;

    const cdnCss = (cdnLibraries || [])
      .filter((lib) => lib.type === "css")
      .map((lib) => `<link rel="stylesheet" href="${lib.url}">`)
      .join("\n");

    const cdnJs = (cdnLibraries || [])
      .filter((lib) => lib.type === "js")
      .map((lib) => `<script src="${lib.url}"><\/script>`)
      .join("\n");

    const previewHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${cdnCss}
  <style>${css || ""}</style>
</head>
<body>
  ${html || ""}
  ${cdnJs}
  <script>
    (function() {
      const originalConsole = { ...console };
      ['log', 'error', 'warn', 'info', 'debug', 'table'].forEach(method => {
        console[method] = function(...args) {
          originalConsole[method](...args);
          try {
            window.parent.postMessage({
              type: 'console',
              method: method,
              args: args.map(arg => {
                try {
                  if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
                  return String(arg);
                } catch (e) {
                  return String(arg);
                }
              })
            }, '*');
          } catch (e) {}
        };
      });

      window.onerror = function(message, source, lineno, colno, error) {
        console.error({
          type: 'runtime_error',
          message: message,
          source: source,
          line: lineno,
          column: colno,
          stack: error?.stack
        });
        return true;
      };

      window.addEventListener('unhandledrejection', function(event) {
        console.error({
          type: 'promise_error',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        });
      });
    })();
  <\/script>
  <script type="text/babel" data-presets="env,react">
    ${javascript || ""}
  <\/script>
  <script>
    document.querySelectorAll('script[type="text/babel"]').forEach(script => {
      if (window.Babel) {
        try {
          const transformed = Babel.transform(script.textContent, { presets: ['env', 'react'] });
          const newScript = document.createElement('script');
          newScript.textContent = transformed.code;
          script.parentNode.replaceChild(newScript, script);
        } catch (e) {
          console.error('Babel Error:', e.message);
        }
      }
    });
  <\/script>
</body>
</html>`;

    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [html, css, javascript, cdnLibraries]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "console") {
        onConsoleLog({
          method: event.data.method,
          args: event.data.args,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleLog]);

  useEffect(() => {
    if (autoRun) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(generatePreview, 800);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [html, css, javascript, cdnLibraries, autoRun, generatePreview]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview, runTick]);

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <span className="preview-title">Preview</span>
        <div className="preview-actions">
          <button type="button" onClick={generatePreview} title="Refresh">🔄</button>
          <button
            type="button"
            onClick={() => {
              const cdnCss = (cdnLibraries || []).filter((l) => l.type === "css").map((l) => `<link rel="stylesheet" href="${l.url}">`).join("");
              const cdnJs = (cdnLibraries || []).filter((l) => l.type === "js").map((l) => `<script src="${l.url}"><\/script>`).join("");
              const blob = new Blob([
                `<!DOCTYPE html><html><head>${cdnCss}<style>${css}</style></head><body>${html}${cdnJs}<script>${javascript}<\/script></body></html>`
              ], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank", "noopener,noreferrer");
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
            title="Open in new tab"
          >
            ↗️
          </button>
        </div>
      </div>
      <div className="preview-content">
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          title="Preview"
          className="preview-iframe"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
