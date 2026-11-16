import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDeviceSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface IDeviceSubscription extends Document {
  userId: Types.ObjectId;
  endpoint: string;
  keys: IDeviceSubscriptionKeys;
  userAgent?: string;
  deviceLabel: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSubscriptionSchema = new Schema<IDeviceSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
        trim: true,
      },
      auth: {
        type: String,
        required: true,
        trim: true,
      },
    },
    userAgent: {
      type: String,
      default: "",
    },
    deviceLabel: {
      type: String,
      default: "Browser Device",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying active subscriptions per user
DeviceSubscriptionSchema.index({ userId: 1, isActive: 1 });

const DeviceSubscription: Model<IDeviceSubscription> =
  mongoose.models.DeviceSubscription ||
  mongoose.model<IDeviceSubscription>("DeviceSubscription", DeviceSubscriptionSchema);

export default DeviceSubscription;

