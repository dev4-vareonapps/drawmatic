'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { FoldersPanel } from './folders-panel';
import { ArrowLeft, Plus } from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
  canCreateFolder: boolean;
  canEditFolder: boolean;
  canDeleteFolder: boolean;
  canCreateDiagram: boolean;
}

interface DiagramRecord {
  _id: string;
  name: string;
  description?: string;
  archived: boolean;
  updatedAt: string;
}

interface ProjectInfo {
  name: string;
  description?: string;
  slug: string;
}

export function ProjectDetailView({
  projectId,
  canCreateFolder,
  canEditFolder,
  canDeleteFolder,
  canCreateDiagram,
}: ProjectDetailViewProps) {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [diagrams, setDiagrams] = useState<DiagramRecord[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderRefresh, setFolderRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject({ name: data.name, description: data.description, slug: data.slug });
      }
    } catch {
      /* project meta optional */
    }
  }, [projectId]);

  const loadDiagrams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ projectId });
      if (selectedFolderId) params.set('folderId', selectedFolderId);
      const res = await fetch(`/api/diagrams?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load diagrams');
        setDiagrams([]);
        return;
      }
      setDiagrams(data as DiagramRecord[]);
    } catch {
      setError('Failed to load diagrams');
      setDiagrams([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedFolderId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams, folderRefresh]);

  const newDiagramHref = selectedFolderId
    ? `/dashboard/diagrams/new?projectId=${projectId}&folderId=${selectedFolderId}`
    : `/dashboard/diagrams/new?projectId=${projectId}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Projects
          </Link>
        </Button>
      </div>

      {project && (
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          {project.description && (
            <p className="mt-1 text-muted-foreground">{project.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">/{project.slug}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <FoldersPanel
          projectId={projectId}
          canCreate={canCreateFolder}
          canEdit={canEditFolder}
          canDelete={canDeleteFolder}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          refreshTrigger={folderRefresh}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">
              {selectedFolderId ? 'Diagrams in folder' : 'Project diagrams'}
            </CardTitle>
            {canCreateDiagram && (
              <Button size="sm" asChild>
                <Link href={newDiagramHref}>
                  <Plus className="mr-1 h-4 w-4" />
                  New diagram
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading diagrams...</p>
            ) : diagrams.length === 0 ? (
              <EmptyState
                title="No diagrams here"
                description={
                  selectedFolderId
                    ? 'Create a diagram in this folder.'
                    : 'Create a diagram in this project or select a folder.'
                }
                action={
                  canCreateDiagram ? (
                    <Button asChild size="sm">
                      <Link href={newDiagramHref}>Create diagram</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y">
                {diagrams.map((d) => (
                  <li key={d._id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/dashboard/diagrams/${d._id}`}
                        className="font-medium hover:underline"
                      >
                        {d.name}
                      </Link>
                      {d.description && (
                        <p className="text-sm text-muted-foreground">{d.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {d.archived && <Badge variant="secondary">Archived</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
