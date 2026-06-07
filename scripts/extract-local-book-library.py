from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

SOURCE_DIR = Path("Books")
OUT_DIR = Path("data/books")
REGISTRY = OUT_DIR / "registry.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

BOOK_META = {
    "Complete HTML and Web Development Foundations Handbook1.docx": {
        "slug": "html-foundations",
        "title": "HTML",
        "category": "Web",
        "level": "Beginner",
        "description": "Learn HTML structure, semantic layout, forms, accessibility and document foundations from the full course book.",
    },
    "Complete CSS and Modern Web Styling Handbook1.docx": {
        "slug": "css-design-systems",
        "title": "CSS",
        "category": "Web",
        "level": "Beginner",
        "description": "Study CSS layout, responsive design, Flexbox, Grid, motion and modern styling systems from the book.",
    },
    "COMPLETE JAVASCRIPT FOR ABSOLUTE BEGINNERS1.docx": {
        "slug": "javascript-mastery",
        "title": "JavaScript",
        "category": "Programming",
        "level": "Intermediate",
        "description": "Learn JavaScript fundamentals, DOM work, functions, async code and practical browser programming.",
    },
}

PREFERRED_ORDER = {
    "html-foundations": 0,
    "css-design-systems": 1,
    "javascript-mastery": 2,
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "book"


def clean_heading_text(text: str) -> str:
    text = normalize(text)
    return re.sub(r"^\d+(?:\.\d+)*\.?\s+", "", text)


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


def parse_chapter_marker(text: str) -> tuple[int | None, str | None]:
    match = re.fullmatch(r"Chapter\s+(\d+)\s*(?:[-—:]\s*(.+))?", text, re.IGNORECASE)
    if match:
        return int(match.group(1)), normalize(match.group(2) or "") or None
    return None, None


def block_type(style: str, text: str) -> str:
    if style == "ListParagraph":
        return "list"
    if style.startswith("Heading1") or style.startswith("Heading2"):
        return "heading"
    if style.startswith("Heading"):
        return "subheading"
    if re.fullmatch(r"\d+(\.\d+)*\. .+", text) or (len(text) <= 80 and not text.endswith(".")):
        return "subheading"
    if text.startswith(("Example:", "Correct Answer:", "Note:", "Tip:", "Coding Exercise")):
        return "callout"
    return "paragraph"


def find_chapter_starts(paragraphs: list[dict[str, str]]) -> list[dict[str, object]]:
    starts: list[dict[str, object]] = []
    seen_numbers: set[int] = set()
    for index, item in enumerate(paragraphs):
        number, inline_title = parse_chapter_marker(item["text"])
        if not number:
            continue
        if number in seen_numbers:
            continue
        title = inline_title or item["text"]
        starts.append({"number": number, "index": index, "title": title})
        seen_numbers.add(number)

    if len(starts) >= 2:
        return sorted(starts, key=lambda entry: int(entry["index"]))

    fallback = []
    for index, item in enumerate(paragraphs):
        if item["style"].startswith("Heading1") and len(item["text"]) > 4:
            fallback.append({"number": len(fallback) + 1, "index": index, "title": item["text"]})
    return fallback[:80]


def build_book(path: Path) -> dict[str, object]:
    meta = BOOK_META.get(path.name, {})
    title = meta.get("title") or path.stem.replace("-", " ").replace("_", " ").strip()
    slug = meta.get("slug") or slugify(path.stem)
    paragraphs = read_paragraphs(path)
    starts = find_chapter_starts(paragraphs)
    if not starts:
        starts = [{"number": 1, "index": 0, "title": title}]

    chapters = []
    used_slugs: set[str] = set()
    for pos, start in enumerate(starts):
        start_index = int(start["index"])
        end_index = int(starts[pos + 1]["index"]) if pos + 1 < len(starts) else len(paragraphs)
        number = int(start["number"])
        chapter_title = str(start["title"])
        blocks = []

        for item in paragraphs[start_index:end_index]:
            text = item["text"]
            marker_number, _ = parse_chapter_marker(text)
            if marker_number == number or text == chapter_title:
                continue
            kind = block_type(item["style"], text)
            blocks.append({"type": kind, "text": clean_heading_text(text) if kind in {"heading", "subheading"} else text})

        chapter_slug = f"chapter-{number:02d}"
        if chapter_slug in used_slugs:
          chapter_slug = f"{chapter_slug}-{slugify(chapter_title)[:40] or 'section'}"
        used_slugs.add(chapter_slug)

        chapters.append(
            {
                "number": number,
                "slug": chapter_slug,
                "title": chapter_title,
                "blocks": blocks,
            }
        )

    chapters.sort(key=lambda chapter: int(chapter["number"]))

    return {
        "slug": slug,
        "title": title,
        "category": meta.get("category", "Course"),
        "level": meta.get("level", "Book"),
        "description": meta.get("description", ""),
        "source": path.name,
        "chapters": chapters,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    existing_registry = []
    if REGISTRY.exists():
        existing_registry = json.loads(REGISTRY.read_text(encoding="utf-8"))

    existing_by_slug = {entry["slug"]: entry for entry in existing_registry if isinstance(entry, dict) and entry.get("slug")}
    for path in sorted(SOURCE_DIR.glob("*.docx")):
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
        }
        print(f"{book['slug']}: {len(book['chapters'])} chapters")

    merged = sorted(
        existing_by_slug.values(),
        key=lambda entry: (
            PREFERRED_ORDER.get(entry["slug"], 99),
            entry["title"].lower()
        )
    )
    REGISTRY.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote merged registry to {REGISTRY}")


if __name__ == "__main__":
    main()
