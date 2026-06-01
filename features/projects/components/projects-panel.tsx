'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  slug: string;
  diagramCount: number;
  updatedAt: string;
}

interface ProjectsPanelProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function ProjectsPanel({ canCreate, canEdit, canDelete }: ProjectsPanelProps) {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load projects');
        setProjects([]);
        return;
      }
      setProjects(
        (data as ProjectRecord[]).map((p) => ({
          ...p,
          id: p.id ?? (p as { _id?: string })._id ?? '',
          updatedAt: p.updatedAt,
        })),
      );
    } catch {
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, description: createDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create project');
        return;
      }
      setCreateName('');
      setCreateDesc('');
      setShowCreate(false);
      await loadProjects();
    } catch {
      setError('Failed to create project');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(project: ProjectRecord) {
    setEditingId(project.id);
    setEditName(project.name);
    setEditDesc(project.description);
  }

  async function handleUpdate(projectId: string) {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, description: editDesc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update project');
        return;
      }
      setEditingId(null);
      await loadProjects();
    } catch {
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(projectId: string, name: string) {
    if (!canDelete) return;
    if (!confirm(`Delete project "${name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete project');
        return;
      }
      await loadProjects();
    } catch {
      setError('Failed to delete project');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {canCreate && (
        <div className="mb-6">
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="createName">Name</Label>
                    <Input
                      id="createName"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      required
                      minLength={1}
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="createDesc">Description</Label>
                    <Textarea
                      id="createDesc"
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      rows={2}
                      disabled={saving}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading projects...</p>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            canCreate
              ? 'Create a project to organize your diagrams.'
              : 'No projects have been created in this organization.'
          }
          action={
            canCreate ? (
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-2">
                {editingId === project.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      disabled={saving}
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <CardTitle>{project.name}</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                {editingId !== project.id && project.description && (
                  <p className="mb-2 text-sm text-muted-foreground">{project.description}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {project.diagramCount} {project.diagramCount === 1 ? 'diagram' : 'diagrams'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {editingId !== project.id && (
                    <Button size="sm" variant="default" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <FolderOpen className="mr-1 h-3 w-3" />
                        Open
                      </Link>
                    </Button>
                  )}
                  {editingId === project.id ? (
                    <>
                      <Button size="sm" disabled={saving} onClick={() => handleUpdate(project.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {canEdit && (
                        <Button size="sm" variant="outline" onClick={() => startEdit(project)}>
                          <Pencil className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={saving}
                          onClick={() => handleDelete(project.id, project.name)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
