"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";

// ─── Types ────────────────────────────────────────────────────────────

type Language = "python" | "javascript";

type VizVal = { t: string; v?: any; id?: number };
type VizFrame = { name: string; locals: [string, VizVal][] };
type VizHeapEntry = { kind: string; items?: VizVal[]; entries?: [VizVal, VizVal][] };
type VizStep = {
  line: number | null;
  stack: VizFrame[];
  heap: Record<string, VizHeapEntry>;
  output: string;
  final?: boolean;
};
type VizResult = {
  steps: VizStep[];
  inputs: string[];
  error: string;
  truncated: boolean;
};

// ─── Default code ─────────────────────────────────────────────────────

const DEFAULTS: Record<Language, string> = {
  python: `def max_product(nums):
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
  javascript: `function maxProduct(nums) {
  if (nums.length === 0) return 0;
  let max1 = -Infinity, max2 = -Infinity;
  for (const n of nums) {
    if (n > max1) {
      max2 = max1;
      max1 = n;
    } else if (n > max2) {
      max2 = n;
    }
  }
  return max1 * max2;
}

const nums = [12, 43, 6, 8, 3, 6];
const result = maxProduct(nums);
console.log(result);`,
};

const EXAMPLES: Record<
  Language,
  { label: string; code: string }[]
> = {
  python: [
    {
      label: "Star Pattern",
      code: `rows = 5
for i in range(1, rows + 1):
    for j in range(1, i + 1):
        print('*', end='')
    print()`,
    },
    {
      label: "FizzBuzz",
      code: `for n in range(1, 21):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)`,
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
    {
      label: "Factorial Sum",
      code: `n = 5
result = 0.0
fact = 1

for i in range(1, n + 1):
    fact = fact * i
    result = result + i / fact

print("n =", n)
print("Series sum =", result)
print("Expected  : 1/1! + 2/2! + 3/3! + 4/4! + 5/5!")`,
    },
  ],
  javascript: [
    {
      label: "FizzBuzz",
      code: `for (let n = 1; n <= 20; n++) {
  if (n % 15 === 0) console.log("FizzBuzz");
  else if (n % 3 === 0) console.log("Fizz");
  else if (n % 5 === 0) console.log("Buzz");
  else console.log(n);
}`,
    },
    {
      label: "Fibonacci",
      code: `function fibonacci(n) {
  const result = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
}

const nums = fibonacci(10);
console.log(nums);
console.log("Sum:", nums.reduce((a, b) => a + b, 0));`,
    },
    {
      label: "Object Destructure",
      code: `const user = { name: "Alice", age: 30, role: "admin" };
const { name, ...rest } = user;
console.log("Name:", name);
console.log("Rest:", JSON.stringify(rest));`,
    },
    {
      label: "Array Methods",
      code: `const data = [3, 7, 1, 9, 4, 6, 8, 2, 5];
console.log("Original:", data);

const evens = data.filter(n => n % 2 === 0);
console.log("Evens:", evens);

const squares = data.map(n => n ** 2);
console.log("Squares:", squares);

const total = data.reduce((a, b) => a + b, 0);
console.log("Sum:", total);`,
    },
    {
      label: "Promise",
      code: `async function fetchData() {
  console.log("Fetching...");
  const result = await new Promise(resolve =>
    setTimeout(() => resolve("Done!"), 100)
  );
  console.log(result);
}

fetchData();`,
    },
    {
      label: "Recursive Factorial",
      code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

for (let i = 1; i <= 6; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`);
}`,
    },
  ],
};

const LANG_META: Record<Language, { label: string; badge: string; file: string }> = {
  python: { label: "Python", badge: "Python 3.11", file: "main.py" },
  javascript: { label: "JavaScript", badge: "JS (ES2024)", file: "main.js" },
};

// ─── Socket-style Tracer (Python) ─────────────────────────────────────

const TRACER_DRIVER = `
import sys, json, traceback, builtins, io, math

_FILENAME = "<usercode>"
_MAX_STEPS = 500

class _StepLimitExceeded(Exception):
    pass

_out_buf = []
_steps = []
_inputs_log = []
_obj_registry = {}
_next_id = [1]

