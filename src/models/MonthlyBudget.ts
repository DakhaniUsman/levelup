import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IIncomeSource {
  sourceName: string;
  amount: number;
  isSalary: boolean;
}

export interface ICategoryBudget {
  categoryName: string;
  allocatedAmount: number;
}

export interface IMonthlyBudget extends Document {
  userId: Types.ObjectId;
  month: string; // YYYY-MM
  incomes: IIncomeSource[];
  categoryBudgets: ICategoryBudget[];
  savingsTarget: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSourceSchema = new Schema<IIncomeSource>(
  {
    sourceName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    isSalary: { type: Boolean, default: false },
  },
  { _id: false }
);

const CategoryBudgetSchema = new Schema<ICategoryBudget>(
  {
    categoryName: { type: String, required: true, trim: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const MonthlyBudgetSchema = new Schema<IMonthlyBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    month: {
      type: String, // YYYY-MM
      required: true,
      index: true,
    },
    incomes: [IncomeSourceSchema],
    categoryBudgets: [CategoryBudgetSchema],
    savingsTarget: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// One budget per user per month
MonthlyBudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const MonthlyBudget: Model<IMonthlyBudget> =
  mongoose.models.MonthlyBudget ||
  mongoose.model<IMonthlyBudget>("MonthlyBudget", MonthlyBudgetSchema);

export default MonthlyBudget;
