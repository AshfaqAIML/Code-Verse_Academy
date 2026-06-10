import fs from "node:fs";
import path from "node:path";

const root = String.raw`C:\Users\moham\Downloads\Kamraan\WEB DEV\Islamic`;
const nurRoot = path.join(root, "Nur Academy");
const kawserRoot = path.join(root, "al-kawser-lms");
const target = path.join(root, "nur-al-kawser-single-react-app");

const skipDirs = new Set([".git", "node_modules", "__pycache__"]);
const skipFiles = new Set(["desktop.ini"]);
const assetExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf"]);
const textExts = new Set([".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".sql", ".cjs", ".mjs", ".txt", ".svg"]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(p) {
  return fs.existsSync(p);
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function isTextFile(file) {
  const base = path.basename(file).toLowerCase();
  const ext = path.extname(file).toLowerCase();
  return textExts.has(ext) || base === ".env" || base === ".env.example" || base === ".gitignore" || base === ".eslintrc.cjs";
}

function copyDir(src, dst) {
  ensureDir(dst);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipDirs.has(entry.name) || skipFiles.has(entry.name)) continue;
    const sp = path.join(src, entry.name);
    const dp = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(sp, dp);
    else if (entry.isFile()) copyFile(sp, dp);
  }
}

function walk(src, base = "") {
  const out = [];
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipDirs.has(entry.name) || skipFiles.has(entry.name)) continue;
    const sp = path.join(src, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) out.push(...walk(sp, rel));
    else if (entry.isFile()) out.push({ full: sp, rel });
  }
  return out;
}

