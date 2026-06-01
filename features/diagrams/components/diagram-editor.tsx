'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MermaidEditor } from './mermaid-editor';
import { DrawioEditor } from './drawio-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DiagramEditorProps {
  diagramId?: string;
  initial?: {
    name?: string;
    description?: string;
    textContent?: string;
    xmlContent?: string;
    editorMode?: 'visual' | 'text' | 'mermaid';
    projectId?: string;
    folderId?: string;
  };
  onCreated?: (id: string) => void;
}

export function DiagramEditor({ diagramId, initial, onCreated }: DiagramEditorProps) {
  const [name, setName] = useState(initial?.name ?? 'Untitled Diagram');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [textContent, setTextContent] = useState(initial?.textContent ?? '');
  const [xmlContent, setXmlContent] = useState(initial?.xmlContent ?? '');
  const [mode, setMode] = useState<'mermaid' | 'visual' | 'text'>(
    initial?.editorMode === 'visual'
      ? 'visual'
      : initial?.editorMode === 'mermaid'
        ? 'mermaid'
        : 'mermaid',
  );
  const [saving, setSaving] = useState(false);

  async function persist(payload: {
    textContent?: string;
    xmlContent?: string;
    editorMode: 'visual' | 'text' | 'mermaid';
  }) {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name,
        description,
        textContent: payload.textContent ?? textContent,
        xmlContent: payload.xmlContent ?? xmlContent,
        editorMode: payload.editorMode,
      };
      if (initial?.projectId) body.projectId = initial.projectId;
      if (initial?.folderId) body.folderId = initial.folderId;

      if (diagramId) {
        await fetch(`/api/diagrams/${diagramId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch('/api/diagrams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const created = await res.json();
        onCreated?.(created._id);
      }

      if (payload.textContent) setTextContent(payload.textContent);
      if (payload.xmlContent) setXmlContent(payload.xmlContent);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList>
          <TabsTrigger value="mermaid">Mermaid</TabsTrigger>
          <TabsTrigger value="visual">Visual (draw.io)</TabsTrigger>
          <TabsTrigger value="text">Raw XML</TabsTrigger>
        </TabsList>
        <TabsContent value="mermaid">
          <MermaidEditor
            initialContent={textContent}
            saving={saving}
            onSave={async (text, xml) => {
              await persist({ textContent: text, xmlContent: xml, editorMode: 'mermaid' });
            }}
          />
        </TabsContent>
        <TabsContent value="visual">
          <DrawioEditor
            xmlContent={xmlContent}
            onSave={async (xml) => {
              await persist({ xmlContent: xml, editorMode: 'visual' });
            }}
          />
        </TabsContent>
        <TabsContent value="text">
          <div className="space-y-2">
            <Label>XML Content</Label>
            <Textarea
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              disabled={saving}
              onClick={() => persist({ xmlContent, textContent, editorMode: 'text' })}
            >
              {saving ? 'Saving...' : 'Save XML'}
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
