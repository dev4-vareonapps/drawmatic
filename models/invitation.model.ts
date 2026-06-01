import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { ROLES, type Role } from '@/lib/constants/roles';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface IInvitation extends Document {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: Role;
  token: string;
  status: InvitationStatus;
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER],
      required: true,
    },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

invitationSchema.index({ organizationId: 1, email: 1, status: 1 });
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ expiresAt: 1 });

export const Invitation: Model<IInvitation> =
  mongoose.models.Invitation ?? mongoose.model<IInvitation>('Invitation', invitationSchema);
