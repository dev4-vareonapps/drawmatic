'use client';

import { use } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DiagramEditor } from '@/features/diagrams/components/diagram-editor';
import { useDiagram } from '@/hooks/use-diagrams';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function EditDiagramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { diagram, loading } = useDiagram(id);

  async function handleDuplicate() {
    const res = await fetch(`/api/diagrams/${id}/duplicate`, { method: 'POST' });
    const copy = await res.json();
    router.push(`/dashboard/diagrams/${copy._id}`);
  }

  async function handleArchive() {
    await fetch(`/api/diagrams/${id}/archive`, { method: 'POST' });
    router.push('/dashboard/diagrams');
  }

  async function handleDelete() {
    if (!confirm('Delete this diagram?')) return;
    await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
    router.push('/dashboard/diagrams');
  }

  if (loading) {
    return (
      <DashboardShell title="Edit Diagram">
        <p className="text-muted-foreground">Loading...</p>
      </DashboardShell>
    );
  }

  const d = diagram as {
    name?: string;
    description?: string;
    textContent?: string;
    xmlContent?: string;
    editorMode?: 'visual' | 'text' | 'mermaid';
  };

  return (
    <DashboardShell title={d?.name ?? 'Edit Diagram'}>
      <div className="mb-4 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleDuplicate}>
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={handleArchive}>
          Archive
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          Delete
        </Button>
      </div>
      <DiagramEditor
        diagramId={id}
        initial={{
          name: d?.name,
          description: d?.description,
          textContent: d?.textContent,
          xmlContent: d?.xmlContent,
          editorMode: d?.editorMode,
        }}
      />
    </DashboardShell>
  );
}
