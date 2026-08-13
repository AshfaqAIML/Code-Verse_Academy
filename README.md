# CodeVerse Academy

CodeVerse Academy is a full-stack learning platform for programming, web development, data science, AI/ML, interview preparation, and project-based practice. It combines a Next.js learning experience with file-backed course content, interactive coding workspaces, learner tools, administration screens, and optional AI-assisted revision.

## What the platform includes

- Course discovery, learning paths, dashboards, projects, community, and profile pages.
- A searchable tutorial library backed by structured JSON books.
- Chapter and lesson readers with table of contents, previous/next navigation, bookmarks, recent-learning memory, and local progress persistence.
- **AI From Scratch**: a 17-module, 48-lesson beginner-to-production path covering foundations, ML, deep learning, computer vision, NLP, transformers, LLMs, RAG, agents, MLOps, system design, projects, and interview preparation.
- Classic single-page tutorials from `lib/data.ts` alongside full book-style tutorial routes.
- Practice workspaces, Python compiler, Monaco-based project playground, templates, import/export, and project management.
- AI revision assistant with provider selection, streamed responses, revision history, and export helpers.
- Certificate studio and certificate verification.
- Authentication, admin pages, blog management, and book/tutorial management routes.
- Light/dark theme, responsive navigation, global command-palette search, and accessibility-minded controls.

## Stack

| Area | Implementation |
| --- | --- |
| Frontend | Next.js 15 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 3, global CSS, Lucide icons, Framer Motion |
| Visual/interactive UI | Monaco Editor, Recharts, Chart.js, Pyodide |
| AI | Vercel AI SDK with OpenAI, Anthropic, Google, and DeepSeek providers |
| App APIs | Next.js route handlers |
| Auxiliary backend | Express 4 scaffold in `server/` |
| Persistence | JSON content files, browser localStorage, optional MongoDB/Mongoose |
| Auth | JWT; Google OAuth integration route is available when configured |

## Quick start

Prerequisite: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the Next.js app and Express service together:

```bash
npm run dev:full
```

The Express service defaults to port 4000. Its route setup is in `server/index.js`.

## Environment configuration

Copy the intended values into `.env.local`. Never commit real credentials.

```env
# Required only for AI revision features: configure one supported provider.
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
DEEPSEEK_API_KEY=

# Optional AI defaults
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini

# Required for signed authentication in non-development environments
JWT_SECRET=

# Optional persistence and OAuth
MONGODB_URI=
GOOGLE_CLIENT_ID=
```

The app can render static course content and use most client-side learning features without an LLM key. AI revision calls require a configured provider; database-backed functionality requires a reachable MongoDB instance.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run server` | Run the Express scaffold. |
| `npm run dev:full` | Run Next.js and Express concurrently. |
| `npm run lint` | Run the configured lint command. |
| `npm run validate:content` | Validate book JSON, parts, chapter/lesson slugs, and indexed tutorial routes. |

## Architecture

```text
app/                         App Router pages and Next.js API routes
  api/                       Auth, AI revision, admin, practice, certificates, playground APIs
  tutorials/                 Book overview, chapter, lesson, and full-reader routes
  tutorial/[slug]/           Legacy/simple data-driven tutorial route
  admin/                     Admin dashboard, book, blog, and tutorial management
  playground/                IDE and saved-project pages
  practice/, dashboard/      Learning and progress surfaces
components/                  Shared layout and feature UI
  tutorials/                 Book grid, chapter reader, AI-volume lesson reader
  playground-ide/            Monaco IDE, console, templates, project manager, Python/SQL sandboxes
  revision/                  Revision assistant and revision center
