import { z } from 'zod';

export const createDiagramSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  projectId: z.string().optional(),
  folderId: z.string().optional(),
  xmlContent: z.string().optional().default(''),
  textContent: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  editorMode: z.enum(['visual', 'text', 'mermaid']).optional().default('text'),
});

export const updateDiagramSchema = createDiagramSchema.partial().extend({
  archived: z.boolean().optional(),
});

export const mermaidSaveSchema = z.object({
  textContent: z.string(),
  xmlContent: z.string().optional(),
});

export type CreateDiagramInput = z.infer<typeof createDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof updateDiagramSchema>;
