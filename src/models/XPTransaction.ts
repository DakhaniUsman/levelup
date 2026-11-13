import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type XPSourceType = "QUEST" | "TASK" | "HABIT" | "MANUAL_ADJUSTMENT";
export type XPTransactionType = "REWARD" | "PENALTY" | "CORRECTION";

export interface IXPTransaction extends Document {
  userId: Types.ObjectId;
  amount: number;
  transactionType: XPTransactionType;
  sourceType: XPSourceType;
  sourceId: string;
  idempotencyKey: string;
  description: string;
  createdAt: Date;
}

const XPTransactionSchema = new Schema<IXPTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["REWARD", "PENALTY", "CORRECTION"],
      default: "REWARD",
    },
    sourceType: {
      type: String,
      enum: ["QUEST", "TASK", "HABIT", "MANUAL_ADJUSTMENT"],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate rewards for the same activity
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable ledger
  }
);

XPTransactionSchema.index({ userId: 1, createdAt: -1 });

const XPTransaction: Model<IXPTransaction> =
  mongoose.models.XPTransaction ||
  mongoose.model<IXPTransaction>("XPTransaction", XPTransactionSchema);

export default XPTransaction;

