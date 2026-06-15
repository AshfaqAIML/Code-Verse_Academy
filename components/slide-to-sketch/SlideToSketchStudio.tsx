"use client";

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Layers,
  Trash2,
  Plus,
  Printer,
  Sparkles,
  RefreshCw,
  Sliders,
  Type,
  Layout,
  ChevronUp,
  ChevronDown,
  Download,
  Image as ImageIcon,
  FolderOpen,
  PlusCircle,
  FileCode,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const fontPresets: Record<string, { name: string; desc: string; titleClass: string; bodyClass: string; checkmark: string }> = {
  mentor: {
    name: "The Classic Mentor",
    desc: "Flowing italicized cursive curves.",
    titleClass: "font-['Architects_Daughter']",
    bodyClass: "font-['Caveat'] tracking-wide",
    checkmark: "✓",
  },
  scribbler: {
    name: "The Creative Scribbler",
    desc: "Raw whiteboard marker strokes.",
    titleClass: "font-['Gochi_Hand']",
    bodyClass: "font-['Reenie_Beanie'] tracking-widest",
    checkmark: "✎",
  },
  boardroom: {
    name: "The Boardroom Sketcher",
    desc: "Clean architect block-print style.",
    titleClass: "font-['Patrick_Hand']",
    bodyClass: "font-['Indie_Flower'] leading-relaxed",
    checkmark: "✔",
  },
  tech: {
    name: "Minimalist Tech stylus",
    desc: "Geometric modern stylus annotations.",
    titleClass: "font-['Fredoka'] font-bold",
    bodyClass: "font-['Fredoka'] font-normal tracking-wide",
    checkmark: "●",
  },
};

const layoutArchitectures: Record<string, { name: string; desc: string }> = {
  cornell: { name: "Cornell Notes Method", desc: "Left keywords column, right core detail panel, bottom summary frame." },
  split: { name: "Split-Page Two-Column", desc: "Left column handles conceptual text, right side hosts code terminals." },
  mindmap: { name: "Visual Mind Map Cluster", desc: "Central layout node bubble splitting outward into organic satellite tags." },
  flashcard: { name: "Grid Revision Cards", desc: "Splits content vectors into colorful, hand-sketched boxes." },
  dashboard: { name: "Cheat Sheet Dashboard", desc: "Dense info overview packing code and diagrams efficiently." },
  notebook: { name: "Standard Bound Notebook", desc: "Traditional full-width layout mimicking your original uploaded photos." },
};

function getArrayFromData(dataString: string): string[] {
  if (!dataString) return ["10", "20", "30"];
  return dataString.split(",").map((s) => s.trim());
}

function generateId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type Slide = {
  id: string;
  title: string;
  paragraph: string;
  bullets: string[];
  code: string;
  visualType: string;
  visualData: string;
  cueKeywords: string;
  summary: string;
};

function createBlankSlide(): Slide {
  return {
    id: generateId(),
    title: "New Lesson Card",
    paragraph: "Pasted or typed notes appear inside the binder here. Toggle the layout presets to align notes on lined sheets.",
    bullets: ["Click elements to edit contents", "Select layout modes to re-render geometry"],
    code: "// Code block placeholder",
    visualType: "none",
    visualData: "",
    cueKeywords: "Concept, Core, Logic",
    summary: "Summary tracking statement describing the primary takeaway.",
  };
}

type FontPresetKey = keyof typeof fontPresets;
type LayoutKey = keyof typeof layoutArchitectures;

