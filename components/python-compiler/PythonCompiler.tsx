"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";

// ─── Types ────────────────────────────────────────────────────────────

type LiteralVal = { kind: "literal"; type: string; value: string };
type RefVal = { kind: "ref"; oid: string };
type EllipsisVal = { kind: "ellipsis" };
type VarInfo = LiteralVal | RefVal | EllipsisVal | { kind: string; value: string };

type HeapObject = {
  type: "list" | "dict" | "tuple" | "set";
  items?: VarInfo[];
  pairs?: { key: VarInfo; val: VarInfo }[];
  length: number;
};

type Step = {
  line: number;
  locals: Record<string, VarInfo>;
  funcName: string;
  funcFrame: string;
  stdout: string;
};

type TraceResult = {
  steps: Step[];
  heap: Record<string, HeapObject>;
  stdout: string;
  error: string | null;
};

// ─── Default code ─────────────────────────────────────────────────────

const DEFAULT_CODE = `def max_product(nums):
    if not nums:
        return 0
    max1 = max2 = float('-inf')
    for n in nums:
        if n > max1:
            max2 = max1
            max1 = n
        elif n > max2:
            max2 = n
    return max1 * max2

nums = [12, 43, 6, 8, 3, 6]
result = max_product(nums)
print(result)`;

const EXAMPLES = [
  {
    label: "Max Product",
    code: `def max_product(nums):
    if not nums:
        return 0
    max1 = max2 = float('-inf')
    for n in nums:
        if n > max1:
            max2 = max1
            max1 = n
        elif n > max2:
            max2 = n
    return max1 * max2

nums = [12, 43, 6, 8, 3, 6]
result = max_product(nums)
print(result)`,
  },
  {
    label: "Fibonacci",
    code: `def fibonacci(n):
    a, b = 0, 1
    result = []
    for _ in range(n):
        result.append(a)
        a, b = b, a + b
    return result

nums = fibonacci(10)
print(nums)
print(f"Sum: {sum(nums)}")`,
  },
  {
    label: "List Filter",
    code: `data = [3, 7, 1, 9, 4, 6, 8, 2, 5]
print("Original:", data)

evens = [n for n in data if n % 2 == 0]
print("Evens:  ", evens)

squares = [n ** 2 for n in data]
print("Squares:", squares)

total = 0
for n in data:
    total += n
print(f"Sum: {total}")`,
  },
  {
    label: "Nested Loops",
    code: `def build_matrix(rows, cols):
    matrix = []
    for i in range(rows):
        row = []
        for j in range(cols):
            row.append(i * cols + j + 1)
        matrix.append(row)
    return matrix

m = build_matrix(3, 4)
for row in m:
    print(row)`,
  },
];

// ─── Injected Python Tracer ───────────────────────────────────────────

const TRACER_SETUP = `
import sys, json

_trace = {"steps": [], "heap": {}, "stdout": "", "error": None}
_MAX = 300

def _desc(v, depth=0):
    if depth > 2:
        return {"kind": "ellipsis"}
    if isinstance(v, (int, float, bool, type(None))):
        return {"kind": "literal", "type": type(v).__name__, "value": repr(v)}
    if isinstance(v, str):
        if len(v) > 60:
            return {"kind": "literal", "type": "str", "value": repr(v[:60]) + "..."}
        return {"kind": "literal", "type": "str", "value": repr(v)}
    if isinstance(v, list):
        oid = "oid_" + str(id(v))
        if oid not in _trace["heap"]:
            _trace["heap"][oid] = {"type": "list", "items": [_desc(x, depth+1) for x in v], "length": len(v)}
        return {"kind": "ref", "oid": oid}
    if isinstance(v, tuple):
        oid = "oid_" + str(id(v))
        if oid not in _trace["heap"]:
            _trace["heap"][oid] = {"type": "tuple", "items": [_desc(x, depth+1) for x in v], "length": len(v)}
        return {"kind": "ref", "oid": oid}
    if isinstance(v, dict):
        oid = "oid_" + str(id(v))
        if oid not in _trace["heap"]:
            pairs = []
            for k, val in list(v.items())[:12]:
                pairs.append({"key": _desc(k, depth+1), "val": _desc(val, depth+1)})
            _trace["heap"][oid] = {"type": "dict", "pairs": pairs, "length": len(v)}
        return {"kind": "ref", "oid": oid}
    return {"kind": type(v).__name__, "value": repr(v)[:80]}

def _snap(frame):
    step = {"line": frame.f_lineno, "locals": {}, "funcName": frame.f_code.co_name, "funcFrame": frame.f_code.co_name or "Global", "stdout": ""}
    for k, v in frame.f_locals.items():
        if not k.startswith("_"):
            try:
                step["locals"][k] = _desc(v)
            except:
                step["locals"][k] = {"kind": "error", "value": "?"}
    try:
        step["stdout"] = sys.stdout.getvalue()
    except:
        pass
    return step

class _T:
    def __call__(self, frame, event, arg):
        if event == "line" and len(_trace["steps"]) < _MAX:
            if frame.f_code.co_filename == "<usercode>":
                _trace["steps"].append(_snap(frame))
        return self
`;

