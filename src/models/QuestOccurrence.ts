import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type OccurrenceStatus = "PENDING" | "COMPLETED" | "MISSED";

export interface IQuestOccurrence extends Document {
  questId: Types.ObjectId;
  userId: Types.ObjectId;
  targetDate: string; // ISO format: YYYY-MM-DD
  status: OccurrenceStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestOccurrenceSchema = new Schema<IQuestOccurrence>(
  {
    questId: {
      type: Schema.Types.ObjectId,
      ref: "Quest",
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
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "MISSED"],
      default: "PENDING",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Guarantee unique occurrence per quest per calendar day
QuestOccurrenceSchema.index({ questId: 1, targetDate: 1 }, { unique: true });
QuestOccurrenceSchema.index({ userId: 1, targetDate: 1, status: 1 });

const QuestOccurrence: Model<IQuestOccurrence> =
  mongoose.models.QuestOccurrence ||
  mongoose.model<IQuestOccurrence>("QuestOccurrence", QuestOccurrenceSchema);

export default QuestOccurrence;