def _get_obj_id(obj):
    oid = id(obj)
    if oid not in _obj_registry:
        _obj_registry[oid] = _next_id[0]
        _next_id[0] += 1
    return _obj_registry[oid]

def _snapshot(line, frame):
    heap = {}
    visiting = set()

    def ser(val):
        if val is None:
            return {"t": "none"}
        if isinstance(val, bool):
            return {"t": "bool", "v": val}
        if isinstance(val, (int, float)):
            if math.isinf(val):
                return {"t": "str", "v": "inf" if val > 0 else "-inf"}
            if math.isnan(val):
                return {"t": "str", "v": "nan"}
            return {"t": "num", "v": val}
        if isinstance(val, str):
            v = val if len(val) <= 200 else val[:200] + "\\u2026"
            return {"t": "str", "v": v}
        if isinstance(val, (list, tuple, set, frozenset, dict)):
            oid = _get_obj_id(val)
            kind = ("list" if isinstance(val, list) else
                    "tuple" if isinstance(val, tuple) else
                    "dict" if isinstance(val, dict) else "set")
            if str(oid) not in heap and oid not in visiting:
                visiting.add(oid)
                if kind == "dict":
                    entries = []
                    for i, (k, v) in enumerate(val.items()):
                        if i >= 40:
                            entries.append([{"t": "str", "v": "\\u2026"}, {"t": "str", "v": "truncated"}])
                            break
                        entries.append([ser(k), ser(v)])
                    heap[str(oid)] = {"kind": "dict", "entries": entries}
                else:
                    items = []
                    for i, item in enumerate(val):
                        if i >= 60:
                            items.append({"t": "str", "v": "\\u2026 truncated"})
                            break
                        items.append(ser(item))
                    heap[str(oid)] = {"kind": kind, "items": items}
                visiting.discard(oid)
            return {"t": "ref", "id": oid}
        if callable(val):
            return {"t": "func", "v": getattr(val, "__name__", "function")}
        try:
            r = repr(val)
        except Exception:
            r = "<object>"
        if len(r) > 200:
            r = r[:200] + "\\u2026"
        return {"t": "obj", "v": r}

    import types as _types
    chain = []
    f = frame
    while f is not None:
        if f.f_code.co_filename == _FILENAME:
            chain.append(f)
        elif f.f_back and f.f_back.f_code.co_filename == _FILENAME:
            chain.append(f)
        f = f.f_back
    chain.reverse()

    stack = []
    for fr in chain:
        if fr.f_code.co_filename != _FILENAME:
            continue
        is_global = fr.f_back is None or fr.f_back.f_code.co_filename != _FILENAME
        name = "Global frame" if is_global else fr.f_code.co_name + "()"
        locs = []
        for k, v in fr.f_locals.items():
            if k.startswith("__"):
                continue
            if isinstance(v, _types.ModuleType):
                continue
            if callable(v) and not isinstance(v, type):
                continue
            locs.append([k, ser(v)])
        stack.append({"name": name, "locals": locs})

    return {"line": line, "stack": stack, "heap": heap, "output": "".join(_out_buf)}

def _tracer(frame, event, arg):
    if frame.f_code.co_filename != _FILENAME:
        return _tracer
    if event == "line":
        if len(_steps) >= _MAX_STEPS:
            raise _StepLimitExceeded()
        _steps.append(_snapshot(frame.f_lineno, frame))
        return _tracer
    if event == "call":
        return _tracer
    return _tracer

class _Writer:
    def write(self, s):
        if s:
            _out_buf.append(s)
        return len(s)
    def flush(self):
        pass

_stdin_lines = _stdin_raw.split("\\n") if _stdin_raw else []
_stdin_index = [0]
_old_stdout = sys.stdout
_old_input = builtins.input
_error_text = ""
_truncated = False
_g = {"__name__": "__main__", "__builtins__": builtins}

sys.stdout = _Writer()

