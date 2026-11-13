import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { TaskCategory } from "./Task";

export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "CUSTOM";

export interface IHabit extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  frequency: HabitFrequency;
  customDays: number[]; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  targetPerDay: number;
  currentStreak: number;
  longestStreak: number;
  xpReward: number;
  isPaused: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema = new Schema<IHabit>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Habit title is required"],
      trim: true,
      maxlength: [150, "Habit title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    category: {
      type: String,
      enum: [
        "PERSONAL",
        "CAREER",
        "FITNESS",
        "LEARNING",
        "SPIRITUAL",
        "FINANCE",
        "BUSINESS",
      ],
      default: "PERSONAL",
    },
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKDAYS", "WEEKENDS", "CUSTOM"],
      default: "DAILY",
    },
    customDays: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    targetPerDay: {
      type: Number,
      default: 1,
      min: 1,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    xpReward: {
      type: Number,
      default: 20,
      min: 5,
    },
    isPaused: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

HabitSchema.index({ userId: 1, isArchived: 1, isPaused: 1 });

const Habit: Model<IHabit> =
  mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema);

export default Habit;