export default function SlideToSketchStudio() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [paperStyle, setPaperStyle] = useState("lined");
  const [activeTab, setActiveTab] = useState<"layout" | "bulk" | "edit" | "typography">("layout");
  const [selectedFontPreset, setSelectedFontPreset] = useState<FontPresetKey>("mentor");
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(32);
  const [verticalOffset, setVerticalOffset] = useState(4);
  const [selectedLayoutStructure, setSelectedLayoutStructure] = useState<LayoutKey>("notebook");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [liveStack, setLiveStack] = useState(["Frame_A", "Frame_B", "Frame_C"]);
  const [newStackItem, setNewStackItem] = useState("");
  const [liveQueue, setLiveQueue] = useState(["Job_1", "Job_2", "Job_3"]);
  const [newQueueItem, setNewQueueItem] = useState("");
  const [mounted, setMounted] = useState(false);

  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "slide-1",
      title: "Ch 1: Time Complexity Bounds",
      paragraph:
        "An algorithm computational analysis establishes a hardware-independent performance baseline relative to input scale N. We measure operation growth using asymptotic bounds.",
      bullets: [
        "O(1) Constant Time: Instant execution (e.g., Array Index access).",
        "O(log N) Logarithmic: Slices search zones in half (e.g., Binary Search).",
        "O(N) Linear Time: Scales proportionally with items count (e.g., Single Loop).",
        "O(N^2) Quadratic: Deep processing complexity (e.g., Nested Loops).",
      ],
      code: `// C++ Complexity Growth Demo
for(int i = 0; i < n; i++) {
    std::cout << i << " ";
}`,
      visualType: "complexity",
      visualData: "10, 50, 100, 250",
      cueKeywords: "Asymptotic, Complexity, Upper Bound, Worst-Case",
      summary:
        "Time Complexity models the absolute worst-case growth curves of instructions, neutralizing local hardware speed variations.",
    },
    {
      id: "slide-2",
      title: "Ch 2: Stack LIFO Buffer Operations",
      paragraph:
        "A Stack is a linear logical structure operating under the Last In First Out (LIFO) protocol. Insertion and deletion happen exclusively at the top index.",
      bullets: [
        "Push(): Places an element onto the peak of the stack buffer.",
        "Pop(): Extracts and deletes the topmost active element.",
        "Overflow: Triggered when pushing to a completely full static stack.",
        "Underflow: Triggered when trying to pop from an empty container.",
      ],
      code: `// C++ STL Stack operations
std::stack<std::string> buffer;
buffer.push("Frame_A");
buffer.pop();`,
      visualType: "stack",
      visualData: "Frame_A, Frame_B, Frame_C",
      cueKeywords: "LIFO, Push, Pop, Underflow, Overflow",
      summary:
        "Stack buffers manage context frames during execution and power depth-first graph exploration algorithms.",
    },
    {
      id: "slide-3",
      title: "Ch 3: Queue FIFO Conveyor Line",
      paragraph:
        "A Queue represents a First In First Out (FIFO) pipeline. Insertion happens at the rear tail of the buffer, while extraction occurs at the front head.",
      bullets: [
        "Enqueue(): Places a new element at the rear of the pipeline.",
        "Dequeue(): Removes and processes the oldest element from the front.",
        "Front Pointer: Tracks the exit boundary element of the queue.",
        "Rear Pointer: Tracks the incoming boundary element of the queue.",
      ],
      code: `// C++ Queue Pipeline
std::queue<int> tasks;
tasks.push(101); // Enqueue at Rear
tasks.pop();     // Dequeue from Front`,
      visualType: "queue",
      visualData: "Job_1, Job_2, Job_3",
      cueKeywords: "FIFO, Enqueue, Dequeue, Front, Rear",
      summary:
        "Queues maintain order in asynchronous task dispatch systems, CPU thread scheduling, and breadth-first search traversals.",
    },
    {
      id: "slide-4",
      title: "Ch 4: Binary Search Tree Nodes",
      paragraph:
        "A Binary Search Tree (BST) organizes node elements hierarchically. Each parent contains at most two children, maintaining sorted relational invariants.",
      bullets: [
        "Left Subtree Invariant: All descendant node values must be smaller.",
        "Right Subtree Invariant: All descendant node values must be larger.",
        "Height Bound: Balanced trees offer O(log N) lookup and search limits.",
      ],
      code: `// BST Inorder Traversal
void inorder(Node* root) {
    if(!root) return;
    inorder(root->left);
    std::cout << root->val;
    inorder(root->right);
}`,
      visualType: "tree",
      visualData: "50, 30, 70, 20, 40, 60, 80",
      cueKeywords: "BST, Invariant, Height, Inorder, Traversal",
      summary:
        "BST in-order traversals process keys in sorted ascending order, making them excellent for fast lookup database indexes.",
    },
  ]);

  const [bulkInput, setBulkInput] = useState(
    `--- Slide 1: Quick Sorting Arrays ---
Merge Sort recursive subdivisions slice lists in halves, executing a Divide & Conquer paradigm.
✓ Divide: split arrays around midpoint offsets
✓ Conquer: compare and order elements sequentially
✓ Space requirements scale at linear O(n) bounds

data: [15, 30, 45, 60, 75]
[Array Visualizer]

--- Slide 2: FIFO Queue Tasks ---
A Queue is a linear system preserving structural FIFO execution order.
✓ Standard task scheduling pipeline
✓ CPU multi-process buffers
✓ Linear memory space allocation

elements: [Job_A, Job_B, Job_C]
[Queue Visualizer]`
  );

  const notebookPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePresetChange = (key: FontPresetKey) => {
    setSelectedFontPreset(key);
    if (key === "scribbler") {
      setLineHeight(38);
      setVerticalOffset(-4);
    } else if (key === "boardroom") {
      setLineHeight(34);
      setVerticalOffset(2);
    } else if (key === "tech") {
      setLineHeight(30);
      setVerticalOffset(4);
    } else {
      setLineHeight(32);
      setVerticalOffset(4);
    }
  };

  const updateSlideField = (index: number, field: keyof Slide, value: string | string[]) => {
    const updated = [...slides];
    (updated[index] as any)[field] = value;
    setSlides(updated);
  };

  const handleAddNewSlide = () => {
    const newSlide = createBlankSlide();
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, idx) => idx !== index);
    setSlides(updated);
    if (activeSlideIndex >= updated.length) {
      setActiveSlideIndex(updated.length - 1);
    }
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === slides.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSlides(updated);
    setActiveSlideIndex(targetIdx);
  };

  const handleBulkParse = () => {
    if (!bulkInput.trim()) return;
    const blocks = bulkInput.split(/--- Slide \d+:\s*|---\s*Slide\s*|---\s*/i);
    const parsed = blocks
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        const lines = trimmed.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

        let title = "DSA Summary Sheet";
        let bullets: string[] = [];
        let paragraph = "";
        let visualType = "none";
        let cues = "Keywords, Offsets";
        let summary = "Core algorithmic summary trace statement.";

        const firstLine = lines[0];
        if (firstLine && !firstLine.startsWith("✓") && !firstLine.startsWith("cues:") && !firstLine.startsWith("[")) {
          title = firstLine.replace(/---/g, "").trim();
          lines.shift();
        }

        lines.forEach((line) => {
          if (line.startsWith("✓") || line.startsWith("•") || line.startsWith("-")) {
            bullets.push(line.replace(/^[✓•\-]\s*/, ""));
          } else if (line.startsWith("cues:")) {
            cues = line.substring(5).trim();
          } else if (line.startsWith("summary:")) {
            summary = line.substring(8).trim();
          } else if (line.startsWith("[") && line.endsWith("]")) {
            const lower = line.toLowerCase();
            if (lower.includes("complexity")) visualType = "complexity";
            else if (lower.includes("stack")) visualType = "stack";
            else if (lower.includes("queue")) visualType = "queue";
            else if (lower.includes("tree")) visualType = "tree";
            else visualType = "array";
          } else {
            paragraph += (paragraph ? " " : "") + line;
          }
        });

        return {
          id: generateId(),
          title,
          paragraph,
          bullets,
          code: "// Verified Data Structure Block",
          visualType,
          visualData: "",
          cueKeywords: cues,
          summary,
        } satisfies Slide;
      })
      .filter(Boolean) as Slide[];

    if (parsed.length > 0) {
      setSlides(parsed);
      setActiveSlideIndex(0);
    }
  };

  const handleExportAsImage = async (format: "png" | "jpeg" = "png") => {
    setExporting(true);
    setExportMessage(`Generating ${format.toUpperCase()}...`);
    try {
      const el = notebookPageRef.current;
      if (!el) throw new Error("Element not found");
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#fafaf9",
        useCORS: false,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `slide_${activeSlideIndex + 1}_sketch.${format === "jpeg" ? "jpg" : "png"}`;
      link.href = canvas.toDataURL(format === "jpeg" ? "image/jpeg" : "image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportMessage("Exported!");
    } catch (e: any) {
      setExportMessage(`Failed: ${e.message}`);
    }
    setExporting(false);
    setTimeout(() => setExportMessage(""), 3000);
  };

  const handleExportAllToPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [842, 595] });
      const originalIndex = activeSlideIndex;

      for (let i = 0; i < slides.length; i++) {
        setExportMessage(`Page ${i + 1} of ${slides.length}...`);
        setActiveSlideIndex(i);
        await new Promise((r) => setTimeout(r, 500));

        const el = notebookPageRef.current;
        if (!el) continue;
        const canvas = await html2canvas(el, {
          scale: 1.5,
          useCORS: false,
          backgroundColor: "#fafaf9",
          logging: false,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 842, 595);
      }

      setActiveSlideIndex(originalIndex);
      pdf.save("handdrawn_dsa_mastery_notes.pdf");
      setExportMessage("PDF ready!");
    } catch (e: any) {
      setExportMessage(`PDF failed: ${e.message}`);
    }
    setExporting(false);
    setTimeout(() => setExportMessage(""), 3000);
  };

  const pushToLiveStack = () => {
    if (!newStackItem.trim()) return;
    setLiveStack([...liveStack, newStackItem]);
    setNewStackItem("");
  };

  const popFromLiveStack = () => {
    if (liveStack.length === 0) return;
    const updated = [...liveStack];
    updated.pop();
    setLiveStack(updated);
  };

  const enqueueToLiveQueue = () => {
    if (!newQueueItem.trim()) return;
    setLiveQueue([...liveQueue, newQueueItem]);
    setNewQueueItem("");
  };

  const dequeueFromLiveQueue = () => {
    if (liveQueue.length === 0) return;
    const updated = [...liveQueue];
    updated.shift();
    setLiveQueue(updated);
  };

  const activeSlide = slides[activeSlideIndex] || slides[0];
  const activeFont = fontPresets[selectedFontPreset];

  if (!mounted) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div id="sketch-studio-root" className="flex min-h-[calc(100svh-4rem)] flex-col bg-slate-900 font-sans text-slate-100 selection:bg-rose-200 selection:text-slate-900">
      <style>{`
        #sketch-studio-root {
          --sketch-font-size: ${fontSize}px;
          --sketch-line-height: ${lineHeight}px;
          --sketch-offset: ${verticalOffset}px;
        }
        @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&family=Gochi+Hand&family=Reenie+Beanie&family=Patrick+Hand&family=Indie+Flower&family=Fredoka:wght@300..700&family=JetBrains+Mono:wght@400;600&display=swap');
        #sketch-studio-root .paper-lined {
          background-image: linear-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 100% var(--sketch-line-height, 32px);
        }
        #sketch-studio-root .paper-grid {
          background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
          background-size: 28px 28px;
        }
        #sketch-studio-root .paper-plain {
          background: #fafaf9;
        }
        #sketch-studio-root .ring-holder::before {
          content: '';
          position: absolute;
          width: 26px;
          height: 12px;
          background: linear-gradient(to right, #475569, #cbd5e1);
          border: 1px solid #1e293b;
          border-radius: 6px;
        }
      `}</style>

      <header className="no-print flex flex-wrap items-center justify-between border-b-4 border-rose-500 bg-slate-950 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-rose-500" />
          <div>
            <h1 className="font-['Fredoka'] text-xl font-bold">Slide-to-Sketch Studio v3.0</h1>
            <p className="font-mono text-xs text-slate-400">Convert text slides into multi-layout structural study logs</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["lined", "grid", "plain"] as const).map((style) => (
            <button
              key={style}
              onClick={() => setPaperStyle(style)}
              className={`rounded px-3 py-1 text-xs capitalize ${
                paperStyle === style ? "bg-rose-500 font-bold text-white" : "bg-slate-800"
              }`}
            >
              {style}
            </button>
          ))}
          <button
            onClick={handleExportAllToPDF}
            className="rounded bg-amber-500 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-amber-600"
          >
            Export All to PDF
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 md:p-6 lg:flex-row">
        <aside className="flex shrink-0 flex-col gap-4 text-slate-300 lg:w-[420px]">
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-bold">
            {(["layout", "bulk", "edit", "typography"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 rounded-lg py-2.5 capitalize transition ${
                  activeTab === t ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                {t === "layout" ? "1. Architecture" : t === "bulk" ? "2. Parser" : t === "edit" ? "3. Fields" : "4. Baseline"}
              </button>
            ))}
          </div>

          {activeTab === "layout" && (
            <div className="flex-1 space-y-3 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 shadow-lg">
              <span className="font-mono flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-400">
                <Layout className="h-3.5 w-3.5" /> Choose Note Layout
              </span>
              <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {(Object.entries(layoutArchitectures) as [LayoutKey, typeof layoutArchitectures[LayoutKey]][]).map(
                  ([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedLayoutStructure(key)}
                      className={`flex w-full flex-col rounded-xl border p-3.5 text-left transition ${
                        selectedLayoutStructure === key
                          ? "border-rose-500 bg-slate-900 text-white ring-1 ring-rose-500/30"
                          : "border-slate-700 bg-slate-900/40 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      <span className="mt-1 font-sans text-[10px] leading-relaxed text-slate-500">{item.desc}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === "bulk" && (
            <div className="flex flex-1 flex-col gap-3 rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 shadow-lg">
              <span className="font-mono flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-400">
                <FolderOpen className="h-3.5 w-3.5" /> Slide Transcript Parser
              </span>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={11}
                className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 p-2.5 font-mono text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleBulkParse}
                className="w-full rounded-xl bg-rose-500 py-2.5 text-xs font-bold transition hover:bg-rose-600"
              >
                Parse &amp; Populate Binder Deck
              </button>
            </div>
          )}

          {activeTab === "edit" && (
            <div className="max-h-[580px] overflow-y-auto rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 shadow-lg">
              <span className="block font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                Modify Variable Nodes
              </span>
              <div className="mt-3 space-y-2">
                <label className="font-mono text-[10px] text-slate-400">Header Title:</label>
                <input
                  type="text"
                  value={activeSlide.title}
                  onChange={(e) => updateSlideField(activeSlideIndex, "title", e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                />
              </div>
              <div className="mt-2 space-y-1">
                <label className="font-mono text-[10px] text-slate-400">Body Paragraph:</label>
                <textarea
                  value={activeSlide.paragraph}
                  onChange={(e) => updateSlideField(activeSlideIndex, "paragraph", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded border border-slate-700 bg-slate-900 p-2 text-xs text-white"
                />
              </div>
              <div className="mt-2 space-y-2 rounded-xl border border-slate-700 bg-slate-900/60 p-2">
                <label className="font-mono text-[10px] text-slate-400">Keywords &amp; Core Summary Elements:</label>
                <input
                  type="text"
                  value={activeSlide.cueKeywords}
                  onChange={(e) => updateSlideField(activeSlideIndex, "cueKeywords", e.target.value)}
                  placeholder="Keywords (comma separated)"
                  className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 font-mono text-xs text-white"
                />
                <textarea
                  value={activeSlide.summary}
                  onChange={(e) => updateSlideField(activeSlideIndex, "summary", e.target.value)}
                  placeholder="Summary strip text..."
                  rows={2}
                  className="w-full resize-none rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {activeTab === "typography" && (
            <div className="rounded-2xl border-2 border-slate-700 bg-slate-800 p-4 text-xs text-slate-300 shadow-lg">
              <span className="block font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
                4. Baseline Typography
              </span>
              <div className="mt-3 flex gap-1.5">
                {(Object.keys(fontPresets) as FontPresetKey[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetChange(preset)}
                    className={`flex-1 rounded border py-1 text-[11px] capitalize ${
                      selectedFontPreset === preset
                        ? "border-rose-500 bg-rose-500/20 font-bold text-rose-300"
                        : "border-slate-700 bg-slate-900/50"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
                <div>
                  <div className="flex justify-between font-mono text-[9px]">
                    <span>FONT DIMENSIONS:</span>
                    <span>{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={24}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[9px]">
                    <span>SHEET ROW HEIGHT:</span>
                    <span>{lineHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min={24}
                    max={46}
                    value={lineHeight}
                    onChange={(e) => setLineHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[9px]">
                    <span>VERTICAL SHIFT OFFSET:</span>
                    <span>{verticalOffset}px</span>
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={16}
                    value={verticalOffset}
                    onChange={(e) => setVerticalOffset(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-3 shadow-xl">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Active Deck Directory ({slides.length} slides)
            </span>
            <div className="max-h-[140px] space-y-1 overflow-y-auto pr-1">
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-xs ${
                    activeSlideIndex === idx
                      ? "border-rose-500 bg-rose-500/10 font-bold text-white"
                      : "border-slate-700 bg-slate-900/30 text-slate-400"
                  }`}
                >
                  <span className="max-w-[240px] truncate font-mono">
                    {idx + 1}. {s.title}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, "up"); }} disabled={idx === 0}>
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, "down"); }} disabled={idx === slides.length - 1}>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }} className="pl-1 text-rose-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddNewSlide}
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-white/5 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            >
              <Plus className="h-3 w-3" /> Add Slide
            </button>
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-slate-700 bg-slate-800 p-3">
            <span className="font-mono text-xs text-slate-400">Capture Active Visual Frame:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportAsImage("png")}
                disabled={exporting}
                className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <ImageIcon className="h-3.5 w-3.5" /> PNG
              </button>
              <button
                onClick={() => handleExportAsImage("jpeg")}
                disabled={exporting}
                className="flex items-center gap-1 rounded-xl bg-sky-500 px-3 py-1 text-xs font-bold text-slate-950 transition hover:bg-sky-400 disabled:opacity-50"
              >
                <ImageIcon className="h-3.5 w-3.5" /> JPEG
              </button>
              <button
                onClick={handleExportAllToPDF}
                disabled={exporting}
                className="flex items-center gap-1 rounded-xl bg-purple-500 px-3 py-1 text-xs font-bold text-white transition hover:bg-purple-400 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 rounded-xl bg-slate-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-slate-500"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>
          </div>

          {exportMessage && (
            <div className="no-print absolute left-3 top-14 z-30 animate-pulse rounded-lg bg-rose-600 px-3 py-1.5 font-mono text-xs text-white shadow-md">
              {exportMessage}
            </div>
          )}

          <div
            ref={notebookPageRef}
            id="notebook-render-surface"
            className="relative flex min-h-[660px] flex-1 overflow-hidden rounded-3xl border-4 border-slate-950 bg-amber-50 p-8 text-slate-900 shadow-2xl"
          >
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 flex w-16 flex-col justify-between bg-gradient-to-r from-amber-100/90 to-transparent py-8">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="ring-holder relative flex h-4 items-center justify-end pr-3">
                  <div className="h-4.5 w-3.5 origin-left rotate-12 rounded-full border border-slate-700 bg-gradient-to-r from-slate-600 to-slate-200 shadow shadow-slate-950/40"></div>
                  <div className="-mr-1.5 h-1.5 w-5 border-b border-t border-slate-400 bg-slate-300"></div>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-0 left-20 top-0 z-10 w-[2px] bg-rose-400/80"></div>

            <div
              className={`relative flex flex-1 flex-col pl-16 ${
                paperStyle === "lined"
                  ? "paper-lined"
                  : paperStyle === "grid"
                  ? "paper-grid"
                  : "paper-plain"
              }`}
              style={{
                lineHeight: `${lineHeight}px`,
                fontSize: `${fontSize}px`,
              }}
            >
              <div className="no-print absolute right-2 top-0 flex select-none flex-col items-end opacity-90">
                <span className="font-['Architects_Daughter'] text-sm font-bold text-rose-800">@curious_programmer</span>
                <span className="-mt-2 font-mono text-[8px] uppercase tracking-widest text-slate-400">Revision Visual Guide</span>
              </div>

              {selectedLayoutStructure === "notebook" && (
                <div className="flex flex-1 flex-col gap-4">
                  <h2 className={`border-b-2 border-slate-400/20 pb-1 text-3xl font-black text-rose-900 ${activeFont.titleClass}`}>
                    {activeSlide.title}
                  </h2>
                  <p className={`font-bold leading-relaxed text-slate-800 ${activeFont.bodyClass}`}>{activeSlide.paragraph}</p>
                  <div className="space-y-1">
                    {activeSlide.bullets.map((b, i) => (
                      <div key={i} className={`flex items-start gap-2 text-slate-800 ${activeFont.bodyClass}`}>
                        <span className="mt-0.5 text-xl font-bold text-rose-700">{activeFont.checkmark}</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {activeSlide.code && (
                    <div className="mt-2 rounded-xl border-2 border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-400">
                      <pre className="whitespace-pre-wrap">{activeSlide.code}</pre>
                    </div>
                  )}

                  {activeSlide.visualType === "complexity" && (
                    <div className="mt-4 flex h-24 max-w-md items-end justify-around rounded-xl bg-slate-900 p-3">
                      <div className="h-2 w-5 bg-emerald-500" />
                      <div className="h-6 w-5 bg-sky-500" />
                      <div className="h-12 w-5 bg-yellow-500" />
                      <div className="h-20 w-5 bg-rose-500" />
                    </div>
                  )}

                  {activeSlide.visualType === "array" && (
                    <div className="mt-2 flex gap-2">
                      {getArrayFromData(activeSlide.visualData).map((num, i) => (
                        <div
                          key={i}
                          className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border-2 border-slate-800 bg-white text-sm font-bold shadow-sm"
                        >
                          <span>{num}</span>
                          <span className="-mt-1 font-mono text-[8px] text-slate-400">idx {i}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeSlide.visualType === "stack" && (
                    <div className="mt-2 max-w-sm rounded-xl border border-dashed border-slate-400 bg-white/70 p-4">
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex min-h-24 w-24 flex-col-reverse gap-1 rounded-b-xl border-2 border-b-4 border-slate-800 bg-amber-50/50 p-1">
                          {liveStack.map((el, idx) => (
                            <div
                              key={idx}
                              className="w-full rounded border border-rose-800 bg-rose-200 py-0.5 text-center font-mono text-[10px] font-bold"
                            >
                              {el}
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={newStackItem}
                              onChange={(e) => setNewStackItem(e.target.value)}
                              placeholder="Val"
                              className="w-14 rounded border bg-white px-1.5 py-0.5 text-slate-900"
                            />
                            <button
                              onClick={pushToLiveStack}
                              className="rounded border border-emerald-800 bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-950"
                            >
                              Push
                            </button>
                          </div>
                          <button
                            onClick={popFromLiveStack}
                            className="rounded border border-rose-800 bg-rose-100 py-0.5 font-bold text-rose-950"
                          >
                            Pop()
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSlide.visualType === "queue" && (
                    <div className="mt-2 max-w-md rounded-xl border border-dashed border-slate-400 bg-white/70 p-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-400 bg-amber-50/60 p-1.5">
                          <span className="mr-1 font-mono text-[8px] text-slate-400">Exit</span>
                          {liveQueue.map((val, idx) => (
                            <div
                              key={idx}
                              className="rounded border border-slate-400 bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold"
                            >
                              {val}
                            </div>
                          ))}
                          <span className="ml-1 font-mono text-[8px] text-slate-400">Enter</span>
                        </div>
                        <div className="flex gap-1 text-[10px]">
                          <input
                            type="text"
                            value={newQueueItem}
                            onChange={(e) => setNewQueueItem(e.target.value)}
                            placeholder="Job"
                            className="w-16 rounded border bg-white px-1.5 py-0.5 text-slate-900"
                          />
                          <button
                            onClick={enqueueToLiveQueue}
                            className="rounded border border-emerald-800 bg-emerald-100 px-2 py-0.5 font-bold text-emerald-950"
                          >
                            Enqueue
                          </button>
                          <button
                            onClick={dequeueFromLiveQueue}
                            className="rounded border border-sky-800 bg-sky-100 px-2 py-0.5 font-bold text-sky-950"
                          >
                            Dequeue
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSlide.visualType === "tree" && (
                    <div className="mx-auto mt-2 max-w-xs rounded-xl border border-dashed border-slate-400 bg-white/70 p-4">
                      <svg className="h-20 w-48" viewBox="0 0 200 100">
                        <line x1="100" y1="20" x2="60" y2="50" stroke="#be123c" strokeWidth="2" />
                        <line x1="100" y1="20" x2="140" y2="50" stroke="#be123c" strokeWidth="2" />
                        <circle cx="100" cy="20" r="12" fill="#fef08a" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="100" y="23" textAnchor="middle" className="text-[8px] font-bold" fill="#0f172a">
                          {getArrayFromData(activeSlide.visualData)[0] || "50"}
                        </text>
                        <circle cx="60" cy="50" r="12" fill="#bfdbfe" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="60" y="53" textAnchor="middle" className="text-[8px] font-bold" fill="#0f172a">
                          {getArrayFromData(activeSlide.visualData)[1] || "30"}
                        </text>
                        <circle cx="140" cy="50" r="12" fill="#fbcfe8" stroke="#1e293b" strokeWidth="1.5" />
                        <text x="140" y="53" textAnchor="middle" className="text-[8px] font-bold" fill="#0f172a">
                          {getArrayFromData(activeSlide.visualData)[2] || "70"}
                        </text>
                      </svg>
                    </div>
                  )}
                </div>
              )}

              {selectedLayoutStructure === "cornell" && (
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <h2 className={`border-b-2 border-slate-400/30 pb-1 text-2xl font-black text-rose-900 ${activeFont.titleClass}`}>
                      {activeSlide.title}
                    </h2>
                    <div className="mt-2 grid flex-1 grid-cols-10 gap-4">
                      <div className="col-span-3 flex min-h-[320px] flex-col gap-2 border-r-2 border-dashed border-slate-400/50 pr-3 pt-1 text-sm font-bold text-rose-800">
                        {activeSlide.cueKeywords.split(",").map((k, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 rounded border border-slate-300 bg-amber-100/70 p-1.5 text-center shadow-sm"
                          >
                            <span className="text-xs">💡</span>
                            <span className={activeFont.titleClass}>{k.trim()}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`col-span-7 space-y-3 pl-2 text-slate-800 ${activeFont.bodyClass}`}>
                        <p className="text-base font-bold leading-relaxed text-slate-950">{activeSlide.paragraph}</p>
                        {activeSlide.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="font-bold text-emerald-700">{activeFont.checkmark}</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 rounded-xl border-2 border-slate-800 bg-yellow-100/60 p-4">
                    <span className="block -mb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-900">
                      Summary Frame:
                    </span>
                    <p className={`font-bold leading-normal text-slate-800 ${activeFont.bodyClass}`}>{activeSlide.summary}</p>
                  </div>
                </div>
              )}

              {selectedLayoutStructure === "split" && (
                <div className="flex flex-1 flex-col">
                  <h2 className={`border-b pb-1 text-2xl font-black text-rose-900 ${activeFont.titleClass}`}>
                    {activeSlide.title}
                  </h2>
                  <div className="mt-3 grid flex-1 grid-cols-2 gap-6 items-start">
                    <div className={`space-y-4 text-slate-800 ${activeFont.bodyClass}`}>
                      <p className="text-base font-bold leading-relaxed">{activeSlide.paragraph}</p>
                      {activeSlide.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-sm">
                          <span className="font-bold text-sky-700">{activeFont.checkmark}</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border-2 border-slate-800 bg-slate-950 p-4 font-mono text-xs">
                      <div className="mb-2 flex justify-between border-b border-slate-800 pb-1 text-[10px] text-slate-500">
                        <span>💡 terminal_buffer.cpp</span>
                        <span>STL Source</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-snug text-emerald-400">{activeSlide.code}</pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedLayoutStructure === "mindmap" && (
                <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
                  <div className="mb-6 max-w-sm border-2 border-rose-900 bg-rose-100 p-4 text-rose-950 shadow-md">
                    <h2 className={`text-xl font-black ${activeFont.titleClass}`}>{activeSlide.title}</h2>
                    <p className="mt-1 font-sans text-xs leading-tight text-rose-800">{activeSlide.paragraph}</p>
                  </div>
                  <div className="mt-4 grid w-full grid-cols-3 gap-4">
                    {activeSlide.bullets.map((b, i) => (
                      <div key={i} className="relative rounded-xl border-2 border-slate-800 bg-white p-3 shadow-md">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[9px] text-white">
                          Node #{i + 1}
                        </span>
                        <p className={`mt-1 text-xs font-bold text-slate-800 ${activeFont.bodyClass}`}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLayoutStructure === "flashcard" && (
                <div className="flex flex-1 flex-col">
                  <h2 className={`mb-3 text-2xl font-black text-rose-900 ${activeFont.titleClass}`}>{activeSlide.title}</h2>
                  <div className="grid flex-1 grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center rounded-2xl border-2 border-emerald-800 bg-emerald-50 p-4">
                      <p className={`text-xs font-bold text-emerald-950 ${activeFont.bodyClass}`}>{activeSlide.paragraph}</p>
                    </div>
                    {activeSlide.bullets.map((b, i) => {
                      const colors = [
                        "border-sky-800 bg-sky-50 text-sky-950",
                        "border-yellow-800 bg-yellow-50 text-yellow-950",
                        "border-purple-800 bg-purple-50 text-purple-950",
                      ];
                      return (
                        <div
                          key={i}
                          className={`flex flex-col justify-center rounded-2xl border-2 p-4 ${colors[i % colors.length]}`}
                        >
                          <p className={`text-xs font-bold ${activeFont.bodyClass}`}>{b}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedLayoutStructure === "dashboard" && (
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <h2 className={`border-b pb-1 text-2xl font-black text-rose-900 ${activeFont.titleClass}`}>
                    {activeSlide.title}
                  </h2>
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div
                      className={`col-span-7 rounded-xl border-2 border-slate-800 bg-white/40 p-4 ${activeFont.bodyClass}`}
                    >
                      <p className="mb-2 font-bold text-slate-950">{activeSlide.paragraph}</p>
                      {activeSlide.bullets.map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-800">
                          <span className="font-bold text-rose-700">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="col-span-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px]">
                      <pre className="text-sky-400">{activeSlide.code.slice(0, 180)}...</pre>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-100 p-3 text-xs font-bold text-amber-950">
                    <span>💡</span>
                    {activeSlide.summary}
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute bottom-3 right-6 select-none rounded-full border border-slate-400/10 bg-slate-900/5 px-2.5 py-0.5 font-mono text-[9px] text-slate-400">
                {selectedLayoutStructure.toUpperCase()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
