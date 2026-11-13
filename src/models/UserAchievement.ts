import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUserAchievement extends Document {
  userId: Types.ObjectId;
  achievementId: Types.ObjectId;
  unlockedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
      index: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const UserAchievement: Model<IUserAchievement> =
  mongoose.models.UserAchievement ||
  mongoose.model<IUserAchievement>("UserAchievement", UserAchievementSchema);

export default UserAchievement;