lib/                         Server/client helpers, content access, auth, persistence abstractions
data/                        File-backed books, search index, blogs, admin tutorial data
server/                      Express scaffold, Mongo configuration, playground endpoints
scripts/                     DOCX/PDF/content extraction and maintenance utilities
docs/                        Certificate and AI-revision architecture notes
public/                      Static assets and Pyodide runtime files
```

### Layout and navigation

`app/layout.tsx` installs the Inter font, global styles, `ThemeProvider`, and `AppShell`.

`components/app-shell.tsx` owns the responsive sidebar, sticky header, theme switch, authenticated profile/admin controls, and global search. Workspace routes (`/practice` and `/playground`) can collapse the desktop sidebar to maximize editor space.

Navigation metadata, categories, course cards, legacy tutorial content, practice material, and project lists are centralized in `lib/data.ts`.

## Route map

### Learning routes

| Route | Role |
| --- | --- |
| `/` | Landing page and learning hub. |
| `/courses` | Course catalog. |
| `/courses/[slug]/watch` | Course watch/learning surface. |
| `/tutorials` | Full-length book/tutorial library. |
| `/tutorials/[book]` | Book course overview, metadata, roadmap, chapter cards. |
| `/tutorials/[book]/[chapter]` | Chapter reader with progress and navigation. |
| `/tutorials/[book]/[chapter]/[lesson]` | Granular lesson reader. |
| `/tutorials/[book]/full` | Full-reader view. |
| `/tutorial/[slug]` | Legacy/simple tutorial page sourced from `lib/data.ts`. |
| `/practice` | Practice platform. |
| `/playground` | Full coding playground. |
| `/playground/project/[id]` | Saved playground project. |
| `/python-compiler` | Python compiler interface. |
| `/data-science`, `/ai-ml` | Topic learning pages. |
| `/projects`, `/community`, `/dashboard`, `/profile` | Learner support pages. |

### Content, account, and admin routes

| Route | Role |
| --- | --- |
| `/blog`, `/blog/[slug]` | Blog listing and reader. |
| `/certifications`, `/verify/[id]` | Certificate creation and public verification. |
| `/login`, `/register`, `/forgot-password` | Authentication flow. |
| `/admin` | Admin home; access is guarded in the app shell. |
| `/admin/books` | Book administration. |
| `/admin/tutorials`, `/admin/tutorials/new`, `/admin/tutorials/[slug]` | Tutorial management. |
| `/admin/blogs`, `/admin/blogs/new`, `/admin/blogs/[slug]` | Blog management. |
| `/sketch-studio` | Slide-to-sketch studio. |

### API routes

| Route family | Purpose |
| --- | --- |
| `/api/auth/*` | Login, registration, logout, session, Google OAuth, and streak support. |
| `/api/ai/revision` | Streamed AI revision assistant response. |
| `/api/revision/history` | Revision-history persistence/query flow. |
| `/api/practice` | Practice-track data. |
| `/api/certificates` | Certificate creation and lookup. |
| `/api/admin/*` | Book migration and admin CRUD for tutorials and blogs. |
| `/api/playground/*` | Templates, saved projects, fork/duplicate, and import/export. |

## Tutorial and book content model

Tutorial books are intentionally separate from UI code.

```text
data/books/
  registry.json          Book summaries displayed by the library
  search-index.json      Precomputed search entries for books, parts, chapters, lessons
  <book-slug>.json       Complete structured book content
```

`lib/books.ts` is the server-side access layer. It loads the registry, returns a book, resolves a chapter, and resolves an optional granular lesson.

Each book JSON file follows this shape:

```ts
type LibraryBook = {
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  estimatedMinutes?: number;
  parts?: { number: number; slug: string; title: string; chapters: string[] }[];
  chapters: {
    number: number;
    slug: string;
    title: string;
    blocks: { type: "heading" | "subheading" | "paragraph" | "list" | "callout" | "table" | "code"; text: string }[];
    lessons?: { number: number; slug: string; title: string; blocks: LibraryBookBlock[] }[];
  }[];
};
```

The tutorial reader stores progress and learning memory client-side using `lib/book-progress.ts` and `lib/learning-memory.ts`. This means book reading works without creating a second, incompatible progress system.

### Adding or changing a book

1. Add `data/books/<slug>.json` using the model above.
2. Add its summary to `data/books/registry.json`.
3. Add book, part, chapter, and lesson entries to `data/books/search-index.json` so Global Search can discover it.
4. Add a `tutorialTracks` entry in `lib/data.ts` if it should be promoted in the Tutorials page.
5. Ensure the track uses `/tutorials/<slug>` when it is a book-backed tutorial.
6. Run `npm run build` and visit the book overview, one chapter route, and one lesson route.

The `scripts/` directory includes extractors for existing source materials. Generated content should be reviewed, edited for clarity, and treated as reference-derived curriculum rather than pasted source material.

### AI From Scratch curriculum

`data/books/ai-from-scratch.json` is the primary guided AI path. It is original educational content informed by the supplied reference volumes and intentionally does not reproduce them verbatim.

1. AI Fundamentals and Your Roadmap
2. Mathematics for AI Without Fear
3. Python and Data Handling for AI
4. Machine Learning Fundamentals
5. Supervised Learning Algorithms
6. Unsupervised Learning and Representation
7. Evaluation, Features and Improvement
8. Deep Learning and Neural Networks
9. Computer Vision
10. Natural Language Processing
11. Transformers From Intuition to Architecture
12. Generative AI and LLM Fundamentals
13. Retrieval-Augmented Generation (RAG)
14. AI Agents and Tool-Using Workflows
15. Deployment and MLOps Fundamentals
16. AI System Design
17. Real-World Projects and Interview Preparation

## Key feature modules

| Module | Main files | Notes |
| --- | --- | --- |
| Tutorial reader | `components/tutorials/tutorial-reader.tsx`, `components/tutorials/ai-volume-reader.tsx` | Renders structured blocks, side navigation, reading controls, bookmarks, progress, and revision context. |
| Search | `components/global-search.tsx` | Merges courses, tracks, projects, practice resources, and `data/books/search-index.json`. |
| Practice | `lib/practice.ts`, `components/practice/practice-platform.tsx` | Generates and displays practice material. |
| Playground | `components/playground-ide/*`, `app/api/playground/*`, `server/routes/playground/*` | Monaco-based editor, templates, saved projects, import/export, Python/SQL capabilities. |
| Revision | `lib/revision/*`, `components/revision/*`, `app/api/ai/revision/route.ts` | Prompt construction, provider-backed AI responses, history, and export. |
| Certificates | `lib/certificates.ts`, `components/certificates/*`, `app/api/certificates/route.ts` | Certificate generation and verification. |
| Admin | `components/admin/*`, `app/admin/*`, `app/api/admin/*` | Content management interfaces and APIs. |

## Data and persistence

- Static/course content: JSON under `data/`.
- Client learning state: browser `localStorage` through `lib/book-progress.ts`, `lib/learning-memory.ts`, and playground-store helpers.
- Optional application persistence: Mongoose models in `lib/models/` and database helpers in `lib/db.ts` / `server/config/db.js`.
- Authentication: JWT helpers in `lib/auth.ts`; clients retain a token and user record in local storage, then verify with `/api/auth/session`.

## Development guidelines

1. Keep route composition in `app/`, reusable presentation in `components/`, and data access/business logic in `lib/`.
2. Prefer the existing book reader and JSON content model for new long-form learning paths.
3. Do not put server-only modules such as `fs`, database access, or secrets in client components.
4. Keep user-facing AI output validated and scoped; tools and authorization should be handled by deterministic application code.
5. Preserve existing local progress keys when enhancing tutorial behavior.
6. Use semantic headings, clear code examples, accessible labels, and the established Tailwind dark-mode variants.
7. Inspect existing patterns before adding a new API or a competing UI system.

## Verification

Before opening a pull request or deploying:

```bash
npm run build
npm run lint
```

Then manually verify at desktop and mobile widths:

- Global navigation, theme toggle, and search.
- Tutorial overview, chapter route, lesson route, previous/next navigation, and progress persistence.
- Practice and playground workspace layouts.
- Authenticated and unauthenticated states.
- Any changed API route using the relevant environment configuration.

## Deployment

The project is configured for Vercel deployment. Set the same required environment variables in the Vercel project before deploying.

```bash
npm run build
vercel --prod
```

The application’s canonical deployment is [code-verse-academy.vercel.app](https://code-verse-academy.vercel.app).
