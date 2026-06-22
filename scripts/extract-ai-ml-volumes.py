from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from zipfile import ZipFile

SOURCE_FILES = [
    Path(r"C:\Users\moham\Downloads\AI_ML_Book1_Final.docx"),
    Path(r"C:\Users\moham\Downloads\AI_ML_Book2_Final.docx"),
]

OUT_DIR = Path("data/books")
REGISTRY = OUT_DIR / "registry.json"
SEARCH_INDEX = OUT_DIR / "search-index.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

BOOK_META = {
    "AI_ML_Book1_Final.docx": {
        "slug": "ai-ml-handbook-volume-1",
        "title": "AI/ML Handbook Volume 1",
        "category": "AI/ML",
        "level": "Foundations",
        "description": "Python, mathematics, machine learning and deep learning foundations for AI/ML interview prep.",
        "coverTheme": "aurora",
    },
    "AI_ML_Book2_Final.docx": {
        "slug": "ai-ml-handbook-volume-2",
        "title": "AI/ML Handbook Volume 2",
        "category": "AI/ML",
        "level": "Interview Prep",
        "description": "Generative AI, MLOps, SQL, project discussion and interview question bank for AI/ML roles.",
        "coverTheme": "midnight",
    },
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clean_heading_text(text: str) -> str:
    text = normalize(text)
    return re.sub(r"^\d+(?:\.\d+)*\.?\s+", "", text)


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "item"


def read_paragraphs(path: Path) -> list[dict[str, str]]:
    with ZipFile(path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))

    paragraphs: list[dict[str, str]] = []
    for paragraph in root.findall(".//w:body/w:p", NS):
        text = normalize("".join(node.text or "" for node in paragraph.findall(".//w:t", NS)))
        if not text:
            continue
        style_node = paragraph.find("./w:pPr/w:pStyle", NS)
        style = ""
        if style_node is not None:
            style = style_node.attrib.get(f"{{{NS['w']}}}val", "")
        paragraphs.append({"style": style, "text": text})
    return paragraphs


def parse_part_marker(text: str) -> tuple[int | None, str | None]:
    match = re.fullmatch(r"Part\s+(\d+)\s*[:\-—–]\s*(.+)", text, re.IGNORECASE)
    if not match:
        return None, None
    return int(match.group(1)), normalize(match.group(2))


def parse_chapter_marker(text: str) -> tuple[str | None, str | None]:
    match = re.fullmatch(r"Chapter\s+([0-9A-Za-z.]+)\s*[:\-—–]\s*(.+)", text, re.IGNORECASE)
    if not match:
        return None, None
    return match.group(1), normalize(match.group(2))


def looks_like_front_matter(text: str) -> bool:
    lowered = text.lower()
    return any(
        phrase in lowered
        for phrase in [
            "copyright",
            "all rights reserved",
            "disclaimer",
            "table of contents",
            "dedication",
            "acknowledgements",
            "about the author",
            "book structure",
            "learning roadmap",
        ]
    )


def block_type(style: str, text: str) -> str:
    lowered = text.lower()
    if style == "ListParagraph":
        return "list"
    if "table" in lowered and "|" in text:
        return "table"
    if style.startswith("Heading1") or style.startswith("Heading2") or style.startswith("Heading3"):
        if "quick revision sheet" in lowered or "cheat sheet" in lowered or "roadmap" in lowered:
            return "heading"
        return "subheading" if style.startswith("Heading3") else "heading"
    if re.fullmatch(r"\d+(\.\d+)*\. .+", text) or (len(text) <= 90 and not text.endswith(".")):
        return "subheading"
    if text.startswith(("Example:", "Correct Answer:", "Note:", "Tip:", "Coding Exercise", "Warning:", "Important:")):
        return "callout"
    return "paragraph"


