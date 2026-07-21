"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Play, Eye, StepForward, StepBack, RotateCcw, FileCode, Terminal,
  ChevronDown, Sparkles
} from "lucide-react";

type StepData = {
  line: number;
  locals: Record<string, string>;
};

type ExecutionResult = {
  steps: StepData[];
  stdout: string;
  error: string | null;
};

const DEFAULT_CODE = `# Write Python code, then click Run or Visualize
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

def greet(name):
    return f"Hello, {name}!"

def main():
    print("Fibonacci sequence:")
    for i, val in enumerate(fibonacci(10)):
        print(f"  fib({i}) = {val}")
    
    print()
    print(greet("CodeVerse Academy"))
    print(greet("Python Developer"))

    # Variable tracking example
    x = 42
    y = x * 2
    message = f"The answer is {y}"
    print(message)

if __name__ == "__main__":
    main()
`;

const EXAMPLES: { label: string; code: string }[] = [
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
print("First 10 Fibonacci numbers:")
for i, n in enumerate(nums):
    print(f"  {i}: {n}")
print(f"Sum: {sum(nums)}")`,
  },
  {
    label: "Data Analysis",
    code: `data = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
    {"name": "Charlie", "score": 78},
    {"name": "Diana", "score": 95},
]

total = sum(d["score"] for d in data)
count = len(data)
average = total / count

print(f"Students: {count}")
print(f"Total Score: {total}")
print(f"Average: {average:.1f}")

top = max(data, key=lambda d: d["score"])
print(f"Top performer: {top['name']} ({top['score']})")`,
  },
  {
    label: "List Operations",
    code: `numbers = [3, 7, 1, 9, 4, 6, 8, 2, 5]

print("Original:", numbers)

# Sort
numbers.sort()
print("Sorted: ", numbers)

# Filter
evens = [n for n in numbers if n % 2 == 0]
print("Evens:  ", evens)

# Map
squares = [n ** 2 for n in numbers]
print("Squares:", squares)

# Reduce (manual)
total = 0
for n in numbers:
    total += n
print(f"Sum: {total}")`,
  },
];

export default function PythonCompiler() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [mode, setMode] = useState<"run" | "visualize">("run");
  const [output, setOutput] = useState("Ready. Write your Python code and click Run.");
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const pyodideRef = useRef<any>(null);
  const outputRef = useRef<HTMLDivElement>(null);

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
        setOutput("Python runtime ready. Write your code and click Run.");
      } catch {
        setOutput("Failed to load Python environment. Please refresh.");
      }
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const runCode = useCallback(async () => {
    if (!pyodideRef.current) return;
    setOutput("Executing...");
    setExecution(null);

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
    setOutput("Running in visualization mode...");
    setExecution(null);

    try {
      pyodideRef.current.runPython(`
import sys, json

_trace_data = {"steps": [], "stdout": "", "error": None}
_MAX_STEP = 500

class _StepTracer:
    def __call__(self, frame, event, arg):
        if event == "line" and len(_trace_data["steps"]) < _MAX_STEP:
            if frame.f_code.co_filename != "<usercode>":
                return self
            lineno = frame.f_lineno
            snapshot = {}
            try:
                for k, v in frame.f_locals.items():
                    if not k.startswith("_"):
                        try:
                            snapshot[k] = repr(v)[:120]
                        except:
                            snapshot[k] = "<?>"
            except:
                pass
            _trace_data["steps"].append({"line": lineno, "locals": snapshot})
        return self
      `);

      pyodideRef.current.runPython(`
_saved_stdout = sys.stdout
sys.stdout = io.StringIO()
sys.settrace(_StepTracer())
      `);

      try {
        await pyodideRef.current.runPythonAsync(code, { filename: "<usercode>" });
      } catch (error: any) {
        pyodideRef.current.runPython(`
_trace_data["error"] = str(error)
        `);
      }

      pyodideRef.current.runPython(`
