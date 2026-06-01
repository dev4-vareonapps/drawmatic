import { Schema, type Query } from 'mongoose';

export interface TenantDocument {
  organizationId: Schema.Types.ObjectId;
  deletedAt?: Date | null;
}

export function tenantPlugin(schema: Schema): void {
  schema.add({
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  });

  schema.pre(/^find/, function (this: Query<unknown, unknown>) {
    const opts = this.getOptions() as { includeDeleted?: boolean };
    if (!opts.includeDeleted) {
      this.where({ deletedAt: null });
    }
  });

  schema.methods.softDelete = async function () {
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this.deletedAt = null;
    return this.save();
  };
}
