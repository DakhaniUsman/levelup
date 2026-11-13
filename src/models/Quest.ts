import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { TaskCategory } from "./Task";

export type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";
export type QuestFrequency = "DAILY" | "WEEKDAYS" | "WEEKLY" | "CUSTOM";

export const QUEST_DIFFICULTY_XP: Record<QuestDifficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  EPIC: 100,
};

export interface IQuest extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: TaskCategory;
  difficulty: QuestDifficulty;
  xpReward: number;
  frequency: QuestFrequency;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Quest title is required"],
      trim: true,
      maxlength: [150, "Quest title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
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
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD", "EPIC"],
      default: "EASY",
    },
    xpReward: {
      type: Number,
      required: true,
      default: 10,
    },
    frequency: {
      type: String,
      enum: ["DAILY", "WEEKDAYS", "WEEKLY", "CUSTOM"],
      default: "DAILY",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

QuestSchema.index({ userId: 1, isActive: 1 });

const Quest: Model<IQuest> =
  mongoose.models.Quest || mongoose.model<IQuest>("Quest", QuestSchema);

export default Quest;