def _custom_input(prompt=""):
    if prompt:
        _out_buf.append(str(prompt))
    if _stdin_index[0] < len(_stdin_lines):
        line = _stdin_lines[_stdin_index[0]]
        _stdin_index[0] += 1
        _out_buf.append(line + "\\n")
        _inputs_log.append(line)
        return line
    line = input(str(prompt) or "")
    _out_buf.append(line + "\\n")
    _inputs_log.append(line)
    return line

builtins.input = _custom_input

try:
    sys.settrace(_tracer)
    exec(compile(_user_code, _FILENAME, "exec"), _g)
except _StepLimitExceeded:
    _truncated = True
except SystemExit:
    pass
except Exception:
    _full_tb = traceback.format_exc()
    _marker = "File \\"" + _FILENAME + "\\""
    _idx = _full_tb.find(_marker)
    if _idx != -1:
        _error_text = "Traceback (most recent call last):\\n  " + _full_tb[_idx:]
    else:
        _error_text = _full_tb
finally:
    sys.settrace(None)
    sys.stdout = _old_stdout
    builtins.input = _old_input

_final_heap = {}
_final_visiting = set()

def _ser2(val):
    if val is None:
        return {"t": "none"}
    if isinstance(val, bool):
        return {"t": "bool", "v": val}
    if isinstance(val, (int, float)):
        if math.isinf(val):
            return {"t": "str", "v": "inf" if val > 0 else "-inf"}
        if math.isnan(val):
            return {"t": "str", "v": "nan"}
        return {"t": "num", "v": val}
    if isinstance(val, str):
        v = val if len(val) <= 200 else val[:200] + "\\u2026"
        return {"t": "str", "v": v}
    if isinstance(val, (list, tuple, set, frozenset, dict)):
        oid = _get_obj_id(val)
        kind = ("list" if isinstance(val, list) else
                "tuple" if isinstance(val, tuple) else
                "dict" if isinstance(val, dict) else "set")
        if str(oid) not in _final_heap and oid not in _final_visiting:
            _final_visiting.add(oid)
            if kind == "dict":
                entries = []
                for k, v in val.items():
                    entries.append([_ser2(k), _ser2(v)])
                _final_heap[str(oid)] = {"kind": "dict", "entries": entries}
            else:
                items = [_ser2(item) for item in val]
                _final_heap[str(oid)] = {"kind": kind, "items": items}
            _final_visiting.discard(oid)
        return {"t": "ref", "id": oid}
    if callable(val):
        return {"t": "func", "v": getattr(val, "__name__", "function")}
    try:
        r = repr(val)
    except Exception:
        r = "<object>"
    return {"t": "obj", "v": r}

import types as _types
_final_locals = []
for _k, _v in _g.items():
    if _k.startswith("__"):
        continue
    if isinstance(_v, _types.ModuleType):
        continue
    if callable(_v) and not isinstance(_v, type):
        continue
    _final_locals.append([_k, _ser2(_v)])

_steps.append({
    "line": None,
    "stack": [{"name": "Global frame", "locals": _final_locals}],
    "heap": _final_heap,
    "output": "".join(_out_buf),
    "final": True,
})

