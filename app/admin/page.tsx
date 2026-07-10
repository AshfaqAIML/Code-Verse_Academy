import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BadgeCheck, BookPlus, Download, FileCheck2, LockKeyhole, PieChart, QrCode, ShieldCheck, Users } from "lucide-react";
import { LearningChart } from "@/components/charts";
import { Section } from "@/components/section";
import { adminMetrics, courses } from "@/lib/data";
import { certificateTemplates } from "@/lib/certificates";
import { verifyAuthToken } from "@/lib/auth";

const adminPrivileges = [
  {
    title: "Publish and edit course content",
    description: "Update course cards, lesson outlines, chapter content, and book-backed tutorials.",
    href: "/admin/tutorials",
    label: "Course editor"
  },
  {
    title: "Manage blog articles",
    description: "Create, edit and publish blog posts with full content block editor.",
    href: "/admin/blogs",
    label: "Blog editor"
  },
  {
    title: "Manage books",
    description: "Import and manage full-length book content from JSON sources.",
    href: "/admin/books",
    label: "Books"
  },
  {
    title: "Manage users and access",
    description: "Review accounts, separate admin from student access, and control who can see protected tools.",
    href: "/profile",
    label: "User access"
  },
  {
    title: "Issue certificates",
    description: "Create, review, and verify course certificates from the admin certificate studio.",
    href: "/certifications",
    label: "Certificates"
  },
  {
    title: "Moderate practice and revision tools",
    description: "Keep practice submissions, revision history, and AI-generated study material under control.",
    href: "/practice",
    label: "Practice"
  }
];

const adminActions = [
  ["Upload lesson", BookPlus],
  ["Manage users", Users],
  ["Practice sheet management", FileCheck2],
  ["Certificate management", BadgeCheck],
  ["Template management", ShieldCheck],
  ["Verification records", QrCode],
  ["Download logs", Download]
] as const;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("codeverse-token")?.value ?? "";
  const user = token ? verifyAuthToken(token) : null;

  if (!user || user.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return (
    <Section
      eyebrow="Admin panel"
      title="Admin privileges and controls"
      copy="This profile can modify course content, manage users, issue certificates, review verification records, and oversee protected learning tools."
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Signed in as admin</p>
            <h2 className="mt-2 text-2xl font-black">{user.email}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Full access is enabled for this account across guarded admin surfaces.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <LockKeyhole className="size-4" />
            Admin access enabled
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black">Privileges</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">These are the admin-only capabilities currently exposed by the system.</p>
          <div className="mt-5 grid gap-4">
            {adminPrivileges.map((privilege) => (
              <Link
                key={privilege.title}
                href={privilege.href}
                className="group rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-cyan-50/60 dark:border-slate-800 dark:hover:border-brand-900 dark:hover:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-black">{privilege.title}</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{privilege.description}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {privilege.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black">Protected actions</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">These controls are restricted to authenticated users, with the highest-risk tools reserved for admins.</p>
          <div className="mt-5 grid gap-3">
            {adminActions.map(([label, Icon]) => (
              <button
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left font-black transition hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <Icon className="size-5 text-brand-600" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {[
          ...adminMetrics,
          { label: "Certificates issued", value: "1,284", change: "+14%" },
          { label: "Certificate downloads", value: "3,916", change: "+31%" },
          { label: "Verification scans", value: "842", change: "+19%" },
          { label: "Active templates", value: String(certificateTemplates.length), change: "Live" }
        ].slice(0, 8).map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-black">{metric.value}</p>
            <p className="mt-1 text-sm font-black text-leaf">{metric.change}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">Enrollment analytics</h3>
            <PieChart className="size-5 text-brand-600" />
          </div>
          <LearningChart />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xl font-black">Operations</h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Upload lesson", BookPlus],
              ["Manage users", Users],
              ["Practice sheet management", FileCheck2],
              ["Certificate management", BadgeCheck],
              ["Template management", ShieldCheck],
              ["Verification records", QrCode],
              ["Download logs", Download]
            ].map(([label, Icon]) => (
              <button key={label as string} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-left font-black transition hover:bg-cyan-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                <Icon className="size-5 text-brand-600" /> {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 text-xl font-black">Course inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3">Course</th>
                <th>Category</th>
                <th>Lessons</th>
                <th>Progress Avg.</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {courses.slice(0, 6).map((course) => (
                <tr key={course.slug}>
                  <td className="py-3 font-black">{course.title}</td>
                  <td>{course.category}</td>
                  <td>{course.lessons}</td>
                  <td>{course.progress}%</td>
                  <td><span className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">Published</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
