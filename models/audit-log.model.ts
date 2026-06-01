import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  resourceType: string;
  resourceId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, userId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, resourceType: 1, resourceId: 1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ?? mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
