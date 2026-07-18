"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import type { IChapterEditBlock } from "@/lib/models/ChapterEdit";

type Props = {
  blocks: IChapterEditBlock[];
  onChange: (blocks: IChapterEditBlock[]) => void;
};

const BLOCK_TYPES = ["heading", "subheading", "paragraph", "list", "callout", "code", "table"] as const;

export function ChapterBlockEditor({ blocks, onChange }: Props) {
  const addBlock = (afterIndex: number) => {
    const next = [...blocks];
    next.splice(afterIndex + 1, 0, { type: "paragraph", text: "" });
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const updateBlock = (index: number, patch: Partial<IChapterEditBlock>) => {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  return (
    <div className="space-y-3">
      {blocks.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">No blocks yet. Click + to add one.</p>
      )}
      {blocks.map((block, i) => (
        <div key={i} className="group flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="mt-1.5 flex shrink-0 cursor-grab items-center text-slate-300">
            <GripVertical className="size-4" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={block.type}
                onChange={(e) => updateBlock(i, { type: e.target.value })}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="text-xs text-slate-400">#{i + 1}</span>
            </div>
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(i, { text: e.target.value })}
              rows={block.type === "code" ? 6 : 3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm font-mono outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => addBlock(i)}
              className="rounded-lg border border-slate-200 p-1.5 text-green-600 transition hover:bg-green-50 dark:border-slate-700"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => removeBlock(i)}
              className="rounded-lg border border-slate-200 p-1.5 text-red-500 transition hover:bg-red-50 dark:border-slate-700"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
      {blocks.length > 0 && (
        <button
          type="button"
          onClick={() => addBlock(blocks.length - 1)}
          className="w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-bold text-slate-400 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700"
        >
          + Add block
        </button>
      )}
    </div>
  );
}
