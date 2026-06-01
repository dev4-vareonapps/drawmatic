import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ deletedAt: 1 });

organizationSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ?? mongoose.model<IOrganization>('Organization', organizationSchema);
