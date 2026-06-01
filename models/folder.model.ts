import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { tenantPlugin } from './plugins/tenant.plugin';

export interface IFolder extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null;
  name: string;
  path: string;
  createdBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    name: { type: String, required: true, trim: true },
    path: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

folderSchema.plugin(tenantPlugin);
folderSchema.index({ organizationId: 1, projectId: 1, path: 1 });
folderSchema.index({ organizationId: 1, parentId: 1 });

export const Folder: Model<IFolder> =
  mongoose.models.Folder ?? mongoose.model<IFolder>('Folder', folderSchema);
