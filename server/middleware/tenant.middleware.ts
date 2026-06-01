import mongoose from 'mongoose';

export class TenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantError';
  }
}

export function assertValidOrganizationId(organizationId: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new TenantError('Invalid organization ID');
  }
  return new mongoose.Types.ObjectId(organizationId);
}

export function withTenantFilter<T extends Record<string, unknown>>(
  organizationId: mongoose.Types.ObjectId,
  filter: T = {} as T,
): T & { organizationId: mongoose.Types.ObjectId; deletedAt: null } {
  return {
    ...filter,
    organizationId,
    deletedAt: null,
  };
}