function urlPath(...parts) {
  return parts
    .flatMap((part) => String(part).split(/[\\/]+/))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

ensureDir(target);
ensureDir(path.join(target, "src", "apps"));
ensureDir(path.join(target, "public"));
if (!exists(path.join(target, "node_modules"))) {
  if (exists(path.join(kawserRoot, "node_modules"))) {
    copyDir(path.join(kawserRoot, "node_modules"), path.join(target, "node_modules"));
  }
  for (const pkgName of ["react-qr-code", "qrcode.react", "qr.js"]) {
    const sourcePkg = path.join(nurRoot, "node_modules", pkgName);
    const targetPkg = path.join(target, "node_modules", pkgName);
    if (exists(sourcePkg) && !exists(targetPkg)) {
      copyDir(sourcePkg, targetPkg);
    }
  }
}

copyDir(path.join(nurRoot, "src"), path.join(target, "src", "apps", "nur"));
copyDir(path.join(kawserRoot, "src"), path.join(target, "src", "apps", "alKawser"));
copyDir(path.join(nurRoot, "public"), path.join(target, "public", "nur-public"));
copyDir(path.join(kawserRoot, "public"), path.join(target, "public", "al-kawser-public"));
copyDir(nurRoot, path.join(target, "public", "original-sources", "nur-academy"));
copyDir(kawserRoot, path.join(target, "public", "original-sources", "al-kawser-lms"));

if (exists(path.join(nurRoot, "public", "favicon.png"))) {
  copyFile(path.join(nurRoot, "public", "favicon.png"), path.join(target, "public", "favicon.png"));
}
if (exists(path.join(nurRoot, "src", "assets", "signature.png"))) {
  copyFile(path.join(nurRoot, "src", "assets", "signature.png"), path.join(target, "src", "apps", "nur", "assets", "signature-optimized.png"));
}

const kawserAppFile = path.join(target, "src", "apps", "alKawser", "App.jsx");
let kawserApp = fs.readFileSync(kawserAppFile, "utf8");
kawserApp = kawserApp.replace("<BrowserRouter>", '<BrowserRouter basename="/lms">');
kawserApp = kawserApp.replace('href="/dashboard"', 'href="/lms/dashboard"');
fs.writeFileSync(kawserAppFile, kawserApp, "utf8");

const allFiles = [
  ...walk(nurRoot).map((file) => ({ source: "Nur Academy", sourceKey: "nur-academy", ...file })),
  ...walk(kawserRoot).map((file) => ({ source: "Al-Kawser LMS", sourceKey: "al-kawser-lms", ...file })),
];

const manifest = allFiles
  .filter((file) => isTextFile(file.full) || assetExts.has(path.extname(file.full).toLowerCase()))
  .map((file) => {
    const ext = path.extname(file.full).toLowerCase() || path.basename(file.rel).toLowerCase();
    const stat = fs.statSync(file.full);
    const kind = isTextFile(file.full) ? "text" : "asset";
    return {
      source: file.source,
      sourceKey: file.sourceKey,
      name: path.basename(file.rel),
      path: file.rel.split(path.sep).join("/"),
      ext,
      bytes: stat.size,
      kind,
      href: "/" + urlPath("original-sources", file.sourceKey, file.rel),
    };
  })
  .sort((a, b) => (a.sourceKey + "/" + a.path).localeCompare(b.sourceKey + "/" + b.path));

fs.writeFileSync(path.join(target, "src", "archiveManifest.js"), `export const archiveFiles = ${JSON.stringify(manifest, null, 2)};\n`, "utf8");

const pkg = readJson(path.join(kawserRoot, "package.json"));
const nurPkg = readJson(path.join(nurRoot, "package.json"));
pkg.name = "nur-al-kawser-single-react-app";
pkg.version = "1.0.0";
pkg.scripts = {
  dev: "vite",
  build: "vite build",
  preview: "vite preview",
  "create-admin": "node scripts/create-admin.cjs",
  "import-playlist-course": "node scripts/import-playlist-course.cjs",
  "import-nur-courses": "node scripts/import-nur-academy-courses.cjs",
};
pkg.dependencies = { ...pkg.dependencies, ...nurPkg.dependencies };
pkg.dependencies["qr.js"] = pkg.dependencies["qr.js"] || "0.0.0";
pkg.devDependencies = { ...pkg.devDependencies, ...nurPkg.devDependencies };
fs.writeFileSync(path.join(target, "package.json"), JSON.stringify(pkg, null, 2) + "\n", "utf8");

for (const file of [".env.example", ".env", ".eslintrc.cjs", ".gitignore", "postcss.config.js", "tailwind.config.js", "vercel.json"]) {
  if (exists(path.join(kawserRoot, file))) copyFile(path.join(kawserRoot, file), path.join(target, file));
}
copyDir(path.join(kawserRoot, "scripts"), path.join(target, "scripts"));
copyDir(path.join(kawserRoot, "supabase"), path.join(target, "supabase"));
if (exists(path.join(kawserRoot, "Courses thumbnails"))) copyDir(path.join(kawserRoot, "Courses thumbnails"), path.join(target, "Courses thumbnails"));

fs.writeFileSync(
  path.join(target, "vite.config.js"),
  `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: { alias: { '@': '/src/apps/alKawser' } },\n  server: { port: 3010, open: false },\n  build: {\n    outDir: 'dist',\n    sourcemap: false,\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['react', 'react-dom', 'react-router-dom'],\n          supabase: ['@supabase/supabase-js'],\n        },\n      },\n    },\n  },\n});\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "index.html"),
  `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="theme-color" content="#10261F" />\n    <title>Nur Academy + Al-Kawser LMS</title>\n    <link rel="icon" type="image/svg+xml" href="/al-kawser-public/favicon.svg" />\n    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@500;600;700&family=Inter:wght@400;600;700;800&family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "src", "main.jsx"),
  `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport './index.css';\nimport App from './App.jsx';\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n`,
  "utf8",
);

