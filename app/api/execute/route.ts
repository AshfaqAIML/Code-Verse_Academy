import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const TRACER_SETUP = `
import sys, json, io

_trace = {"steps": [], "heap": {}, "stdout": ""}
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
            _trace["heap"][oid] = {"type": "list", "items": [_desc(x, depth+1) for x in v], "length": len(v), "repr": repr(v)[:200]}
        return {"kind": "ref", "oid": oid}
    if isinstance(v, tuple):
        oid = "oid_" + str(id(v))
        if oid not in _trace["heap"]:
            _trace["heap"][oid] = {"type": "tuple", "items": [_desc(x, depth+1) for x in v], "length": len(v), "repr": repr(v)[:200]}
        return {"kind": "ref", "oid": oid}
    if isinstance(v, dict):
        oid = "oid_" + str(id(v))
        if oid not in _trace["heap"]:
            pairs = []
            for k, val in list(v.items())[:12]:
                pairs.append({"key": _desc(k, depth+1), "val": _desc(val, depth+1)})
            _trace["heap"][oid] = {"type": "dict", "pairs": pairs, "length": len(v), "repr": repr(v)[:200]}
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

function wrapWithTracer(userCode: string): string {
  return `
${TRACER_SETUP}

_captured_out = io.StringIO()
_saved_out = sys.stdout
sys.stdout = _captured_out

__user_code__ = ${JSON.stringify(userCode)}
__user_code_obj__ = compile(__user_code__, "<usercode>", "exec")

sys.settrace(_T())
__user_globals__ = {"__name__": "__main__", "__builtins__": __builtins__}
try:
    exec(__user_code_obj__, __user_globals__)
except Exception as e:
    _trace["error"] = str(e)
sys.settrace(None)

sys.stdout = _saved_out
print(_captured_out.getvalue(), end="")
print("__TRACE__")
print(json.dumps(_trace))
`;
}

export async function POST(req: NextRequest) {
  try {
    const { code, mode } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const isVisualize = mode === "visualize";
    const sourceCode = isVisualize ? wrapWithTracer(code) : code;

    const body = {
      language: "python",
      version: "3.10.0",
      files: [{ name: "main.py", content: sourceCode }],
    };

    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Piston API error (${response.status}): ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const stdout: string = result?.run?.stdout ?? "";
    const stderr: string = result?.run?.stderr ?? "";

    if (isVisualize) {
      const traceMarker = "__TRACE__";
      const traceIdx = stdout.lastIndexOf(traceMarker);

      if (traceIdx === -1) {
        return NextResponse.json({
          output: stdout || stderr || "(no output)",
          error: stderr || null,
        });
      }

      const userOutput = stdout.slice(0, traceIdx);
      const traceStr = stdout.slice(traceIdx + traceMarker.length).trim();

      try {
        const traceData = JSON.parse(traceStr);
        return NextResponse.json({
          trace: traceData,
          output: userOutput,
          error: traceData.error || stderr || null,
        });
      } catch {
        return NextResponse.json({
          output: userOutput || traceStr,
          error: "Failed to parse trace data: " + traceStr.slice(0, 100),
        });
      }
    }

    const output = stdout || stderr || "(no output)";
    return NextResponse.json({ output, error: stderr || null });
  } catch (error: any) {
    if (error?.name === "TimeoutError") {
      return NextResponse.json({ error: "Execution timed out (30s)" }, { status: 504 });
    }
    return NextResponse.json(
      { error: error?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
