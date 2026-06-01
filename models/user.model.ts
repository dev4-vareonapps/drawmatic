import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  emailVerified?: Date | null;
  image?: string;
  defaultOrganizationId?: mongoose.Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    emailVerified: { type: Date, default: null },
    image: { type: String, default: '' },
    defaultOrganizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ defaultOrganizationId: 1 });

userSchema.pre(/^find/, function (this: mongoose.Query<unknown, unknown>) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>('User', userSchema);