const kawserCss = fs.readFileSync(path.join(kawserRoot, "src", "index.css"), "utf8");
fs.writeFileSync(
  path.join(target, "src", "index.css"),
  `${kawserCss}\n\n@layer components {\n  .merged-shell { min-height: 100vh; background: #f4f7f2; color: #16221f; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }\n  .merged-shell button, .merged-shell input, .merged-shell select { font: inherit; }\n  .merged-topbar { position: sticky; top: 0; z-index: 40; background: rgba(244,247,242,.94); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(22,34,31,.12); }\n  .merged-topbar-inner { width: min(100%, 1240px); margin: 0 auto; min-height: 68px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }\n  .merged-brand { display: flex; align-items: center; gap: 12px; color: #16221f; text-decoration: none; min-width: 0; }\n  .merged-brand-mark { width: 42px; height: 42px; border-radius: 8px; background: #0e5c48; display: grid; place-items: center; color: #f8e7a2; font-weight: 800; flex: 0 0 auto; }\n  .merged-brand strong { display: block; font-size: 15px; line-height: 1.15; }\n  .merged-brand span span { display: block; font-size: 12px; color: #66736d; line-height: 1.2; }\n  .merged-nav { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }\n  .merged-nav a, .merged-action { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 12px; border: 1px solid rgba(22,34,31,.14); border-radius: 8px; color: #16221f; background: rgba(255,255,255,.58); text-decoration: none; font-size: 13px; font-weight: 700; cursor: pointer; }\n  .merged-nav a[data-active=\"true\"] { background: #0e5c48; color: white; border-color: #0e5c48; }\n  .merged-hero { position: relative; min-height: calc(100svh - 68px); display: grid; align-items: center; overflow: hidden; background: #10261f; color: white; }\n  .merged-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(16,38,31,.96) 0%, rgba(16,38,31,.84) 38%, rgba(16,38,31,.28) 100%), url('/nur-public/favicon.png') center right 12% / min(42vw, 440px) auto no-repeat, radial-gradient(circle at 78% 30%, rgba(248,231,162,.24), transparent 34%); }\n  .merged-hero-inner { position: relative; width: min(100%, 1240px); margin: 0 auto; padding: 72px 20px 96px; }\n  .merged-kicker { margin: 0 0 14px; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; color: #f8e7a2; font-weight: 800; }\n  .merged-title { max-width: 760px; margin: 0; font-size: clamp(44px, 8vw, 98px); line-height: .96; letter-spacing: 0; color: white; font-family: Georgia, 'Times New Roman', serif; }\n  .merged-lede { max-width: 620px; margin: 22px 0 0; color: rgba(255,255,255,.82); font-size: 17px; line-height: 1.7; }\n  .merged-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }\n  .merged-button { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; border-radius: 8px; padding: 11px 16px; text-decoration: none; font-weight: 800; border: 1px solid rgba(255,255,255,.18); }\n  .merged-button.primary { background: #f8e7a2; color: #10261f; border-color: #f8e7a2; }\n  .merged-button.secondary { color: white; background: rgba(255,255,255,.09); }\n  .merged-main { width: min(100%, 1240px); margin: 0 auto; padding: 34px 20px 80px; }\n  .merged-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 16px; }\n  .merged-section-head h2 { margin: 0; font-size: 26px; color: #16221f; font-family: Georgia, 'Times New Roman', serif; }\n  .merged-section-head p { margin: 4px 0 0; color: #66736d; max-width: 640px; }\n  .merged-app-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); border-top: 1px solid rgba(22,34,31,.14); border-bottom: 1px solid rgba(22,34,31,.14); }\n  .merged-app-tile { min-height: 260px; padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 28px; text-decoration: none; color: #16221f; border-right: 1px solid rgba(22,34,31,.14); background: rgba(255,255,255,.38); transition: background 160ms ease, transform 160ms ease; }\n  .merged-app-tile:last-child { border-right: 0; }\n  .merged-app-tile:hover { background: white; transform: translateY(-2px); }\n  .merged-app-logo { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; background: white; }\n  .merged-app-tile h3 { margin: 0; font-size: 30px; line-height: 1.08; color: #16221f; font-family: Georgia, 'Times New Roman', serif; }\n  .merged-app-tile p { margin: 10px 0 0; color: #66736d; line-height: 1.65; }\n  .merged-meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }\n  .merged-meta-row span, .archive-chip { width: fit-content; color: #0e5c48; background: rgba(14,92,72,.08); padding: 6px 8px; border-radius: 8px; font-size: 12px; font-weight: 800; }\n  .archive-toolbar { display: grid; grid-template-columns: minmax(0,1fr) 180px 160px; gap: 10px; margin: 22px 0 14px; }\n  .archive-toolbar input, .archive-toolbar select { width: 100%; min-height: 42px; border: 1px solid rgba(22,34,31,.15); border-radius: 8px; padding: 9px 11px; background: white; color: #16221f; }\n  .archive-table { border-top: 1px solid rgba(22,34,31,.14); }\n  .archive-row { display: grid; grid-template-columns: 140px minmax(0,1fr) 90px 86px; gap: 12px; align-items: center; min-height: 58px; padding: 10px 0; border-bottom: 1px solid rgba(22,34,31,.10); color: #16221f; }\n  .archive-row button { border: 0; background: none; color: #0e5c48; font-weight: 800; text-align: left; cursor: pointer; }\n  .archive-path { color: #66736d; font-size: 12px; overflow-wrap: anywhere; }\n  .archive-viewer { margin-top: 18px; background: #0f1d19; color: #e9f1eb; border-radius: 8px; overflow: hidden; border: 1px solid rgba(22,34,31,.18); }\n  .archive-viewer-head { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 12px 14px; background: rgba(255,255,255,.06); border-bottom: 1px solid rgba(255,255,255,.08); }\n  .archive-viewer pre { margin: 0; padding: 16px; max-height: 520px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.65; }\n  .archive-asset-preview { padding: 16px; background: white; }\n  .archive-asset-preview img { max-width: 100%; max-height: 460px; display: block; border-radius: 8px; }\n  .merged-floating-switcher { position: fixed; left: 14px; bottom: 14px; z-index: 5000; display: flex; gap: 8px; padding: 8px; border-radius: 10px; background: rgba(12,28,24,.86); border: 1px solid rgba(255,255,255,.12); backdrop-filter: blur(12px); }\n  .merged-floating-switcher a { min-height: 36px; display: inline-flex; align-items: center; justify-content: center; padding: 8px 10px; border-radius: 8px; color: white; text-decoration: none; font-size: 12px; font-weight: 800; }\n  .merged-floating-switcher a[data-active=\"true\"] { background: #f8e7a2; color: #10261f; }\n  @media (max-width: 820px) { .merged-topbar-inner { align-items: flex-start; flex-direction: column; padding: 12px 16px; } .merged-nav { justify-content: flex-start; } .merged-hero { min-height: auto; } .merged-hero::before { background: linear-gradient(180deg, rgba(16,38,31,.96), rgba(16,38,31,.8)), url('/nur-public/favicon.png') top 24px right 20px / 120px auto no-repeat; } .merged-hero-inner { padding: 78px 16px 56px; } .merged-app-grid { grid-template-columns: 1fr; } .merged-app-tile { border-right: 0; border-bottom: 1px solid rgba(22,34,31,.14); padding: 22px 0; } .archive-toolbar, .archive-row { grid-template-columns: 1fr; } .merged-floating-switcher { right: 10px; left: 10px; justify-content: center; flex-wrap: wrap; } }\n}\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "src", "App.jsx"),
  `import { useEffect, useMemo, useState, lazy, Suspense } from 'react';\nimport { archiveFiles } from './archiveManifest.js';\n\nconst NurAcademyApp = lazy(() => import('./apps/nur/App.jsx'));\nconst AlKawserApp = lazy(() => import('./apps/alKawser/App.jsx'));\nconst routes = [{ href: '/', label: 'Home' }, { href: '/nur', label: 'Nur Academy' }, { href: '/lms', label: 'Al-Kawser LMS' }, { href: '/archive', label: 'Archive' }];\n\nfunction navigateTo(path) { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }\nfunction usePathname() { const [pathname, setPathname] = useState(window.location.pathname); useEffect(() => { const sync = () => setPathname(window.location.pathname); window.addEventListener('popstate', sync); return () => window.removeEventListener('popstate', sync); }, []); return pathname; }\nfunction Shell({ children }) { const pathname = usePathname(); return <div className=\"merged-shell\"><header className=\"merged-topbar\"><div className=\"merged-topbar-inner\"><a className=\"merged-brand\" href=\"/\" onClick={(event) => { event.preventDefault(); navigateTo('/'); }}><span className=\"merged-brand-mark\">NA</span><span><strong>Nur + Al-Kawser</strong><span><span>One React learning workspace</span></span></span></a><nav className=\"merged-nav\" aria-label=\"Merged app navigation\">{routes.map((route) => <a key={route.href} href={route.href} data-active={pathname === route.href || (route.href !== '/' && pathname.startsWith(route.href))} onClick={(event) => { event.preventDefault(); navigateTo(route.href); }}>{route.label}</a>)}</nav></div></header>{children}</div>; }\nfunction Home() { const counts = useMemo(() => { const nur = archiveFiles.filter((file) => file.sourceKey === 'nur-academy'); const kawser = archiveFiles.filter((file) => file.sourceKey === 'al-kawser-lms'); return { nurText: nur.filter((file) => file.kind === 'text').length, kawserText: kawser.filter((file) => file.kind === 'text').length, assets: archiveFiles.filter((file) => file.kind === 'asset').length }; }, []); return <Shell><section className=\"merged-hero\"><div className=\"merged-hero-inner\"><p className=\"merged-kicker\">Unified React App</p><h1 className=\"merged-title\">Nur Academy and Al-Kawser LMS</h1><p className=\"merged-lede\">A single Vite React app that keeps the Nur Academy course experience, the Al-Kawser LMS workspace, and the original project files together under one interface.</p><div className=\"merged-actions\"><a className=\"merged-button primary\" href=\"/nur\" onClick={(event) => { event.preventDefault(); navigateTo('/nur'); }}>Open Nur Academy</a><a className=\"merged-button secondary\" href=\"/lms\" onClick={(event) => { event.preventDefault(); navigateTo('/lms'); }}>Open Al-Kawser LMS</a><a className=\"merged-button secondary\" href=\"/archive\" onClick={(event) => { event.preventDefault(); navigateTo('/archive'); }}>Browse Preserved Files</a></div></div></section><main className=\"merged-main\"><div className=\"merged-section-head\"><div><h2>Learning apps</h2><p>Both original applications are mounted in this single React runtime. Source documents and assets are preserved in the archive.</p></div></div><section className=\"merged-app-grid\"><a className=\"merged-app-tile\" href=\"/nur\" onClick={(event) => { event.preventDefault(); navigateTo('/nur'); }}><div><img className=\"merged-app-logo\" src=\"/nur-public/favicon.png\" alt=\"Nur Academy logo\" /><h3>Nur Academy</h3><p>State-based academy app with course catalog, lesson player, certificates, support, local admin tools, and playlist data.</p><div className=\"merged-meta-row\"><span>{counts.nurText} text files preserved</span><span>Course playlists included</span></div></div><strong>Launch academy</strong></a><a className=\"merged-app-tile\" href=\"/lms\" onClick={(event) => { event.preventDefault(); navigateTo('/lms'); }}><div><img className=\"merged-app-logo\" src=\"/al-kawser-public/favicon.svg\" alt=\"Al-Kawser logo\" /><h3>Al-Kawser LMS</h3><p>Supabase-backed LMS with auth, student dashboard, course catalog, admin panels, certificates, support, and analytics routes.</p><div className=\"merged-meta-row\"><span>{counts.kawserText} text files preserved</span><span>{counts.assets} total assets indexed</span></div></div><strong>Launch LMS</strong></a></section></main></Shell>; }\nfunction Archive() { const [query, setQuery] = useState(''); const [source, setSource] = useState('all'); const [kind, setKind] = useState('all'); const [selected, setSelected] = useState(null); const [content, setContent] = useState(''); const [loading, setLoading] = useState(false); const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return archiveFiles.filter((file) => { const sourceMatch = source === 'all' || file.sourceKey === source; const kindMatch = kind === 'all' || file.kind === kind; const queryMatch = !q || (file.source + ' ' + file.path + ' ' + file.name + ' ' + file.ext).toLowerCase().includes(q); return sourceMatch && kindMatch && queryMatch; }); }, [query, source, kind]); useEffect(() => { if (!selected || selected.kind !== 'text') { setContent(''); return; } let active = true; setLoading(true); fetch(selected.href).then((response) => response.text()).then((text) => { if (active) setContent(text); }).catch((error) => { if (active) setContent('Unable to load file: ' + error.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [selected]); return <Shell><main className=\"merged-main\"><div className=\"merged-section-head\"><div><h2>Preserved source and content archive</h2><p>Every copied source, documentation, SQL, script, config, and visual asset is indexed here so the merged app does not lose project text.</p></div><span className=\"archive-chip\">{filtered.length} files</span></div><div className=\"archive-toolbar\"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder=\"Search files, course names, docs, SQL, scripts\" /><select value={source} onChange={(event) => setSource(event.target.value)}><option value=\"all\">Both projects</option><option value=\"nur-academy\">Nur Academy</option><option value=\"al-kawser-lms\">Al-Kawser LMS</option></select><select value={kind} onChange={(event) => setKind(event.target.value)}><option value=\"all\">All files</option><option value=\"text\">Text files</option><option value=\"asset\">Assets</option></select></div><div className=\"archive-table\">{filtered.slice(0, 260).map((file) => <div className=\"archive-row\" key={file.sourceKey + '-' + file.path}><span className=\"archive-chip\">{file.source}</span><div><button type=\"button\" onClick={() => setSelected(file)}>{file.name}</button><div className=\"archive-path\">{file.path}</div></div><span className=\"archive-path\">{file.kind}</span><a className=\"archive-chip\" href={file.href} target=\"_blank\" rel=\"noreferrer\">Open</a></div>)}</div>{filtered.length > 260 && <p className=\"archive-path\" style={{ marginTop: 12 }}>Showing the first 260 matches. Narrow the search to inspect more specific files.</p>}{selected && <section className=\"archive-viewer\"><div className=\"archive-viewer-head\"><strong>{selected.source} / {selected.path}</strong><button className=\"merged-action\" type=\"button\" onClick={() => setSelected(null)}>Close</button></div>{selected.kind === 'text' ? <pre>{loading ? 'Loading...' : content}</pre> : <div className=\"archive-asset-preview\">{['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(selected.ext) ? <img src={selected.href} alt={selected.name} /> : <a href={selected.href} target=\"_blank\" rel=\"noreferrer\">Open asset</a>}</div>}</section>}</main></Shell>; }\nfunction FloatingSwitcher({ current }) { return <nav className=\"merged-floating-switcher\" aria-label=\"Merged app switcher\">{routes.map((route) => <a key={route.href} href={route.href} data-active={current === route.href || (route.href !== '/' && current.startsWith(route.href))}>{route.label}</a>)}</nav>; }\nfunction LoadingApp() { return <div className=\"merged-shell\" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>Loading app...</div>; }\nexport default function App() { const pathname = usePathname(); if (pathname.startsWith('/nur')) return <Suspense fallback={<LoadingApp />}><FloatingSwitcher current=\"/nur\" /><NurAcademyApp /></Suspense>; if (pathname.startsWith('/lms')) return <Suspense fallback={<LoadingApp />}><FloatingSwitcher current=\"/lms\" /><AlKawserApp /></Suspense>; if (pathname.startsWith('/archive')) return <Archive />; return <Home />; }\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "README.md"),
  `# Nur Academy + Al-Kawser LMS Single React App\n\nRoutes:\n\n- / - unified launcher\n- /nur - Nur Academy\n- /lms - Al-Kawser LMS\n- /archive - preserved original source, text, docs, SQL, configs, scripts, and assets\n\nOriginal projects were copied into this app and the source archive. The original folders were not modified.\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "src", "index.css"),
  `:root {
  color-scheme: light;
}

html, body, #root {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(14, 92, 72, 0.14), transparent 35%),
    radial-gradient(circle at 85% 15%, rgba(248, 231, 162, 0.22), transparent 28%),
    linear-gradient(180deg, #f6f8f4 0%, #eef3ee 55%, #e7eee8 100%);
  color: #15231f;
}

* {
  box-sizing: border-box;
}

a {
  color: inherit;
}

button,
input,
select {
  font: inherit;
}

.merged-shell {
  min-height: 100vh;
}

.merged-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid rgba(21, 35, 31, 0.1);
  background: rgba(246, 248, 244, 0.84);
  backdrop-filter: blur(18px);
}

.merged-topbar-inner {
  width: min(100%, 1240px);
  margin: 0 auto;
  min-height: 72px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.merged-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  min-width: 0;
}

.merged-brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0e5c48, #133e34);
  color: #f8e7a2;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: 0 14px 30px rgba(14, 92, 72, 0.18);
}

