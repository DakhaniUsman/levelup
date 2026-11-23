import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Expense, { IExpense } from "@/models/Expense";
import { BudgetService } from "./budget.service";
import { formatCategoryLabel } from "../constants/categories";
import { CacheService } from "@/lib/cache.service";

export interface CategoryComparison {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverbudget: boolean;
}

export interface FinancialOverviewData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage
  totalBudget: number;
  remainingBudget: number;
  budgetUtilization: number; // percentage
  savingsTarget: number;
  categories: CategoryComparison[];
  highestSpendingCategory: { name: string; amount: number } | null;
  incomesCount: number;
}

export interface SpendingAnalyticsData {
  month: string;
  dailySpending: { date: string; day: number; amount: number }[];
  weeklySpending: { weekLabel: string; amount: number }[];
  categoryDistribution: { category: string; amount: number; percentage: number }[];
  highestSpendingDay: { date: string; amount: number } | null;
}

export interface MonthlyFinancialReportData {
  month: string;
  previousMonth: string;
  current: FinancialOverviewData;
  previous: FinancialOverviewData | null;
  deltas: {
    expenseChange: number; // current - prev
    savingsChange: number;
    savingsRateChange: number;
  };
  insights: string[];
}

export class FinancialAnalyticsService {
  /**
   * Calculates previous YYYY-MM string (e.g., "2026-11" -> "2026-10")
   */
  static getPreviousMonth(month: string): string {
    const [yearStr, monthStr] = month.split("-");
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) - 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    return `${y}-${String(m).padStart(2, "0")}`;
  }

  /**
   * Computes the complete financial overview for the month
   */
  static async getMonthlyOverview(
    userId: string | Types.ObjectId,
    month: string // "YYYY-MM"
  ): Promise<FinancialOverviewData> {
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const cacheKey = CacheService.keys.financeOverview(userObjId.toString(), month);

    return CacheService.getOrSet(cacheKey, async () => {
      await dbConnect();

      const [budget, monthExpenses] = await Promise.all([
      BudgetService.getOrCreateBudget(userObjId, month),
      Expense.find({
        userId: userObjId,
        targetDate: { $regex: new RegExp(`^${month}`) },
      }).lean(),
    ]);

    // 1. Total Actual Income from configured budget income sources
    const totalIncome = (budget.incomes || []).reduce((sum, inc) => sum + (inc.amount || 0), 0);

    // 2. Total Actual Expenses from canonical Expense collection
    const actualExpenseMap = new Map<string, number>();
    let totalExpenses = 0;

    for (const exp of monthExpenses) {
      const amt = exp.amount || 0;
      totalExpenses += amt;
      const cat = (exp.category || "MISCELLANEOUS").trim().toUpperCase();
      actualExpenseMap.set(cat, (actualExpenseMap.get(cat) || 0) + amt);
    }

    // 3. Category comparison
    const categories: CategoryComparison[] = [];
    const processedCats = new Set<string>();
    let totalBudget = 0;

    for (const cb of budget.categoryBudgets || []) {
      const catName = cb.categoryName.trim().toUpperCase();
      processedCats.add(catName);
      const budgeted = cb.allocatedAmount || 0;
      totalBudget += budgeted;
      const actual = actualExpenseMap.get(catName) || 0;
      const remaining = budgeted - actual;
      const percentUsed = budgeted > 0 ? Math.round((actual / budgeted) * 100) : actual > 0 ? 100 : 0;

      categories.push({
        category: cb.categoryName,
        budgeted,
        actual,
        remaining,
        percentUsed,
        isOverbudget: actual > budgeted,
      });
    }

    // Include any categories that were spent on but not explicitly in budget
    for (const [catName, actual] of actualExpenseMap.entries()) {
      if (!processedCats.has(catName)) {
        categories.push({
          category: catName,
          budgeted: 0,
          actual,
          remaining: -actual,
          percentUsed: 100,
          isOverbudget: true,
        });
      }
    }

    // Sort categories by actual spent descending
    categories.sort((a, b) => b.actual - a.actual);

    // 4. Savings calculations
    const netSavings = totalIncome - totalExpenses;
    const savingsRate =
      totalIncome > 0
        ? Math.round((netSavings / totalIncome) * 1000) / 10
        : 0;

    const remainingBudget = totalBudget - totalExpenses;
    const budgetUtilization =
      totalBudget > 0
        ? Math.round((totalExpenses / totalBudget) * 1000) / 10
        : 0;

    const highestSpendingCategory =
      categories.length > 0 && categories[0].actual > 0
        ? { name: formatCategoryLabel(categories[0].category), amount: categories[0].actual }
        : null;

    return {
      month,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      totalBudget,
      remainingBudget,
      budgetUtilization,
      savingsTarget: budget.savingsTarget || 0,
      categories,
      highestSpendingCategory,
      incomesCount: (budget.incomes || []).length,
    };
  }, 600);
}

  /**
   * Generates daily and weekly spending trends and category distribution
   */
  static async getSpendingAnalytics(
    userId: string | Types.ObjectId,
    month: string
  ): Promise<SpendingAnalyticsData> {
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const cacheKey = CacheService.keys.financeAnalytics(userObjId.toString(), month);

    return CacheService.getOrSet(cacheKey, async () => {
      await dbConnect();

      const expenses = await Expense.find({
        userId: userObjId,
        targetDate: { $regex: new RegExp(`^${month}`) },
      })
        .sort({ targetDate: 1 })
        .lean();

    // Days in month
    const [yearStr, monthStr] = month.split("-");
    const y = parseInt(yearStr, 10);
    const m = parseInt(monthStr, 10);
    const daysInMonth = new Date(y, m, 0).getDate();

    const dailyMap = new Map<number, number>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, 0);
    }

    const catMap = new Map<string, number>();
    let highestSpendingDay: { date: string; amount: number } | null = null;
    let totalSpent = 0;

    for (const exp of expenses) {
      const dayNum = parseInt(exp.targetDate.slice(8, 10), 10);
      const currentDayTotal = (dailyMap.get(dayNum) || 0) + exp.amount;
      dailyMap.set(dayNum, currentDayTotal);

      const cat = (exp.category || "MISCELLANEOUS").trim().toUpperCase();
      catMap.set(cat, (catMap.get(cat) || 0) + exp.amount);

      totalSpent += exp.amount;

      if (!highestSpendingDay || currentDayTotal > highestSpendingDay.amount) {
        highestSpendingDay = { date: exp.targetDate, amount: currentDayTotal };
      }
    }

    const dailySpending = Array.from(dailyMap.entries()).map(([day, amount]) => ({
      date: `${month}-${String(day).padStart(2, "0")}`,
      day,
      amount,
    }));

    // Weekly breakdown
    let w1 = 0,
      w2 = 0,
      w3 = 0,
      w4 = 0;
    for (const d of dailySpending) {
      if (d.day <= 7) w1 += d.amount;
      else if (d.day <= 14) w2 += d.amount;
      else if (d.day <= 21) w3 += d.amount;
      else w4 += d.amount;
    }

    const weeklySpending = [
      { weekLabel: "Week 1 (1-7)", amount: w1 },
      { weekLabel: "Week 2 (8-14)", amount: w2 },
      { weekLabel: "Week 3 (15-21)", amount: w3 },
      { weekLabel: "Week 4+ (22+)", amount: w4 },
    ];

    const categoryDistribution = Array.from(catMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      month,
      dailySpending,
      weeklySpending,
      categoryDistribution,
      highestSpendingDay,
    };
  }, 600);
}

  /**
   * Generates comprehensive monthly financial report with comparative month-over-month insights
   */
  static async getMonthlyReport(
    userId: string | Types.ObjectId,
    month: string
  ): Promise<MonthlyFinancialReportData> {
    const userObjId = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const cacheKey = CacheService.keys.financeReport(userObjId.toString(), month);

    return CacheService.getOrSet(cacheKey, async () => {
      const prevMonth = this.getPreviousMonth(month);

      const [current, previous] = await Promise.all([
        this.getMonthlyOverview(userObjId, month),
        this.getMonthlyOverview(userObjId, prevMonth).catch(() => null),
      ]);

      const deltas = {
        expenseChange: previous ? current.totalExpenses - previous.totalExpenses : 0,
        savingsChange: previous ? current.netSavings - previous.netSavings : 0,
        savingsRateChange: previous
          ? Math.round((current.savingsRate - previous.savingsRate) * 10) / 10
          : 0,
      };

      const insights: string[] = [];

      // Savings insight
      if (current.netSavings >= 0) {
        insights.push(
          `Positive Net Savings: You preserved ₹${current.netSavings.toLocaleString("en-IN")} this month (${current.savingsRate}% savings rate).`
        );
      } else {
        insights.push(
          `Negative Savings Warning: Expenditures exceeded total income by ₹${Math.abs(current.netSavings).toLocaleString("en-IN")}.`
        );
      }

      // Budget adherence insight
      const adheredCount = current.categories.filter((c) => !c.isOverbudget).length;
      const totalCount = current.categories.length;
      if (totalCount > 0) {
        insights.push(
          `Budget Adherence: You stayed within ${adheredCount} of ${totalCount} category allocations (${Math.round((adheredCount / totalCount) * 100)}% adherence rate).`
        );
      }

      // Comparative insight
      if (previous && previous.totalExpenses > 0) {
        if (deltas.expenseChange > 0) {
          insights.push(
            `Spending Trend: You spent ₹${deltas.expenseChange.toLocaleString("en-IN")} more overall compared to ${prevMonth}.`
          );
        } else if (deltas.expenseChange < 0) {
          insights.push(
            `Savings Discipline: You reduced overall expenditures by ₹${Math.abs(deltas.expenseChange).toLocaleString("en-IN")} compared to ${prevMonth}.`
          );
        }
      }

      // Highest category insight
      if (current.highestSpendingCategory) {
        insights.push(
          `Primary Capital Drain: ${current.highestSpendingCategory.name} accounted for ₹${current.highestSpendingCategory.amount.toLocaleString("en-IN")} of total spending.`
        );
      }

      return {
        month,
        previousMonth: prevMonth,
        current,
        previous,
        deltas,
        insights,
      };
    }, 600);
  }
}
