import PlaygroundClient from "@/components/playground-ide/PlaygroundClient";

export default async function PlaygroundProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <PlaygroundClient projectId={id} />
    </main>
  );
}
