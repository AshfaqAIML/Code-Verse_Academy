import PlaygroundClient from "@/components/playground-ide/PlaygroundClient";

export const metadata = {
  title: "Code Playground | CodeVerse Academy",
  description: "Write HTML, CSS, and JS with live preview."
};

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PlaygroundClient />
    </main>
  );
}
