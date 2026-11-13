import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ExpenseCategory =
  | "FOOD"
  | "TRAVELLING"
  | "ENTERTAINMENT"
  | "OUTING"
  | "MISCELLANEOUS";

export interface IExpense extends Document {
  userId: Types.ObjectId;
  targetDate: string; // YYYY-MM-DD
  amount: number;
  category: ExpenseCategory;
  description: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["FOOD", "TRAVELLING", "ENTERTAINMENT", "OUTING", "MISCELLANEOUS"],
      default: "MISCELLANEOUS",
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ExpenseSchema.index({ userId: 1, targetDate: 1 });

const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;

