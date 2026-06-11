import fs from "fs";

const content = fs.readFileSync(
  "C:\\Users\\moham\\Downloads\\Kamraan\\WEB DEV\\CodeVerse Academy\\_temp_article.md",
  "utf-8"
);

const lines = content.split("\n");
const blocks = [];
let wordCount = 0;
let sectionCount = 0;
let excerpt = "";
let excerptDone = false;

for (const rawLine of lines) {
  const line = rawLine.trimEnd();
  const trimmed = line.trim();
  if (trimmed === "") continue;

  if (/^## /.test(trimmed)) {
    const text = trimmed.replace(/^## /, "");
    blocks.push({ type: "heading", level: 2, text });
    sectionCount++;
    wordCount += text.split(/\s+/).filter(Boolean).length;
  } else if (/^### /.test(trimmed)) {
    const text = trimmed.replace(/^### /, "");
    blocks.push({ type: "heading", level: 3, text });
    sectionCount++;
    wordCount += text.split(/\s+/).filter(Boolean).length;
  } else if (/^\|/.test(trimmed) || /^---/.test(trimmed)) {
    // skip table rows and hr
  } else if (/^```/.test(trimmed)) {
    // skip code fence markers
  } else if (/^- /.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
    let text = trimmed.replace(/^- \*\*/, "").replace(/\*\*$/, "").replace(/^- /, "").replace(/^\d+\.\s*/, "");
    blocks.push({ type: "list", text });
    wordCount += text.split(/\s+/).filter(Boolean).length;
  } else if (/^`[^`]/.test(trimmed)) {
    let text = trimmed.replace(/^`/, "").replace(/`$/, "");
    blocks.push({ type: "pre", text });
    wordCount += text.split(/\s+/).filter(Boolean).length;
  } else {
    let text = trimmed.replace(/\*\*/g, "");
    blocks.push({ type: "paragraph", text });
    wordCount += text.split(/\s+/).filter(Boolean).length;
  }

  if (!excerptDone && blocks.length >= 2 && blocks[1].type === "paragraph") {
    excerpt = blocks[1].text.substring(0, 200);
    excerptDone = true;
  }
}

const readingTime = Math.max(1, Math.round(wordCount / 220));

const articleEntry = {
  order: 5,
  slug: "3-powerful-tools-that-reduce-llm-token-usage",
  title:
    "3 Powerful Tools That Reduce LLM Token Usage and Improve AI Memory: Caveman, RTK, and Supermemory",
  category: "AI",
  excerpt,
  wordCount,
  readingTime,
  sectionCount,
  format: "Web article",
  blocks,
};

fs.writeFileSync(
  "C:\\Users\\moham\\Downloads\\Kamraan\\WEB DEV\\CodeVerse Academy\\_article_entry.json",
  JSON.stringify(articleEntry, null, 2),
  "utf-8"
);

console.log(`wordCount: ${wordCount}`);
console.log(`readingTime: ${readingTime}`);
console.log(`sectionCount: ${sectionCount}`);
console.log(`blocks: ${blocks.length}`);
console.log(`excerpt length: ${excerpt.length}`);
console.log("Done.");
