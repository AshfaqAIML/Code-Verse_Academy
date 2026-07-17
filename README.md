# CodeVerse Academy

CodeVerse Academy is a comprehensive learning platform built with Next.js 15. It offers interactive tutorials, AI-powered learning tools, practice environments, certification, and community features for web development, data science, and AI/ML education.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v3 |
| **UI Components** | Lucide icons, Framer Motion, Recharts, Chart.js, Monaco Editor |
| **AI/LLM** | Multi-provider (OpenAI, Anthropic, Google Gemini, DeepSeek) via AI SDK |
| **Auth** | JWT-based login (Google OAuth ready) |
| **Storage** | Local JSON files, extracted DOCX content, file-based storage |
| **Backend** | Next.js route handlers + Express scaffold in `server/` |

## Quick Start

```bash
npm install
npm run dev        # Frontend at http://localhost:3000
```

### Environment Variables

Create `.env.local`:

```env
# At least one LLM provider key is required for AI features
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
DEEPSEEK_API_KEY=...

# Optional: choose default provider and model
AI_PROVIDER=openai          # openai | anthropic | google | deepseek
AI_MODEL=gpt-4o-mini

# Auth (optional)
JWT_SECRET=your-secret
MONGODB_URI=...
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run server` | Start Express backend scaffold on port 4000 |
| `npm run dev:full` | Run both frontend and backend |

---

## Project Layout

```
app/                    Next.js App Router pages and routes
  ai-classroom/         AI-powered learning tools (7 tools)
  api/                  API route handlers
  blog/                 Blog index and articles
  courses/              Course grid and tracks
  tutorials/            Tutorial book reader
  practice/             Practice workspace
  playground/           Code playground
  dashboard/            Learner dashboard
  projects/             Project showcase
  certifications/       Certificate studio
  data-science/         Data science learning page
  ai-ml/                AI/ML learning page
  community/            Community page
  login, register, profile, admin

components/             Shared UI and feature-specific components
data/                   Generated content: books, blogs, CSV samples
docs/                   Architecture and design notes
lib/                    Shared logic, content helpers, AI classroom modules
server/                 Express API scaffold
scripts/                Content extraction utilities
playground/             Standalone sandbox (separate Vite + Express app)
```

---

## AI Classroom — 7 Learning Tools

The AI Classroom (`/ai-classroom`) is the platform's AI-powered learning suite. Each tool lives in `app/ai-classroom/<tool>/` and is backed by a shared LLM layer in `lib/ai-classroom/`.

### Tools

| Tool | Route | Description |
|------|-------|-------------|
| **Smart Quiz** | `/ai-classroom/quiz` | AI-generated quizzes from lesson content. Timer, difficulty selector, progress bar, skip questions, detailed scoring |
| **Flashcards** | `/ai-classroom/flashcards` | AI-generated flashcards with 3D CSS flip animation, keyboard nav (← → Space), shuffle, progress tracking |
| **Voice Learning** | `/ai-classroom/voice` | Speech recognition + synthesis in 7 languages. Click-to-speak, transcript preview, read-aloud |
| **AI Notes** | `/ai-classroom/notes` | Structured notes with localStorage persistence, search, AI generation from content, word count, duplicate |
| **Code Mentor** | `/ai-classroom/code-mentor` | Review/Debug/Optimize/Explain modes. Paste code, get AI analysis, ask follow-ups |
| **AI Whiteboard** | `/ai-classroom/whiteboard` | HTML5 Canvas drawing board. Pen, shapes, text, eraser, fill color, undo/redo, download PNG |
| **AI Classmates** | `/ai-classroom/classmates` | Multi-agent group discussion. Beginner/Intermediate/Advanced AI peers discuss together via SSE streaming |

### AI Backend Architecture

```
lib/ai-classroom/
  providers.ts          -- Multi-provider LLM factory (OpenAI, Anthropic, Google, DeepSeek)
  llm.ts                -- streamAI / callAI helpers
  types.ts              -- Shared types (ChatMessage, ChatRequest, SSEEvent, DirectorState)
  use-chat-history.ts   -- Generic localStorage hook for chat persistence
  agents.ts             -- Agent definitions (teacher, assistant, classmates)
  generation/
    types.ts            -- QuizContent, Flashcard, GenerationRequest types
    outline-generator.ts-- Chapter outline generation
    content-generator.ts-- Quiz and flashcard content generation
  orchestration/
    prompt-builder.ts   -- System prompts for multi-agent discussions
    director.ts         -- Director loop: cycles agents via LLM decisions with SSE streaming

app/api/ai-classroom/
  chat/route.ts         -- POST handler: single-agent or multi-agent chat with SSE
  generate/route.ts     -- POST handler: generate outlines, quizzes, flashcards
```

### Key design decisions

