'use client';

import { useCallback, useEffect, useState } from 'react';

export interface DiagramListItem {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  archived: boolean;
  updatedAt: string;
  editorMode?: string;
}

export function useDiagrams(options?: { archived?: boolean }) {
  const [diagrams, setDiagrams] = useState<DiagramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagrams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = options?.archived ? '?archived=true' : '';
      const res = await fetch(`/api/diagrams${params}`);
      if (!res.ok) throw new Error('Failed to load diagrams');
      const data = await res.json();
      setDiagrams(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.archived]);

  useEffect(() => {
    fetchDiagrams();
  }, [fetchDiagrams]);

  return { diagrams, loading, error, refetch: fetchDiagrams };
}

export function useDiagram(id: string) {
  const [diagram, setDiagram] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagram = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/diagrams/${id}`);
      if (!res.ok) throw new Error('Failed to load diagram');
      setDiagram(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiagram();
  }, [fetchDiagram]);

  return { diagram, loading, error, refetch: fetchDiagram };
}
