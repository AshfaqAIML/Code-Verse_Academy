from __future__ import annotations

import json
from pathlib import Path


BOOK_PATH = Path("data/books/html-foundations.json")


def extract_topics(chapter: dict) -> list[str]:
    topics: list[str] = []
    for block in chapter.get("blocks", []):
        if block.get("type") == "list":
            topics.append(str(block.get("text", "")).strip())
    return topics


def normalize_label(text: str) -> str:
    cleaned = text.strip().rstrip(".")
    if not cleaned:
        return "the topic"
    return cleaned[0].upper() + cleaned[1:]


def make_paragraphs(chapter_title: str, topics: list[str]) -> list[dict[str, str]]:
    topic_list = ", ".join(topics[:4]) if topics else "the main ideas in this chapter"
    return [
        {"type": "heading", "text": "Chapter Introduction"},
        {
            "type": "paragraph",
            "text": f"{chapter_title} builds on the foundation you need to understand how websites and web applications work in the real world."
        },
        {
            "type": "paragraph",
            "text": f"In this chapter, we focus on {topic_list}. Keep the big picture in mind: every concept here helps you think more clearly about how the web is designed, delivered, and used."
        },
        {
            "type": "paragraph",
            "text": "Read each idea slowly, connect it to something you already know, and then test yourself with the checkpoint questions before moving on."
        },
        {"type": "heading", "text": "Learning Objectives"},
        {"type": "subheading", "text": "By the end of this chapter, you will be able to:"},
    ]


def make_objectives(chapter_title: str, topics: list[str]) -> list[dict[str, str]]:
    objectives = [f"Explain {topic.lower()} in simple words" for topic in topics[:6]]
    if not objectives:
        objectives = [f"Understand the core ideas in {chapter_title.lower()}"]
    while len(objectives) < 8:
        objectives.append("Connect the chapter ideas to practical web development work")
    return [{"type": "list", "text": item[0].upper() + item[1:] if item else item} for item in objectives[:8]]


def make_topic_sections(topics: list[str]) -> list[dict[str, str]]:
    blocks: list[dict[str, str]] = []
    for topic in topics:
        label = normalize_label(topic)
        blocks.extend(
            [
                {"type": "heading", "text": label},
                {
                    "type": "paragraph",
                    "text": f"{label} is one of the core ideas in this chapter. Understanding it helps you build stronger mental models and avoid shallow memorization."
                },
                {
                    "type": "paragraph",
                    "text": f"Think about how {label.lower()} appears when you visit websites, open apps, or move data between the browser and a server."
                },
                {"type": "subheading", "text": "Real-World Analogy"},
                {
                    "type": "paragraph",
                    "text": f"Imagine explaining {label.lower()} to a beginner using a simple everyday comparison, then try to relate it back to the web."
                },
            ]
        )
    return blocks


def make_checkpoint(topics: list[str]) -> list[dict[str, str]]:
    questions = [
        f"What is {topics[0].lower()}?" if topics else "What is the main idea from this chapter?",
        f"Why does {topics[1].lower()} matter?" if len(topics) > 1 else "Why does this topic matter?",
        "How would you explain the idea in your own words?",
        "Where would this concept show up in a real project?",
        "What is one mistake beginners make with this topic?"
    ]
    return [
        {"type": "heading", "text": "Checkpoint"},
        {"type": "subheading", "text": "Can you answer these questions?"},
        *({"type": "list", "text": question} for question in questions),
    ]


def make_mistakes_and_practice(chapter_title: str, topics: list[str]) -> list[dict[str, str]]:
    primary = normalize_label(topics[0]) if topics else chapter_title
    return [
        {"type": "heading", "text": "Common Beginner Mistakes"},
        {"type": "list", "text": f"Trying to memorize {primary.lower()} without understanding the reason behind it."},
        {"type": "list", "text": "Skipping the chapter introduction and jumping straight to tools."},
        {"type": "list", "text": "Ignoring examples and exercises after reading the theory."},
        {"type": "heading", "text": "Best Practices"},
        {"type": "list", "text": "Learn the idea first, then the tool."},
        {"type": "list", "text": "Practice with small examples before moving to bigger projects."},
        {"type": "list", "text": "Write short notes in your own words."},
        {"type": "list", "text": "Review the chapter more than once."},
        {"type": "list", "text": "Compare the chapter idea with real websites or apps."},
    ]


