"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sliders,
  Receipt,
  Trash2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { IExpense } from "@/models/Expense";
import {
  FinancialOverviewData,
  SpendingAnalyticsData,
  MonthlyFinancialReportData,
} from "@/features/finance/services/financial-analytics.service";
import { IMonthlyBudget, IIncomeSource, ICategoryBudget } from "@/models/MonthlyBudget";
import ExpenseModal from "@/features/expenses/components/ExpenseModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import FinancialDonutChart from "@/features/finance/components/FinancialDonutChart";
import OverspendingInsightsPanel from "@/features/finance/components/OverspendingInsightsPanel";
import {
  formatCategoryLabel,
  getCategoryIcon,
  STANDARD_CATEGORIES,
} from "@/features/finance/constants/categories";

export default function FinancialIntelligencePage() {
  const queryClient = useQueryClient();

  // Selected month state (defaults to current YYYY-MM)
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayDateStr.slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [timeView, setTimeView] = useState<"DAY" | "WEEK" | "MONTH">("MONTH");
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedChartCategory, setSelectedChartCategory] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<IExpense | null>(null);

  // Budget form state for the modal
  const [incomesForm, setIncomesForm] = useState<IIncomeSource[]>([
    { sourceName: "Primary Salary", amount: 35000, isSalary: true },
  ]);
  const [categoriesForm, setCategoriesForm] = useState<ICategoryBudget[]>([
    { categoryName: "FOOD", allocatedAmount: 7000 },
    { categoryName: "RENT", allocatedAmount: 5000 },
    { categoryName: "ELECTRICITY_BILL", allocatedAmount: 500 },
    { categoryName: "HOME_SUPPORT", allocatedAmount: 10000 },
    { categoryName: "TRAVELLING", allocatedAmount: 2000 },
    { categoryName: "PERSONAL", allocatedAmount: 2000 },
    { categoryName: "MISCELLANEOUS", allocatedAmount: 3000 },
  ]);
  const [savingsTargetForm, setSavingsTargetForm] = useState<number>(10000);
  const [budgetNotesForm, setBudgetNotesForm] = useState<string>("");

  // 1. Fetch Monthly Financial Overview
  const { data: overview, isLoading: isOverviewLoading } = useQuery<FinancialOverviewData>({
    queryKey: ["financial-overview", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/finance/overview?month=${selectedMonth}`);
      const json = await res.json();
      return json.data;
    },
  });

  // 2. Fetch Spending Analytics (Daily / Weekly)
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery<SpendingAnalyticsData>({
    queryKey: ["spending-trends", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/finance/analytics?month=${selectedMonth}`);
      const json = await res.json();
      return json.data;
    },
  });

  // 3. Fetch Monthly Financial Report & Insights
  const { data: report, isLoading: isReportLoading } = useQuery<MonthlyFinancialReportData>({
    queryKey: ["financial-report", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/finance/report?month=${selectedMonth}`);
      const json = await res.json();
      return json.data;
    },
  });

  // 4. Fetch Configured Monthly Budget
  const { data: budgetData } = useQuery<IMonthlyBudget>({
    queryKey: ["monthly-budget", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/finance/budget?month=${selectedMonth}`);
      const json = await res.json();
      return json.data;
    },
  });

  // 5. Fetch This Month's Expenses List
  const { data: expensesData } = useQuery<{ expenses: IExpense[]; totalSpent: number }>({
    queryKey: ["expenses", selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/expenses`);
      const json = await res.json();
      return json.data;
    },
  });

  // Save Budget Mutation
  const saveBudgetMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/finance/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-budget", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["financial-report", selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsBudgetModalOpen(false);
    },
  });

  // Delete Expense Mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      queryClient.invalidateQueries({ queryKey: ["spending-trends"] });
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      setExpenseToDelete(null);
    },
  });

  const handleOpenBudgetModal = () => {
    if (budgetData) {
      setIncomesForm(budgetData.incomes || []);
      setCategoriesForm(budgetData.categoryBudgets || []);
      setSavingsTargetForm(budgetData.savingsTarget || 0);
      setBudgetNotesForm(budgetData.notes || "");
    }
    setIsBudgetModalOpen(true);
  };

  const handleAddIncomeRow = () => {
    setIncomesForm([...incomesForm, { sourceName: "", amount: 0, isSalary: false }]);
  };

  const handleAddCategoryRow = () => {
    setCategoriesForm([...categoriesForm, { categoryName: "", allocatedAmount: 0 }]);
  };

  // Month navigation helper
  const navigateMonth = (direction: -1 | 1) => {
    const [yStr, mStr] = selectedMonth.split("-");
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + direction;
    if (m === 0) {
      m = 12;
      y -= 1;
    } else if (m === 13) {
      m = 1;
      y += 1;
    }
    setSelectedMonth(`${y}-${String(m).padStart(2, "0")}`);
  };

  // Day navigation helper
  const navigateDay = (direction: -1 | 1) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    const newDateStr = d.toISOString().slice(0, 10);
    setSelectedDate(newDateStr);
    setSelectedMonth(newDateStr.slice(0, 7));
  };

  const allExpenses = expensesData?.expenses || [];
  const rawMonthExpenses = allExpenses.filter((e) =>
    e.targetDate.startsWith(selectedMonth)
  );

  // Filter according to active timeView:
  let timeScopedExpenses = rawMonthExpenses;
  if (timeView === "DAY") {
    timeScopedExpenses = allExpenses.filter((e) => e.targetDate === selectedDate);
  } else if (timeView === "WEEK") {
    timeScopedExpenses = rawMonthExpenses.filter((e) => {
      const dayNum = parseInt(e.targetDate.slice(8, 10), 10);
      if (selectedWeek === 1) return dayNum >= 1 && dayNum <= 7;
      if (selectedWeek === 2) return dayNum >= 8 && dayNum <= 14;
      if (selectedWeek === 3) return dayNum >= 15 && dayNum <= 21;
      if (selectedWeek === 4) return dayNum >= 22 && dayNum <= 28;
      return dayNum >= 29;
    });
  }

  // Calculate dynamic category distribution for active time view
  const timeScopedTotalSpent = timeScopedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const dynamicCatMap = new Map<string, number>();
  for (const exp of timeScopedExpenses) {
    const c = (exp.category || "MISCELLANEOUS").trim().toUpperCase();
    dynamicCatMap.set(c, (dynamicCatMap.get(c) || 0) + exp.amount);
  }
  const dynamicCategoryDistribution = Array.from(dynamicCatMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: timeScopedTotalSpent > 0 ? Math.round((amount / timeScopedTotalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Then apply category filter (from donut click or dropdown):
  const effectiveCategoryFilter = selectedChartCategory || categoryFilter;
  const displayExpenses = timeScopedExpenses.filter((e) => {
    if (effectiveCategoryFilter === "ALL" || !effectiveCategoryFilter) return true;
    return e.category.trim().toUpperCase() === effectiveCategoryFilter.trim().toUpperCase();
  });

  return (
    <div className="space-y-8 pb-16 font-mono text-xs">
      {/* 1. Header Banner & Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                FINANCIAL INTELLIGENCE
              </h1>
              <p className="text-[#94A3B8]">
                Monthly Income Architecture, Dynamic Category Budgets & Capital Discipline
              </p>
            </div>
          </div>
        </div>

        {/* Time Filter Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day / Week / Month Mode Tabs */}
          <div className="flex items-center rounded-xl bg-[#090A0F] border border-[#1F2435] p-1 text-xs">
            {(["DAY", "WEEK", "MONTH"] as const).map((view) => (
              <button
                key={view}
                onClick={() => setTimeView(view)}
                className={`px-3 py-1 rounded-lg transition-all font-bold cursor-pointer ${
                  timeView === view
                    ? "bg-[#131620] text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-[#64748B] hover:text-white"
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          {/* Conditional Time Navigator based on view */}
          {timeView === "DAY" && (
            <div className="flex items-center rounded-xl bg-[#090A0F] border border-[#1F2435] p-1">
              <button
                onClick={() => navigateDay(-1)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-white transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-white text-xs tracking-wider">
                {selectedDate}
              </span>
              <button
                onClick={() => navigateDay(1)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-white transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {timeView === "WEEK" && (
            <div className="flex items-center rounded-xl bg-[#090A0F] border border-[#1F2435] p-1 text-xs">
              {[1, 2, 3, 4, 5].map((wk) => (
                <button
                  key={wk}
                  onClick={() => setSelectedWeek(wk)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedWeek === wk
                      ? "bg-[#131620] text-purple-400 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                      : "text-[#64748B] hover:text-white"
                  }`}
                >
                  {wk === 1
                    ? "W1 (1-7)"
                    : wk === 2
                    ? "W2 (8-14)"
                    : wk === 3
                    ? "W3 (15-21)"
                    : wk === 4
                    ? "W4 (22-28)"
                    : "W5 (29-End)"}
                </button>
              ))}
            </div>
          )}

          {timeView === "MONTH" && (
            <div className="flex items-center rounded-xl bg-[#090A0F] border border-[#1F2435] p-1">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-white transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-white text-xs tracking-wider">
                {selectedMonth}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-white transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleOpenBudgetModal}
            className="px-3.5 py-2 rounded-xl bg-[#131620] border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>PLAN BUDGET</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-[#090A0F] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>LOG EXPENSE</span>
          </button>
        </div>
      </div>

      {/* 2. Top Overview HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Actual Income */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-[#94A3B8]">
            <span>MONTHLY INCOME</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              ₹{(overview?.totalIncome || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#64748B]">
            {overview?.incomesCount || 1} active income stream(s)
          </div>
        </div>

        {/* Total Actual Expenses */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-[#94A3B8]">
            <span>TOTAL EXPENDITURES</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              ₹{(overview?.totalExpenses || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#64748B]">
            Budgeted: ₹{(overview?.totalBudget || 0).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Net Savings & Savings Rate */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-[#94A3B8]">
            <span>NET CAPITAL SAVINGS</span>
            <Wallet className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                (overview?.netSavings || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              ₹{(overview?.netSavings || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#64748B]">
            Savings Rate:{" "}
            <strong className={(overview?.savingsRate || 0) >= 20 ? "text-emerald-400" : "text-amber-400"}>
              {overview?.savingsRate || 0}%
            </strong>
          </div>
        </div>

        {/* Budget Utilization & Remaining */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-[#94A3B8]">
            <span>BUDGET UTILIZATION</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {overview?.budgetUtilization || 0}%
            </span>
            <span className="text-xs text-[#64748B]">used</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5">
            <div className="w-full h-1.5 rounded-full bg-[#1F2435] overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  (overview?.budgetUtilization || 0) > 100
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    : "bg-[#00F0FF]"
                }`}
                style={{ width: `${Math.min(100, overview?.budgetUtilization || 0)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
              <span>Remaining: ₹{(overview?.remainingBudget || 0).toLocaleString("en-IN")}</span>
              <span>Target: ₹{(overview?.savingsTarget || 0).toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category-Wise Budget Adherence & Progress */}
      <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
              CATEGORY-WISE BUDGET ADHERENCE
            </h2>
            <p className="text-[#94A3B8] text-[11px] mt-0.5">
              Live comparison of planned allocations versus actual expenditures for {selectedMonth}
            </p>
          </div>
          <button
            onClick={handleOpenBudgetModal}
            className="text-[11px] text-[#00F0FF] hover:underline cursor-pointer"
          >
            Adjust Allocations
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.categories && overview.categories.length > 0 ? (
            overview.categories.map((cat) => {
              const CatIcon = getCategoryIcon(cat.category);
              return (
                <div
                  key={cat.category}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    cat.isOverbudget
                      ? "bg-rose-950/20 border-rose-500/50 text-rose-200"
                      : "bg-[#090A0F] border-[#1F2435] text-[#94A3B8]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#131620] border border-[#1F2435] text-[#00F0FF] shrink-0">
                        <CatIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white text-xs">
                        {formatCategoryLabel(cat.category)}
                      </span>
                      {cat.isOverbudget && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 border border-rose-500 text-rose-400">
                          OVERBUDGET
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white font-bold">
                      ₹{cat.actual.toLocaleString("en-IN")}{" "}
                      <span className="font-normal text-[#64748B]">
                        / ₹{cat.budgeted.toLocaleString("en-IN")}
                      </span>
                    </span>
                  </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#1F2435] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cat.isOverbudget ? "bg-rose-500" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, cat.percentUsed)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span>
                    Remaining:{" "}
                    <strong className={cat.remaining >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      ₹{cat.remaining.toLocaleString("en-IN")}
                    </strong>
                  </span>
                  <span>{cat.percentUsed}% utilized</span>
                </div>
              </div>
            );
          })
          ) : (
            <div className="py-8 text-center text-[#64748B] col-span-2">
              No budget categories configured yet for this month.
            </div>
          )}
        </div>
      </div>

      {/* 4. Daily Spending Bar Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Spending Bars */}
        <div className="lg:col-span-2 hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                DAILY EXPENDITURE VELOCITY
              </h2>
              <p className="text-[11px] text-[#94A3B8]">Day-by-day spending pattern in {selectedMonth}</p>
            </div>
            {analytics?.highestSpendingDay && (
              <span className="text-[10px] text-[#64748B]">
                Peak: Day {analytics.highestSpendingDay.date.slice(8)} (₹{analytics.highestSpendingDay.amount.toLocaleString("en-IN")})
              </span>
            )}
          </div>

          {/* SVG Bar Chart */}
          <div className="h-48 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#1F2435" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#1F2435" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1F2435" />

              {analytics &&
                (() => {
                  const days = analytics.dailySpending;
                  const maxAmt = Math.max(1000, ...days.map((d) => d.amount));
                  const barWidth = 500 / days.length - 3;

                  return days.map((d, i) => {
                    const barHeight = (d.amount / maxAmt) * 100;
                    const x = i * (500 / days.length) + 1.5;
                    const y = 120 - barHeight;

                    return (
                      <g key={d.day}>
                        <rect
                          x={x}
                          y={y}
                          width={Math.max(2, barWidth)}
                          height={barHeight}
                          rx="2"
                          fill={d.amount > 0 ? (d.amount > maxAmt * 0.7 ? "#FF2A55" : "#10B981") : "#1F2435"}
                        />
                        {/* Show day labels for every 5 days */}
                        {d.day % 5 === 0 && (
                          <text x={x + barWidth / 2} y="134" fill="#64748B" fontSize="8" textAnchor="middle">
                            {d.day}
                          </text>
                        )}
                      </g>
                    );
                  });
                })()}
            </svg>
          </div>
        </div>

        {/* Dynamic Category Donut Chart */}
        <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
          <div className="pb-3 border-b border-[#1F2435] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                CATEGORY DISTRIBUTION
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                {timeView === "DAY"
                  ? `Day: ${selectedDate}`
                  : timeView === "WEEK"
                  ? `Week ${selectedWeek} of ${selectedMonth}`
                  : `Full Month: ${selectedMonth}`}
              </p>
            </div>
            {selectedChartCategory && (
              <button
                onClick={() => setSelectedChartCategory(null)}
                className="text-[10px] text-[#00F0FF] hover:underline cursor-pointer"
              >
                Clear Slice
              </button>
            )}
          </div>

          <FinancialDonutChart
            distribution={dynamicCategoryDistribution}
            totalAmount={timeScopedTotalSpent}
            selectedCategory={selectedChartCategory}
            onSelectCategory={(cat) => setSelectedChartCategory(cat)}
          />
        </div>
      </div>

      {/* Overspending Insights Directly Below Expenditure Velocity Graph */}
      <div className="hud-card p-6 rounded-2xl border border-[#1F2435]">
        <OverspendingInsightsPanel
          categories={overview?.categories}
          totalExpenses={overview?.totalExpenses || 0}
          totalBudget={overview?.totalBudget || 0}
        />
      </div>

      {/* 5. Monthly Financial Report & Automated Insights */}
      {report && (
        <div className="hud-card p-6 sm:p-7 rounded-2xl border border-[#00F0FF]/30 bg-[#131620]/60 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00F0FF]" />
                EXECUTIVE FINANCIAL INTELLIGENCE REPORT &mdash; {selectedMonth}
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Audited calculations comparing {selectedMonth} with preceding period ({report.previousMonth})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {report.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-1.5 shrink-0" />
                <span className="text-[#E2E8F0] leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Transaction Ledger Table */}
      <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2435]">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              TRANSACTIONS LEDGER ({displayExpenses.length})
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              {timeView === "DAY"
                ? `Showing expenditures for ${selectedDate}`
                : timeView === "WEEK"
                ? `Showing Week ${selectedWeek} records for ${selectedMonth}`
                : `Canonical audit records for ${selectedMonth}`}
              {effectiveCategoryFilter !== "ALL" && effectiveCategoryFilter && (
                <span className="text-[#00F0FF] ml-1 font-bold">
                  [{formatCategoryLabel(effectiveCategoryFilter)}]
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#090A0F] border border-[#1F2435]">
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <select
                value={effectiveCategoryFilter || "ALL"}
                onChange={(e) => {
                  setSelectedChartCategory(null);
                  setCategoryFilter(e.target.value);
                }}
                className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#090A0F] text-white">All Categories</option>
                {STANDARD_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-[#090A0F] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-emerald-500 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1F2435] text-[#64748B]">
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">CATEGORY</th>
                <th className="py-2.5 px-3">DESCRIPTION</th>
                <th className="py-2.5 px-3 text-right">AMOUNT</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2435]/40 text-[#94A3B8]">
              {displayExpenses.length > 0 ? (
                displayExpenses.map((exp) => (
                  <tr key={exp._id.toString()} className="hover:bg-[#131620]/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{exp.targetDate}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#131620] border border-[#1F2435] text-[#00F0FF]">
                        {formatCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white">{exp.description}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      ₹{exp.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="p-1 rounded text-[#64748B] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#64748B]">
                    No transactions matching the active time window and category filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Add Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["expenses"] });
          queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
          queryClient.invalidateQueries({ queryKey: ["spending-trends"] });
          queryClient.invalidateQueries({ queryKey: ["financial-report"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
        }}
      />

      {/* 2. Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpenseMutation.mutate(expenseToDelete._id.toString());
          }
        }}
        title="DELETE EXPENSE TRANSACTION"
        itemName={expenseToDelete?.description || "Expense"}
        description="Are you sure you want to delete this financial ledger record?"
        warningText="Deleting this transaction will update your daily protocol audit and monthly spending reports."
        isPending={deleteExpenseMutation.isPending}
      />

      {/* 3. Monthly Budget Planning Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl hud-card p-6 rounded-2xl border border-[#00F0FF]/30 shadow-2xl font-mono text-xs space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00F0FF]" />
                CONFIGURE MONTHLY BUDGET &mdash; {selectedMonth}
              </h3>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-[#64748B] hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Incomes Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase text-[11px]">
                  1. Income Streams (Multiple Sources)
                </span>
                <button
                  type="button"
                  onClick={handleAddIncomeRow}
                  className="text-[#00F0FF] hover:underline text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Source
                </button>
              </div>

              <div className="space-y-2">
                {incomesForm.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Source name (e.g. Salary, Freelance)"
                      value={inc.sourceName}
                      onChange={(e) => {
                        const copy = [...incomesForm];
                        copy[i].sourceName = e.target.value;
                        setIncomesForm(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1.5 text-[#64748B]">₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={inc.amount}
                        onChange={(e) => {
                          const copy = [...incomesForm];
                          copy[i].amount = parseFloat(e.target.value) || 0;
                          setIncomesForm(copy);
                        }}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>
                    {incomesForm.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setIncomesForm(incomesForm.filter((_, idx) => idx !== i))}
                        className="text-[#64748B] hover:text-rose-400 p-1 cursor-pointer"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Budgets Section */}
            <div className="space-y-3 pt-2 border-t border-[#1F2435]">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase text-[11px]">
                  2. Category Budget Allocations
                </span>
                <button
                  type="button"
                  onClick={handleAddCategoryRow}
                  className="text-[#00F0FF] hover:underline text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Category
                </button>
              </div>

              <div className="space-y-2">
                <datalist id="standard-budget-categories">
                  {STANDARD_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} (Default: ₹{c.defaultBudget.toLocaleString("en-IN")})
                    </option>
                  ))}
                </datalist>

                {categoriesForm.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1 flex flex-col">
                      <input
                        type="text"
                        list="standard-budget-categories"
                        placeholder="Category (e.g. FOOD, RENT, ELECTRICITY_BILL)"
                        value={cat.categoryName}
                        onChange={(e) => {
                          const copy = [...categoriesForm];
                          copy[i].categoryName = e.target.value.toUpperCase();
                          setCategoriesForm(copy);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                      />
                      {cat.categoryName && (
                        <span className="text-[10px] text-[#64748B] mt-0.5 pl-1">
                          {formatCategoryLabel(cat.categoryName)}
                        </span>
                      )}
                    </div>
                    <div className="relative w-32 shrink-0">
                      <span className="absolute left-2.5 top-1.5 text-[#64748B]">₹</span>
                      <input
                        type="number"
                        placeholder="Limit"
                        value={cat.allocatedAmount}
                        onChange={(e) => {
                          const copy = [...categoriesForm];
                          copy[i].allocatedAmount = parseFloat(e.target.value) || 0;
                          setCategoriesForm(copy);
                        }}
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                      />
                    </div>
                    {categoriesForm.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setCategoriesForm(categoriesForm.filter((_, idx) => idx !== i))}
                        className="text-[#64748B] hover:text-rose-400 p-1 cursor-pointer shrink-0"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Target Section */}
            <div className="pt-2 border-t border-[#1F2435]">
              <label className="block text-[#94A3B8] mb-1">Monthly Savings Target (₹)</label>
              <input
                type="number"
                value={savingsTargetForm}
                onChange={(e) => setSavingsTargetForm(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-[#1F2435] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saveBudgetMutation.isPending}
                onClick={() =>
                  saveBudgetMutation.mutate({
                    month: selectedMonth,
                    incomes: incomesForm.filter((inc) => inc.sourceName.trim() && inc.amount > 0),
                    categoryBudgets: categoriesForm.filter(
                      (cat) => cat.categoryName.trim() && cat.allocatedAmount > 0
                    ),
                    savingsTarget: savingsTargetForm,
                    notes: budgetNotesForm,
                  })
                }
                className="px-5 py-2 rounded-lg bg-[#00F0FF] text-[#090A0F] font-bold hover:bg-[#00F0FF]/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {saveBudgetMutation.isPending ? "Saving..." : "Save Monthly Budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