def find_chapter_starts(paragraphs: list[dict[str, str]]) -> list[dict[str, object]]:
    candidates: list[dict[str, object]] = []

    for index, item in enumerate(paragraphs):
        number, inline_title = parse_chapter_marker(item["text"])
        if not number:
            continue

        title = inline_title
        next_text = paragraphs[index + 1]["text"] if index + 1 < len(paragraphs) else ""
        if not title and next_text and not parse_chapter_marker(next_text)[0] and not looks_like_front_matter(next_text):
            title = next_text

        body_index = index + 1
        if title and next_text == title:
            body_index = index + 2
        first_body_text = paragraphs[body_index]["text"] if body_index < len(paragraphs) else ""
        toc_like = bool(parse_chapter_marker(first_body_text)[0]) or first_body_text.upper().startswith("PART ")

        candidates.append({"code": number, "index": index, "title": title or f"Chapter {number}", "toc_like": toc_like})

    if candidates:
        chosen: dict[str, dict[str, object]] = {}
        for pos, candidate in enumerate(candidates):
            code = str(candidate["code"])
            index = int(candidate["index"])
            next_index = int(candidates[pos + 1]["index"]) if pos + 1 < len(candidates) else len(paragraphs)
            segment = paragraphs[index + 1 : next_index]
            body_score = sum(
                len(item["text"])
                for item in segment
                if not parse_chapter_marker(item["text"])[0] and not item["text"].upper().startswith("PART ")
            )
            if candidate.get("toc_like"):
                body_score = 0
            candidate = {**candidate, "score": body_score}
            if code not in chosen or int(candidate["score"]) > int(chosen[code]["score"]):
                chosen[code] = candidate

        starts = [
            {key: value for key, value in item.items() if key not in {"score", "toc_like"}}
            for item in sorted(chosen.values(), key=lambda entry: int(entry["index"]))
            if int(item["score"]) > 0
        ]
        if len(starts) >= 2:
            return starts

    heading_starts = []
    for index, item in enumerate(paragraphs):
        if item["style"].startswith("Heading1") and not looks_like_front_matter(item["text"]):
            if len(item["text"]) > 4:
                heading_starts.append({"code": str(len(heading_starts) + 1), "index": index, "title": item["text"]})
    return heading_starts[:120]


def find_part_starts(paragraphs: list[dict[str, str]]) -> list[dict[str, object]]:
    starts: list[dict[str, object]] = []
    seen: set[int] = set()
    for index, item in enumerate(paragraphs):
        number, title = parse_part_marker(item["text"])
        if not number or number in seen:
            continue
        starts.append({"number": number, "index": index, "title": title or f"Part {number}"})
        seen.add(number)
    return sorted(starts, key=lambda entry: int(entry["index"]))


def is_revision_boundary(text: str) -> bool:
    lowered = text.lower()
    return any(
        token in lowered
        for token in [
            "quick revision sheet",
            "rapid revision sheet",
            "ultimate interview cheat sheet",
            "ultimate hr interview cheat sheet",
            "ultimate ai/ml interview cheat sheet",
            "1-day interview revision list",
            "1-day revision",
            "3-day revision",
            "7-day revision",
            "15-day interview preparation roadmap",
            "final revision section",
            "revision roadmap",
        ]
    )


def lesson_title_from_boundary(text: str) -> str:
    cleaned = clean_heading_text(text)
    cleaned = re.sub(r"^Chapter\s+[0-9A-Za-z.]+[:\-—–]?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^Part\s+\d+[:\-—–]?\s*", "", cleaned, flags=re.IGNORECASE)
    return cleaned or "Lesson"


GENERIC_LESSON_HEADINGS = {
    "definition",
    "why it is used",
    "easy example",
    "how it works",
    "important interview questions",
    "short interview answer",
    "important notes",
    "common mistakes",
    "quick revision sheet",
    "revision sheet",
    "summary",
    "practice",
    "key points",
    "introduction",
    "overview",
    "examples",
}


