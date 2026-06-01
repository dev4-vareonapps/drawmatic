import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface ISubscription extends Document {
  organizationId: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ organizationId: 1 }, { unique: true });
subscriptionSchema.index({ stripeCustomerId: 1 }, { sparse: true });

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ?? mongoose.model<ISubscription>('Subscription', subscriptionSchema);
