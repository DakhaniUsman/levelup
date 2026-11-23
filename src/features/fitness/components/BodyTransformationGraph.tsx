"use client";

import { useState } from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  Scale,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { IBodyWeight } from "@/models/BodyWeight";
import { WeightStats } from "../services/body-weight.service";

interface BodyTransformationGraphProps {
  weightData: WeightStats | undefined;
  isLoading: boolean;
  activeRange: string;
  onRangeChange: (range: string) => void;
  onOpenLogModal: () => void;
  onOpenProfileModal: () => void;
}

const RANGES = [
  { label: "7 Days", value: "7D" },
  { label: "30 Days", value: "30D" },
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "1 Year", value: "1Y" },
  { label: "All Time", value: "ALL" },
];

export default function BodyTransformationGraph({
  weightData,
  isLoading,
  activeRange,
  onRangeChange,
  onOpenLogModal,
  onOpenProfileModal,
}: BodyTransformationGraphProps) {
  const [hoveredPoint, setHoveredPoint] = useState<IBodyWeight | null>(null);

  const startWeight = weightData?.startingWeight || 51;
  const currentWeight = weightData?.currentWeight || startWeight;
  const targetWeight = weightData?.targetWeight || 65;
  const progressPercent = weightData?.progressPercent || 0;
  const weightGained = weightData?.weightGained || 0;
  const remainingKg = weightData?.remainingKg ?? Math.max(0, targetWeight - currentWeight);
  const timeElapsed = weightData?.timeElapsedDays || 1;
  const weeklyChange = weightData?.weeklyChange || 0;

  const history = weightData?.history || [];

  return (
    <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-6 font-mono">
      {/* Top Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <Scale className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              BODY TRANSFORMATION ENGINE
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              51kg &rarr; 65kg JOURNEY
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Tracking exact weight gains, progression trajectory, and target attainment rate
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time range pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090A0F] border border-[#1F2435] text-xs">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => onRangeChange(r.value)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-bold cursor-pointer ${
                  activeRange === r.value
                    ? "bg-[#131620] text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_8px_rgba(0,240,255,0.25)]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenLogModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-[#090A0F] hover:bg-[#00F0FF]/90 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            + Log Weight
          </button>
        </div>
      </div>

      {/* Growth Insights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
          <span className="text-[10px] text-[#64748B] uppercase">Baseline Start</span>
          <div className="text-lg font-bold text-slate-300 mt-0.5">{startWeight} kg</div>
          <span className="text-[9px] text-[#64748B]">Initial measurement</span>
        </div>

        <div className="p-3 rounded-xl bg-[#090A0F] border border-[#00F0FF]/30">
          <span className="text-[10px] text-[#00F0FF] uppercase">Current Weight</span>
          <div className="text-lg font-bold text-[#00F0FF] mt-0.5">{currentWeight} kg</div>
          <span className="text-[9px] text-[#94A3B8]">
            {weightGained >= 0 ? `+${weightGained}` : weightGained} kg net delta
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#090A0F] border border-amber-500/30">
          <span className="text-[10px] text-amber-400 uppercase">Target Objective</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">{targetWeight} kg</div>
          <button
            onClick={onOpenProfileModal}
            className="text-[9px] text-[#00F0FF] hover:underline cursor-pointer"
          >
            Edit Goal
          </button>
        </div>

        <div className="p-3 rounded-xl bg-[#090A0F] border border-emerald-500/30">
          <span className="text-[10px] text-emerald-400 uppercase">Goal Attainment</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">{progressPercent}%</div>
          <span className="text-[9px] text-[#94A3B8]">{remainingKg} kg remaining</span>
        </div>

        <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
          <span className="text-[10px] text-[#64748B] uppercase">Weekly Delta</span>
          <div
            className={`text-lg font-bold mt-0.5 ${
              weeklyChange >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {weeklyChange >= 0 ? `+${weeklyChange}` : weeklyChange} kg
          </div>
          <span className="text-[9px] text-[#64748B]">Last 7-day rate</span>
        </div>

        <div className="p-3 rounded-xl bg-[#090A0F] border border-[#1F2435]">
          <span className="text-[10px] text-[#64748B] uppercase">Journey Elapsed</span>
          <div className="text-lg font-bold text-purple-400 mt-0.5">{timeElapsed} Days</div>
          <span className="text-[9px] text-[#64748B]">Consistency streak</span>
        </div>
      </div>

      {/* Pure SVG Transformation Graph */}
      <div className="p-5 rounded-2xl bg-[#090A0F] border border-[#1F2435] relative">
        <div className="flex justify-between items-center text-xs text-[#94A3B8] mb-3">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
            WEIGHT PROGRESSION CURVE & TARGET TRAJECTORY
          </span>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1 text-[#00F0FF]">
              <span className="w-2.5 h-0.5 bg-[#00F0FF]" /> Measured Weight
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 border-b border-dashed" /> Target (65kg)
            </span>
            <span className="flex items-center gap-1 text-[#64748B]">
              <span className="w-2.5 h-0.5 bg-[#64748B] border-b border-dashed" /> Baseline (51kg)
            </span>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="h-64 w-full relative pt-2">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {(() => {
                // Determine scale boundaries
                const minScale = Math.min(startWeight - 2, ...history.map((h) => h.weightKg));
                const maxScale = Math.max(targetWeight + 2, ...history.map((h) => h.weightKg));
                const range = maxScale - minScale || 1;

                const getY = (val: number) => {
                  return 190 - ((val - minScale) / range) * 160;
                };

                const targetY = getY(targetWeight);
                const startY = getY(startWeight);

                const points = history.map((entry, idx) => {
                  const x =
                    history.length === 1
                      ? 300
                      : (idx / (history.length - 1)) * 560 + 20;
                  const y = getY(entry.weightKg);
                  return { x, y, entry };
                });

                const linePath = points
                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                  .join(" ");

                const areaPath =
                  points.length > 0
                    ? `${linePath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
                    : "";

                return (
                  <>
                    {/* Horizontal Grid lines */}
                    <line x1="10" y1="30" x2="590" y2="30" stroke="#1F2435" strokeDasharray="3 3" />
                    <line x1="10" y1="110" x2="590" y2="110" stroke="#1F2435" strokeDasharray="3 3" />
                    <line x1="10" y1="190" x2="590" y2="190" stroke="#1F2435" />

                    {/* Target Reference Line: 65 kg */}
                    <line
                      x1="10"
                      y1={targetY}
                      x2="590"
                      y2={targetY}
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <text
                      x="590"
                      y={targetY - 5}
                      fill="#F59E0B"
                      fontSize="9"
                      textAnchor="end"
                      fontWeight="bold"
                    >
                      TARGET: {targetWeight} kg
                    </text>

                    {/* Starting Reference Line: 51 kg */}
                    <line
                      x1="10"
                      y1={startY}
                      x2="590"
                      y2={startY}
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="20"
                      y={startY + 12}
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      START: {startWeight} kg
                    </text>

                    {/* Area under curve */}
                    {areaPath && <path d={areaPath} fill="url(#weightAreaGrad)" />}

                    {/* Weight Curve Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Points */}
                    {points.map((p, idx) => {
                      const isHovered = hoveredPoint?._id === p.entry._id;
                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredPoint(p.entry)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? "6" : "4"}
                            fill={isHovered ? "#FFFFFF" : "#00F0FF"}
                            stroke="#090A0F"
                            strokeWidth="2"
                          />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            fill={isHovered ? "#FFFFFF" : "#00F0FF"}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {p.entry.weightKg}kg
                          </text>
                          <text
                            x={p.x}
                            y="205"
                            fill="#64748B"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {p.entry.date.slice(5)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div className="py-16 text-center text-[#64748B] text-xs space-y-2">
            <p>No body weight measurements recorded within this time window.</p>
            <button
              onClick={onOpenLogModal}
              className="text-[#00F0FF] hover:underline font-bold"
            >
              Log your initial body weight now &rarr;
            </button>
          </div>
        )}

        {/* Floating Tooltip details if hovered */}
        {hoveredPoint && (
          <div className="mt-3 p-3 rounded-xl bg-[#131620] border border-[#00F0FF]/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">
                Recorded: {hoveredPoint.date}
              </span>
              <span className="text-[#00F0FF] font-bold">
                {hoveredPoint.weightKg} kg
              </span>
              {hoveredPoint.recordedAt && (
                <span className="text-[#64748B] text-[10px]">
                  Time: {new Date(hoveredPoint.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            {hoveredPoint.notes && (
              <span className="text-slate-300 italic text-[11px]">
                &quot;{hoveredPoint.notes}&quot;
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
