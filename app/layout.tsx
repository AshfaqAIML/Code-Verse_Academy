import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/components/playground-ide/playground.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "CodeVerse Academy | Modern Web, Data Science and AI Learning",
  description:
    "A premium educational platform for web development, data science, AI/ML, programming, interview preparation, projects and practice.",
  keywords: [
    "web development",
    "data science",
    "AI",
    "machine learning",
    "coding playground",
    "interactive tutorials"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
