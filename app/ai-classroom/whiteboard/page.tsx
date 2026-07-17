"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Pen, Square, Circle, Minus, Type, Eraser, RotateCcw, Trash2, Download, PaintBucket } from "lucide-react";

type Tool = "pen" | "rect" | "circle" | "line" | "text" | "eraser";

const COLORS = ["#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
const FILL_COLORS = ["none", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];
const TOOLS: { id: Tool; icon: typeof Pen; label: string }[] = [
  { id: "pen", icon: Pen, label: "Pen" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("none");
  const [brushSize, setBrushSize] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d"), []);

  function resizeCanvas() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(data, 0, 0);
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function saveState() {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-30), data]);
    setRedoStack([]);
  }

  function undo() {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas || undoStack.length === 0) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack((prev) => [...prev, current]);
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    ctx.putImageData(prev, 0, 0);
  }

  function redo() {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas || redoStack.length === 0) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, current]);
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    ctx.putImageData(next, 0, 0);
  }

  function clearCanvas() {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    saveState();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const pos = getPos(e);
    if (tool === "text") {
      setTextPos(pos);
      setShowTextInput(true);
      return;
    }
    setDrawing(true);
    setStartPos(pos);
    const ctx = getCtx();
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    saveState();
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineCap = "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else {
      const savedData = undoStack[undoStack.length - 1];
      if (savedData) ctx.putImageData(savedData, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();

      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);
      const w = Math.abs(pos.x - startPos.x);
      const h = Math.abs(pos.y - startPos.y);

      if (tool === "rect") {
        if (fillColor !== "none") {
          ctx.fillStyle = fillColor;
          ctx.fillRect(x, y, w, h);
        }
        ctx.strokeRect(x, y, w, h);
      } else if (tool === "circle") {
        const cx = startPos.x + (pos.x - startPos.x) / 2;
        const cy = startPos.y + (pos.y - startPos.y) / 2;
        const rx = w / 2;
        const ry = h / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (fillColor !== "none") {
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    }
  }

  function endDraw() {
    setDrawing(false);
  }

  function placeText() {
    if (!textInput.trim()) return;
    const ctx = getCtx();
    if (!ctx) return;
    saveState();
    ctx.fillStyle = color;
    ctx.font = `${brushSize * 6}px sans-serif`;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput("");
    setShowTextInput(false);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const strokePreview = brushSize;

  return (
    <main className="px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3">
              <Sparkles className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Whiteboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Draw diagrams, flowcharts, and visual explanations</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const isActive = tool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={t.label}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}

            <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`size-6 rounded-full border-2 transition ${
                    color === c ? "scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c, borderColor: c === "#ffffff" ? (color === c ? "#000" : "#ccc") : undefined }}
                />
              ))}
            </div>

            <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />

            {(tool === "rect" || tool === "circle") && (
              <>
                <PaintBucket className="size-4 text-slate-400" />
                <select
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"
                >
                  {FILL_COLORS.map((c) => (
                    <option key={c} value={c}>{c === "none" ? "No Fill" : c}</option>
                  ))}
                </select>
                <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700" />
              </>
            )}

            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
              title="Brush size"
            />
            <div
              className="rounded-full bg-slate-200 dark:bg-slate-700"
              style={{ width: strokePreview + 8, height: strokePreview + 8, minWidth: 8, minHeight: 8 }}
            />
            <span className="text-xs text-slate-400">{brushSize}px</span>

            <div className="ml-auto flex items-center gap-1">
              <button onClick={undo} disabled={undoStack.length === 0} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800" title="Undo">
                <RotateCcw className="size-4" />
              </button>
              <button onClick={redo} disabled={redoStack.length === 0} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800" title="Redo">
                <RotateCcw className="size-4 -scale-x-100" />
              </button>
              <button onClick={clearCanvas} className="rounded-xl p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Clear">
                <Trash2 className="size-4" />
              </button>
              <button onClick={download} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Download">
                <Download className="size-4" />
              </button>
            </div>
          </div>

          <div className="relative" ref={containerRef}>
            <canvas
              ref={canvasRef}
              className="h-[600px] w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {showTextInput && (
              <div
                className="absolute flex gap-2"
                style={{ left: textPos.x, top: textPos.y }}
              >
                <input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") placeText(); if (e.key === "Escape") setShowTextInput(false); }}
                  className="rounded-xl border-2 border-brand-500 bg-white px-3 py-2 text-sm font-mono outline-none shadow-lg dark:bg-slate-900"
                  placeholder="Type text..."
                  autoFocus
                />
                <button onClick={placeText} className="rounded-xl bg-brand-500 px-3 py-2 text-white text-sm font-bold">OK</button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              {TOOLS.find((t) => t.id === tool)?.label} mode
              {color !== "#000000" && ` · ${color}`}
              {` · ${brushSize}px`}
            </span>
            <span className="text-xs text-slate-400">
              Undo: {undoStack.length} / Redo: {redoStack.length}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
