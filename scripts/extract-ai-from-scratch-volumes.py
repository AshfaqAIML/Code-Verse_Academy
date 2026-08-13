from __future__ import annotations

import json
import re
import glob
from pathlib import Path

import fitz  # PyMuPDF

OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "books"
SOURCE_GLOB = r"C:\Users\moham\Downloads\Kamraan\AI_and_ML\AIMLENG\Books\aiefs-vol*.pdf"

BULLETS = ("\u2022", "\u25e6", "\u25aa", "\u25cf", "\u25b8", "\ufffd")

# Per-volume book metadata
VOLUME_META = {
    "aiefs-vol1-foundations.pdf": {
        "slug": "ai-from-scratch-vol1-foundations",
        "title": "AI From Scratch: Volume 1 - Foundations",
        "level": "Volume 1",
        "coverTheme": "aurora",
        "description": "Foundations for AI engineering: environment setup, the math (linear algebra, calculus, probability, statistics, optimization), and machine learning fundamentals."
    },
    "aiefs-vol2-deep-learning.pdf": {
        "slug": "ai-from-scratch-vol2-deep-learning",
        "title": "AI From Scratch: Volume 2 - Deep Learning",
        "level": "Volume 2",
        "coverTheme": "midnight",
        "description": "Deep learning from first principles: the perceptron, multi-layer networks, backpropagation, activation and loss functions, plus computer vision and speech & audio."
    },
    "aiefs-vol3-language.pdf": {
        "slug": "ai-from-scratch-vol3-language",
        "title": "AI From Scratch: Volume 3 - Language",
        "level": "Volume 3",
        "coverTheme": "default",
        "description": "Natural language processing from foundations to advanced: tokenization, text representation, word embeddings, plus a deep dive into transformers."
    },
    "aiefs-vol4-llms.pdf": {
        "slug": "ai-from-scratch-vol4-llms",
        "title": "AI From Scratch: Volume 4 - Large Language Models",
        "level": "Volume 4",
        "coverTheme": "aurora",
        "description": "Generative AI, reinforcement learning, building LLMs from scratch, and LLM engineering for production use."
    },
    "aiefs-vol5-agents.pdf": {
        "slug": "ai-from-scratch-vol5-agents",
        "title": "AI From Scratch: Volume 5 - Agents",
        "level": "Volume 5",
        "coverTheme": "midnight",
        "description": "Multimodal AI, tools and protocols, agent engineering, autonomous systems, and multi-agent swarms."
    },
    "aiefs-vol6-production.pdf": {
        "slug": "ai-from-scratch-vol6-production",
        "title": "AI From Scratch: Volume 6 - Production",
        "level": "Volume 6",
        "coverTheme": "default",
        "description": "Ship AI responsibly: infrastructure and production, ethics safety and alignment, and capstone projects."
    },
}