.merged-brand strong {
  display: block;
  font-size: 15px;
  line-height: 1.12;
}

.merged-brand span span {
  display: block;
  margin-top: 2px;
  color: #66736d;
  font-size: 12px;
  line-height: 1.25;
}

.merged-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.merged-nav a,
.merged-action {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid rgba(21, 35, 31, 0.12);
  background: rgba(255, 255, 255, 0.65);
  color: #15231f;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
  cursor: pointer;
}

.merged-nav a:hover,
.merged-action:hover,
.launch-panel:hover .merged-action {
  transform: translateY(-1px);
  border-color: rgba(14, 92, 72, 0.32);
}

.merged-nav a[data-active="true"] {
  background: #0e5c48;
  color: #fff;
  border-color: #0e5c48;
}

.merged-hero {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(14, 29, 25, 0.96) 0%, rgba(14, 29, 25, 0.9) 46%, rgba(14, 29, 25, 0.35) 100%),
    url('/nur-public/favicon.png') right 8% center / min(34vw, 360px) auto no-repeat,
    linear-gradient(135deg, #10261f, #13382d 72%, #0f201c);
  color: #fff;
}

.merged-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 75% 20%, rgba(248, 231, 162, 0.22), transparent 24%),
    radial-gradient(circle at 18% 80%, rgba(255, 255, 255, 0.08), transparent 30%);
}

