import mongoose, { Schema, Document, Model } from "mongoose";

export type AchievementCategory =
  | "QUESTS"
  | "STREAKS"
  | "LEVELS"
  | "KNOWLEDGE"
  | "DISCIPLINE";

export type AchievementRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface IAchievement extends Document {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  rarity: AchievementRarity;
  createdAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "Trophy",
    },
    category: {
      type: String,
      enum: ["QUESTS", "STREAKS", "LEVELS", "KNOWLEDGE", "DISCIPLINE"],
      required: true,
      index: true,
    },
    xpReward: {
      type: Number,
      required: true,
      default: 50,
    },
    rarity: {
      type: String,
      enum: ["COMMON", "RARE", "EPIC", "LEGENDARY"],
      default: "COMMON",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Achievement: Model<IAchievement> =
  mongoose.models.Achievement ||
  mongoose.model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;