- **Multi-provider**: Supports 4 LLM providers via environment variables. Default: `openai` / `gpt-4o-mini`. Set `AI_PROVIDER` and `AI_MODEL` in env.
- **SSE streaming**: All AI responses stream via Server-Sent Events for real-time UI updates.
- **Multi-agent orchestration**: Lightweight director loop (no LangGraph dependency) — agents take turns based on LLM director decisions.
- **localStorage persistence**: Chat history is saved per page via the `useChatHistory` hook. Clear buttons provided on each surface.
- **No UI framework**: All tools use Tailwind CSS with custom components to match the platform's design language.

---

## Route Map

### App Routes

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/courses` | Course grid and learning tracks |
| `/tutorials` | Tutorial index |
| `/tutorials/[book]/[chapter]` | Tutorial chapter reader |
| `/practice` | Practice classroom and task workspace |
| `/playground` | Code playground |
| `/dashboard` | Learner dashboard |
| `/blog` | Blog index |
| `/blog/[slug]` | Full article reader |
| `/projects` | Projects showcase |
| `/data-science` | Data science learning page |
| `/ai-ml` | AI/ML learning page |
| `/community` | Community page |
| `/certifications` | Certificate studio |
| `/verify/[id]` | Certificate verification page |
| `/login`, `/register`, `/profile`, `/admin` | Account and admin pages |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | JWT login |
| `/api/practice` | GET, POST | Practice tracks |
| `/api/certificates` | GET, POST | Certificate management |
| `/api/ai/revision` | POST | AI revision assistant |
| `/api/revision/history` | POST | Revision history |
| `/api/ai-classroom/chat` | POST | Single-agent / multi-agent chat (SSE) |
| `/api/ai-classroom/generate` | POST | Generate outlines, quizzes, flashcards |

---

## Content Sources

### Tutorials & Books

Tutorial content lives in `data/books/*.json` with a registry at `data/books/registry.json`.

- `lib/books.ts` — book registry and chapter lookup
- `app/tutorials/[book]/[chapter]/page.tsx` — chapter reader
- `components/tutorials/tutorial-reader.tsx` — reading UI with revision flow

Currently loaded: **AIML Engineer** (102 chapters), **AI/ML Handbook Volumes 1 & 2**.

### Blog Articles

Sourced from `Blogs.docx`, extracted to `data/blogs.json`.

- `lib/blogs.ts` — article lookup
- `app/blog/page.tsx` — index
- `app/blog/[slug]/page.tsx` — reader
- `components/blog/blog-reader.tsx` — article layout

### Practice Content

Assembled from course metadata (`lib/data.ts`) and book summaries (`lib/books.ts`).

- `lib/practice.ts` — track/task generation
- `components/practice/practice-platform.tsx` — practice UI

### Certificates

- `components/certificates/certificate-studio.tsx` — certificate designer
- `docs/certificate-system.md` — design docs

---

## Components Library

All shared UI components live in `components/`:

| Component | Purpose |
|-----------|---------|
| `app-shell.tsx` | Global layout: sidebar, header, theme toggle, auth state |
| `section.tsx` | Reusable page section wrapper |
| `blog/blog-reader.tsx` | Article reader with section navigation |
| `tutorials/tutorial-reader.tsx` | Chapter reader with revision flow |
| `practice/practice-platform.tsx` | Practice workspace |
| `playground.tsx` | Code editor and output |
| `charts.tsx` | Dashboard charts |
| `certificates/certificate-studio.tsx` | Certificate designer |
| `revision/*` | AI revision assistant and center |
| `ai-classroom/chat-panel.tsx` | Reusable single-agent chat panel |
| `ai-classroom/classmates-page.tsx` | Multi-agent group discussion |

---

## Where To Add New Code

| What | Where |
|------|-------|
| New page or route | `app/<route>/page.tsx` |
| New reusable UI | `components/<feature>/...` |
| New API endpoint | `app/api/<feature>/route.ts` |
| New shared logic | `lib/<feature>.ts` |
| New AI tool | `app/ai-classroom/<tool>/page.tsx` + helpers in `lib/ai-classroom/` |
| New backend service | `server/` |
| New content extractor | `scripts/` |
| New static content | `data/` |

### Principles

1. Find the nearest existing pattern before creating a new one.
2. Keep data lookup in `lib/`, UI in `components/`, pages in `app/`.
3. Never duplicate static content across pages — load from `lib/`.
4. Keep server-only logic out of client components.
5. Content generation goes in `scripts/`, rendered UI goes in `components/` or `app/`.

---

## Deployment

The project is deployed on **Vercel** at [code-verse-academy.vercel.app](https://code-verse-academy.vercel.app).

```bash
# Deploy via Vercel CLI
vercel --prod
```

Set all required environment variables in the Vercel project dashboard under **Settings → Environment Variables**.

---

## Design Patterns

- **Global navigation**: `components/app-shell.tsx` owns sidebar, header, theme, auth.
- **Page framing**: `components/section.tsx` provides consistent section layout.
- **Reader pattern**: Main reading column + side index/inspector.
- **AI pattern**: Client-side streaming via fetch/ReadableStream → SSE parsing → React state.
- **Storage pattern**: `lib/` modules abstract localStorage and data access behind simple APIs.
- **Dark mode**: Tailwind `dark:` variants + `ThemeProvider` in layout.
