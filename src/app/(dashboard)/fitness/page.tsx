"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Dumbbell,
  TrendingUp,
  Scale,
  Flame,
  Plus,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Loader2,
  Target,
  ChevronDown,
} from "lucide-react";
import { IWorkout } from "@/models/Workout";
import { IBodyWeight } from "@/models/BodyWeight";
import {
  FitnessOverviewStats,
  ExerciseProgressionData,
} from "@/features/fitness/services/fitness-analytics.service";
import { WeightStats } from "@/features/fitness/services/body-weight.service";
import WorkoutLoggerModal from "@/features/workouts/components/WorkoutLoggerModal";
import WorkoutHistoryModal from "@/features/workouts/components/WorkoutHistoryModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import BodyTransformationGraph from "@/features/fitness/components/BodyTransformationGraph";

export default function FitnessTransformationPage() {
  const queryClient = useQueryClient();

  // Modals & form state
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState<IWorkout | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<IWorkout | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Filter & selection states
  const [selectedSplit, setSelectedSplit] = useState<"ALL" | "PUSH" | "PULL" | "LEGS">("ALL");
  const [selectedExercise, setSelectedExercise] = useState<string>("Dumbbell Bench Press");
  const [weightRange, setWeightRange] = useState<string>("ALL");
  const [weightInput, setWeightInput] = useState<string>("");
  const [weightNotes, setWeightNotes] = useState<string>("");
  const [startingWeightInput, setStartingWeightInput] = useState<string>("51");
  const [targetWeightInput, setTargetWeightInput] = useState<string>("65");

  // 1. Fetch Overview Analytics & Exercise Catalog
  const { data: analyticsData, isLoading: isOverviewLoading } = useQuery<{
    stats: FitnessOverviewStats;
    exercises: string[];
  }>({
    queryKey: ["fitness-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/fitness/analytics");
      const json = await res.json();
      return json.data;
    },
  });

  // 2. Fetch Selected Exercise Progression
  const { data: progressionData, isLoading: isProgressionLoading } = useQuery<ExerciseProgressionData>({
    queryKey: ["exercise-progression", selectedExercise],
    queryFn: async () => {
      const res = await fetch(
        `/api/fitness/exercises/progression?exercise=${encodeURIComponent(selectedExercise)}`
      );
      const json = await res.json();
      return json.data;
    },
    enabled: !!selectedExercise,
  });

  // 3. Fetch Weight History & Transformation Stats
  const { data: weightData, isLoading: isWeightLoading } = useQuery<WeightStats>({
    queryKey: ["body-weight", weightRange],
    queryFn: async () => {
      const res = await fetch(`/api/fitness/weight?range=${weightRange}`);
      const json = await res.json();
      return json.data;
    },
  });

  // 4. Fetch All Historical Workouts
  const { data: workouts = [], isLoading: isWorkoutsLoading } = useQuery<IWorkout[]>({
    queryKey: ["workouts"],
    queryFn: async () => {
      const res = await fetch("/api/workouts?limit=50");
      const json = await res.json();
      return json.data;
    },
  });

  // Mutations
  const logWeightMutation = useMutation({
    mutationFn: async (payload: { weightKg: number; notes: string }) => {
      const res = await fetch("/api/fitness/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsWeightModalOpen(false);
      setWeightInput("");
      setWeightNotes("");
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: { startingWeightKg: number; targetWeightKg: number }) => {
      const res = await fetch("/api/fitness/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setIsProfileModalOpen(false);
    },
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workouts/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["fitness-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-progression"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      setWorkoutToDelete(null);
    },
  });

  const deleteWeightMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/fitness/weight/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body-weight"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const stats = analyticsData?.stats;
  const exercises = analyticsData?.exercises || [];
  const filteredWorkouts =
    selectedSplit === "ALL"
      ? workouts
      : workouts.filter((w) => w.split === selectedSplit);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                FITNESS & BODY TRANSFORMATION
              </h1>
              <p className="text-xs text-[#94A3B8] font-mono">
                Push / Pull / Legs Frequency, 1RM Strength Progression & Body Weight Tracker
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setWorkoutToEdit(null);
              setIsLoggerOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>LOG WORKOUT</span>
          </button>
          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#131620] border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.15)]"
          >
            <Scale className="w-4 h-4" />
            <span>LOG WEIGHT</span>
          </button>
        </div>
      </div>

      {/* 2. Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Workouts This Month */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-xs text-[#94A3B8]">
            <span>SESSIONS THIS MONTH</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {stats?.workoutsThisMonth || 0}
            </span>
            <span className="text-xs text-[#64748B]">/ {stats?.totalWorkouts || 0} Lifetime</span>
          </div>
          <div className="mt-2 text-[11px] text-[#94A3B8]">
            Avg: <span className="text-rose-400 font-bold">{stats?.weeklyFrequency || 0}</span> sessions / week
          </div>
        </div>

        {/* Volume This Month */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-xs text-[#94A3B8]">
            <span>TRAINING VOLUME</span>
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#00F0FF]">
              {Math.round(((stats?.totalVolumeThisMonth || 0) / 1000) * 10) / 10}k
            </span>
            <span className="text-xs text-[#64748B]">kg moved</span>
          </div>
          <div className="mt-2 text-[11px] text-[#94A3B8]">
            Lifetime: {((stats?.totalVolumeLifetime || 0) / 1000).toFixed(1)}k kg
          </div>
        </div>

        {/* PR Count */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-xs text-[#94A3B8]">
            <span>PERSONAL RECORDS</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">
              {stats?.totalPRsCount || 0}
            </span>
            <span className="text-xs text-[#64748B]">PR Sets Hit</span>
          </div>
          <div className="mt-2 text-[11px] text-[#94A3B8]">
            Progressive overload confirmed
          </div>
        </div>

        {/* Body Transformation Weight Target */}
        <div className="hud-card p-5 rounded-2xl border border-[#1F2435] bg-[#131620]/70 relative overflow-hidden">
          <div className="flex justify-between items-start text-xs text-[#94A3B8]">
            <span>BODY TRANSFORMATION</span>
            <button
              onClick={() => {
                setStartingWeightInput(String(weightData?.startingWeight || 51));
                setTargetWeightInput(String(weightData?.targetWeight || 65));
                setIsProfileModalOpen(true);
              }}
              className="text-[10px] text-[#00F0FF] hover:underline cursor-pointer"
            >
              Edit Target
            </button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {weightData?.currentWeight || 51} <span className="text-sm font-normal text-[#94A3B8]">kg</span>
            </span>
            <span className="text-xs text-[#00F0FF]">
              &rarr; {weightData?.targetWeight || 65} kg
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5">
            <div className="w-full h-1.5 rounded-full bg-[#1F2435] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00F0FF] to-emerald-400 transition-all duration-500"
                style={{ width: `${weightData?.progressPercent || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
              <span>{weightData?.weightGained && weightData.weightGained > 0 ? `+${weightData.weightGained} kg` : "0 kg"}</span>
              <span>{weightData?.progressPercent || 0}% to target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PPL Analytics & Muscle Group Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* PPL Split Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                PPL DISTRIBUTION
              </h2>
            </div>

            <div className="space-y-3">
              {/* Push */}
              <div className="p-3.5 rounded-xl bg-[#090A0F] border border-rose-900/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-300">PUSH (Chest / Shoulders / Triceps)</span>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {stats?.pplBreakdown.PUSH.sessions || 0} sessions &bull;{" "}
                    {Math.round(((stats?.pplBreakdown.PUSH.totalVolume || 0) / 1000) * 10) / 10}k kg
                  </p>
                </div>
                <span className="text-xs text-[#94A3B8]">
                  {stats?.pplBreakdown.PUSH.lastSessionDate || "No data"}
                </span>
              </div>

              {/* Pull */}
              <div className="p-3.5 rounded-xl bg-[#090A0F] border border-[#0088FF]/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0088FF]">PULL (Back / Biceps)</span>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {stats?.pplBreakdown.PULL.sessions || 0} sessions &bull;{" "}
                    {Math.round(((stats?.pplBreakdown.PULL.totalVolume || 0) / 1000) * 10) / 10}k kg
                  </p>
                </div>
                <span className="text-xs text-[#94A3B8]">
                  {stats?.pplBreakdown.PULL.lastSessionDate || "No data"}
                </span>
              </div>

              {/* Legs */}
              <div className="p-3.5 rounded-xl bg-[#090A0F] border border-emerald-900/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400">LEGS (Quads / Hams / Calves)</span>
                  <p className="text-[10px] text-[#64748B] mt-0.5">
                    {stats?.pplBreakdown.LEGS.sessions || 0} sessions &bull;{" "}
                    {Math.round(((stats?.pplBreakdown.LEGS.totalVolume || 0) / 1000) * 10) / 10}k kg
                  </p>
                </div>
                <span className="text-xs text-[#94A3B8]">
                  {stats?.pplBreakdown.LEGS.lastSessionDate || "No data"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Muscle Group Frequency Grid (2x/week goal) */}
        <div className="lg:col-span-2">
          <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1F2435]">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#00F0FF]" />
                  WEEKLY MUSCLE GROUP COVERAGE (2x/WEEK TARGET)
                </h2>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Calculated from actual workouts in the trailing 7 days
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {stats?.muscleGroupFrequencyWeekly &&
                Object.entries(stats.muscleGroupFrequencyWeekly).map(([muscle, data]) => {
                  const isMet = data.status === "MET";
                  return (
                    <div
                      key={muscle}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isMet
                          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                          : "bg-[#090A0F] border-[#1F2435] text-[#94A3B8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{muscle}</span>
                        {isMet ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-400">
                            {data.count}/2
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">
                        {data.count} <span className="text-xs font-normal text-[#64748B]">/ 2 days</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Exercise-Level Strength Progression Section */}
      <div className="hud-card p-6 sm:p-7 rounded-2xl border border-[#1F2435] space-y-6 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2435]">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00F0FF]" />
              EXERCISE-LEVEL STRENGTH PROGRESSION
            </h2>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Individual set telemetry, estimated 1-Rep Max (1RM) & volume history
            </p>
          </div>

          {/* Exercise Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B]">Exercise:</span>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none cursor-pointer"
            >
              {exercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PR Cards for selected exercise */}
        {progressionData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[11px] text-[#64748B] uppercase">Max Weight PR</span>
              <div className="mt-1 text-2xl font-bold text-white">
                {progressionData.personalRecords.maxWeight.value} kg
              </div>
              <span className="text-[10px] text-[#94A3B8]">
                {progressionData.personalRecords.maxWeight.date || "No PR yet"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#00F0FF]/30">
              <span className="text-[11px] text-[#00F0FF] uppercase">Estimated 1RM PR</span>
              <div className="mt-1 text-2xl font-bold text-[#00F0FF]">
                {progressionData.personalRecords.maxOneRepMax.value} kg
              </div>
              <span className="text-[10px] text-[#94A3B8]">
                {progressionData.personalRecords.maxOneRepMax.date || "Epley formula"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435]">
              <span className="text-[11px] text-[#64748B] uppercase">Max Session Volume PR</span>
              <div className="mt-1 text-2xl font-bold text-amber-400">
                {progressionData.personalRecords.maxVolume.value.toLocaleString()} kg
              </div>
              <span className="text-[10px] text-[#94A3B8]">
                {progressionData.personalRecords.maxVolume.date || "Cumulative sets"}
              </span>
            </div>
          </div>
        )}

        {/* Delta Comparison Alert */}
        {progressionData?.latestDelta && (
          <div className="p-4 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              <span>
                Progress vs Previous Session:{" "}
                <strong className={progressionData.latestDelta.weightDelta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {progressionData.latestDelta.weightDelta >= 0 ? `+${progressionData.latestDelta.weightDelta}` : progressionData.latestDelta.weightDelta} kg weight
                </strong>
                ,{" "}
                <strong className={progressionData.latestDelta.repsDelta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {progressionData.latestDelta.repsDelta >= 0 ? `+${progressionData.latestDelta.repsDelta}` : progressionData.latestDelta.repsDelta} reps
                </strong>
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              Estimated 1RM Delta: {progressionData.latestDelta.oneRepMaxDelta >= 0 ? `+${progressionData.latestDelta.oneRepMaxDelta}` : progressionData.latestDelta.oneRepMaxDelta} kg
            </span>
          </div>
        )}

        {/* Interactive SVG Progression Chart */}
        {progressionData && progressionData.records.length > 0 ? (
          <div className="p-5 rounded-xl bg-[#090A0F] border border-[#1F2435] space-y-3">
            <div className="flex justify-between items-center text-xs text-[#94A3B8]">
              <span>STRENGTH & 1RM PROGRESSION TIMELINE</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" /> Max Weight
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" /> Estimated 1RM
                </span>
              </div>
            </div>

            {/* Pure SVG Line Chart */}
            <div className="h-56 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#1F2435" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1F2435" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#1F2435" strokeDasharray="4 4" />

                {/* Plot points */}
                {(() => {
                  const recs = progressionData.records;
                  if (recs.length === 0) return null;
                  const maxVal = Math.max(...recs.map((r) => Math.max(r.estimatedOneRepMax, r.maxWeightKg, 30)));
                  const minVal = Math.max(0, Math.min(...recs.map((r) => Math.min(r.maxWeightKg, r.estimatedOneRepMax))) - 5);
                  const range = maxVal - minVal || 1;

                  const pointsWeight = recs.map((r, i) => {
                    const x = recs.length === 1 ? 250 : (i / (recs.length - 1)) * 480 + 10;
                    const y = 150 - ((r.maxWeightKg - minVal) / range) * 120;
                    return { x, y, ...r };
                  });

                  const points1RM = recs.map((r, i) => {
                    const x = recs.length === 1 ? 250 : (i / (recs.length - 1)) * 480 + 10;
                    const y = 150 - ((r.estimatedOneRepMax - minVal) / range) * 120;
                    return { x, y, ...r };
                  });

                  const pathWeight = pointsWeight.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const path1RM = points1RM.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

                  return (
                    <>
                      {/* Lines */}
                      <path d={pathWeight} fill="none" stroke="#00F0FF" strokeWidth="2.5" />
                      <path d={path1RM} fill="none" stroke="#8A2BE2" strokeWidth="2.5" strokeDasharray="5 3" />

                      {/* Circles */}
                      {pointsWeight.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#00F0FF" />
                          <text x={p.x} y={p.y - 8} fill="#00F0FF" fontSize="9" textAnchor="middle">
                            {p.maxWeightKg}k
                          </text>
                        </g>
                      ))}

                      {/* Date labels */}
                      {pointsWeight.map((p, i) => (
                        <text key={i} x={p.x} y="172" fill="#64748B" fontSize="9" textAnchor="middle">
                          {p.date.slice(5)}
                        </text>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-[#64748B] text-xs">
            No historical workout sessions recorded yet for &quot;{selectedExercise}&quot;. Log a session above to begin tracking.
          </div>
        )}
      </div>

      {/* 5. Body Weight Transformation History & Graph */}
      <BodyTransformationGraph
        weightData={weightData}
        isLoading={isWeightLoading}
        activeRange={weightRange}
        onRangeChange={(range) => setWeightRange(range)}
        onOpenLogModal={() => setIsWeightModalOpen(true)}
        onOpenProfileModal={() => {
          setStartingWeightInput(String(weightData?.startingWeight || 51));
          setTargetWeightInput(String(weightData?.targetWeight || 65));
          setIsProfileModalOpen(true);
        }}
      />

      <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-5 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-400" />
              RECORDED WEIGHT MEASUREMENT LOGS
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Granular logbook of all verified weigh-ins within selected period ({weightRange})
            </p>
          </div>
          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-bold hover:bg-emerald-950/60 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Weight</span>
          </button>
        </div>

        {/* Weight Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1F2435] text-[#64748B]">
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">MEASURED WEIGHT</th>
                <th className="py-2.5 px-3">NOTES</th>
                <th className="py-2.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2435]/40 text-[#94A3B8]">
              {weightData?.history && weightData.history.length > 0 ? (
                weightData.history.map((entry) => (
                  <tr key={entry._id.toString()} className="hover:bg-[#131620]/50 transition-colors">
                    <td className="py-2.5 px-3 text-white font-bold">{entry.date}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{entry.weightKg} kg</td>
                    <td className="py-2.5 px-3 text-[11px] text-[#64748B]">{entry.notes || "—"}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteWeightMutation.mutate(entry._id.toString())}
                        className="p-1 rounded text-[#64748B] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-[#64748B]">
                    No body weight measurements recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Complete Workout History Table */}
      <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2435]">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-rose-400" />
              WORKOUT LOGBOOK HISTORY
            </h2>
            <p className="text-xs text-[#94A3B8]">
              View, inspect set breakdowns, edit, or delete logged training sessions
            </p>
          </div>

          {/* Split filter tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0F] border border-[#1F2435] text-xs">
            {(["ALL", "PUSH", "PULL", "LEGS"] as const).map((split) => (
              <button
                key={split}
                onClick={() => setSelectedSplit(split)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedSplit === split
                    ? "bg-[#131620] text-[#00F0FF] border border-[#00F0FF]/30 font-bold shadow-[0_0_8px_rgba(0,240,255,0.2)]"
                    : "text-[#64748B] hover:text-white"
                }`}
              >
                {split}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions list */}
        <div className="space-y-3">
          {filteredWorkouts.length === 0 ? (
            <div className="py-12 text-center text-[#64748B] text-xs">
              No workouts matching filter.
            </div>
          ) : (
            filteredWorkouts.map((w) => (
              <div
                key={w._id.toString()}
                className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] hover:border-[#1F2435]/80 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                        w.split === "PUSH"
                          ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                          : w.split === "PULL"
                          ? "bg-[#0088FF]/10 border-[#0088FF]/40 text-[#0088FF]"
                          : "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      }`}
                    >
                      {w.split}
                    </span>
                    <h3 className="font-bold text-white text-sm">{w.title}</h3>
                    <span className="text-xs text-[#64748B]">{w.targetDate}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setWorkoutToEdit(w);
                        setIsLoggerOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#0088FF]/50 text-[#64748B] hover:text-[#0088FF] transition-all cursor-pointer"
                      title="Edit workout"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setWorkoutToDelete(w)}
                      className="p-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-rose-500/50 text-[#64748B] hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete workout"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Exercises & sets summary */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(w.exercises || []).map((ex, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#131620] text-[11px] text-[#94A3B8] border border-[#1F2435]"
                    >
                      <strong className="text-white">{ex.exerciseName}</strong>: {ex.sets.length} sets (max:{" "}
                      {Math.max(...ex.sets.map((s) => s.weightKg || 0))} kg)
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Workout Logger Modal (Create & Edit) */}
      <WorkoutLoggerModal
        isOpen={isLoggerOpen}
        workoutToEdit={workoutToEdit}
        onClose={() => {
          setIsLoggerOpen(false);
          setWorkoutToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["workouts"] });
          queryClient.invalidateQueries({ queryKey: ["fitness-analytics"] });
          queryClient.invalidateQueries({ queryKey: ["exercise-progression"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
        }}
      />

      {/* 2. Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!workoutToDelete}
        onClose={() => setWorkoutToDelete(null)}
        onConfirm={() => {
          if (workoutToDelete) {
            deleteWorkoutMutation.mutate(workoutToDelete._id.toString());
          }
        }}
        title="DELETE WORKOUT SESSION"
        itemName={workoutToDelete?.title || "Workout"}
        description="Are you sure you want to remove this historical workout session?"
        warningText="Deleting this session will remove its sets from your volume and strength analytics. If this was today's session, the physical protocol status will recalculate."
        isPending={deleteWorkoutMutation.isPending}
      />

      {/* 3. Log Body Weight Modal */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md hud-card p-6 rounded-2xl border border-[#00F0FF]/30 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#00F0FF]" />
                RECORD BODY WEIGHT
              </h3>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="text-[#64748B] hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Body Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  placeholder="e.g. 51.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasted measurement"
                  value={weightNotes}
                  onChange={(e) => setWeightNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F2435] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsWeightModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!weightInput || logWeightMutation.isPending}
                onClick={() =>
                  logWeightMutation.mutate({
                    weightKg: parseFloat(weightInput),
                    notes: weightNotes,
                  })
                }
                className="px-5 py-2 rounded-lg bg-[#00F0FF] text-[#090A0F] font-bold hover:bg-[#00F0FF]/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {logWeightMutation.isPending ? "Recording..." : "Save Weight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Configure Target Weight Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md hud-card p-6 rounded-2xl border border-emerald-500/40 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2435]">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                SET TRANSFORMATION TARGETS
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-[#64748B] hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Starting Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={startingWeightInput}
                  onChange={(e) => setStartingWeightInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#94A3B8] mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[#090A0F] border border-[#1F2435] text-white text-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F2435] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#090A0F] border border-[#1F2435] text-[#94A3B8] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateProfileMutation.isPending}
                onClick={() =>
                  updateProfileMutation.mutate({
                    startingWeightKg: parseFloat(startingWeightInput) || 51,
                    targetWeightKg: parseFloat(targetWeightInput) || 65,
                  })
                }
                className="px-5 py-2 rounded-lg bg-emerald-500 text-[#090A0F] font-bold hover:bg-emerald-400 transition-all cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Target"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
