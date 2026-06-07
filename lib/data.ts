import {
  BadgeCheck,
  BarChart3,
  Bot,
  BrainCircuit,
  Code2,
  Database,
  FileQuestion,
  Flame,
  FolderKanban,
  GraduationCap,
  LineChart,
  MonitorPlay,
  Network,
  NotebookTabs,
  PanelTop,
  Rocket,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";

export const categories = [
  { name: "Web Development", href: "/courses?category=web", icon: Code2, count: "Start with HTML, CSS and JS" },
  { name: "DSA & Problem Solving", href: "/courses?category=dsa", icon: Trophy, count: "Arrays to graphs, step by step" },
  { name: "Data Science", href: "/courses?category=data", icon: BarChart3, count: "Python, SQL and charts" },
  { name: "AI/ML", href: "/courses?category=ai-ml", icon: BrainCircuit, count: "Models explained simply" },
  { name: "CS Core", href: "/courses?category=cs-core", icon: Database, count: "DBMS, OS, OOP and networks" },
  { name: "Projects", href: "/courses?category=projects", icon: FolderKanban, count: "Build portfolio-ready apps" }
];

export const courses = [
  {
    title: "DSA Complete Path",
    slug: "dsa-complete-path",
    category: "DSA",
    level: "Beginner to Advanced",
    lessons: 92,
    progress: 61,
    color: "from-rose-400 to-orange-500",
    description: "Learn problem solving from basics: arrays, strings, recursion, trees, graphs and dynamic programming.",
    chapters: ["C++ basics", "Recursion", "Trees", "Graphs"],
    certificate: true
  },
  {
    title: "System Design Basics",
    slug: "system-design-basics",
    category: "Interview",
    level: "Intermediate",
    lessons: 28,
    progress: 38,
    color: "from-slate-500 to-cyan-500",
    description: "Understand clean design, common patterns, APIs, caching and how to explain your design in interviews.",
    chapters: ["LLD", "Patterns", "APIs", "Scaling"],
    certificate: true
  },
  {
    title: "C++ Programming Basics",
    slug: "cpp-programming-basics",
    category: "Programming",
    level: "Beginner",
    lessons: 39,
    progress: 74,
    color: "from-blue-400 to-indigo-600",
    description: "Start coding with variables, loops, functions, pointers, OOP and simple practice problems.",
    chapters: ["Syntax", "Loops", "Functions", "OOP"],
    certificate: true
  },
  {
    title: "Java Programming Basics",
    slug: "java-programming-basics",
    category: "Programming",
    level: "Beginner",
    lessons: 32,
    progress: 52,
    color: "from-red-400 to-amber-500",
    description: "Learn Java in a simple way with classes, objects, collections and interview-friendly exercises.",
    chapters: ["Core Java", "OOP", "Collections", "Practice"],
    certificate: true
  },
  {
    title: "HTML",
    slug: "html-foundations",
    bookSlug: "html-foundations",
    category: "Web",
    level: "Beginner",
    lessons: 37,
    progress: 88,
    color: "from-orange-400 to-coral",
    description:
      "Complete HTML and Web Development Foundations Handbook1 covers internet basics, document anatomy, semantic HTML, forms, media, accessibility and SEO-friendly page structure.",
    chapters: ["Internet basics", "Document anatomy", "Semantic HTML", "Forms & accessibility"],
    certificate: true
  },
  {
    title: "CSS",
    slug: "css-design-systems",
    bookSlug: "css-design-systems",
    category: "Web",
    level: "Beginner",
    lessons: 44,
    progress: 71,
    color: "from-sky-400 to-brand-600",
    description: "Responsive layout, Grid, Flexbox, tokens, animations and modern component styling.",
    chapters: ["Selectors", "Layout", "Responsive UI", "Motion"],
    certificate: true
  },
  {
    title: "JavaScript",
    slug: "javascript-mastery",
    bookSlug: "javascript-mastery",
    category: "Programming",
    level: "Intermediate",
    lessons: 58,
    progress: 56,
    color: "from-amber-300 to-yellow-500",
    description: "DOM, async programming, APIs, testing, modules and interview-grade problem solving.",
    chapters: ["Core JS", "DOM", "Async", "Patterns"],
    certificate: true
  },
  {
    title: "React Product Engineering",
    slug: "react-product-engineering",
    category: "Web",
    level: "Advanced",
    lessons: 52,
    progress: 43,
    color: "from-cyan-300 to-blue-600",
    description: "Hooks, server rendering, state, forms, performance and production app architecture.",
    chapters: ["Components", "Hooks", "Routing", "Optimization"],
    certificate: true
  },
  {
    title: "Node.js API Studio",
    slug: "node-api-studio",
    category: "Backend",
    level: "Intermediate",
    lessons: 39,
    progress: 32,
    color: "from-emerald-300 to-leaf",
    description: "Express APIs, JWT auth, validation, databases, logging and deployment workflows.",
    chapters: ["Express", "Auth", "MongoDB", "Deployment"],
    certificate: true
  },
  {
    title: "Python for Data Analysis",
    slug: "python-data-analysis",
    category: "Data",
    level: "Beginner",
    lessons: 47,
    progress: 64,
    color: "from-indigo-400 to-fuchsia-500",
    description: "Python, NumPy, Pandas, notebooks, data cleaning and dashboard-ready analysis.",
    chapters: ["Python", "NumPy", "Pandas", "Visualization"],
    certificate: true
  },
  {
    title: "SQL Practice Lab",
    slug: "sql-practice-lab",
    category: "Data",
    level: "Intermediate",
    lessons: 31,
    progress: 49,
    color: "from-teal-300 to-emerald-600",
    description: "Queries, joins, windows, CTEs, analytics questions and interview SQL drills.",
    chapters: ["Selects", "Joins", "Windows", "Analytics"],
    certificate: true
  },
  {
    title: "CS Core Interview Kit",
    slug: "cs-core-interview-kit",
    category: "Interview",
    level: "Intermediate",
    lessons: 46,
    progress: 35,
    color: "from-violet-400 to-rose-500",
    description: "Prepare the core topics: operating systems, DBMS, OOP, networking and common placement questions.",
    chapters: ["OS", "DBMS", "OOP", "Networks"],
    certificate: true
  },
  {
    title: "Machine Learning Launchpad",
    slug: "machine-learning-launchpad",
    category: "AI/ML",
    level: "Advanced",
    lessons: 54,
    progress: 28,
    color: "from-violet-400 to-rose-500",
    description: "Regression, classification, evaluation, feature engineering and model demos.",
    chapters: ["Roadmap", "Models", "Evaluation", "Projects"],
    certificate: true
  },
  {
    title: "Deep Learning Visualized",
    slug: "deep-learning-visualized",
    category: "AI/ML",
    level: "Advanced",
    lessons: 42,
    progress: 19,
    color: "from-slate-500 to-cyan-500",
    description: "Neural networks, backpropagation, CNNs, transformers and animated experiments.",
    chapters: ["Neurons", "Training", "CNNs", "Transformers"],
    certificate: true
  }
];

export const navItems = [
  { label: "Home", href: "/", icon: PanelTop },
  { label: "Courses", href: "/courses", icon: GraduationCap },
  { label: "Tutorials", href: "/tutorials", icon: NotebookTabs },
  { label: "Playground", href: "/playground", icon: MonitorPlay },
  { label: "Dashboard", href: "/dashboard", icon: LineChart },
  { label: "Practice", href: "/practice", icon: Trophy },
  { label: "Projects", href: "/projects", icon: Rocket },
  { label: "Community", href: "/community", icon: Users },
  { label: "Certificates", href: "/certifications", icon: BadgeCheck },
  { label: "Blog", href: "/blog", icon: FileQuestion },
  { label: "Admin", href: "/admin", icon: ShieldCheck }
];

export const stats = [
  { label: "Active learners", value: "128K", icon: Users },
  { label: "Lessons completed", value: "3.4M", icon: BadgeCheck },
  { label: "Daily code runs", value: "92K", icon: Code2 },
  { label: "Career wins", value: "18K", icon: Trophy }
];

export const progressData = [
  { name: "Mon", lessons: 3, xp: 220 },
  { name: "Tue", lessons: 5, xp: 380 },
  { name: "Wed", lessons: 2, xp: 160 },
  { name: "Thu", lessons: 7, xp: 530 },
  { name: "Fri", lessons: 4, xp: 340 },
  { name: "Sat", lessons: 8, xp: 620 },
  { name: "Sun", lessons: 6, xp: 470 }
];

export const skillData = [
  { subject: "HTML", score: 92 },
  { subject: "CSS", score: 84 },
  { subject: "JS", score: 76 },
  { subject: "React", score: 68 },
  { subject: "Python", score: 73 },
  { subject: "SQL", score: 81 }
];

export const challenges = [
  { title: "Solve two-pointer array questions", type: "DSA", points: 140, difficulty: "Easy" },
  { title: "Explain normalization with examples", type: "DBMS", points: 120, difficulty: "Easy" },
  { title: "Design a parking lot class model", type: "LLD", points: 220, difficulty: "Medium" },
  { title: "Build a responsive pricing section", type: "Frontend", points: 120, difficulty: "Easy" },
  { title: "Write SQL for top customers by cohort", type: "SQL", points: 180, difficulty: "Medium" },
  { title: "Classify churn with logistic regression", type: "ML", points: 260, difficulty: "Hard" },
  { title: "Flatten nested API response", type: "JavaScript", points: 150, difficulty: "Medium" }
];

export const projects = [
  "DSA tracker with solved question notes",
  "Low-level design case study board",
  "Portfolio CMS with markdown editor",
  "E-commerce analytics dashboard",
  "AI resume matcher",
  "Full-stack task manager with JWT",
  "Customer churn prediction app",
  "SQL sales intelligence workspace"
];

export const testimonials = [
  {
    name: "Anika Sharma",
    role: "Frontend Developer",
    text: "The lessons were simple and the practice tasks helped me build real pages."
  },
  {
    name: "Marcus Lee",
    role: "Data Analyst",
    text: "The SQL and data lessons made interview questions feel much easier."
  },
  {
    name: "Riya Patel",
    role: "ML Intern",
    text: "The AI examples are clear, visual and easy to repeat on my own."
  }
];

export const adminMetrics = [
  { label: "Course revenue", value: "$84.2K", change: "+18%" },
  { label: "Quiz pass rate", value: "78%", change: "+6%" },
  { label: "New users", value: "9,420", change: "+22%" },
  { label: "Certificates issued", value: "1,284", change: "+14%" }
];

export const roadmap = [
  "Python and math refresh",
  "Data cleaning and feature engineering",
  "Regression and classification",
  "Neural network intuition",
  "Model deployment and monitoring"
];

export const badges = [
  { label: "21 day streak", icon: Flame },
  { label: "React finisher", icon: BadgeCheck },
  { label: "SQL top 5%", icon: Trophy },
  { label: "AI builder", icon: Bot },
  { label: "Network mentor", icon: Network }
];

export const supportFeatures = [
  {
    title: "Clear roadmaps",
    text: "Know what to learn first, what to skip for now, and what to practice next.",
    icon: Rocket
  },
  {
    title: "Doubt help",
    text: "Ask questions, raise issues and get unstuck while learning.",
    icon: Bot
  },
  {
    title: "Practice sheets",
    text: "Topic-wise sheets for DSA, DBMS, OS, OOP, SQL and frontend.",
    icon: NotebookTabs
  },
  {
    title: "Certificates",
    text: "Finish lessons, pass quizzes and download proof of completion.",
    icon: BadgeCheck
  }
];

export const learningSheets = [
  "DSA placement sheet",
  "DBMS interview sheet",
  "Operating system notes",
  "OOP quick revision",
  "SQL query practice",
  "Frontend project checklist",
  "Python backend roadmap"
];

export const mentors = [
  {
    name: "Aarav Mehta",
    role: "Senior Software Engineer",
    text: "Explains DSA, system design and interview thinking with simple examples."
  },
  {
    name: "Naina Kapoor",
    role: "Data and AI Mentor",
    text: "Teaches Python, SQL, dashboards and ML projects in small steps."
  }
];

export const tutorialTracks = [
  {
    title: "Data Structures and Algorithms",
    slug: "dsa-complete-path",
    level: "Start here",
    text: "Learn arrays, strings, recursion, trees, graphs and DP with simple examples.",
    topics: ["Arrays", "Strings", "Recursion", "Trees", "Graphs", "DP"],
    icon: Trophy
  },
  {
    title: "Web Development",
    slug: "html-foundations",
    level: "Beginner friendly",
    text: "Build websites with HTML, CSS, JavaScript, React, Node.js and APIs.",
    topics: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Projects"],
    icon: Code2
  },
  {
    title: "Programming Languages",
    slug: "cpp-programming-basics",
    level: "Basics first",
    text: "Understand C++, Java, Python and JavaScript syntax without confusion.",
    topics: ["C++", "Java", "Python", "JavaScript", "OOP", "Functions"],
    icon: GraduationCap
  },
  {
    title: "Core CS Subjects",
    slug: "cs-core-interview-kit",
    level: "Interview prep",
    text: "Revise DBMS, OS, OOP and computer networks in clear short notes.",
    topics: ["DBMS", "OS", "OOP", "CN", "SQL", "Mock tests"],
    icon: Database
  },
  {
    title: "Data Science",
    slug: "python-data-analysis",
    level: "Practice based",
    text: "Use Python, Pandas, NumPy, charts and SQL to study real data.",
    topics: ["Python", "Pandas", "NumPy", "Matplotlib", "Power BI", "SQL"],
    icon: BarChart3
  },
  {
    title: "Python Backend Development",
    slug: "python-backend-development",
    level: "Book course",
    text: "Read your backend book as a guided course with Python, FastAPI, databases, security, testing and deployment.",
    topics: ["Python", "FastAPI", "APIs", "PostgreSQL", "Auth", "Docker"],
    icon: Database
  },
  {
    title: "AI and Machine Learning",
    slug: "machine-learning-launchpad",
    level: "Visual learning",
    text: "Learn models, training, evaluation and AI projects with easy visuals.",
    topics: ["AI roadmap", "ML", "Deep learning", "Models", "Datasets", "Projects"],
    icon: BrainCircuit
  }
];

export const tutorialArticles = [
  {
    title: "What backend development means",
    track: "Python Backend",
    readTime: "8 min",
    text: "Learn what the backend does: APIs, business logic, data storage, security and request handling."
  },
  {
    title: "FastAPI basics",
    track: "Python Backend",
    readTime: "9 min",
    text: "Create API routes, validate data and return JSON responses with Python."
  },
  {
    title: "Docker for backend apps",
    track: "Python Backend",
    readTime: "10 min",
    text: "Package your backend with its dependencies so it runs the same way everywhere."
  },
  {
    title: "Write your first Java program",
    track: "Java",
    readTime: "5 min",
    text: "Print Hello World, understand the main method, and learn where code starts."
  },
  {
    title: "Java comments in simple words",
    track: "Java",
    readTime: "4 min",
    text: "Use comments to explain code and turn off lines while testing."
  },
  {
    title: "JavaScript loops",
    track: "JavaScript",
    readTime: "7 min",
    text: "Repeat work with for, while and for-of loops using small examples."
  },
  {
    title: "Arrays in JavaScript",
    track: "JavaScript",
    readTime: "8 min",
    text: "Store many values, read items, add items and loop through arrays."
  },
  {
    title: "CSS syntax and selectors",
    track: "CSS",
    readTime: "6 min",
    text: "Learn how CSS rules are written and how to select page elements."
  },
  {
    title: "DBMS normalization basics",
    track: "DBMS",
    readTime: "9 min",
    text: "Organize tables so data stays clean and repeated data is reduced."
  },
  {
    title: "Operating system processes",
    track: "OS",
    readTime: "8 min",
    text: "Understand programs, processes, threads and why scheduling matters."
  },
  {
    title: "SQL joins made easy",
    track: "SQL",
    readTime: "7 min",
    text: "Combine tables with inner, left and right joins using simple data."
  },
  {
    title: "React hooks overview",
    track: "React",
    readTime: "6 min",
    text: "Use state and effects to make components interactive."
  }
];

export const mockTests = [
  {
    title: "DBMS Mock Test",
    text: "Practice normalization, keys, ER diagrams, transactions and SQL.",
    questions: 40
  },
  {
    title: "Operating System Mock Test",
    text: "Check your basics in processes, memory, scheduling and deadlocks.",
    questions: 35
  },
  {
    title: "OOP Mock Test",
    text: "Revise classes, objects, inheritance, polymorphism and abstraction.",
    questions: 30
  },
  {
    title: "JavaScript Mock Test",
    text: "Test loops, arrays, functions, DOM, promises and basic debugging.",
    questions: 45
  }
];

const defaultTutorialContent = {
  overview:
    "Start with the idea, read the short explanation, study the example, then try the practice task before moving ahead.",
  sections: [
    {
      heading: "What you will learn",
      body: "You will understand the main concept in simple words and learn where it is used in real projects."
    },
    {
      heading: "Simple example",
      body: "Look at the example carefully. Focus on the input, the output and the small steps in between."
    },
    {
      heading: "Common mistake",
      body: "Do not memorize only the final answer. Try to explain why each step is needed."
    }
  ],
  example: "Read the lesson, change the code in the playground, and run it to see the result.",
  practice: ["Write the concept in your own words.", "Solve two easy questions from this topic.", "Save one note for revision."],
  quiz: [
    {
      question: "What should you do after reading a new concept?",
      answer: "Try a small example and practice it yourself."
    }
  ]
};

export const tutorialContent: Record<
  string,
  {
    overview: string;
    sections: { heading: string; body: string }[];
    example: string;
    practice: string[];
    quiz: { question: string; answer: string }[];
    outline?: { part: string; chapters: string[] }[];
  }
> = {
  "dsa-complete-path": {
    overview:
      "DSA helps you solve coding problems in a planned way. You learn how to store data, search faster, reduce repeated work and choose the right approach.",
    sections: [
      {
        heading: "Arrays and strings",
        body: "Arrays store many values in order. Strings are text values that can be checked, reversed, counted or split into smaller parts."
      },
      {
        heading: "Recursion",
        body: "Recursion means a function calls itself to solve a smaller version of the same problem. Always define the stopping condition first."
      },
      {
        heading: "Trees and graphs",
        body: "Trees help represent hierarchy. Graphs help represent connections like roads, networks, friendships and dependencies."
      },
      {
        heading: "Dynamic programming",
        body: "Dynamic programming stores answers to smaller problems so the program does not calculate the same thing again and again."
      }
    ],
    example: "Example: To find the largest number in an array, keep one variable called largest and update it while scanning each item.",
    practice: ["Find the smallest number in an array.", "Reverse a string.", "Solve one recursion problem like factorial.", "Draw a tree traversal by hand."],
    quiz: [
      { question: "Why do we use arrays?", answer: "To store multiple values in one ordered collection." },
      { question: "What must every recursion problem have?", answer: "A base case that stops the function." }
    ]
  },
  "system-design-basics": {
    overview:
      "System design teaches you how to plan an application before building it. You think about users, APIs, data, speed, security and scaling.",
    sections: [
      {
        heading: "Understand the requirement",
        body: "First ask what the system should do. A chat app, food app and learning app all need different features and data."
      },
      {
        heading: "Design the API",
        body: "APIs are the doors through which frontend and backend talk. Keep names simple, like GET courses or POST login."
      },
      {
        heading: "Store the data",
        body: "Choose tables or collections based on the data. Users, courses, lessons, quizzes and progress usually need separate storage."
      },
      {
        heading: "Scale slowly",
        body: "Start with a simple design. Add caching, queues and load balancing only when the app really needs them."
      }
    ],
    example: "Example: A course platform needs user login, course list, lesson content, progress tracking and certificate generation.",
    practice: ["Design a URL shortener.", "List APIs for a notes app.", "Draw the database tables for a quiz app."],
    quiz: [
      { question: "What should you clarify first in system design?", answer: "The requirements and main users." },
      { question: "Why do we use caching?", answer: "To make frequently used data load faster." }
    ]
  },
  "cpp-programming-basics": {
    overview:
      "C++ is a fast programming language often used for DSA. Start with syntax, variables, conditions, loops and functions.",
    sections: [
      {
        heading: "Variables",
        body: "Variables store values. Use int for whole numbers, double for decimals, char for one character and string for text."
      },
      {
        heading: "Conditions",
        body: "Use if, else if and else when your program needs to make decisions."
      },
      {
        heading: "Loops",
        body: "Loops repeat work. Use for loops when you know the count and while loops when the count depends on a condition."
      },
      {
        heading: "Functions",
        body: "Functions keep code organized. A function should do one clear job and return a useful result when needed."
      }
    ],
    example: "Example: int total = a + b; stores the sum of two numbers in total.",
    practice: ["Print numbers from 1 to 10.", "Check if a number is even.", "Write a function that returns the larger of two numbers."],
    quiz: [
      { question: "Which type stores whole numbers in C++?", answer: "int." },
      { question: "Why do we use functions?", answer: "To reuse code and keep programs organized." }
    ]
  },
  "java-programming-basics": {
    overview:
      "Java is used for apps, backend systems and interviews. Learn classes, objects, methods, arrays and collections step by step.",
    sections: [
      {
        heading: "Class and object",
        body: "A class is a blueprint. An object is a real item made from that blueprint."
      },
      {
        heading: "Methods",
        body: "Methods are actions inside a class. They help keep logic grouped and reusable."
      },
      {
        heading: "Collections",
        body: "Collections like ArrayList and HashMap help store and manage groups of values."
      },
      {
        heading: "Exception handling",
        body: "Exceptions are errors that happen while the program runs. Use try and catch to handle them cleanly."
      }
    ],
    example: "Example: A Student class can have name, roll number and a method called printDetails.",
    practice: ["Create a Student class.", "Store five names in an ArrayList.", "Use a HashMap to store subject marks."],
    quiz: [
      { question: "What is an object?", answer: "A real instance created from a class." },
      { question: "What does ArrayList store?", answer: "A list of values that can grow or shrink." }
    ]
  },
  "html-foundations": {
    overview:
      "HTML gives structure to a webpage. It tells the browser what each part means: heading, paragraph, image, form, button or section.",
    sections: [
      {
        heading: "Page structure",
        body: "A good page has clear headings, sections, navigation and meaningful content. This helps users and search engines."
      },
      {
        heading: "Text and media",
        body: "Use headings for titles, paragraphs for text, lists for grouped points, images for visuals and links for navigation."
      },
      {
        heading: "Forms",
        body: "Forms collect user input. Use labels so users know what each input field is for."
      },
      {
        heading: "Accessibility",
        body: "Write HTML that screen readers can understand. Use alt text for images and buttons with clear names."
      }
    ],
    example: "<section><h1>Course title</h1><p>Short lesson intro.</p></section>",
    practice: ["Create a profile page.", "Add a contact form with labels.", "Use semantic tags like header, main and footer."],
    quiz: [
      { question: "What is HTML used for?", answer: "To structure content on a webpage." },
      { question: "Why should inputs have labels?", answer: "So users understand what information to enter." }
    ]
  },
  "css-design-systems": {
    overview:
      "CSS controls how a website looks. It handles colors, spacing, layout, typography, responsiveness and animation.",
    sections: [
      {
        heading: "Selectors",
        body: "Selectors choose which HTML elements to style. You can select by element, class, id or state."
      },
      {
        heading: "Box model",
        body: "Every element has content, padding, border and margin. Understanding this makes layout easier."
      },
      {
        heading: "Flexbox and grid",
        body: "Flexbox is great for one-direction layouts. Grid is great for rows and columns."
      },
      {
        heading: "Responsive design",
        body: "Responsive design makes the page look good on mobile, tablet and desktop screens."
      }
    ],
    example: ".card { padding: 16px; border-radius: 12px; display: grid; gap: 12px; }",
    practice: ["Style a button.", "Create a two-column layout.", "Make a card stack on mobile."],
    quiz: [
      { question: "What does CSS control?", answer: "The visual style and layout of a webpage." },
      { question: "When is CSS grid useful?", answer: "When you need rows and columns." }
    ]
  },
  "javascript-mastery": {
    overview:
      "JavaScript makes websites interactive. You can react to clicks, update content, call APIs and handle data.",
    sections: [
      {
        heading: "Variables and types",
        body: "Use variables to store values like numbers, strings, booleans, arrays and objects."
      },
      {
        heading: "Functions",
        body: "Functions group code into reusable actions. Give them clear names based on what they do."
      },
      {
        heading: "DOM",
        body: "The DOM is the page structure that JavaScript can read and change."
      },
      {
        heading: "Async code",
        body: "Async code is used when work takes time, like calling an API or loading data."
      }
    ],
    example: "button.addEventListener('click', () => { console.log('Clicked'); });",
    practice: ["Create a counter.", "Show and hide a menu.", "Fetch sample data from an API."],
    quiz: [
      { question: "What does JavaScript add to a webpage?", answer: "Interactivity and logic." },
      { question: "What is the DOM?", answer: "The page structure that JavaScript can change." }
    ]
  },
  "react-product-engineering": {
    overview:
      "React helps you build user interfaces with reusable components. Each component owns a small part of the screen.",
    sections: [
      {
        heading: "Components",
        body: "Components are reusable UI blocks. A button, navbar, course card or dashboard widget can be a component."
      },
      {
        heading: "Props",
        body: "Props pass data into a component. They make one component reusable with different content."
      },
      {
        heading: "State",
        body: "State stores values that can change, like form input, theme mode or selected tab."
      },
      {
        heading: "Effects",
        body: "Effects run code after rendering, such as reading local storage or loading data."
      }
    ],
    example: "function CourseCard({ title }) { return <h3>{title}</h3>; }",
    practice: ["Build a course card component.", "Create a theme toggle.", "Make a tabs component for lessons."],
    quiz: [
      { question: "What is a React component?", answer: "A reusable piece of UI." },
      { question: "What is state used for?", answer: "Data that changes while the app is running." }
    ]
  },
  "node-api-studio": {
    overview:
      "Node.js lets you run JavaScript on the server. With Express, you can create APIs for login, courses, quizzes and dashboards.",
    sections: [
      {
        heading: "Routes",
        body: "Routes define what happens when a user or frontend visits an API URL."
      },
      {
        heading: "Middleware",
        body: "Middleware runs before the final route. It can check auth, parse JSON or log requests."
      },
      {
        heading: "Authentication",
        body: "JWT auth sends a token after login. The token proves the user is signed in."
      },
      {
        heading: "Database connection",
        body: "The API can read and write data from MongoDB or PostgreSQL depending on your project."
      }
    ],
    example: "app.get('/api/courses', (req, res) => res.json({ data: courses }));",
    practice: ["Create a health route.", "Create a courses route.", "Add simple login validation."],
    quiz: [
      { question: "What is Express used for?", answer: "Creating server routes and APIs." },
      { question: "What does a JWT token prove?", answer: "That a user has logged in." }
    ]
  },
  "python-backend-development": {
    overview:
      "This course is based on your book Python Backend Development. It teaches backend engineering step by step, from Python basics to production APIs, databases, security, deployment, microservices and a real backend project.",
    sections: [
      {
        heading: "Python foundations",
        body:
          "Start with Python setup, variables, functions, data structures, object-oriented programming, error handling, logging, file handling and clean coding habits for backend work."
      },
      {
        heading: "Web and API fundamentals",
        body:
          "Learn how the internet works, how HTTP requests and responses move between client and server, and why APIs are the main connection between frontend apps and backend systems."
      },
      {
        heading: "FastAPI development",
        body:
          "Build Python APIs with FastAPI. Create routes, handle request data, validate input with Pydantic, return JSON responses and structure backend code clearly."
      },
      {
        heading: "Databases and data management",
        body:
          "Understand relational databases, PostgreSQL, SQL queries, schema design and ORM usage so your backend can store and read data safely."
      },
      {
        heading: "Security and authentication",
        body:
          "Learn login systems, authorization, password protection, tokens, secure API access and common backend security practices."
      },
      {
        heading: "Performance and reliability",
        body:
          "Study caching, background tasks, queues, async programming, testing, debugging, API documentation and performance optimization."
      },
      {
        heading: "Deployment and architecture",
        body:
          "Package apps with Docker, understand DevOps basics, deploy backend applications, design production-ready APIs, explore microservices and complete a real project."
      }
    ],
    outline: [
      {
        part: "Part I - Python Foundations",
        chapters: [
          "Chapter 1 - Introduction to Backend Development",
          "Chapter 2 - Python Environment Setup for Backend Development",
          "Chapter 3 - Python Fundamentals for Backend Development",
          "Chapter 4 - Advanced Python Essentials",
          "Chapter 5 - Object-Oriented Programming in Python",
          "Chapter 6 - Error Handling and Logging",
          "Chapter 7 - File Handling and Data Processing"
        ]
      },
      {
        part: "Part II - Web Fundamentals",
        chapters: [
          "Chapter 8 - Understanding the Internet and HTTP",
          "Chapter 9 - Introduction to Web Servers",
          "Chapter 10 - Introduction to APIs"
        ]
      },
      {
        part: "Part III - Backend Framework Development",
        chapters: [
          "Chapter 11 - FastAPI Framework Fundamentals",
          "Chapter 12 - Advanced FastAPI Development",
          "Chapter 13 - Data Validation with Pydantic"
        ]
      },
      {
        part: "Part IV - Databases and Data Management",
        chapters: [
          "Chapter 14 - Database Fundamentals",
          "Chapter 15 - Working with PostgreSQL and SQL",
          "Chapter 16 - Object Relational Mapping (ORM)"
        ]
      },
      {
        part: "Part V - Security and Authentication",
        chapters: ["Chapter 17 - Authentication and Authorization", "Chapter 18 - Security in Backend Applications"]
      },
      {
        part: "Part VI - Performance and Scalability",
        chapters: [
          "Chapter 19 - Caching for Performance",
          "Chapter 20 - Background Tasks and Queues",
          "Chapter 21 - Asynchronous Programming in Python"
        ]
      },
      {
        part: "Part VII - Testing and System Reliability",
        chapters: [
          "Chapter 22 - Testing Backend Applications",
          "Chapter 23 - Debugging and Performance Optimization",
          "Chapter 24 - API Documentation"
        ]
      },
      {
        part: "Part VIII - Deployment and DevOps",
        chapters: [
          "Chapter 25 - Containerization with Docker",
          "Chapter 26 - Deployment and DevOps Basics",
          "Chapter 27 - Deploying Backend Applications"
        ]
      },
      {
        part: "Part IX - Advanced Backend Architecture",
        chapters: [
          "Chapter 28 - Building Production-Ready APIs",
          "Chapter 29 - Microservices Architecture",
          "Chapter 30 - Real-World Backend Project"
        ]
      }
    ],
    example:
      "Example: A FastAPI backend receives a request, validates the input, runs business logic, talks to PostgreSQL, and returns a clean JSON response to the frontend.",
    practice: [
      "Create a FastAPI route called /health that returns { status: 'ok' }.",
      "Design tables for users, courses, lessons and progress.",
      "Explain the request-response cycle in your own words.",
      "Write three security rules for a login API.",
      "Plan a Docker deployment checklist for a backend app."
    ],
    quiz: [
      {
        question: "What is the main job of a backend?",
        answer: "It handles data, business logic, security and communication between the app and database."
      },
      {
        question: "Why is FastAPI useful for Python backend development?",
        answer: "It helps build APIs quickly with routing, validation, automatic docs and async support."
      },
      {
        question: "Why do backend apps use databases?",
        answer: "To store important data like users, courses, orders, progress and settings."
      },
      {
        question: "What does Docker help with?",
        answer: "It packages the app and dependencies so the backend runs consistently in different environments."
      }
    ]
  },
  "python-data-analysis": {
    overview:
      "Python is useful for data analysis because it is simple to read and has strong libraries like Pandas, NumPy and Matplotlib.",
    sections: [
      {
        heading: "Load data",
        body: "Start by loading data from CSV, Excel or a database. Always inspect the first few rows."
      },
      {
        heading: "Clean data",
        body: "Fix missing values, remove duplicates and convert columns into the right type."
      },
      {
        heading: "Analyze data",
        body: "Group, filter and summarize data to answer useful questions."
      },
      {
        heading: "Visualize data",
        body: "Charts make patterns easier to see. Use bar charts, line charts and scatter plots."
      }
    ],
    example: "df.groupby('course')['revenue'].sum() shows total revenue for each course.",
    practice: ["Load a CSV file.", "Find missing values.", "Create a bar chart for top categories."],
    quiz: [
      { question: "Why do analysts clean data?", answer: "To make results accurate and reliable." },
      { question: "What does Pandas help with?", answer: "Working with tables of data." }
    ]
  },
  "sql-practice-lab": {
    overview:
      "SQL is used to ask questions from tables. You can filter, sort, group, join and summarize data.",
    sections: [
      {
        heading: "SELECT",
        body: "SELECT chooses the columns you want to see from a table."
      },
      {
        heading: "WHERE",
        body: "WHERE filters rows based on a condition, like price greater than 500."
      },
      {
        heading: "JOIN",
        body: "JOIN combines data from two or more tables using a matching column."
      },
      {
        heading: "GROUP BY",
        body: "GROUP BY helps summarize rows, like total sales by month or users by country."
      }
    ],
    example: "SELECT course, COUNT(*) FROM enrollments GROUP BY course;",
    practice: ["Write a SELECT query.", "Filter active users.", "Join users with orders.", "Group sales by category."],
    quiz: [
      { question: "What does WHERE do?", answer: "It filters rows." },
      { question: "Why do we use JOIN?", answer: "To combine related tables." }
    ]
  },
  "cs-core-interview-kit": {
    overview:
      "CS core topics help in interviews and exams. Focus on DBMS, operating systems, OOP and computer networks.",
    sections: [
      {
        heading: "DBMS",
        body: "DBMS teaches how data is stored, related, protected and queried."
      },
      {
        heading: "Operating systems",
        body: "OS topics include processes, threads, memory, scheduling and deadlocks."
      },
      {
        heading: "OOP",
        body: "OOP uses classes and objects to organize code. Learn inheritance, polymorphism, abstraction and encapsulation."
      },
      {
        heading: "Computer networks",
        body: "Networks explain how data moves between devices using protocols like HTTP, TCP and IP."
      }
    ],
    example: "Example: In OOP, a Vehicle class can be inherited by Car and Bike classes.",
    practice: ["Explain normalization.", "Compare process and thread.", "Define polymorphism.", "Explain HTTP request and response."],
    quiz: [
      { question: "What does DBMS manage?", answer: "Stored data and database operations." },
      { question: "What is encapsulation?", answer: "Keeping data and methods together with controlled access." }
    ]
  },
  "machine-learning-launchpad": {
    overview:
      "Machine learning helps computers learn patterns from data. You train a model, test it and use it for predictions.",
    sections: [
      {
        heading: "Dataset",
        body: "A dataset contains examples. Each row is usually one example and each column is a feature."
      },
      {
        heading: "Training",
        body: "Training means the model studies data and learns patterns from it."
      },
      {
        heading: "Evaluation",
        body: "Evaluation checks how well the model works on data it has not seen before."
      },
      {
        heading: "Prediction",
        body: "After training, the model can predict values or classes for new data."
      }
    ],
    example: "Example: A model can learn past customer data and predict whether a customer may leave.",
    practice: ["List features for a student score model.", "Split data into train and test sets.", "Compare accuracy and precision."],
    quiz: [
      { question: "What is training?", answer: "The process where a model learns patterns from data." },
      { question: "Why do we test a model?", answer: "To check performance on new data." }
    ]
  },
  "deep-learning-visualized": {
    overview:
      "Deep learning uses neural networks with many layers. It is useful for images, text, speech and complex patterns.",
    sections: [
      {
        heading: "Neurons",
        body: "A neuron takes inputs, applies weights and produces an output."
      },
      {
        heading: "Layers",
        body: "Layers pass information forward. Earlier layers learn simple patterns and later layers learn deeper patterns."
      },
      {
        heading: "Backpropagation",
        body: "Backpropagation helps the network adjust weights when the prediction is wrong."
      },
      {
        heading: "Applications",
        body: "Deep learning is used in image recognition, chatbots, translation and recommendation systems."
      }
    ],
    example: "Example: An image model may learn edges first, then shapes, then full objects.",
    practice: ["Draw a three-layer neural network.", "Explain weights in one sentence.", "List two deep learning use cases."],
    quiz: [
      { question: "What is a neuron?", answer: "A small unit that receives inputs and produces an output." },
      { question: "What does backpropagation do?", answer: "It adjusts weights to reduce errors." }
    ]
  }
};

export function getTutorialContent(slug: string) {
  return tutorialContent[slug] ?? defaultTutorialContent;
}