def is_lesson_heading(text: str) -> bool:
    lowered = clean_heading_text(text).strip().lower()
    if not lowered:
        return False
    if lowered in GENERIC_LESSON_HEADINGS:
        return False
    if lowered.startswith(("part ", "chapter ", "section ")):
        return False
    if lowered.startswith("part ") or lowered.startswith("chapter "):
        return False
    return True


def chapter_sort_key(code: str) -> tuple[int, int, int, str]:
    numeric = re.fullmatch(r"(\d+)(?:\.(\d+))?", code)
    if numeric:
        return (0, int(numeric.group(1)), int(numeric.group(2) or 0), "")

    revision = re.fullmatch(r"R(\d+)", code, re.IGNORECASE)
    if revision:
        return (1, 999, int(revision.group(1)), "")

    alpha = re.match(r"([A-Za-z]+)(\d+)", code)
    if alpha:
        return (2, 999, int(alpha.group(2)), alpha.group(1).upper())

    return (3, 999, 999, code.upper())


def build_lesson_blocks(chapter_blocks: list[dict[str, str]]) -> list[dict[str, object]]:
    lessons: list[dict[str, object]] = []
    current_blocks: list[dict[str, str]] = []
    current_title = ""

    def flush(title: str) -> None:
        nonlocal current_blocks
        if not current_blocks:
            return
        resolved_title = title or lesson_title_from_boundary(current_blocks[0]["text"])
        lessons.append(
            {
                "title": resolved_title,
                "slug": slugify(resolved_title),
                "blocks": current_blocks,
                "readingTime": max(3, round(sum(len(block["text"].split()) for block in current_blocks) / 180) or 1),
            }
        )
        current_blocks = []

    for block in chapter_blocks:
        text = block["text"]
        if block["type"] == "heading" and is_lesson_heading(text):
            if current_blocks:
                flush(current_title)
            current_title = text
        current_blocks.append(block)

    flush(current_title)
    if not lessons and chapter_blocks:
        lessons.append(
            {
                "title": lesson_title_from_boundary(chapter_blocks[0]["text"]) if chapter_blocks else "Lesson",
                "slug": slugify(lesson_title_from_boundary(chapter_blocks[0]["text"]) if chapter_blocks else "lesson"),
                "blocks": chapter_blocks,
                "readingTime": max(3, round(sum(len(block["text"].split()) for block in chapter_blocks) / 180) or 1),
            }
        )
    return lessons


