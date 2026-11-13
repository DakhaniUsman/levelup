import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationType =
  | "ACHIEVEMENT"
  | "LEVEL_UP"
  | "STREAK"
  | "SYSTEM";

export interface INotification extends Document {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["ACHIEVEMENT", "LEVEL_UP", "STREAK", "SYSTEM"],
      default: "SYSTEM",
    },
    link: {
      type: String,
      default: "/dashboard",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;

