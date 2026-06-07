# CodeVerse Academy

CodeVerse Academy is a Next.js learning platform for web development, data science, AI/ML, interview prep, practice work, certificates, blogs, and guided reading.

This README is written as a project map so another LLM or developer can quickly understand:

- what the app already contains
- where each feature lives
- where new code should be added
- how to avoid duplicating logic or content

## Tech Stack

- Frontend: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS
- Motion and UI: Framer Motion, Lucide icons, Recharts, Chart.js, Monaco Editor
- Backend/API: Next.js route handlers plus an Express scaffold in `server/`
- Auth scaffold: JWT-based login flow ready for a real auth provider
- Content sources: local JSON files, extracted DOCX content, and seeded demo data

## Run Scripts

```bash
npm install
npm run dev
npm run server
npm run dev:full
npm run build
```

- Frontend: `http://localhost:3000`
- Backend API scaffold: `http://localhost:4000`

## Project Layout

```text
app/                Next.js routes and pages
components/         Shared UI and feature-specific client components
data/               Generated content, books, blog JSON, CSV samples
docs/               Architecture notes for specific systems
lib/                Shared data access, feature logic, and content helpers
server/             Express API scaffold and server-side models
scripts/            Content extraction and generation utilities
playground/         Separate standalone playground stack with its own frontend/backend
Blogs.docx          Source Word file for the blog articles
```

## Route Map

### App routes

- `/` - landing page
- `/courses` - course grid and learning tracks
- `/tutorials` - tutorial index
- `/tutorials/[book]` - tutorial book overview
- `/tutorials/[book]/[chapter]` - tutorial chapter reader
- `/tutorial/[slug]` - single-course tutorial view
- `/practice` - practice classroom and task workspace
- `/playground` - code playground
- `/dashboard` - learner dashboard
- `/blog` - blog index
- `/blog/[slug]` - full article reader
- `/projects` - projects showcase
- `/data-science` - data science learning page
- `/ai-ml` - AI/ML learning page
- `/community` - community page
- `/certifications` - certificate studio
- `/verify/[id]` - certificate verification page
- `/login`, `/register`, `/profile`, `/admin` - account and admin pages

### API routes

- `POST /api/auth/login`
- `GET /api/practice`
- `POST /api/practice`
- `GET /api/certificates`
- `POST /api/certificates`
- `POST /api/ai/revision`
- `POST /api/revision/history`

## What Lives Where

### `app/`

Each folder in `app/` is a route. Use this when the feature is page-specific.

- Put page entry components in `page.tsx`.
- Put route-specific metadata or server data fetching next to the page.
- Put dynamic route readers in `app/<section>/[slug]/page.tsx` or nested route folders.

Important patterns already used here:

- `app/layout.tsx` wraps the whole app with `ThemeProvider` and `AppShell`.
- `app/blog/[slug]/page.tsx` uses `generateStaticParams()` for static article pages.
- `app/tutorials/[book]/[chapter]/page.tsx` uses a reader component to keep the page file small.

### `components/`

Use this for reusable UI and feature components.

Current high-value components:

- `components/app-shell.tsx` - global sidebar, header, theme, auth state
- `components/section.tsx` - reusable section wrapper
- `components/blog/blog-reader.tsx` - article reader layout
- `components/tutorials/tutorial-reader.tsx` - tutorial chapter reader
- `components/practice/practice-platform.tsx` - practice classroom and task workspace
- `components/revision/*` - AI revision assistant and revision center
- `components/certificates/certificate-studio.tsx` - certificate studio UI
- `components/playground.tsx` - playground editor/output experience
- `components/charts.tsx` - dashboard charts

Use `components/` when:

- multiple routes need the same UI
- a route file is getting too large
- the feature has its own interaction state

### `lib/`

Use this for shared data, parsing, business rules, and feature-specific helpers.

Current modules:

- `lib/data.ts` - global navigation, categories, courses, metrics, and demo content
- `lib/books.ts` - book registry access and tutorial chapter lookup
- `lib/blogs.ts` - blog article access from generated JSON
- `lib/practice.ts` - practice track creation and task generation
- `lib/certificates.ts` - certificate helpers
- `lib/revision/*` - revision AI types, prompts, agent, and export helpers

Rule of thumb:

- page-specific UI goes in `app/` or `components/`
- shared content lookup goes in `lib/`
- never duplicate static content in multiple pages if it can be loaded from `lib/`

### `data/`

This folder holds the content data the app consumes.

- `data/books/*.json` - extracted tutorial books and chapters
- `data/books/registry.json` - book index used by tutorial and practice pages
- `data/blogs.json` - parsed blog articles from `Blogs.docx`
- `data/sample-certificate-bulk.csv` - sample certificate import data

The blog and book JSON files are generated content, not hand-written page copy.

### `server/`

Express scaffold for when you want a separate backend process.

- `server/index.js` - server entry
- `server/models/revision-models.js` - revision-related data models
- `server/README.md` - backend notes

Use `server/` when a feature needs:

- a standalone API
- persistent storage logic
- backend auth or queues outside Next.js route handlers

### `playground/`

This is a separate sandbox application, not the same thing as the main `/playground` route in `app/`.

- `playground/frontend/` - standalone Vite React UI
- `playground/backend/` - standalone Express backend, DB, routes, middleware, and utilities
- `playground/INTEGRATION.md` - setup and integration notes

Use this folder when you are working on the isolated playground stack. Do not copy its UI or backend logic into the main app unless the feature is intentionally being shared.

