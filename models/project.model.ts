import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { tenantPlugin } from './plugins/tenant.plugin';

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    slug: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

projectSchema.plugin(tenantPlugin);
projectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
projectSchema.index({ organizationId: 1, createdAt: -1 });

export const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>('Project', projectSchema);
