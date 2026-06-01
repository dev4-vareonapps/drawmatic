import { z } from 'zod';
import { ROLES } from '@/lib/constants/roles';

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER]),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