// ─── Helpers ──────────────────────────────────────────────────────────

function codeLines(code: string): string[] {
  return code.split("\n");
}

function isRefVar(v: VarInfo): v is RefVal {
  return v.kind === "ref";
}

function getObjectColor(type: string, index?: number): string {
  const colors = [
    "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-200",
    "bg-sky-100 border-sky-300 text-sky-900 dark:bg-sky-900/30 dark:border-sky-600 dark:text-sky-200",
    "bg-violet-100 border-violet-300 text-violet-900 dark:bg-violet-900/30 dark:border-violet-600 dark:text-violet-200",
    "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-600 dark:text-emerald-200",
    "bg-rose-100 border-rose-300 text-rose-900 dark:bg-rose-900/30 dark:border-rose-600 dark:text-rose-200",
    "bg-cyan-100 border-cyan-300 text-cyan-900 dark:bg-cyan-900/30 dark:border-cyan-600 dark:text-cyan-200",
  ];
  return colors[(index ?? 0) % colors.length];
}

// ─── Component ────────────────────────────────────────────────────────

export default function PythonCompiler() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("Click **Visualize Execution** to see your code run step by step.");
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [trace, setTrace] = useState<TraceResult | null>(null);
  const [activeTab, setActiveTab] = useState<"output" | "frames">("frames");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [language, setLanguage] = useState("Python");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const pyodideRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const stepperAnimRef = useRef<number | null>(null);

  // Load Pyodide
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      try {
        const pyodide = await (window as any).loadPyodide();
        await pyodide.loadPackage(["pandas", "numpy"]);
        pyodideRef.current = pyodide;
        setIsLoading(false);
      } catch {
        setOutput("Failed to load Python runtime. Please refresh.");
        setIsLoading(false);
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Step animation
  useEffect(() => {
    if (stepperAnimRef.current) cancelAnimationFrame(stepperAnimRef.current);
    stepperAnimRef.current = requestAnimationFrame(() => {});
    return () => { if (stepperAnimRef.current) cancelAnimationFrame(stepperAnimRef.current); };
  }, [currentStepIdx]);

  const lines = useMemo(() => codeLines(code), [code]);
  const stepCount = trace?.steps.length ?? 0;
  const currentStep = trace?.steps[currentStepIdx] ?? null;
  const nextStep = currentStepIdx < stepCount - 1 ? trace?.steps[currentStepIdx + 1] : null;

  // Executed line numbers (all steps up to current)
  const executedLines = useMemo(() => {
    if (!trace) return new Set<number>();
    return new Set(trace.steps.slice(0, currentStepIdx + 1).map((s) => s.line));
  }, [trace, currentStepIdx]);

  // ─── Actions ───────────────────────────────────────────────────────

  const runCode = useCallback(async () => {
    if (!pyodideRef.current) return;
    setOutput("Running...");
    setTrace(null);

    try {
      pyodideRef.current.runPython(`
import sys, io
sys.stdout = io.StringIO()
      `);
      await pyodideRef.current.runPythonAsync(code);
      const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
      setOutput(stdout || "Code ran successfully with no output.");
    } catch (error: any) {
      setOutput(`Error:\n${error.message}`);
    }
  }, [code]);

  const visualizeCode = useCallback(async () => {
    if (!pyodideRef.current) return;
    setOutput("Tracing execution...");
    setTrace(null);

    try {
      // Setup tracer
      pyodideRef.current.runPython(TRACER_SETUP);

      pyodideRef.current.runPython(`
_saved_out = sys.stdout
sys.stdout = io.StringIO()
sys.settrace(_T())
      `);

      // Run user code
      try {
        await pyodideRef.current.runPythonAsync(code, { filename: "<usercode>" });
      } catch (err: any) {
        pyodideRef.current.runPython(`_trace["error"] = ${JSON.stringify(err.message)}`);
      }

      // Collect trace
      pyodideRef.current.runPython(`
sys.settrace(None)
_trace["stdout"] = sys.stdout.getvalue()
sys.stdout = _saved_out
      `);

      const raw = pyodideRef.current.runPython("json.dumps(_trace)") as string;
      const parsed = JSON.parse(raw) as TraceResult;

      if (parsed.steps.length === 0) {
        setOutput(parsed.stdout || "No steps captured — code may have run too quickly.");
        return;
      }

      setTrace(parsed);
      setCurrentStepIdx(0);
      setActiveTab("frames");
      setOutput(parsed.stdout || "✓ Execution complete. Step through to see variables and objects.");
    } catch (error: any) {
      setOutput(`Visualization error:\n${error.message}`);
    }
  }, [code]);

  const stepperGo = useCallback((idx: number) => {
    setCurrentStepIdx(Math.max(0, Math.min(idx, stepCount - 1)));
  }, [stepCount]);

  // Gather heap objects referenced in current step
  const activeHeapEntries = useMemo(() => {
    if (!currentStep || !trace) return [];
    const oids = new Set<string>();
    for (const v of Object.values(currentStep.locals)) {
      if (isRefVar(v)) oids.add(v.oid);
    }
    return Array.from(oids).map((oid) => ({ oid, obj: trace.heap[oid] })).filter((e) => e.obj);
  }, [currentStep, trace]);

  // ─── Renderers ──────────────────────────────────────────────────────

  const renderInlineVal = (v: VarInfo | undefined) => {
    if (!v) return <span className="text-slate-400">—</span>;
    if (v.kind === "literal") {
      const val = (v as LiteralVal).value;
      if (val === "True" || val === "False") return <span className="text-amber-600 dark:text-amber-400">{val}</span>;
      if (val === "None") return <span className="text-slate-400">None</span>;
      if (val.startsWith("'") || val.startsWith('"')) return <span className="text-emerald-600 dark:text-emerald-400">{val}</span>;
      if (val.includes(".") || val === "inf") return <span className="text-blue-600 dark:text-blue-400">{val}</span>;
      return <span className="text-violet-600 dark:text-violet-400">{val}</span>;
    }
    if (v.kind === "ref") return <span className="text-sky-600 dark:text-sky-400">ref</span>;
    if (v.kind === "ellipsis") return <span className="text-slate-400">...</span>;
    return <span className="text-slate-500">{(v as any).value ?? "?"}</span>;
  };

  const renderCodeLine = (line: string, idx: number) => {
    const lineNum = idx + 1;
    const isExecuted = executedLines.has(lineNum);
    const isCurrent = currentStep?.line === lineNum;
    const isNext = nextStep?.line === lineNum && !isCurrent;

    let gutterContent: React.ReactNode = null;
    let bgClass = "bg-transparent";
    let borderClass = "border-transparent";

    if (isCurrent) {
      bgClass = "bg-emerald-50 dark:bg-emerald-950/30";
      borderClass = "border-l-4 border-l-emerald-500";
      gutterContent = (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M6 3.5v11l8-5.5z" />
          </svg>
        </span>
      );
    } else if (isNext) {
      bgClass = "bg-rose-50 dark:bg-rose-950/30";
      borderClass = "border-l-4 border-l-rose-400";
      gutterContent = (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-rose-400">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M6 3.5v11l8-5.5z" />
          </svg>
        </span>
      );
    } else if (isExecuted) {
      bgClass = "bg-emerald-50/40 dark:bg-emerald-950/20";
    }

    return (
      <div
        key={lineNum}
        className={`relative flex items-center border-l-4 py-[1.5px] text-sm leading-6 transition-colors duration-150 ${bgClass} ${borderClass}`}
      >
        <div className="relative flex w-12 shrink-0 items-center justify-center">
          {gutterContent}
          <span className={`text-xs font-mono select-none ${isCurrent || isNext ? "text-slate-500 font-bold" : "text-slate-400"}`}>
            {lineNum}
          </span>
        </div>
        <pre className="flex-1 overflow-hidden font-mono text-sm leading-6">
          <code>{line || " "}</code>
        </pre>
      </div>
    );
  };

  const renderHeapObject = (oid: string, obj: HeapObject, idx: number) => {
    const color = getObjectColor(obj.type, idx);

    return (
      <div key={oid} className={`rounded-xl border ${color} overflow-hidden transition-all duration-300`}>
        <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border-b border-inherit opacity-70">
          <span>{obj.type}</span>
          <span className="font-mono text-[10px] opacity-50">id: {oid.slice(0, 12)}</span>
        </div>
        <div className="p-2">
          {obj.type === "list" || obj.type === "tuple" ? (
            <div className="flex flex-wrap gap-1">
              {obj.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-lg border border-inherit/40 bg-white/50 px-2 py-1 dark:bg-black/20"
                >
                  <span className="text-[10px] opacity-50">{i}</span>
                  <span className="text-xs font-mono font-semibold">{renderInlineVal(item)}</span>
                </div>
              ))}
            </div>
          ) : obj.type === "dict" ? (
            <div className="space-y-1">
              {obj.pairs?.map((pair, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-inherit/40 bg-white/50 px-2 py-1 text-xs dark:bg-black/20">
                  <span className="font-bold">
                    {pair.key.kind === "literal" ? (pair.key as LiteralVal).value : "?"}
                  </span>
                  <span className="opacity-40">→</span>
                  <span className="font-mono">{renderInlineVal(pair.val)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderFrameCard = (name: string, vars: Record<string, VarInfo>) => {
    const entries = Object.entries(vars);
    return (
      <div className="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm transition-all duration-200 dark:border-sky-800 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
          <div className="size-2 rounded-full bg-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            {name}
          </span>
        </div>
        <div className="p-2.5">
          {entries.length === 0 ? (
            <p className="text-xs text-slate-400 italic px-1">No variables</p>
          ) : (
            <div className="space-y-1">
              {entries.map(([name, info]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>
                  <span className="font-mono text-[11px]">{renderInlineVal(info)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── UI ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col bg-gradient-to-b from-slate-50 to-white px-4 py-5 dark:from-slate-950 dark:to-slate-900">
      {/* ═══ Top Bar ═══ */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Code<span className="text-brand-600">Verse</span> Visualizer
          </h1>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-block">
            Python 3.11
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                <path d="M2 12h20" />
              </svg>
              {language}
            </button>
            {showLangPicker && (
              <div className="absolute left-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {["Python", "JavaScript", "Java", "C++"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLangPicker(false); }}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      lang === language ? "bg-slate-100 text-ink dark:bg-slate-700" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Examples */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {selectedExample ?? "Examples"}
            </button>
            {showExamples && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => { setCode(ex.code); setSelectedExample(ex.label); setShowExamples(false); setTrace(null); setOutput(`Loaded: ${ex.label}`); }}
                    className={`w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
                      selectedExample === ex.label ? "bg-slate-100 text-ink dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run */}
          <button
            onClick={runCode}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>

          {/* Visualize */}
          <button
            onClick={visualizeCode}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50 shadow-sm"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Visualize Execution
          </button>

          {/* Edit */}
          <a
            href="#editor"
            className="hidden items-center gap-1 text-sm font-semibold text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline dark:hover:text-slate-300 lg:flex"
          >
            Edit this code
          </a>
        </div>
      </div>

      {/* ═══ Main Grid ═══ */}
      <div className="flex flex-1 gap-4 overflow-hidden lg:flex-row flex-col">
        {/* ─── Left Panel: Editor + Stepper ─── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50 lg:w-[62%]">
          {/* Editor header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              main.py
            </span>
            <button
              onClick={() => { setCode(DEFAULT_CODE); setTrace(null); setOutput("Reset to default example."); }}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              title="Reset code"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </button>
          </div>

          {/* Code editor with line highlighting overlay */}
          <div className="relative flex-1 overflow-auto" id="editor">
            {/* We render code lines with highlighting over the editor */}
            {/* Since Monaco doesn't support per-line background colors easily,
                we use a simplified approach: show the Monaco editor in edit mode,
                and switch to highlighted view when visualization is active. */}
            {trace ? (
              <div className="h-[480px] overflow-y-auto bg-white p-0 font-mono dark:bg-slate-900">
                {lines.map((line, idx) => renderCodeLine(line, idx))}
              </div>
            ) : (
              <div className="h-[480px]">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  onMount={(editor) => { editorRef.current = editor; }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                    padding: { top: 12 },
                    renderLineHighlight: "line",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: false,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            )}
          </div>

          {/* Stepper controls */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            {trace ? (
              <>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Step {currentStepIdx + 1} of {stepCount}</span>
                    <span>{stepCount > 0 ? Math.round(((currentStepIdx + 1) / stepCount) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
                      style={{ width: `${((currentStepIdx + 1) / stepCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => stepperGo(0)}
                    disabled={currentStepIdx === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg>
                    First
                  </button>
                  <button
                    onClick={() => stepperGo(currentStepIdx - 1)}
                    disabled={currentStepIdx === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    Prev
                  </button>

                  <span className="mx-2 min-w-[90px] text-center text-xs font-semibold text-slate-500">
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{currentStepIdx + 1}</span>
                    <span className="opacity-50"> / {stepCount}</span>
                  </span>

                  <button
                    onClick={() => stepperGo(currentStepIdx + 1)}
                    disabled={currentStepIdx >= stepCount - 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Next
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button
                    onClick={() => stepperGo(stepCount - 1)}
                    disabled={currentStepIdx >= stepCount - 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Last
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Click <span className="font-bold text-brand-600">Visualize Execution</span> to begin stepping through your code
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Panel: Output + Frames + Objects ─── */}
        <div className="flex flex-col gap-4 lg:w-[38%]">
          {/* Print Output */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
              <svg className="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 17V4h16v13" /><path d="M4 17h16v4H4z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Print Output</span>
              {currentStep?.stdout && (
                <span className="ml-auto text-[11px] text-slate-400">{currentStep.stdout.split("\n").length} lines</span>
              )}
            </div>
            <div className="max-h-[140px] overflow-auto bg-slate-950 p-3 font-mono text-sm leading-relaxed text-green-400">
              <pre className="whitespace-pre-wrap">{trace ? (currentStep?.stdout || "(no output yet)") : output}</pre>
            </div>
          </div>

          {/* Frames + Objects */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab("frames")}
                className={`flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "frames"
                    ? "border-b-2 border-brand-500 text-brand-600 bg-brand-50/30 dark:bg-brand-950/20 dark:text-brand-300"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                Frames
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === "output"
                    ? "border-b-2 border-brand-500 text-brand-600 bg-brand-50/30 dark:bg-brand-950/20 dark:text-brand-300"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                Objects ({activeHeapEntries.length})
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {!trace ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm text-slate-400">
                    Run visualization to see
                    <br />frames and objects here.
                  </p>
                </div>
              ) : activeTab === "frames" ? (
                <div className="space-y-3">
                  {currentStep && (
                    <div className="space-y-3 transition-all duration-300">
                      {renderFrameCard(currentStep.funcFrame, currentStep.locals)}
                      {/* Show a "Return" hint at the end */}
                      {currentStepIdx === stepCount - 1 && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                          ✓ Program finished
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Objects tab */
                <div className="space-y-3">
                  {activeHeapEntries.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No heap objects at this step.</p>
                  ) : (
                    <div className="space-y-3 transition-all duration-300">
                      {activeHeapEntries.map(({ oid, obj }, idx) => renderHeapObject(oid, obj, idx))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            {trace && (
              <div className="flex items-center gap-3 border-t border-slate-200 px-3 py-2 text-[10px] text-slate-400 dark:border-slate-700">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded bg-emerald-500" /> executed
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded bg-rose-400" /> next line
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-2 rounded bg-emerald-500" />
                  <svg className="size-2.5" viewBox="0 0 18 18" fill="currentColor"><path d="M6 3.5v11l8-5.5z" /></svg>
                  current
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Status Bar ═══ */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`inline-block size-2 rounded-full ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            {isLoading ? "Loading Pyodide runtime..." : "Runtime ready"}
          </span>
          <span>|</span>
          <span>Python 3.11 (WebAssembly)</span>
        </div>
        <div>
          {trace && (
            <span className="font-mono text-[11px] text-slate-500">
              {stepCount} trace steps · {activeHeapEntries.length} heap objects
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
