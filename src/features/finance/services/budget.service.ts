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
  { categoryName: "ELECTRICITY_BILL", allocatedAmount: 500 },
  { categoryName: "HOME_SUPPORT", allocatedAmount: 10000 },
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
    } else {
      // Non-destructive check: if standard categories (EB, RENT, HOME_SUPPORT) are missing from existing budget, safely backfill
      const existingCategoryNames = new Set(
        (budget.categoryBudgets || []).map((c) => c.categoryName.trim().toUpperCase())
      );
      let modified = false;

      // Safely ensure Electricity Bill (EB) is available with default ₹500 allocation
      if (!existingCategoryNames.has("ELECTRICITY_BILL") && !existingCategoryNames.has("EB")) {
        budget.categoryBudgets.push({ categoryName: "ELECTRICITY_BILL", allocatedAmount: 500 });
        modified = true;
      }

      // Safely ensure Rent is available if not already present
      if (!existingCategoryNames.has("RENT")) {
        budget.categoryBudgets.push({ categoryName: "RENT", allocatedAmount: 5000 });
        modified = true;
      }

      // Safely ensure Home Support is available with desired ₹10,000 allocation
      const homeCat = budget.categoryBudgets.find(
        (c) => c.categoryName.trim().toUpperCase() === "HOME_SUPPORT" || c.categoryName.trim().toUpperCase() === "HOME"
      );
      if (!homeCat) {
        budget.categoryBudgets.push({ categoryName: "HOME_SUPPORT", allocatedAmount: 10000 });
        modified = true;
      } else if (homeCat.allocatedAmount === 5000) {
        // Upgrade previous 5000 placeholder to 10000
        homeCat.allocatedAmount = 10000;
        modified = true;
      }

      if (modified) {
        await budget.save();
      }
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
