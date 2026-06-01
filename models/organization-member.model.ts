import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ROLES, type Role } from '@/lib/constants/roles';

export interface IOrganizationMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: Role;
  invitedBy?: mongoose.Types.ObjectId;
  joinedAt: Date;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const organizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VIEWER,
      required: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

organizationMemberSchema.index(
  { organizationId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
organizationMemberSchema.index({ organizationId: 1, role: 1 });

organizationMemberSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

export const OrganizationMember: Model<IOrganizationMember> =
  mongoose.models.OrganizationMember ??
  mongoose.model<IOrganizationMember>('OrganizationMember', organizationMemberSchema);
