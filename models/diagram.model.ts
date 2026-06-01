import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { tenantPlugin } from './plugins/tenant.plugin';

export type EditorMode = 'visual' | 'text' | 'mermaid';

export interface IDiagram extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  xmlContent: string;
  textContent: string;
  version: number;
  tags: string[];
  editorMode: EditorMode;
  archived: boolean;
  archivedAt?: Date | null;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const diagramSchema = new Schema<IDiagram>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder', index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    xmlContent: { type: String, default: '' },
    textContent: { type: String, default: '' },
    version: { type: Number, default: 1 },
    tags: [{ type: String, trim: true }],
    editorMode: {
      type: String,
      enum: ['visual', 'text', 'mermaid'],
      default: 'text',
    },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

diagramSchema.plugin(tenantPlugin);
diagramSchema.index({ organizationId: 1, name: 1 });
diagramSchema.index({ organizationId: 1, projectId: 1, archived: 1 });
diagramSchema.index({ organizationId: 1, tags: 1 });
diagramSchema.index({ organizationId: 1, updatedAt: -1 });

export const Diagram: Model<IDiagram> =
  mongoose.models.Diagram ?? mongoose.model<IDiagram>('Diagram', diagramSchema);
