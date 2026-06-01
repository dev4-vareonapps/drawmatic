'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DiagramEditor } from '@/features/diagrams/components/diagram-editor';

function NewDiagramContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') ?? undefined;
  const folderId = searchParams.get('folderId') ?? undefined;

  return (
    <DiagramEditor
      initial={{ projectId, folderId }}
      onCreated={(id) => {
        if (projectId) {
          router.push(`/dashboard/projects/${projectId}`);
        } else {
          router.push(`/dashboard/diagrams/${id}`);
        }
      }}
    />
  );
}

export default function NewDiagramPage() {
  return (
    <DashboardShell title="New Diagram">
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <NewDiagramContent />
      </Suspense>
    </DashboardShell>
  );
}
