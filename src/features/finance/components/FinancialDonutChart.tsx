"use client";

import { useState } from "react";
import { formatCategoryLabel } from "../constants/categories";

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface FinancialDonutChartProps {
  distribution: CategoryData[];
  totalAmount: number;
  title?: string;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
}

// Fallback palette if categories don't match standard
const PALETTE = [
  "#10B981", // Emerald (Food)
  "#00F0FF", // Cyan (Rent)
  "#F59E0B", // Amber (EB)
  "#8A2BE2", // Purple (Home Support)
  "#38BDF8", // Sky (Travelling)
  "#EC4899", // Pink (Personal)
  "#64748B", // Slate (Misc)
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

export default function FinancialDonutChart({
  distribution = [],
  totalAmount = 0,
  title = "EXPENDITURE BREAKDOWN",
  selectedCategory,
  onSelectCategory,
}: FinancialDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeSlices = distribution.filter((d) => d.amount > 0);

  // SVG parameters
  const size = 260;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="space-y-4 font-mono">
      {/* SVG Donut Visual */}
      <div className="relative flex items-center justify-center py-2">
        {activeSlices.length > 0 && totalAmount > 0 ? (
          <div className="relative w-[240px] h-[240px]">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox={`0 0 ${size} ${size}`}
            >
              {activeSlices.map((slice, idx) => {
                const slicePercent = (slice.amount / totalAmount) * 100;
                const strokeDasharray = `${(slicePercent / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += slicePercent;

                const color = PALETTE[idx % PALETTE.length];
                const isHovered = hoveredIdx === idx;
                const isSelected = selectedCategory === slice.category;

                return (
                  <circle
                    key={slice.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={isHovered || isSelected ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(
                          isSelected ? null : slice.category
                        );
                      }
                    }}
                  />
                );
              })}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">
                {hoveredIdx !== null
                  ? formatCategoryLabel(activeSlices[hoveredIdx].category)
                  : "TOTAL SPENT"}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                ₹
                {(hoveredIdx !== null
                  ? activeSlices[hoveredIdx].amount
                  : totalAmount
                ).toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#00F0FF] font-bold mt-0.5">
                {hoveredIdx !== null
                  ? `${activeSlices[hoveredIdx].percentage}% of total`
                  : `${activeSlices.length} Categories`}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-[220px] h-[220px] rounded-full border-4 border-[#1F2435] border-dashed flex flex-col items-center justify-center text-center p-4">
            <span className="text-xs text-[#64748B]">No expenses recorded</span>
            <span className="text-[10px] text-[#475569] mt-1">₹0.00 spent</span>
          </div>
        )}
      </div>

      {/* Category Legend with Amounts & Percentages */}
      <div className="space-y-2 pt-2 border-t border-[#1F2435]">
        {activeSlices.length > 0 ? (
          activeSlices.map((cat, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const isHovered = hoveredIdx === idx;
            const isSelected = selectedCategory === cat.category;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => {
                  if (onSelectCategory) {
                    onSelectCategory(isSelected ? null : cat.category);
                  }
                }}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isSelected || isHovered
                    ? "bg-[#131620] border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                    : "bg-[#090A0F] border-[#1F2435]/60 hover:border-[#1F2435]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-bold text-white text-[11px]">
                    {formatCategoryLabel(cat.category)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#00F0FF]">
                    ₹{cat.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-[#64748B] w-9 text-right font-normal">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-xs text-[#64748B] py-3">
            No category distribution to display.
          </div>
        )}
      </div>
    </div>
  );
}
