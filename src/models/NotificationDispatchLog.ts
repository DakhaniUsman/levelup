import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotificationDispatchLog extends Document {
  userId: Types.ObjectId;
  dedupeKey: string;
  category: string;
  title: string;
  channel: "PUSH" | "IN_APP" | "BOTH";
  dispatchedAt: Date;
}

const NotificationDispatchLogSchema = new Schema<INotificationDispatchLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dedupeKey: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["PUSH", "IN_APP", "BOTH"],
      default: "BOTH",
    },
    dispatchedAt: {
      type: Date,
      default: Date.now,
      // Automatically expire logs after 7 days to keep collection lightweight
      expires: 60 * 60 * 24 * 7,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index to guarantee unique dispatch per user and dedupeKey
NotificationDispatchLogSchema.index({ userId: 1, dedupeKey: 1 }, { unique: true });

const NotificationDispatchLog: Model<INotificationDispatchLog> =
  mongoose.models.NotificationDispatchLog ||
  mongoose.model<INotificationDispatchLog>("NotificationDispatchLog", NotificationDispatchLogSchema);

export default NotificationDispatchLog;