_viz_result_json = json.dumps({
    "steps": _steps,
    "inputs": _inputs_log,
    "error": _error_text,
    "truncated": _truncated,
})
`;

// ─── Helpers ──────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function assignHeapLabels(steps: VizStep[]): Map<string, string> {
  const labels = new Map<string, string>();
  const counts: Record<string, number> = { list: 0, dict: 0, tuple: 0, set: 0 };
  const prefix: Record<string, string> = { list: "L", dict: "D", tuple: "T", set: "S" };
  for (const step of steps) {
    for (const oid of Object.keys(step.heap || {})) {
      if (!labels.has(oid)) {
        const kind = step.heap[oid].kind;
        counts[kind] = (counts[kind] || 0) + 1;
        labels.set(oid, (prefix[kind] || "?") + counts[kind]);
      }
    }
  }
  return labels;
}

// ─── Component ────────────────────────────────────────────────────────

type ViewMode = "run" | "viz";

export default function PythonCompiler() {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(DEFAULTS.python);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("Loading Python runtime...");
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [ledState, setLedState] = useState<"idle" | "running" | "success" | "error">("idle");

  const [viewMode, setViewMode] = useState<ViewMode>("run");
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const [vizResult, setVizResult] = useState<VizResult | null>(null);
  const [vizIdx, setVizIdx] = useState(0);
  const [heapLabels, setHeapLabels] = useState<Map<string, string>>(new Map());
  const [vizRunning, setVizRunning] = useState(false);

  const [dark, setDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const pyodideRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Load Pyodide ─────────────────────────────────────────────────
  useEffect(() => {
    if (pyodideRef.current) {
      setIsLoading(false);
      return;
    }
    const init = async () => {
      try {
        if (typeof (window as any).loadPyodide !== "function") {
          const script = document.createElement("script");
          script.src = "/pyodide/pyodide.js";
          document.body.appendChild(script);
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Script load failed"));
          });
        }
        const pyodide = await (window as any).loadPyodide({ indexURL: "/pyodide/" });
        pyodideRef.current = pyodide;
        setIsLoading(false);
        setOutput("Press Run to execute your code, or Visualize to step through it.");
      } catch (e) {
        console.error("Pyodide init failed:", e);
        setOutput("Failed to load Python runtime. Please refresh the page.");
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ─── Dark mode ─────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // ─── Fullscreen ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  // ─── Share ─────────────────────────────────────────────────────────
  const shareUrl = useMemo(() => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      const params = new URLSearchParams({ code: encoded, lang: language });
      if (stdin) params.set("stdin", stdin);
      return `${window.location.origin}/python-compiler?${params.toString()}`;
    } catch {
      return "";
    }
  }, [code, language, stdin]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code");
      const langParam = params.get("lang") as Language | null;
      if (codeParam) {
        const decoded = decodeURIComponent(escape(atob(codeParam)));
        setCode(decoded);
        if (langParam === "python" || langParam === "javascript") {
          setLanguage(langParam);
        }
      }
      const stdinParam = params.get("stdin");
      if (stdinParam) setStdin(stdinParam);
    } catch {}
  }, []);

  const copyShareLink = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  }, [shareUrl]);

  const codeLines = useMemo(() => code.split("\n"), [code]);

  // Viz derived state
  const vizSteps = vizResult?.steps ?? [];
  const vizStep = vizSteps[vizIdx] ?? null;
  const vizPrevLine = vizIdx > 0 ? vizSteps[vizIdx - 1]?.line : null;

  const heapLabelsRef = useRef(heapLabels);
  heapLabelsRef.current = heapLabels;

  // ─── Actions ──────────────────────────────────────────────────────

  const downloadFile = useCallback(() => {
    const meta = LANG_META[language];
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meta.file;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setViewMode("run");
    setVizResult(null);
    setIsRunning(true);
    setLedState("running");
    setOutput("");

    if (language === "javascript") {
      try {
        const logs: string[] = [];
        const fakeConsole = {
          log: (...args: any[]) => logs.push(args.map(String).join(" ")),
          error: (...args: any[]) => logs.push("[error] " + args.map(String).join(" ")),
          warn: (...args: any[]) => logs.push("[warn] " + args.map(String).join(" ")),
          info: (...args: any[]) => logs.push("[info] " + args.map(String).join(" ")),
          table: (data: any) => logs.push(JSON.stringify(data, null, 2)),
          dir: (data: any) => logs.push(JSON.stringify(data, null, 2)),
          clear: () => { logs.length = 0; },
        };
        const wrapped = `(async function(){\nconst console={log:__log,error:__err,warn:__warn,info:__info,table:__table,dir:__dir,clear:__clear};\n${code}\n})()`;
        const fn = new Function(
          "__log", "__err", "__warn", "__info", "__table", "__dir", "__clear",
          wrapped,
        );
        const promise = fn(
          fakeConsole.log, fakeConsole.error, fakeConsole.warn,
          fakeConsole.info, fakeConsole.table, fakeConsole.dir, fakeConsole.clear,
        );
        if (promise && typeof promise.then === "function") await promise;
        const combined = logs.join("\n") || "(no output)";
        setOutput(combined);
        setLedState("success");
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
        setLedState("error");
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // Python via Pyodide
    const py = pyodideRef.current;
    if (!py) {
      setIsRunning(false);
      return;
    }

    try {
      await py.runPythonAsync(`
