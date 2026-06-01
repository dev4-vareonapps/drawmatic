export async function validateMermaidSyntax(source: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!source.trim()) {
    return { valid: true };
  }

  try {
    const mermaid = await import('mermaid');
    mermaid.default.initialize({ startOnLoad: false, securityLevel: 'strict' });
    await mermaid.default.parse(source);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid Mermaid syntax',
    };
  }
}

export function mermaidToXmlPlaceholder(source: string): string {
  const escaped = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Drawmatic" type="mermaid">
  <diagram name="Mermaid" id="mermaid-diagram">
    <mermaid><![CDATA[${escaped}]]></mermaid>
  </diagram>
</mxfile>`;
}
