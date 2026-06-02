'use client';

import { useCallback, useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { validateMermaidSyntax } from '@/lib/mermaid/validate';

interface MermaidEditorProps {
  initialContent?: string;
  onSave: (textContent: string, xmlContent: string) => Promise<void>;
  saving?: boolean;
}

export function MermaidEditor({ initialContent = '', onSave, saving = false }: MermaidEditorProps) {
  const [source, setSource] = useState(initialContent);
  const [svg, setSvg] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({
    valid: true,
  });

  const renderPreview = useCallback(async (code: string) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setValidation({ valid: false });
      setSvg('');
      return;
    }

    const result = await validateMermaidSyntax(code);
    setValidation(result);
    if (!result.valid) {
      setSvg('');
      return;
    }
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
      });
      const { svg: rendered } = await mermaid.render(`mermaid-${Date.now()}`, trimmedCode);
      setSvg(rendered);
    } catch (error) {
      setValidation({
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid Mermaid syntax',
      });
      setSvg('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderPreview(source);
    }, 400);
    return () => clearTimeout(timer);
  }, [source, renderPreview]);

  async function handleSave() {
    const result = await validateMermaidSyntax(source);
    if (!result.valid) return;
    const { mermaidToXmlPlaceholder } = await import('@/lib/mermaid/validate');
    await onSave(source, mermaidToXmlPlaceholder(source));
  }

  return (
    <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Mermaid Code</h3>
          {!validation.valid && (
            <span className="text-xs text-destructive">{validation.error}</span>
          )}
        </div>
        <Textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="min-h-[400px] flex-1 font-mono text-sm"
          spellCheck={false}
        />
        <Button onClick={handleSave} disabled={!validation.valid || saving}>
          {saving ? 'Saving...' : 'Save diagram'}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Live Preview</h3>
        <div className="flex flex-1 items-center justify-center overflow-auto rounded-lg border bg-white p-4">
          {svg ? (
            <div dangerouslySetInnerHTML={{ __html: svg }} />
          ) : !source.trim() ? (
            <p className="text-sm text-muted-foreground">No diagram selected</p>
          ) : (
            <p className="text-sm text-destructive">
              {validation.error ?? 'Invalid Mermaid syntax'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
