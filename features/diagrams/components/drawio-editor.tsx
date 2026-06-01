'use client';

import { useCallback, useEffect, useRef } from 'react';

const DRAWIO_EMBED_URL = 'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json';

interface DrawioEditorProps {
  xmlContent: string;
  onSave: (xml: string) => void;
}

export function DrawioEditor({ xmlContent, onSave }: DrawioEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  const postMessage = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), '*');
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== 'https://embed.diagrams.net') return;

      let msg: { event?: string; xml?: string };
      try {
        msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (msg.event === 'init' && !initializedRef.current) {
        initializedRef.current = true;
        postMessage({
          action: 'load',
          xml: xmlContent || '<mxfile><diagram id="d1" name="Page-1"></diagram></mxfile>',
          autosave: 0,
        });
      }

      if (msg.event === 'save') {
        postMessage({ action: 'export', format: 'xml' });
      }

      if (msg.event === 'export' && msg.xml) {
        onSave(msg.xml);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [xmlContent, onSave, postMessage]);

  function handleSaveClick() {
    postMessage({ action: 'save' });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveClick}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Save from draw.io
        </button>
      </div>
      <iframe
        ref={iframeRef}
        title="draw.io Editor"
        src={DRAWIO_EMBED_URL}
        className="w-full flex-1 rounded-lg border"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
