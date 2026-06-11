import fs from "fs";

const entryPath = "C:\\Users\\moham\\Downloads\\Kamraan\\WEB DEV\\CodeVerse Academy\\_article_entry.json";
const blogsPath = "C:\\Users\\moham\\Downloads\\Kamraan\\WEB DEV\\CodeVerse Academy\\data\\blogs.json";

const rawEntry = fs.readFileSync(entryPath, "utf-8");
const entry = JSON.parse(rawEntry);

// Remove the first block (H1 title - stored separately)
if (entry.blocks[0]?.type === "paragraph" && entry.blocks[0].text.startsWith("# ")) {
  entry.blocks.shift();
}

// Clean up bold markers from list items
for (const block of entry.blocks) {
  if (block.type === "list" && block.text) {
    // Remove leading **
    block.text = block.text.replace(/^\*\*/, "").replace(/\*\*$/, "");
    // Remove ** markers
    block.text = block.text.replace(/\*\*/g, "");
    // Clean up double colons like "Key:**" -> "Key:"
    block.text = block.text.replace(/::/g, ":");
  }
  if (block.type === "paragraph") {
    block.text = block.text.replace(/\*\*/g, "");
  }
}

// Read existing blogs.json
const rawBlogs = fs.readFileSync(blogsPath, "utf-8");
const blogs = JSON.parse(rawBlogs);

// Append the new article
blogs.articles.push(entry);

// Update article orders to ensure they're sequential
blogs.articles.forEach((a, i) => {
  a.order = i + 1;
});

// Write back
fs.writeFileSync(blogsPath, JSON.stringify(blogs, null, 2), "utf-8");

console.log(`Added article "${entry.title}" to blogs.json`);
console.log(`Total articles: ${blogs.articles.length}`);