.merged-hero-inner,
.merged-section,
.merged-footer {
  width: min(100%, 1240px);
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
}

.merged-hero-inner {
  position: relative;
  min-height: calc(100svh - 72px);
  display: grid;
  align-items: center;
  padding-top: 68px;
  padding-bottom: 72px;
}

.merged-kicker {
  margin: 0 0 16px;
  color: #f8e7a2;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 11px;
  font-weight: 800;
}

.merged-title {
  max-width: 720px;
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(48px, 8vw, 94px);
  line-height: 0.95;
  letter-spacing: -0.04em;
}

.merged-lede {
  max-width: 640px;
  margin: 20px 0 0;
  font-size: 18px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.8);
}

.merged-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.merged-button.primary {
  background: #f8e7a2;
  color: #10261f;
  border: 1px solid #f8e7a2;
}

.merged-button.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.merged-section {
  padding-top: 34px;
  padding-bottom: 74px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.05;
}

.section-heading p {
  margin: 8px 0 0;
  color: #66736d;
  max-width: 660px;
  line-height: 1.7;
}

.launch-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.launch-chip {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(21, 35, 31, 0.08);
  color: #33403c;
  font-size: 14px;
  line-height: 1.45;
}

.launch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.launch-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-height: 280px;
  padding: 28px;
  border-radius: 28px;
  text-decoration: none;
  color: #15231f;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(247, 249, 244, 0.92) 100%);
  border: 1px solid rgba(21, 35, 31, 0.08);
  box-shadow: 0 20px 60px rgba(20, 31, 28, 0.08);
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.launch-panel:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 70px rgba(20, 31, 28, 0.12);
  border-color: rgba(14, 92, 72, 0.18);
}

