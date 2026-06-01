import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1).max(200),
  parentId: z.string().optional().nullable(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  parentId: z.string().optional().nullable(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
