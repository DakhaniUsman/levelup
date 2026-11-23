"use client";

import { AlertTriangle, ShieldCheck, AlertCircle, TrendingUp } from "lucide-react";
import { CategoryComparison } from "../services/financial-analytics.service";
import { formatCategoryLabel } from "../constants/categories";

interface OverspendingInsightsPanelProps {
  categories: CategoryComparison[] | undefined;
  totalExpenses: number;
  totalBudget: number;
}

export default function OverspendingInsightsPanel({
  categories = [],
  totalExpenses,
  totalBudget,
}: OverspendingInsightsPanelProps) {
  const overbudgetCategories = categories.filter((c) => c.isOverbudget);
  const nearLimitCategories = categories.filter(
    (c) => !c.isOverbudget && c.percentUsed >= 80 && c.budgeted > 0
  );

  const isTotalOverbudget = totalBudget > 0 && totalExpenses > totalBudget;

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#1F2435]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>CAPITAL DISCIPLINE &amp; OVERSPENDING INTELLIGENCE</span>
        </h3>
        <span className="text-[10px] text-[#64748B]">
          {overbudgetCategories.length > 0
            ? `${overbudgetCategories.length} Overbudget Breach(es)`
            : "Disciplined"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Total Budget Warning if applicable */}
        {isTotalOverbudget && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/60 text-xs text-rose-300 flex items-start gap-3 shadow-[0_0_15px_rgba(244,63,94,0.2)] md:col-span-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold uppercase tracking-wider text-rose-200">
                TOTAL MONTHLY EXPENDITURES EXCEEDED
              </span>
              <p className="text-[11px] text-rose-300/90 mt-0.5">
                Total spent (₹{totalExpenses.toLocaleString("en-IN")}) has breached the master monthly budget of ₹{totalBudget.toLocaleString("en-IN")} by ₹{(totalExpenses - totalBudget).toLocaleString("en-IN")}.
              </p>
            </div>
          </div>
        )}

        {/* Overbudget Categories */}
        {overbudgetCategories.map((cat) => {
          const excess = cat.actual - cat.budgeted;
          return (
            <div
              key={cat.category}
              className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase">
                    {formatCategoryLabel(cat.category)}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900 border border-rose-500 text-rose-300 font-bold">
                    +{excess.toLocaleString("en-IN")} EXCESS
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Spent ₹{cat.actual.toLocaleString("en-IN")} against ₹{cat.budgeted.toLocaleString("en-IN")} budget ({cat.percentUsed}% utilized).
                </p>
              </div>
            </div>
          );
        })}

        {/* Near Limit Categories (80% - 99%) */}
        {nearLimitCategories.map((cat) => (
          <div
            key={cat.category}
            className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white uppercase">
                  {formatCategoryLabel(cat.category)}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/60 border border-amber-500 text-amber-300 font-bold">
                  {cat.percentUsed}% USED
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Only ₹{cat.remaining.toLocaleString("en-IN")} remaining before breach. Exercise spending restraint.
              </p>
            </div>
          </div>
        ))}

        {/* Clean status if no breaches */}
        {overbudgetCategories.length === 0 && nearLimitCategories.length === 0 && !isTotalOverbudget && (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-3 md:col-span-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All expense categories are strictly within approved monthly capital allocations.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
