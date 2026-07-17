from __future__ import annotations

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

SOURCE_DIR = Path(r"C:\Users\moham\Downloads\Kamraan\MyBooks\Career\DOCX")
OUT_DIR = Path("data/books")
REGISTRY = OUT_DIR / "registry.json"

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

BOOKS = [
    "BOOK 1 Python Backend Foundation.docx",
    "English.docx",
    "Backend Developer Interview Mastery.docx",
    "JAVASCRIPT FOR WEB DEVELOPMENT MASTER BOOK.docx",
    "MASTER ENGLISH EASILY.docx",
    "Fresher to Job-Ready Data Analyst.docx",
    "BOOK 2 Backend Development & Databases.docx",
    "BOOK 3 Advanced Backend & System Design.docx",
    "Python for Backend Development.docx",
    "Python Mastery.docx",
    "Backend Engineering to AI Systems.docx",
    "PYTHON DSA.docx",
]

BOOK_META = {
    "BOOK 1 Python Backend Foundation.docx": {
        "slug": "python-backend-foundation",
        "title": "Python Backend Foundation",
        "category": "Backend",
        "level": "Book 1",
        "description": "Begin Python backend development with setup, Python basics, APIs and backend thinking.",
    },
    "English.docx": {
        "slug": "english",
        "title": "English",
        "category": "Communication",
        "level": "Foundation",
        "description": "Build practical English reading, writing, vocabulary and communication skills.",
    },
    "Backend Developer Interview Mastery.docx": {
        "slug": "backend-developer-interview-mastery",
        "title": "Backend Developer Interview Mastery",
        "category": "Interview",
        "level": "Job Prep",
        "description": "Prepare for backend interviews with core concepts, questions, system design and practical answers.",
    },
    "JAVASCRIPT FOR WEB DEVELOPMENT MASTER BOOK.docx": {
        "slug": "javascript-web-development-master-book",
        "title": "JavaScript for Web Development Master Book",
        "category": "Web",
        "level": "Complete Book",
        "description": "Learn JavaScript for frontend development, DOM work, browser logic and modern web projects.",
    },
    "MASTER ENGLISH EASILY.docx": {
        "slug": "master-english-easily",
        "title": "Master English Easily",
        "category": "Communication",
        "level": "Beginner",
        "description": "Learn English in a simple way with grammar, vocabulary, speaking and practice lessons.",
    },
    "Fresher to Job-Ready Data Analyst.docx": {
        "slug": "fresher-to-job-ready-data-analyst",
        "title": "Fresher to Job-Ready Data Analyst",
        "category": "Data",
        "level": "Career Path",
        "description": "Move from beginner to job-ready data analyst with Excel, SQL, dashboards, projects and interview prep.",
    },
    "BOOK 2 Backend Development & Databases.docx": {
        "slug": "backend-development-and-databases",
        "title": "Backend Development and Databases",
        "category": "Backend",
        "level": "Book 2",
        "description": "Go deeper into backend development, database design, SQL, APIs and persistent data systems.",
    },
    "BOOK 3 Advanced Backend & System Design.docx": {
        "slug": "advanced-backend-and-system-design",
        "title": "Advanced Backend and System Design",
        "category": "Backend",
        "level": "Book 3",
        "description": "Study advanced backend architecture, scaling, reliability, distributed systems and system design.",
    },
    "Python for Backend Development.docx": {
        "slug": "python-backend-development",
        "title": "Python Backend Development",
        "category": "Backend",
        "level": "Complete Book",
        "description": "Build production-ready Python backends with FastAPI, databases, auth, testing, Docker and deployment.",
    },
    "Python Mastery.docx": {
        "slug": "python-engineering",
        "title": "Python Mastery",
        "category": "Programming",
        "level": "Professional",
        "description": "Write cleaner, stronger Python with engineering practices, architecture and maintainable code.",
    },
    "Backend Engineering to AI Systems.docx": {
        "slug": "backend-engineering-to-ai-systems",
        "title": "Backend Engineering to AI Systems",
        "category": "AI/ML",
        "level": "Advanced",
        "description": "Connect backend engineering with AI systems, data pipelines, APIs and intelligent applications.",
    },
    "PYTHON DSA.docx": {
        "slug": "python-dsa",
        "title": "Python DSA",
        "category": "DSA",
        "level": "Practice Book",
        "description": "Learn data structures and algorithms using Python with topic-wise explanations and practice.",
    },
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def clean_heading_text(text: str) -> str:
    text = normalize(text)
    text = re.sub(r"^\d+(?:\.\d+)*\.?\s+", "", text)
    return text


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "book"


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
        ]
    )


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

        candidates.append({"number": number, "index": index, "title": title or f"Chapter {number}", "toc_like": toc_like})

    if candidates:
        chosen: dict[int, dict[str, object]] = {}
        for pos, candidate in enumerate(candidates):
            number = int(candidate["number"])
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
            if number not in chosen or int(candidate["score"]) > int(chosen[number]["score"]):
                chosen[number] = candidate

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
                heading_starts.append({"number": len(heading_starts) + 1, "index": index, "title": item["text"]})
    return heading_starts[:80]


def build_book(filename: str) -> dict[str, object]:
    source = SOURCE_DIR / filename
    meta = BOOK_META[filename]
    paragraphs = read_paragraphs(source)
    starts = find_chapter_starts(paragraphs)
    chapters = []

    if not starts:
        starts = [{"number": 1, "index": 0, "title": meta["title"]}]

    for pos, start in enumerate(starts):
        start_index = int(start["index"])
        end_index = int(starts[pos + 1]["index"]) if pos + 1 < len(starts) else len(paragraphs)
        number = int(start["number"])
        title = str(start["title"])
        blocks = []

        for item in paragraphs[start_index:end_index]:
            text = item["text"]
            marker_number, _ = parse_chapter_marker(text)
            if marker_number == number or text == title:
                continue
            kind = block_type(item["style"], text)
            blocks.append({"type": kind, "text": clean_heading_text(text) if kind in {"heading", "subheading"} else text})

        chapters.append(
            {
                "number": number,
                "slug": f"chapter-{number:02d}",
                "title": title,
                "blocks": blocks,
            }
        )

    chapters.sort(key=lambda chapter: int(chapter["number"]))

    return {
        **meta,
        "source": filename,
        "chapters": chapters,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    registry = []
    for filename in BOOKS:
        book = build_book(filename)
        book_path = OUT_DIR / f"{book['slug']}.json"
        book_path.write_text(json.dumps(book, ensure_ascii=False, indent=2), encoding="utf-8")
        registry.append(
            {
                key: book[key]
                for key in ["slug", "title", "category", "level", "description", "source"]
            }
            | {"chapters": len(book["chapters"])}
        )
        print(f"{book['slug']}: {len(book['chapters'])} chapters")

    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote registry to {REGISTRY}")


if __name__ == "__main__":
    main()