def build_book(path: Path) -> dict[str, object]:
    meta = BOOK_META[path.name]
    paragraphs = read_paragraphs(path)
    part_starts = find_part_starts(paragraphs)
    chapter_starts = find_chapter_starts(paragraphs)

    if not chapter_starts:
        chapter_starts = [{"code": "1", "index": 0, "title": meta["title"]}]

    chapters: list[dict[str, object]] = []
    parts_map: dict[int, dict[str, object]] = {}
    global_lesson_count = 0
    total_words = 0
    part_titles = {int(part["number"]): str(part["title"]) for part in part_starts}
    active_part_number: int | None = None

    def infer_part_number(chapter_code: str) -> int | None:
        match = re.match(r"(\d+)", chapter_code)
        if match:
            return int(match.group(1))
        return active_part_number

    def chapter_title_blocks(start_index: int, end_index: int, chapter_title: str, chapter_code: str) -> list[dict[str, str]]:
        blocks: list[dict[str, str]] = []
        for item in paragraphs[start_index:end_index]:
            text = item["text"]
            if text == chapter_title or text == f"Chapter {chapter_code}: {chapter_title}":
                continue
            if text.upper().startswith("PART ") and parse_part_marker(text)[0] is not None:
                continue
            if parse_chapter_marker(text)[0] == chapter_code:
                continue
            kind = block_type(item["style"], text)
            blocks.append({"type": kind, "text": clean_heading_text(text) if kind in {"heading", "subheading"} else text})
        return blocks

    for pos, start in enumerate(chapter_starts):
        start_index = int(start["index"])
        end_index = int(chapter_starts[pos + 1]["index"]) if pos + 1 < len(chapter_starts) else len(paragraphs)
        chapter_code = str(start["code"])
        chapter_number = pos + 1
        chapter_title = str(start["title"])
        part_number = infer_part_number(chapter_code)
        if part_number is not None:
            active_part_number = part_number
        part_title = part_titles.get(part_number) if part_number is not None else None
        chapter_blocks = chapter_title_blocks(start_index, end_index, chapter_title, chapter_code)
        lessons = build_lesson_blocks(chapter_blocks)
        chapter_slug = slugify(f"{chapter_code}-{chapter_title}")[:72]
        chapter_words = sum(len(block["text"].split()) for block in chapter_blocks)
        total_words += chapter_words
        global_lesson_count += len(lessons)

        chapters.append(
            {
                "number": chapter_number,
                "code": chapter_code,
                "slug": chapter_slug,
                "title": chapter_title,
                "partNumber": part_number,
                "partTitle": part_title,
                "blocks": chapter_blocks,
                "lessons": [
                    {
                        "number": lesson_index + 1,
                        "slug": f"lesson-{lesson_index + 1:02d}-{lesson['slug']}"[:72],
                        "title": lesson["title"],
                        "blocks": lesson["blocks"],
                        "readingTime": lesson["readingTime"],
                    }
                    for lesson_index, lesson in enumerate(lessons)
                ],
                "readingTime": max(3, round(chapter_words / 180) or 1),
            }
        )

        if part_number is not None:
            part_entry = parts_map.setdefault(
                part_number,
                {"number": part_number, "slug": f"part-{part_number:02d}", "title": part_title or f"Part {part_number}", "chapters": []},
            )
            part_entry["chapters"].append(chapter_slug)

    chapters.sort(
        key=lambda chapter: (
            int(chapter.get("partNumber") or 999),
            chapter_sort_key(str(chapter.get("code") or "")),
            str(chapter.get("title") or "").lower(),
        )
    )
    for index, chapter in enumerate(chapters, start=1):
        chapter["number"] = index

    chapter_order = {chapter["slug"]: index for index, chapter in enumerate(chapters)}
    for part in parts_map.values():
        part["chapters"].sort(key=lambda slug: chapter_order.get(slug, 9999))

    parts = [parts_map[key] for key in sorted(parts_map)]
    estimated_minutes = max(12, round(total_words / 190) or 1)

    return {
        **meta,
        "source": path.name,
        "estimatedMinutes": estimated_minutes,
        "parts": parts,
        "chapters": chapters,
        "lessons": global_lesson_count,
    }


def build_search_index(book: dict[str, object]) -> list[dict[str, str]]:
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
            {
                "label": str(part["title"]),
                "href": f"/tutorials/{book['slug']}",
                "group": "Parts",
                "meta": str(book["title"]),
            }
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

    existing_registry = []
    if REGISTRY.exists():
        existing_registry = json.loads(REGISTRY.read_text(encoding="utf-8"))

    existing_by_slug = {entry["slug"]: entry for entry in existing_registry if isinstance(entry, dict) and entry.get("slug")}
    search_index = []

    for path in SOURCE_FILES:
        book = build_book(path)
        (OUT_DIR / f"{book['slug']}.json").write_text(json.dumps(book, ensure_ascii=False, indent=2), encoding="utf-8")
        existing_by_slug[book["slug"]] = {
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
        search_index.extend(build_search_index(book))
        print(f"{book['slug']}: {len(book['parts'])} parts, {len(book['chapters'])} chapters, {book['lessons']} lessons")

    merged = sorted(existing_by_slug.values(), key=lambda entry: (entry["title"].lower(), entry["slug"]))
    REGISTRY.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    SEARCH_INDEX.write_text(json.dumps(search_index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote registry to {REGISTRY}")
    print(f"Wrote search index to {SEARCH_INDEX}")


if __name__ == "__main__":
    main()
