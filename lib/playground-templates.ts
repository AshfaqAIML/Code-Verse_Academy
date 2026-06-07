export type PlaygroundTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  html: string;
  css: string;
  javascript: string;
  cdn_libraries: { name: string; type: "js" | "css"; url: string }[];
};

export const playgroundTemplates: PlaygroundTemplate[] = [
  {
    id: "blank",
    name: "Blank HTML",
    description: "Empty HTML5 boilerplate",
    icon: "📄",
    category: "basic",
    html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n</body>\n</html>",
    css: "body {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  padding: 20px;\n}",
    javascript: 'console.log("Hello from Playground!");',
    cdn_libraries: []
  },
  {
    id: "landing",
    name: "Landing Page",
    description: "Modern landing page with hero section",
    icon: "🚀",
    category: "pages",
    html: `<header class="hero">
  <nav><div class="logo">🚀 MyApp</div><ul><li><a href="#">Features</a></li><li><a href="#">Pricing</a></li><li><a href="#" class="btn">Get Started</a></li></ul></nav>
  <div class="hero-content">
    <h1>Build Something Amazing</h1>
    <p>Create beautiful web experiences with our platform.</p>
    <a href="#" class="btn btn-primary">Start Free Trial</a>
  </div>
</header>
<section class="features">
  <h2>Why Choose Us?</h2>
  <div class="grid">
    <div class="card"><span class="icon">⚡</span><h3>Fast</h3><p>Optimized performance.</p></div>
    <div class="card"><span class="icon">🔒</span><h3>Secure</h3><p>Enterprise security.</p></div>
    <div class="card"><span class="icon">🎨</span><h3>Beautiful</h3><p>Stunning designs.</p></div>
  </div>
</section>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui,sans-serif; }
.hero { background:linear-gradient(135deg,#667eea,#764ba2); color:white; text-align:center; padding:100px 20px; }
.hero nav { display:flex; justify-content:space-between; align-items:center; max-width:1200px; margin:0 auto 60px; }
.logo { font-size:1.5rem; font-weight:700; }
nav ul { display:flex; gap:20px; list-style:none; }
nav a { color:white; text-decoration:none; }
.btn { padding:12px 24px; background:white; color:#667eea; border-radius:8px; text-decoration:none; font-weight:600; }
.hero h1 { font-size:3rem; margin-bottom:20px; }
.hero p { font-size:1.2rem; opacity:0.9; max-width:500px; margin:0 auto 30px; }
.features { padding:80px 20px; text-align:center; }
.features h2 { font-size:2.5rem; margin-bottom:40px; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:30px; max-width:1000px; margin:0 auto; }
.card { padding:40px; background:#f8f9fa; border-radius:16px; }
.icon { font-size:3rem; display:block; margin-bottom:15px; }`,
    javascript: `document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); });
});`,
    cdn_libraries: []
  },
  {
    id: "dashboard",
    name: "Dashboard UI",
    description: "Admin dashboard with charts",
    icon: "📊",
    category: "apps",
    html: `<div class="dashboard">
  <aside class="sidebar">
    <h2>📊 Admin</h2>
    <nav><a href="#" class="active">Overview</a><a href="#">Users</a><a href="#">Products</a><a href="#">Settings</a></nav>
  </aside>
  <main>
    <div class="stats">
      <div class="stat-card"><h3>Users</h3><p>12,847</p><span>+12.5%</span></div>
      <div class="stat-card"><h3>Revenue</h3><p>$48,295</p><span>+8.2%</span></div>
      <div class="stat-card"><h3>Orders</h3><p>1,429</p><span>-2.4%</span></div>
    </div>
    <div class="charts"><canvas id="chart"></canvas></div>
  </main>
</div>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui,sans-serif; background:#f1f5f9; }
.dashboard { display:flex; min-height:100vh; }
.sidebar { width:240px; background:#1e293b; color:white; padding:20px; }
.sidebar h2 { margin-bottom:30px; }
.sidebar nav { display:flex; flex-direction:column; gap:5px; }
.sidebar a { padding:12px 16px; border-radius:8px; text-decoration:none; color:#94a3b8; }
.sidebar a:hover, .sidebar a.active { background:#334155; color:white; }
main { flex:1; padding:30px; }
.stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-bottom:30px; }
.stat-card { background:white; border-radius:12px; padding:24px; }
.stat-card h3 { font-size:0.85rem; color:#64748b; }
.stat-card p { font-size:1.8rem; font-weight:700; }
.stat-card span { color:#10b981; font-size:0.85rem; }
.charts { background:white; border-radius:12px; padding:24px; }`,
    javascript: `new Chart(document.getElementById('chart'), {
  type: 'line',
  data: { labels:['Jan','Feb','Mar','Apr','May','Jun'],
    datasets:[{ label:'Revenue', data:[12000,19000,15000,25000,22000,30000],
      borderColor:'#667eea', fill:true, backgroundColor:'rgba(102,126,234,0.1)', tension:0.4 }]
  }, options:{ responsive:true }
});`,
    cdn_libraries: [{ name: "Chart.js", type: "js", url: "https://cdn.jsdelivr.net/npm/chart.js" }]
  },
  {
    id: "react-starter",
    name: "React Starter",
    description: "React app with hooks",
    icon: "⚛️",
    category: "frameworks",
    html: '<div id="root"></div>',
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui; }
.app { max-width:600px; margin:0 auto; padding:40px 20px; text-align:center; }
h1 { color:#61dafb; margin-bottom:20px; }
.counter { margin:30px 0; }
.count { font-size:3rem; font-weight:bold; }
button { margin:0 10px; padding:12px 30px; background:#61dafb; border:none; border-radius:8px; font-size:1rem; cursor:pointer; }
button:hover { opacity:0.8; }`,
    javascript: `const { useState } = React;
function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="app">
      <h1>⚛️ React Playground</h1>
      <div className="counter">
        <div className="count">{count}</div>
        <button onClick={() => setCount(c => c + 1)}>+</button>
        <button onClick={() => setCount(c => c - 1)}>-</button>
      </div>
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById('root'));`,
    cdn_libraries: [
      { name: "React", type: "js", url: "https://unpkg.com/react@18/umd/react.development.js" },
      { name: "ReactDOM", type: "js", url: "https://unpkg.com/react-dom@18/umd/react-dom.development.js" },
      { name: "Babel", type: "js", url: "https://unpkg.com/@babel/standalone/babel.min.js" }
    ]
  },
  {
    id: "vue-starter",
    name: "Vue.js Starter",
    description: "Vue 3 with Composition API",
    icon: "🖖",
    category: "frameworks",
    html: `<div id="app">
  <h1>🖖 Vue.js Playground</h1>
  <p>{{ message }}</p>
  <div class="counter">
    <span class="count">{{ count }}</span>
    <button @click="count++">+</button>
    <button @click="count--">-</button>
  </div>
</div>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui; background:#f0f9eb; min-height:100vh; display:flex; align-items:center; justify-content:center; }
#app { text-align:center; padding:40px; background:white; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.1); }
h1 { color:#42b883; margin-bottom:20px; }
.counter { margin-top:20px; }
.count { display:block; font-size:3rem; font-weight:bold; margin:15px 0; }
button { margin:0 10px; padding:12px 30px; background:#42b883; color:white; border:none; border-radius:8px; font-size:1.2rem; cursor:pointer; }`,
    javascript: `const { createApp, ref } = Vue;
createApp({
  setup() {
    const message = ref('Welcome to Vue 3!');
    const count = ref(0);
    return { message, count };
  }
}).mount('#app');`,
    cdn_libraries: [{ name: "Vue.js", type: "js", url: "https://unpkg.com/vue@3/dist/vue.global.js" }]
  }
];

export function getPlaygroundTemplates() {
  return playgroundTemplates.map(({ html, css, javascript, cdn_libraries, ...summary }) => summary);
}

export function getPlaygroundTemplate(id: string) {
  return playgroundTemplates.find((template) => template.id === id) ?? null;
}