def make_interview(chapter_title: str, topics: list[str]) -> list[dict[str, str]]:
    focus = normalize_label(topics[0]) if topics else chapter_title
    return [
        {"type": "heading", "text": "Interview Preparation"},
        {"type": "subheading", "text": "Beginner Questions"},
        {"type": "paragraph", "text": f"Q1. What is {focus.lower()}?"},
        {"type": "paragraph", "text": "Q2. Why is this topic important in web development?"},
        {"type": "paragraph", "text": "Q3. How would you explain it to a friend?"}, 
        {"type": "subheading", "text": "Intermediate Questions"},
        {"type": "paragraph", "text": "Q1. How does this idea connect with the browser and server?"}, 
        {"type": "paragraph", "text": "Q2. Where would you apply it in a project?"}, 
        {"type": "paragraph", "text": "Q3. What mistakes should a beginner avoid?"}, 
        {"type": "subheading", "text": "Advanced Questions"},
        {"type": "paragraph", "text": "Q1. How would you teach this topic to another beginner?"}, 
        {"type": "paragraph", "text": "Q2. How does this concept support larger systems or workflows?"}, 
        {"type": "paragraph", "text": "Q3. Why does this idea matter in production environments?"}, 
    ]


def make_summary_and_exercises(topics: list[str], chapter_title: str) -> list[dict[str, str]]:
    summary_topics = topics[:8] if topics else [chapter_title]
    return [
        {"type": "heading", "text": "Chapter Summary"},
        {
            "type": "paragraph",
            "text": "In this chapter you learned: " + ", ".join(summary_topics) + "."
        },
        {
            "type": "paragraph",
            "text": "These ideas prepare you for the next chapter and help you move from memorizing terms to understanding how the web actually works."
        },
        {"type": "heading", "text": "Exercises"},
        {"type": "subheading", "text": "Beginner Exercises"},
        {"type": "list", "text": f"Define {summary_topics[0].lower()} in one sentence."},
        {"type": "list", "text": "Explain the chapter idea using an everyday example."},
        {"type": "list", "text": "Write down three key points from the chapter."},
        {"type": "subheading", "text": "Intermediate Exercises"},
        {"type": "list", "text": "Connect the chapter topic to a real website or app."},
        {"type": "list", "text": "Draw a simple diagram that represents the main flow."},
        {"type": "list", "text": "Teach the chapter idea to someone else in your own words."},
        {"type": "subheading", "text": "Advanced Exercises"},
        {"type": "list", "text": "Compare this chapter with the previous chapter."},
        {"type": "list", "text": "Find one place in a real project where this idea matters."},
        {"type": "list", "text": "Write a short paragraph explaining why the concept is important."},
        {"type": "heading", "text": "Mini Project"},
        {
            "type": "paragraph",
            "text": f"Create a one-page study note for {chapter_title} that includes the definition, an analogy, one real example, and a quick revision checklist."
        },
        {"type": "heading", "text": "Further Learning"},
        {
            "type": "paragraph",
            "text": "In the next chapter, continue building on these ideas. Read slowly, practice frequently, and keep connecting concepts back to real-world website behavior."
        },
    ]


def expand_chapter(chapter: dict) -> dict:
    topics = extract_topics(chapter)
    if len(chapter.get("blocks", [])) >= 20:
        return chapter

    title = chapter["title"]
    blocks: list[dict[str, str]] = []
    blocks.extend(make_paragraphs(title, topics))
    blocks.extend(make_objectives(title, topics))
    blocks.extend(make_topic_sections(topics))
    blocks.extend(make_checkpoint(topics))
    blocks.extend(make_mistakes_and_practice(title, topics))
    blocks.extend(make_interview(title, topics))
    blocks.extend(make_summary_and_exercises(topics, title))

    chapter = dict(chapter)
    chapter["blocks"] = blocks
    return chapter


def main() -> None:
    book = json.loads(BOOK_PATH.read_text(encoding="utf-8"))
    book["chapters"] = [expand_chapter(chapter) for chapter in book["chapters"]]
    BOOK_PATH.write_text(json.dumps(book, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Expanded HTML foundations chapters")


if __name__ == "__main__":
    main()
