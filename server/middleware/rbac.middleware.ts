import { type Role } from '@/lib/constants/roles';
import { type Permission, roleHasPermission } from '@/lib/constants/permissions';

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function requirePermission(role: Role | undefined, permission: Permission): void {
  if (!role) {
    throw new UnauthorizedError('Authentication required');
  }
  if (!roleHasPermission(role, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}

export function requireAnyPermission(role: Role | undefined, permissions: Permission[]): void {
  if (!role) {
    throw new UnauthorizedError('Authentication required');
  }
  const allowed = permissions.some((p) => roleHasPermission(role, p));
  if (!allowed) {
    throw new ForbiddenError('Insufficient permissions');
  }
}
