import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IHabitCompletion extends Document {
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  targetDate: string; // YYYY-MM-DD
  completedCount: number;
  completedAt: Date;
  xpTransactionId?: Types.ObjectId;
}

const HabitCompletionSchema = new Schema<IHabitCompletion>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetDate: {
      type: String, // YYYY-MM-DD in user's timezone
      required: true,
    },
    completedCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    xpTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "XPTransaction",
    },
  },
  {
    timestamps: false,
  }
);

HabitCompletionSchema.index({ habitId: 1, targetDate: 1 }, { unique: true });
HabitCompletionSchema.index({ userId: 1, targetDate: 1 });

const HabitCompletion: Model<IHabitCompletion> =
  mongoose.models.HabitCompletion ||
  mongoose.model<IHabitCompletion>("HabitCompletion", HabitCompletionSchema);

export default HabitCompletion;

