export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};