def normalize(text: str) -> str:
    text = re.sub(r"[\ufffd]", "-", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "item"


FRONT_MATTER = {
    "about this volume",
    "how to use this book",
}


def is_front_matter(title: str) -> bool:
    return normalize(title).strip().lower().split()[0:3] and " ".join(
        normalize(title).strip().lower().split()[:4]
    ) in FRONT_MATTER or normalize(title).strip().lower() in FRONT_MATTER


def is_lesson_heading(text: str) -> bool:
    lowered = normalize(text).strip().lower()
    if not lowered:
        return False
    if lowered.startswith(("part ", "chapter ", "section ")):
        return False
    return True


def slug_clean_heading(text: str) -> str:
    return re.sub(r"^Part\s+[IVX0-9]+\s*[:\-]\s*", "", text, flags=re.IGNORECASE).strip()


def is_code_line(text: str) -> bool:
    lines = [line.rstrip() for line in text.splitlines() if line.strip()]
    if not lines:
        return False
    line = lines[0]
    return bool(
        re.search(
            r"^(?:from |import |def |class |const |let |var |function |return |print\(|echo |curl |brew |apt |sudo |wsl |docker |pip |uv |npm |pnpm |cargo |rustc |fnm |git |xcode|# |export |eval |arch |source |node |python|IfError|raise |and\s+|if\s+|else:|elif)",
            line,
        )
        or ("=" in line and len(line) <= 120)
        or ("(" in line and ")" in line and len(line) <= 120)
        or line.startswith(("    ", "\t"))
    )


def looks_like_callout(text: str) -> bool:
    return bool(
        re.search(
            r"^(?:Note|Tip|Warning|Important|Caution|Type|Prerequisites|Time|Verify|Expected output|Output|Common mistake|Common pitfalls?|Watch out|Remember):",
            text,
            re.IGNORECASE,
        )
        or "Rendered live in the web edition" in text
        or "Diagram." in text
    )


class Line:
    __slots__ = ("text", "size", "bold")

    def __init__(self, text: str, size: float, bold: bool) -> None:
        self.text = text
        self.size = size
        self.bold = bold


def extract_lines(page) -> list[Line]:
    lines: list[Line] = []
    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for raw in block.get("lines", []):
            spans = raw["spans"]
            if not spans:
                continue
            first = spans[0]
            text = "".join(sp["text"] for sp in spans)
            text = text.replace("\u2018", "'").replace("\u2019", "'").replace("\u201c", '"').replace("\u201d", '"')
            text = text.replace("\u2013", "-").replace("\u2014", "-").replace("\ufffd", "'")
            if not text.strip():
                continue
            size = round(first["size"], 1)
            bold = bool(first["flags"] & 16)
            lines.append(Line(text, size, bold))
    return lines


def classify(line: Line) -> str | None:
    """Return a block type or None to skip the line."""
    if line.size <= 7.0:
        return None  # running header/footer noise
    if line.size >= 17.0 and line.bold:
        return None  # chapter title, handled by TOC boundaries
    if line.size >= 13.0 and line.bold:
        return "heading"
    if line.size >= 11.5 and line.bold:
        return "subheading"
    text = line.text.strip()
    if text.startswith(BULLETS):
        return "list"
    if line.size <= 9.8:
        return "code" if is_code_line(text) else "paragraph"
    if line.bold and looks_like_callout(text):
        return "callout"
    return "paragraph"


def lines_to_blocks(lines: list[Line]) -> list[dict[str, str]]:
    blocks: list[dict[str, str]] = []
    current_type: str | None = None
    buffer: list[str] = []

    def flush() -> None:
        nonlocal buffer, current_type
        if current_type is None or not buffer:
            buffer = []
            current_type = None
            return
        text = "\n".join(buffer).strip()
        if text:
            blocks.append({"type": current_type, "text": text})
        buffer = []
        # merge consecutive same-type runs
        current_type = None

    for line in lines:
        kind = classify(line)
        if kind is None:
            flush()
            continue
        if kind != current_type:
            flush()
            current_type = kind
        item = line.text.strip()
        if kind == "list":
            item = re.sub(r"^[\ufffd\u2022\u25e6\u25aa\u25cf\u25b8\-\u00b7]\s*", "", item)
        buffer.append(item)

    flush()
    return blocks


def build_lesson_blocks(blocks: list[dict[str, str]]) -> list[dict[str, str]]:
    lessons: list[dict[str, str]] = []
    current: list[dict[str, str]] = []
    current_title = ""
    started = False

    def flush() -> None:
        nonlocal current
        if current and current[0]["type"] == "heading":
            lessons.append({"title": current_title or "Lesson", "blocks": current})
        current = []

    for block in blocks:
        if block["type"] == "heading":
            flush()
            started = True
            current_title = block["text"]
            current.append(block)
        elif started:
            current.append(block)
    flush()
    return lessons


def read_time(words: int) -> int:
    return max(3, round(words / 180) or 1)


def find_part_brackets(toc):
    """Return list of (part_title, chapter_entries) groups in order."""
    groups: list[tuple[str, list]] = []
    current_chapters: list = []
    part_title = None

    for level, title, page in toc:
        if level != 1:
            continue
        t_buf = re.sub(r"[\ufffd\u2013\u2014]", "-", title)
        m = re.match(r"^Part\s+([IVX0-9]+)\s*[-:]\s*(.+)$", t_buf, re.IGNORECASE)
        if m:
            if part_title is not None:
                groups.append((part_title, current_chapters))
            part_title = normalize(m.group(2))
            current_chapters = []
        else:
            if part_title is None:
                continue
            if is_front_matter(title):
                continue
            current_chapters.append((normalize(title), page))
    if part_title is not None:
        groups.append((part_title, current_chapters))
    return groups


def build_book(path: Path) -> dict:
    meta = VOLUME_META[path.name]
    doc = fitz.open(str(path))
    toc = doc.get_toc()
    part_groups = find_part_brackets(toc)

    parts: list[dict] = []
    chapters: list[dict] = []
    global_lesson_count = 0
    total_words = 0

    for part_index, (part_title, chapter_entries) in enumerate(part_groups, start=1):
        part_slug = f"part-{part_index:02d}"
        part = {"number": part_index, "slug": part_slug, "title": part_title, "chapters": []}
        parts.append(part)

        for chapter_index, (chapter_title, page) in enumerate(chapter_entries):
            chapter_number = len(chapters) + 1
            lines: list[Line] = []
            page_index = page - 1
            while page_index < doc.page_count:
                page_lines = extract_lines(doc[page_index])
                if lines and page_lines and page_lines[0].size >= 17.0:
                    break  # next chapter title reached
                lines.extend(page_lines)
                page_index += 1
                nxt = [(l, t, p) for l, t, p in toc if p == page_index + 1 and l == 1]
                if nxt:
                    break

            blocks = lines_to_blocks(lines)
            if not blocks:
                continue

            chapters_set = set()
            for ch in chapters:
                chapters_set.add(ch["slug"])
            base = slugify(f"ch{chapter_number:02d}-{slug_clean_heading(chapter_title)}")[:72]
            chapter_slug = base
            chapter_words = sum(len(b["text"].split()) for b in blocks)
            lessons = build_lesson_blocks(blocks)
            global_lesson_count += len(lessons)
            total_words += chapter_words

            chapters.append(
                {
                    "number": chapter_number,
                    "code": f"{chapter_number:02d}",
                    "slug": chapter_slug,
                    "title": chapter_title,
                    "partNumber": part_index,
                    "partTitle": part_title,
                    "blocks": blocks,
                    "lessons": [
                        {
                            "number": li + 1,
                            "slug": f"lesson-{li + 1:02d}-{slugify(lesson['title'])}"[:72],
                            "title": lesson["title"],
                            "blocks": lesson["blocks"],
                            "readingTime": read_time(sum(len(b["text"].split()) for b in lesson["blocks"])) if lesson["blocks"] else 3,
                        }
                        for li, lesson in enumerate(lessons)
                        if lesson["blocks"]
                    ],
                    "readingTime": read_time(chapter_words),
                }
            )
            part["chapters"].append(chapter_slug)

    estimated_minutes = max(12, round(total_words / 190) or 1)
    return {
        **meta,
        "category": "AI/ML",
        "source": path.name,
        "estimatedMinutes": estimated_minutes,
        "parts": parts,
        "chapters": chapters,
        "lessons": global_lesson_count,
    }


def build_search_index(book: dict) -> list[dict[str, str]]:
    items: list[dict[str, str]] = [
        {
            "label": str(book["title"]),
            "href": f"/tutorials/{book['slug']}",
            "group": "Tutorials",
            "meta": f"{book['category']} • {book['level']}",
        }
    ]
    for part in book.get("parts", []):
        items.append(
            {"label": str(part["title"]), "href": f"/tutorials/{book['slug']}", "group": "Parts", "meta": str(book["title"])}
        )
    for chapter in book["chapters"]:
        items.append(
            {
                "label": str(chapter["title"]),
                "href": f"/tutorials/{book['slug']}/{chapter['slug']}",
                "group": "Chapters",
                "meta": f"{book['title']} • {chapter.get('partTitle') or 'Chapter'}",
            }
        )
        for lesson in chapter.get("lessons", []):
            items.append(
                {
                    "label": str(lesson["title"]),
                    "href": f"/tutorials/{book['slug']}/{chapter['slug']}/{lesson['slug']}",
                    "group": "Lessons",
                    "meta": f"{book['title']} • {chapter['title']}",
                }
            )
    return items


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    registry_path = OUT_DIR / "registry.json"
    index_path = OUT_DIR / "search-index.json"

    existing_registry = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else []
    by_slug = {e["slug"]: e for e in existing_registry if isinstance(e, dict) and e.get("slug")}

    # Preserve existing search index (do not clobber other books' entries)
    existing_index = json.loads(index_path.read_text(encoding="utf-8")) if index_path.exists() else []

    filtered_index = [it for it in existing_index if it.get("href", "").startswith("/tutorials/ai-from-scratch-vol") is False]

    for path in sorted(glob.glob(SOURCE_GLOB)):
        book = build_book(Path(path))
        json_path = OUT_DIR / f"{book['slug']}.json"
        json_path.write_text(json.dumps(book, ensure_ascii=False, indent=2), encoding="utf-8")
        by_slug[book["slug"]] = {
            "slug": book["slug"],
            "title": book["title"],
            "category": book["category"],
            "level": book["level"],
            "description": book["description"],
            "source": book["source"],
            "chapters": len(book["chapters"]),
            "parts": len(book.get("parts", [])),
            "lessons": book.get("lessons", 0),
            "estimatedMinutes": book.get("estimatedMinutes", 0),
            "coverTheme": book.get("coverTheme", "aurora"),
        }
        filtered_index.extend(build_search_index(book))
        print(
            f"{book['slug']}: {len(book['parts'])} parts, {len(book['chapters'])} chapters, "
            f"{book.get('lessons', 0)} lessons"
        )

    merged = sorted(by_slug.values(), key=lambda e: (e["title"].lower(), e["slug"]))
    registry_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    index_path.write_text(json.dumps(filtered_index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote registry to {registry_path}")
    print(f"Wrote search index to {index_path} ({len(filtered_index)} items)")


if __name__ == "__main__":
    main()