.launch-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 180ms ease;
  background: radial-gradient(circle at top right, rgba(248, 231, 162, 0.26), transparent 32%);
}

.launch-panel:hover::before {
  opacity: 1;
}

.launch-top {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.launch-logo {
  width: 58px;
  height: 58px;
  object-fit: contain;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(20, 31, 28, 0.08);
  flex: 0 0 auto;
}

.launch-copy h3 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.02;
}

.launch-copy p {
  margin: 10px 0 0;
  max-width: 520px;
  color: #56625d;
  line-height: 1.7;
}

.launch-meta {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #33403c;
  font-size: 13px;
  font-weight: 700;
}

.launch-meta span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(14, 92, 72, 0.08);
}

.launch-cta {
  position: relative;
  align-self: flex-start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: #0e5c48;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}

.merged-footer {
  padding-top: 0;
  padding-bottom: 56px;
}

.merged-note {
  margin: 0;
  color: #66736d;
  font-size: 13px;
  line-height: 1.6;
}

.merged-floating-switcher {
  position: fixed;
  left: 14px;
  bottom: 14px;
  z-index: 5000;
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 14px;
  background: rgba(12, 28, 24, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px);
}

.merged-floating-switcher a {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 800;
}

.merged-floating-switcher a[data-active="true"] {
  background: #f8e7a2;
  color: #10261f;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.merged-hero-inner > * {
  animation: riseIn 700ms ease both;
}

.merged-hero-inner > *:nth-child(2) {
  animation-delay: 80ms;
}

.merged-hero-inner > *:nth-child(3) {
  animation-delay: 140ms;
}

.merged-hero-inner > *:nth-child(4) {
  animation-delay: 200ms;
}

@media (max-width: 900px) {
  .merged-topbar-inner {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .merged-nav {
    justify-content: flex-start;
  }

  .merged-hero {
    background:
      linear-gradient(180deg, rgba(14, 29, 25, 0.98), rgba(14, 29, 25, 0.86)),
      linear-gradient(135deg, #10261f, #13382d 72%, #0f201c);
  }

  .merged-hero-inner {
    min-height: auto;
    padding-top: 60px;
    padding-bottom: 58px;
  }

  .launch-grid,
  .launch-strip {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .merged-floating-switcher {
    right: 10px;
    left: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }
}
`,
  "utf8",
);

fs.writeFileSync(
  path.join(target, "src", "App.jsx"),
  `import { BrowserRouter } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';

const NurAcademyApp = lazy(() => import('./apps/nur/App.jsx'));
const AlKawserApp = lazy(() => import('./apps/alKawser/App.jsx'));
const routes = [{ href: '/', label: 'Home' }, { href: '/nur', label: 'Nur Academy' }, { href: '/lms', label: 'Al-Kawser LMS' }];

function navigateTo(path) {
  window.location.assign(path);
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  return pathname;
}

function Shell({ children }) {
  const pathname = usePathname();
  return (
    <div className="merged-shell">
      <header className="merged-topbar">
        <div className="merged-topbar-inner">
          <a className="merged-brand" href="/" onClick={(event) => { event.preventDefault(); navigateTo('/'); }}>
            <span className="merged-brand-mark">NA</span>
            <span>
              <strong>Nur + Al-Kawser</strong>
              <span>Unified Islamic learning workspace</span>
            </span>
          </a>
          <nav className="merged-nav" aria-label="Merged app navigation">
            {routes.map((route) => (
              <a
                key={route.href}
                href={route.href}
                data-active={pathname === route.href || (route.href !== '/' && pathname.startsWith(route.href))}
                onClick={(event) => { event.preventDefault(); navigateTo(route.href); }}
              >
                {route.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function Home() {
  return (
    <Shell>
      <section className="merged-hero">
        <div className="merged-hero-inner">
          <div>
            <p className="merged-kicker">Single React workspace</p>
            <h1 className="merged-title">Two education platforms, one polished home.</h1>
            <p className="merged-lede">
              Launch Nur Academy for course delivery and certificates, or open Al-Kawser LMS for student, admin, and support workflows.
            </p>
            <div className="merged-actions">
              <a className="merged-button primary" href="/nur" onClick={(event) => { event.preventDefault(); navigateTo('/nur'); }}>
                Open Nur Academy
              </a>
              <a className="merged-button secondary" href="/lms" onClick={(event) => { event.preventDefault(); navigateTo('/lms'); }}>
                Open Al-Kawser LMS
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="merged-section">
        <div className="section-heading">
          <div>
            <h2>Choose your workspace</h2>
            <p>Everything is presented as a focused product launcher, so the homepage feels intentional instead of listing project internals.</p>
          </div>
        </div>

        <div className="launch-strip">
          <div className="launch-chip">Nur Academy keeps the learning journey front and center.</div>
          <div className="launch-chip">Al-Kawser LMS handles dashboard, admin, and support flows.</div>
          <div className="launch-chip">Both apps run inside one shared React shell.</div>
        </div>

        <div className="launch-grid">
          <a className="launch-panel" href="/nur" onClick={(event) => { event.preventDefault(); navigateTo('/nur'); }}>
            <div className="launch-top">
              <img className="launch-logo" src="/nur-public/favicon.png" alt="Nur Academy logo" />
              <div className="launch-copy">
                <h3>Nur Academy</h3>
                <p>Course catalog, lesson flow, certificates, support tools, and academy-focused learning content.</p>
              </div>
            </div>
            <div className="launch-meta">
              <span>Courses</span>
              <span>Certificates</span>
              <span>Support</span>
            </div>
            <span className="launch-cta">Enter academy</span>
          </a>

          <a className="launch-panel" href="/lms" onClick={(event) => { event.preventDefault(); navigateTo('/lms'); }}>
            <div className="launch-top">
              <img className="launch-logo" src="/al-kawser-public/favicon.svg" alt="Al-Kawser LMS logo" />
              <div className="launch-copy">
                <h3>Al-Kawser LMS</h3>
                <p>Student dashboard, course management, admin panels, analytics, and certificate workflows.</p>
              </div>
            </div>
            <div className="launch-meta">
              <span>Dashboard</span>
              <span>Admin</span>
              <span>Analytics</span>
            </div>
            <span className="launch-cta">Enter LMS</span>
          </a>
        </div>
      </section>

      <footer className="merged-footer">
        <p className="merged-note">The original projects remain preserved in the merged workspace and continue to load as their own applications.</p>
      </footer>
    </Shell>
  );
}

function NurWorkspace() {
  return (
    <Suspense fallback={<LoadingApp />}>
      <BrowserRouter basename="/nur">
        <NurAcademyApp />
      </BrowserRouter>
    </Suspense>
  );
}

function LMSWorkspace() {
  return (
    <Suspense fallback={<LoadingApp />}>
      <AlKawserApp />
    </Suspense>
  );
}

function LoadingApp() {
  return (
    <div className="merged-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      Loading app...
    </div>
  );
}

export default function App() {
  const pathname = usePathname();

  if (pathname.startsWith('/nur')) return <NurWorkspace />;
  if (pathname.startsWith('/lms')) return <LMSWorkspace />;
  return <Home />;
}
`,
  "utf8",
);

console.log(JSON.stringify({ target, filesIndexed: manifest.length, textFiles: manifest.filter((f) => f.kind === "text").length, assetFiles: manifest.filter((f) => f.kind === "asset").length }, null, 2));
