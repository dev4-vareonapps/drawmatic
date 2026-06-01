import { ROLES, type Role } from './roles';

export const PERMISSIONS = {
  ORG_MANAGE_USERS: 'org:manage_users',
  ORG_MANAGE_SETTINGS: 'org:manage_settings',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  DIAGRAM_CREATE: 'diagram:create',
  DIAGRAM_EDIT: 'diagram:edit',
  DIAGRAM_DELETE: 'diagram:delete',
  DIAGRAM_VIEW: 'diagram:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.ORG_MANAGE_USERS,
    PERMISSIONS.ORG_MANAGE_SETTINGS,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.DIAGRAM_CREATE,
    PERMISSIONS.DIAGRAM_EDIT,
    PERMISSIONS.DIAGRAM_DELETE,
    PERMISSIONS.DIAGRAM_VIEW,
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.DIAGRAM_CREATE,
    PERMISSIONS.DIAGRAM_EDIT,
    PERMISSIONS.DIAGRAM_VIEW,
  ],
  [ROLES.VIEWER]: [PERMISSIONS.DIAGRAM_VIEW],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
