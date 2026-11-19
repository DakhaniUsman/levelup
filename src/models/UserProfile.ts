import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFitnessProfile {
  startingWeightKg: number;
  targetWeightKg: number;
  weeklyPplGoal: number; // target sessions per muscle group weekly (default: 2)
}

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  timezone: string;
  preferences: {
    compactMode: boolean;
    soundEffects: boolean;
  };
  fitnessProfile: IFitnessProfile;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Display name cannot exceed 50 characters"],
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [250, "Bio cannot exceed 250 characters"],
      default: "",
    },
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
    preferences: {
      compactMode: { type: Boolean, default: false },
      soundEffects: { type: Boolean, default: true },
    },
    fitnessProfile: {
      startingWeightKg: { type: Number, default: 51 },
      targetWeightKg: { type: Number, default: 65 },
      weeklyPplGoal: { type: Number, default: 2 },
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);

export default UserProfile;

