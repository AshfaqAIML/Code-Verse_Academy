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
lib/                    Shared logic, content helpers
server/                 Express API scaffold
scripts/                Content extraction utilities
playground/             Standalone sandbox (separate Vite + Express app)
```

---


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


---

## Where To Add New Code

| What | Where |
|------|-------|
| New page or route | `app/<route>/page.tsx` |
| New reusable UI | `components/<feature>/...` |
| New API endpoint | `app/api/<feature>/route.ts` |
| New shared logic | `lib/<feature>.ts` |
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
