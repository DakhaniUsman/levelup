import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IQuestCompletion extends Document {
  occurrenceId: Types.ObjectId;
  questId: Types.ObjectId;
  userId: Types.ObjectId;
  completedAt: Date;
  xpTransactionId: Types.ObjectId;
}

const QuestCompletionSchema = new Schema<IQuestCompletion>(
  {
    occurrenceId: {
      type: Schema.Types.ObjectId,
      ref: "QuestOccurrence",
      required: true,
      unique: true,
      index: true,
    },
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
    completedAt: {
      type: Date,
      default: Date.now,
    },
    xpTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "XPTransaction",
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

const QuestCompletion: Model<IQuestCompletion> =
  mongoose.models.QuestCompletion ||
  mongoose.model<IQuestCompletion>("QuestCompletion", QuestCompletionSchema);

export default QuestCompletion;