sys.settrace(None)
_trace_data["stdout"] = sys.stdout.getvalue()
sys.stdout = _saved_stdout
      `);

      const result = pyodideRef.current.runPython("json.dumps(_trace_data)") as string;
      const parsed = JSON.parse(result) as ExecutionResult;

      if (parsed.steps.length === 0) {
        setOutput(parsed.stdout || "No execution steps captured. Code may have run too quickly.");
        return;
      }

      setExecution(parsed);
      setCurrentStep(0);

      const stdoutLines = parsed.stdout ? `\n\n--- Program Output ---\n${parsed.stdout}` : "";
      const stepInfo = `Captured ${parsed.steps.length} execution steps. Use the controls to step through.`;
      setOutput(`${stepInfo}${stdoutLines}`);
    } catch (error: any) {
      setOutput(`Visualization error:\n${error.message}`);
    }
  }, [code]);

  const activeStep = execution?.steps[currentStep] ?? null;
  const totalSteps = execution?.steps.length ?? 0;

  const loadExample = (example: { label: string; code: string }) => {
    setCode(example.code);
    setSelectedExample(example.label);
    setShowExamples(false);
    setOutput(`Loaded example: ${example.label}`);
    setExecution(null);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h1 className="text-lg font-black tracking-tight">Python Compiler</h1>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Pyodide v0.26
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Examples dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <FileCode className="size-4" />
              {selectedExample ?? "Examples"}
              <ChevronDown className="size-3.5" />
            </button>
            {showExamples && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex)}
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

          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode("run")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold transition ${
                mode === "run" ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Play className="size-3.5" /> Run
            </button>
            <button
              onClick={() => setMode("visualize")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold transition ${
                mode === "visualize" ? "bg-ink text-white dark:bg-white dark:text-ink" : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <Eye className="size-3.5" /> Visualize
            </button>
          </div>

          {/* Execute button */}
          <button
            onClick={mode === "run" ? runCode : visualizeCode}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {mode === "run" ? <Play className="size-4" /> : <Eye className="size-4" />}
            {isLoading ? "Loading..." : mode === "run" ? "Run Code" : "Visualize"}
          </button>
        </div>
      </div>

      {/* Main editor + output grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <FileCode className="size-4" /> main.py
            </span>
            <button
              onClick={() => { setCode(DEFAULT_CODE); setExecution(null); setOutput("Editor reset."); }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              title="Reset to default"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
          <div className="h-[520px]">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                padding: { top: 12 },
                renderLineHighlight: "all",
              }}
            />
          </div>
        </div>

        {/* Output / Visualization panel */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          {mode === "visualize" && execution ? (
            <>
              {/* Step controls */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Eye className="size-4" /> Step {currentStep + 1} of {totalSteps}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
                  >
                    <StepBack className="size-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-xs font-mono text-slate-500">
                    {currentStep + 1}/{totalSteps}
                  </span>
                  <button
                    onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                    disabled={currentStep >= totalSteps - 1}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-700"
                  >
                    <StepForward className="size-4" />
                  </button>
                  <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => setExecution(null)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Clear visualization"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Variables table */}
                <div className="flex-1 overflow-auto px-4 py-3">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Variables at line {activeStep?.line ?? "?"}
                  </h3>
                  {activeStep && Object.keys(activeStep.locals).length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                            <th className="px-3 py-2">Variable</th>
                            <th className="px-3 py-2">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-xs dark:divide-slate-800">
                          {Object.entries(activeStep.locals).map(([name, value]) => (
                            <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="px-3 py-2 font-semibold text-violet-600 dark:text-violet-400">
                                {name}
                              </td>
                              <td className="max-w-[200px] truncate px-3 py-2 text-slate-700 dark:text-slate-300">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      {activeStep ? "No local variables at this step." : "No execution data."}
                    </p>
                  )}
                </div>

                {/* Stdout */}
                {execution.stdout && (
                  <div className="border-t border-slate-200 bg-slate-950 px-4 py-3 dark:border-slate-700">
                    <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Program Output</h3>
                    <pre className="max-h-[160px] overflow-auto font-mono text-xs text-green-400">
                      {execution.stdout}
                    </pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Terminal className="size-4" /> Output
                </span>
              </div>
              <div
                ref={outputRef}
                className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-sm leading-relaxed text-green-400"
              >
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span>Python 3.11 (WebAssembly)</span>
        <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
        <span className={isLoading ? "text-amber-500" : "text-emerald-500"}>
          {isLoading ? "Loading runtime..." : "Runtime ready"}
        </span>
        {execution && (
          <>
            <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <span>{execution.steps.length} trace steps captured</span>
          </>
        )}
      </div>
    </div>
  );
}
