import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotificationCategories {
  protocol: boolean;
  habits: boolean;
  quests: boolean;
  progression: boolean;
  workouts: boolean;
  expenses: boolean;
  dailyReport: boolean;
}

export interface IReminderTimes {
  morning: string;
  afternoon: string;
  evening: string;
  night: string;
  dailyReport: string;
}

export interface IQuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  enabled: boolean;
  categories: INotificationCategories;
  reminderTimes: IReminderTimes;
  quietHours: IQuietHours;
  maxRemindersPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    categories: {
      protocol: { type: Boolean, default: true },
      habits: { type: Boolean, default: true },
      quests: { type: Boolean, default: true },
      progression: { type: Boolean, default: true },
      workouts: { type: Boolean, default: true },
      expenses: { type: Boolean, default: true },
      dailyReport: { type: Boolean, default: true },
    },
    reminderTimes: {
      morning: { type: String, default: "08:00" },
      afternoon: { type: String, default: "14:00" },
      evening: { type: String, default: "18:30" },
      night: { type: String, default: "21:30" },
      dailyReport: { type: String, default: "22:30" },
    },
    quietHours: {
      enabled: { type: Boolean, default: true },
      start: { type: String, default: "23:00" },
      end: { type: String, default: "07:00" },
    },
    maxRemindersPerDay: {
      type: Number,
      default: 6,
      min: 1,
      max: 20,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationPreference: Model<INotificationPreference> =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>("NotificationPreference", NotificationPreferenceSchema);

export default NotificationPreference;

