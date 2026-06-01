'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderRecord {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  diagramCount: number;
}

interface FoldersPanelProps {
  projectId: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  refreshTrigger?: number;
}

export function FoldersPanel({
  projectId,
  canCreate,
  canEdit,
  canDelete,
  selectedFolderId,
  onSelectFolder,
  refreshTrigger = 0,
}: FoldersPanelProps) {
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createParentId, setCreateParentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/folders`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load folders');
        setFolders([]);
        return;
      }
      setFolders(data as FolderRecord[]);
    } catch {
      setError('Failed to load folders');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders, refreshTrigger]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          parentId: createParentId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create folder');
        return;
      }
      setCreateName('');
      setCreateParentId('');
      setShowCreate(false);
      await loadFolders();
    } catch {
      setError('Failed to create folder');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(folderId: string) {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/folders/${folderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to update folder');
        return;
      }
      setEditingId(null);
      await loadFolders();
    } catch {
      setError('Failed to update folder');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(folderId: string, name: string) {
    if (!canDelete) return;
    if (!confirm(`Delete folder "${name}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/folders/${folderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete folder');
        return;
      }
      if (selectedFolderId === folderId) onSelectFolder(null);
      await loadFolders();
    } catch {
      setError('Failed to delete folder');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Folders</CardTitle>
        {canCreate && !showCreate && (
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
            <FolderPlus className="mr-1 h-4 w-4" />
            New folder
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showCreate && canCreate && (
          <form onSubmit={handleCreate} className="mb-4 space-y-3 rounded-lg border p-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder name</Label>
              <Input
                id="folderName"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentFolder">Parent folder (optional)</Label>
              <select
                id="parentFolder"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={createParentId}
                onChange={(e) => setCreateParentId(e.target.value)}
                disabled={saving}
              >
                <option value="">None (root)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.path}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                Create
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <Button
          variant={selectedFolderId === null ? 'secondary' : 'ghost'}
          size="sm"
          className="mb-3 w-full justify-start"
          onClick={() => onSelectFolder(null)}
        >
          All diagrams in project
        </Button>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading folders...</p>
        ) : folders.length === 0 ? (
          <EmptyState
            title="No folders yet"
            description="Create folders to organize diagrams within this project."
          />
        ) : (
          <ul className="space-y-1">
            {folders.map((folder) => {
              const depth = folder.path.split('/').filter(Boolean).length - 1;
              const isSelected = selectedFolderId === folder.id;

              return (
                <li
                  key={folder.id}
                  className={cn(
                    'rounded-md border',
                    isSelected ? 'border-primary bg-primary/5' : 'border-transparent',
                  )}
                >
                  {editingId === folder.id ? (
                    <div className="flex gap-2 p-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={saving}
                        className="h-8"
                      />
                      <Button size="sm" disabled={saving} onClick={() => handleUpdate(folder.id)}>
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
                    </div>
                  ) : (
                    <div
                      className="flex cursor-pointer items-center justify-between gap-2 p-2"
                      style={{ paddingLeft: `${8 + depth * 12}px` }}
                      onClick={() => onSelectFolder(folder.id)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {folder.diagramCount} {folder.diagramCount === 1 ? 'diagram' : 'diagrams'}
                        </p>
                      </div>
                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingId(folder.id);
                              setEditName(folder.name);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            disabled={saving}
                            onClick={() => handleDelete(folder.id, folder.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
