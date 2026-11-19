import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import MonthlyBudget, {
  IMonthlyBudget,
  IIncomeSource,
  ICategoryBudget,
} from "@/models/MonthlyBudget";

export const DEFAULT_BUDGET_CATEGORIES: ICategoryBudget[] = [
  { categoryName: "FOOD", allocatedAmount: 7000 },
  { categoryName: "RENT", allocatedAmount: 5000 },
  { categoryName: "TRAVELLING", allocatedAmount: 2000 },
  { categoryName: "PERSONAL", allocatedAmount: 2000 },
  { categoryName: "MISCELLANEOUS", allocatedAmount: 3000 },
];

export class BudgetService {
  /**
   * Retrieves or initializes an isolated monthly budget record for the specified month
   */
  static async getOrCreateBudget(
    userId: string | Types.ObjectId,
    month: string // "YYYY-MM"
  ): Promise<IMonthlyBudget> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    let budget = await MonthlyBudget.findOne({ userId: userObjId, month });
    if (!budget) {
      budget = await MonthlyBudget.create({
        userId: userObjId,
        month,
        incomes: [
          { sourceName: "Primary Salary", amount: 35000, isSalary: true },
        ],
        categoryBudgets: DEFAULT_BUDGET_CATEGORIES,
        savingsTarget: 10000,
        notes: "",
      });
    }

    return budget;
  }

  /**
   * Updates the monthly budget configuration
   */
  static async updateBudget(
    userId: string | Types.ObjectId,
    month: string,
    updateData: {
      incomes?: IIncomeSource[];
      categoryBudgets?: ICategoryBudget[];
      savingsTarget?: number;
      notes?: string;
    }
  ): Promise<IMonthlyBudget> {
    await dbConnect();
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const budget = await MonthlyBudget.findOneAndUpdate(
      { userId: userObjId, month },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return budget;
  }
}