If you want to merge the playground backend into an existing backend structure, use a layout like this:

```text
your-existing-backend/
├── src/ (or wherever your main code lives)
│   ├── app.js (or server.js / index.js)  <-- existing main entry
│   ├── config/                           <-- existing DB/config files
│   ├── routes/
│   │   ├── users.js                      <-- existing routes
│   │   └── playground/                   <-- create this folder for playground APIs
│   │       ├── projects.js              <-- move playground/backend/routes/projects.js here
│   │       ├── templates.js             <-- move playground/backend/routes/templates.js here
│   │       ├── export.js                <-- move playground/backend/routes/export.js here
│   │       └── import.js                <-- move playground/backend/routes/import.js here
│   ├── middleware/
│   │   ├── auth.js                       <-- existing auth middleware
│   │   └── playground/                   <-- create this folder for playground middleware
│   │       └── validators.js            <-- move playground/backend/middleware/validators.js here
│   └── controllers/                      <-- optional, if your backend uses controllers
```

Recommended rule: keep playground-specific backend code grouped under a `playground/` namespace so you do not duplicate route names, validators, or service logic across the app.

### `scripts/`

Utilities that turn source docs into app-ready data.

- `scripts/extract-docx-library.py` - generates tutorial book JSON from DOCX source books
- `scripts/extract-blog-articles.py` - generates blog article JSON from `Blogs.docx`

If you change the source Word file, rerun the matching script so the app stays in sync.

## Content Sources

### Tutorials and books

The tutorial library is backed by `data/books/*.json`.

- `lib/books.ts` reads the registry and chapter data.
- `app/tutorials/[book]/page.tsx` lists chapters.
- `app/tutorials/[book]/[chapter]/page.tsx` renders the chapter reader.
- `components/tutorials/tutorial-reader.tsx` owns the reading UI and revision flow.

### Blog articles

The blog content is sourced from `Blogs.docx`.

- `scripts/extract-blog-articles.py` parses the DOCX into `data/blogs.json`
- `lib/blogs.ts` exposes article lookup helpers
- `app/blog/page.tsx` shows the article index
- `app/blog/[slug]/page.tsx` renders the article reader
- `components/blog/blog-reader.tsx` handles article layout and section navigation

### Practice content

Practice tracks are assembled from:

- course metadata in `lib/data.ts`
- tutorial book summaries from `lib/books.ts`
- task generation in `lib/practice.ts`

The main practice UI is in `components/practice/practice-platform.tsx`.

### AI revision content

The AI revision flow is driven by:

- `components/revision/revision-assistant.tsx`
- `components/revision/revision-center.tsx`
- `lib/revision/prompts.ts`
- `lib/revision/agent.ts`
- `app/api/ai/revision/route.ts`

Design notes for that system are in `docs/ai-revision-architecture.md`.

### Certificates

Certificate design and data flow are covered in:

- `components/certificates/certificate-studio.tsx`
- `app/api/certificates/route.ts`
- `app/verify/[id]/page.tsx`
- `docs/certificate-system.md`

## Where To Put New Code

Use this as the default placement guide.

- New page or route-specific screen: `app/<route>/page.tsx`
- New reusable UI block: `components/<feature>/...`
- New data lookup or content helper: `lib/<feature>.ts`
- New API endpoint: `app/api/<feature>/route.ts`
- New backend service or model: `server/`
- New source-to-JSON generator: `scripts/`
- New static content generated from a doc or dataset: `data/`

## How To Extend The Project Without Duplicating Code

When adding a new module, use the closest existing pattern instead of inventing a fresh one.

Examples:

- If you add a new blog article, update `Blogs.docx`, rerun `scripts/extract-blog-articles.py`, and let `lib/blogs.ts` feed the page.
- If you add another tutorial book, generate a new JSON file in `data/books/`, add it to `registry.json`, and read it through `lib/books.ts`.
- If you add a new reader page, keep the data lookup in `lib/` and the UI in a reusable component under `components/`.
- If a page starts mixing layout, data shaping, and feature logic, split the logic out before duplicating it elsewhere.

## Existing Design Patterns

- Global navigation and header live in `components/app-shell.tsx`.
- Shared page framing uses `components/section.tsx`.
- Reader experiences use a main reading column plus a side index or inspector.
- Large learning surfaces prefer route-specific feature components instead of keeping everything in the page file.
- Static content is often generated into JSON first, then read by the UI.

## Environment Notes

- `next.config.mjs` and `tsconfig.json` are set up for the current Next.js and TypeScript workflow.
- `resolveJsonModule` is enabled, so JSON content can be imported directly from `lib/`.
- The repo already contains `.next/` build output and local log files from prior runs; those are not source files.

## If You Are An LLM Reading This Repo

Before writing new code:

1. Find the nearest existing route or feature component.
2. Check whether the data already exists in `lib/` or `data/`.
3. Reuse the same route pattern before adding a new folder.
4. Keep server-only logic out of client components.
5. Keep content generation in `scripts/` and rendered UI in `components/` or `app/`.
6. If you need to add something new, place it beside the most similar existing module instead of creating a duplicate system.

This repo is already organized around a few stable pillars:

- `app/` for routes
- `components/` for UI
- `lib/` for shared logic
- `data/` for generated content
- `scripts/` for content extraction
- `server/` for backend scaffolding

That is usually the fastest way to figure out where a new feature belongs.
