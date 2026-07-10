import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, NotebookText } from "lucide-react";
import { verifyAuthToken } from "@/lib/auth";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Tutorials", href: "/admin/tutorials", icon: NotebookText },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Books", href: "/admin/books", icon: BookOpen },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("codeverse-token")?.value ?? "";
  const user = token ? verifyAuthToken(token) : null;

  if (!user || user.role !== "admin") {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:block">
        <nav className="space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