import sys, builtins, traceback

class _Writer:
    def __init__(self):
        self._buf = []
    def write(self, s):
        if s:
            self._buf.append(s)
    def flush(self):
        pass
    def getvalue(self):
        return "".join(self._buf)

_w = _Writer()
_old_stdout = sys.stdout
sys.stdout = _w

_stdin_lines = ${JSON.stringify(stdin)}.split("\\n") if ${JSON.stringify(stdin)} else []
_stdin_idx = [0]
def _input(prompt=""):
    if prompt:
        _w.write(str(prompt))
    if _stdin_idx[0] < len(_stdin_lines):
        line = _stdin_lines[_stdin_idx[0]]
        _stdin_idx[0] += 1
        _w.write(line + "\\n")
        return line
    line = input(str(prompt) or "")
    _w.write(line + "\\n")
    return line
_old_input = builtins.input
builtins.input = _input

_user_code = ${JSON.stringify(code)}
_error = None
try:
    exec(compile(_user_code, "main.py", "exec"), {"__name__": "__main__"})
except SystemExit:
    pass
except Exception:
    _error = traceback.format_exc()
finally:
    sys.stdout = _old_stdout
    builtins.input = _old_input

import json as _json
_result = _json.dumps({"output": _w.getvalue(), "error": _error})
      `);

      const raw = py.runPython("_result");
      const res = JSON.parse(raw);
      const combined = (res.output || "") + (res.error ? "\n" + res.error : "");
      setOutput(combined || "(no output)");
      setLedState(res.error ? "error" : "success");
    } catch (err: any) {
      setOutput(`Runtime error: ${err.message}`);
      setLedState("error");
    } finally {
      setIsRunning(false);
    }
  }, [code, stdin, isRunning, language]);

  const visualizeCode = useCallback(async () => {
    if (language !== "python") {
      setOutput("Visualization is only available for Python.");
      return;
    }
    const py = pyodideRef.current;
    if (!py || vizRunning) return;
    setVizRunning(true);
    setLedState("running");
    setVizResult(null);

    try {
      py.globals.set("_user_code", code);
      py.globals.set("_stdin_raw", stdin);
      await py.runPythonAsync(TRACER_DRIVER);
      const raw = py.globals.get("_viz_result_json") as string;
      const result: VizResult = JSON.parse(raw);

      const labels = assignHeapLabels(result.steps);
      setHeapLabels(labels);
      setVizResult(result);
      setVizIdx(0);
      setViewMode("viz");
      setLedState(result.error ? "error" : "success");
    } catch (err: any) {
      setOutput(`Visualization error: ${err.message}`);
      setLedState("error");
    } finally {
      setVizRunning(false);
    }
  }, [code, stdin, vizRunning]);

  const stepperGo = useCallback((idx: number) => {
    setVizIdx((prev) => Math.max(0, Math.min(idx, vizSteps.length - 1)));
  }, [vizSteps.length]);

  // ─── Viz Renderers ────────────────────────────────────────────────

  const renderVizVal = (node: VizVal | undefined): React.ReactNode => {
    if (!node) return <span className="text-slate-400">?</span>;
    switch (node.t) {
      case "none":
        return <span className="text-slate-400 italic">None</span>;
      case "bool":
        return <span className="text-amber-600 font-semibold dark:text-amber-400">{node.v ? "True" : "False"}</span>;
      case "num":
        return <span className="text-violet-600 font-semibold dark:text-violet-400">{String(node.v)}</span>;
      case "str":
        return <span className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(node.v)}</span>;
      case "func":
        return <span className="text-slate-500">{escapeHtml(node.v)}()</span>;
      case "obj":
        return <span className="text-slate-500 font-mono text-[11px]">{escapeHtml(node.v)}</span>;
      case "ref": {
        const label = heapLabelsRef.current.get(String(node.id)) || `#${node.id}`;
        return (
          <span className="inline-block rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-700">
            {label}
          </span>
        );
      }
      default:
        return <span className="text-slate-400">?</span>;
    }
  };

  const renderHeapBody = (entry: VizHeapEntry): React.ReactNode => {
    if (entry.kind === "dict" && entry.entries) {
      return (
        <span>
          {"{ "}
          {entry.entries.map(([k, v], i) => (
            <span key={i}>
              {i > 0 && ", "}
              {renderVizVal(k)}
              <span className="text-slate-400">: </span>
              {renderVizVal(v)}
            </span>
          ))}
          {" }"}
        </span>
      );
    }
    const open = entry.kind === "list" ? "[" : entry.kind === "tuple" ? "(" : "{";
    const close = entry.kind === "list" ? "]" : entry.kind === "tuple" ? ")" : "}";
    return (
      <span>
        {open}{" "}
        {(entry.items || []).map((item, i) => (
          <span key={i}>
            {i > 0 && ", "}
            {renderVizVal(item)}
          </span>
        ))}
        {" " + close}
      </span>
    );
  };

  // ─── UI ──────────────────────────────────────────────────────────

  const showViz = viewMode === "viz" && vizStep;
  const meta = LANG_META[language];

  return (
    <div ref={containerRef} className={`mx-auto flex min-h-screen max-w-[1440px] flex-col bg-gradient-to-b from-slate-50 to-white px-4 py-5 dark:from-slate-950 dark:to-slate-900 ${isFullscreen ? "!min-h-screen !py-2" : ""}`}>
      {/* ═══ Header ═══ */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Code<span className="text-brand-600">Verse</span> Visualizer
          </h1>

          {/* Language tabs */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {(["python", "javascript"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setCode(DEFAULTS[lang]);
                  setVizResult(null);
                  setViewMode("run");
                  setOutput(`Switched to ${LANG_META[lang].label}`);
                  setSelectedExample(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold transition ${
                  language === lang
                    ? "bg-brand-600 text-white"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {LANG_META[lang].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
                {EXAMPLES[language].map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      setCode(ex.code);
                      setSelectedExample(ex.label);
                      setShowExamples(false);
                      setVizResult(null);
                      setOutput(`Loaded: ${ex.label}`);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download */}
          <button
            onClick={downloadFile}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title={`Download as ${meta.file}`}
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            .{language === "python" ? "py" : "js"}
          </button>

          {/* Share */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title="Share code"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>

          {/* Run */}
          <button
            onClick={runCode}
            disabled={isLoading || isRunning}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <svg className={`size-4 ${isRunning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {isRunning ? "Running..." : "Run"}
          </button>

          {/* Visualize */}
          <button
            onClick={visualizeCode}
            disabled={isLoading || vizRunning || language !== "python"}
            title={language !== "python" ? "Visualization only available for Python" : ""}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50 shadow-sm"
          >
            <svg className={`size-4 ${vizRunning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {vizRunning ? "Tracing..." : "Visualize"}
          </button>
        </div>
      </div>

      {/* ═══ Main Grid ═══ */}
      <div className="flex flex-1 gap-4 overflow-hidden lg:flex-row flex-col">
        {/* ─── Left Panel ─── */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50 lg:w-[62%]">
          {/* Editor header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
              {meta.file}
            </span>
            {showViz && (
              <span className="text-[11px] text-slate-400">read-only while stepping</span>
            )}
            {!showViz && (
              <button
                onClick={() => {
                  setCode(DEFAULTS[language]);
                  setVizResult(null);
                  setOutput("Reset to default example.");
                }}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                title="Reset code"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
          </div>

          {/* Code area */}
          <div className="relative flex-1 overflow-auto" id="editor">
            {showViz ? (
              <div className="h-[480px] overflow-y-auto bg-white p-0 font-mono dark:bg-slate-900">
                {codeLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isPrev = vizPrevLine === lineNum && vizStep.line !== lineNum;
                  const isCurrent = vizStep.line === lineNum;

                  let bgClass = "bg-transparent";
                  let borderClass = "border-transparent";
                  let arrow = "";

                  if (isCurrent) {
                    bgClass = "bg-teal-50 dark:bg-teal-950/30";
                    borderClass = "border-l-4 border-l-teal-500";
                    arrow = "\u2794";
                  } else if (isPrev) {
                    bgClass = "bg-amber-50 dark:bg-amber-950/30";
                    borderClass = "border-l-4 border-l-amber-400";
                    arrow = "\u2192";
                  }

                  return (
                    <div
                      key={lineNum}
                      className={`relative flex items-center border-l-4 py-[1.5px] text-sm leading-6 transition-colors duration-150 ${bgClass} ${borderClass}`}
                    >
                      <span className="w-7 flex-shrink-0 text-center text-xs text-slate-400">
                        {arrow}
                      </span>
                      <span className="w-10 flex-shrink-0 text-right pr-2 text-xs font-mono select-none text-slate-400">
                        {lineNum}
                      </span>
                      <pre className="flex-1 overflow-hidden font-mono text-sm leading-6">
                        <code>{line || " "}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[480px]">
                <Editor
                  height="100%"
                  defaultLanguage={language === "python" ? "python" : "javascript"}
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

          {/* Bottom controls */}
          <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            {showViz ? (
              <>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, vizSteps.length - 1)}
                  value={vizIdx}
                  onChange={(e) => setVizIdx(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-500 mb-3"
                />
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => stepperGo(0)}
                    disabled={vizIdx === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/></svg>
                    First
                  </button>
                  <button
                    onClick={() => stepperGo(vizIdx - 1)}
                    disabled={vizIdx === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    Prev
                  </button>
                  <span className="mx-2 min-w-[90px] text-center text-xs font-semibold text-slate-500">
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{vizIdx + 1}</span>
                    <span className="opacity-50"> / {vizSteps.length}</span>
                  </span>
                  <button
                    onClick={() => stepperGo(vizIdx + 1)}
                    disabled={vizIdx >= vizSteps.length - 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Next
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button
                    onClick={() => stepperGo(vizSteps.length - 1)}
                    disabled={vizIdx >= vizSteps.length - 1}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Last
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/></svg>
                  </button>
                </div>
                <div className="mt-2 text-center text-xs text-slate-400">
                  {vizStep?.final ? "Program finished" : `Step ${vizIdx + 1} of ${vizSteps.length}`}
                  {vizResult?.truncated && <span className="text-amber-500 ml-2">(trace truncated)</span>}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Click{" "}
                <button
                  onClick={visualizeCode}
                  disabled={isLoading || vizRunning}
                  className="cursor-pointer font-bold text-brand-600 underline underline-offset-2 transition hover:text-brand-700 disabled:opacity-50 dark:hover:text-brand-400"
                >
                  Visualize
                </button>
                {" "}to begin stepping through your code
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Panel ─── */}
        <div className="flex flex-col gap-4 lg:w-[38%]">
          {/* Output */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
              <svg className="size-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 17V4h16v13" />
                <path d="M4 17h16v4H4z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Output</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex gap-1.5">
                  {([0, 1, 2, 3] as const).map((i) => (
                    <span
                      key={i}
                      className={`inline-block size-2 rounded-full transition-all duration-200 ${
                        ledState === "idle" ? "bg-slate-600" :
                        ledState === "running" ? "bg-amber-400 animate-pulse" :
                        ledState === "success" ? "bg-teal-400 shadow-[0_0_6px_rgba(95,201,186,0.6)]" :
                        "bg-rose-400 shadow-[0_0_6px_rgba(226,87,76,0.6)]"
                      }`}
                      style={ledState === "running" ? { animationDelay: `${i * 0.15}s` } : undefined}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { setOutput(""); setLedState("idle"); }}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                  title="Clear output"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <pre className="max-h-[140px] overflow-auto bg-slate-950 p-3 font-mono text-sm leading-relaxed text-green-400 whitespace-pre-wrap">
              {showViz
                ? (vizStep?.output || "(no output yet)")
                : (output || "Press Run to execute your code.")
              }
            </pre>
          </div>

          {/* Stdin */}
          {!showViz && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
              <div className="border-b border-slate-200 px-4 py-2 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Program Input (stdin)</span>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="If your code calls input(), list each value on its own line."
                className="w-full resize-vertical border-none bg-transparent p-3 font-mono text-xs leading-relaxed text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-300"
                rows={3}
              />
              <div className="px-4 pb-2 text-[11px] text-slate-400">
                Each line answers one <code>input()</code> call, in order.
              </div>
            </div>
          )}

          {/* Frames + Objects */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            {showViz ? (
              <>
                {/* Split: frames | objects */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                  <span className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-brand-600 border-b-2 border-brand-500 bg-brand-50/30 dark:text-brand-300">
                    Frames
                  </span>
                  <span className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Objects
                  </span>
                </div>
                <div className="flex flex-1 min-h-0">
                  {/* Frames */}
                  <div className="flex-1 overflow-y-auto border-r border-slate-200 dark:border-slate-700 p-3 space-y-3">
                    {vizStep?.stack.map((frame, fi) => (
                      <div key={fi} className="overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm dark:border-sky-800 dark:bg-slate-800/60">
                        <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950/30">
                          <div className="size-2 rounded-full bg-sky-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">{frame.name}</span>
                        </div>
                        <div className="p-2.5">
                          {frame.locals.length === 0 ? (
                            <p className="text-xs text-slate-400 italic px-1">(no local variables)</p>
                          ) : (
                            <div className="space-y-1">
                              {frame.locals.map(([name, val]) => (
                                <div key={name} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>
                                  <span className="font-mono text-[11px]">{renderVizVal(val)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {vizStep?.final && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                        Program finished
                      </div>
                    )}
                  </div>

                  {/* Objects */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {(() => {
                      const heapKeys = Object.keys(vizStep?.heap || {});
                      if (heapKeys.length === 0) {
                        return <p className="py-8 text-center text-sm text-slate-400">No container objects in scope.</p>;
                      }
                      return heapKeys.map((oid) => {
                        const entry = vizStep!.heap[oid];
                        const label = heapLabels.get(oid) || `#${oid}`;
                        return (
                          <div key={oid} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
                            <div className="mb-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                              {label}{" "}
                              <span className="font-normal text-slate-400">({entry.kind})</span>
                            </div>
                            <div className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
                              {renderHeapBody(entry)}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                  <span className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Frames
                  </span>
                  <span className="flex-1 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    Objects
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center p-6">
                  <p className="text-center text-sm text-slate-400">
                    Run visualization to see<br />frames and objects here.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Status Bar ═══ */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`inline-block size-2 rounded-full ${isLoading && language === "python" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            {isLoading && language === "python" ? "Loading Python runtime..." : `${meta.badge} ready`}
          </span>
          <span>|</span>
          <span>{language === "python" ? "Python 3.11 (WebAssembly)" : "JavaScript (Browser)"}</span>
        </div>
        <div>
          {showViz && (
            <span className="font-mono text-[11px] text-slate-500">
              {vizSteps.length} trace steps
              {vizResult?.error && <span className="text-rose-400 ml-2">error</span>}
              {vizResult?.truncated && <span className="text-amber-500 ml-2">truncated</span>}
            </span>
          )}
        </div>
      </div>

      {/* ═══ Mobile Bottom Bar ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={runCode}
          disabled={isLoading || isRunning}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          <svg className={`size-4 ${isRunning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isRunning ? "Running..." : "Run"}
        </button>
        <button
          onClick={() => {
            if (language !== "python") {
              setOutput("Visualization is only available for Python.");
              return;
            }
            visualizeCode();
          }}
          disabled={isLoading || vizRunning}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50 disabled:opacity-50 dark:border-brand-800 dark:bg-slate-800 dark:text-brand-300"
        >
          <svg className={`size-4 ${vizRunning ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {vizRunning ? "Tracing..." : "Visualize"}
        </button>
      </div>

      {/* ═══ Share Modal ═══ */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShareModal(false)}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Code</h3>
              <button onClick={() => setShowShareModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Share this link to let others view and run your <strong>{meta.label}</strong> code:
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                />
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  {shareCopied ? (
                    <>
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                The link includes your code and language selection. Stdin is also included if provided.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
