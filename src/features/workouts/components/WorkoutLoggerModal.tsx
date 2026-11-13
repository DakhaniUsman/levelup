"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Flame,
  Award,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { WorkoutSplit } from "@/models/Workout";

interface WorkoutLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SetEntry {
  setNumber: number;
  reps: number;
  weightKg: number;
  isPersonalRecord: boolean;
}

interface ExerciseEntry {
  exerciseName: string;
  sets: SetEntry[];
  notes?: string;
}

export default function WorkoutLoggerModal({
  isOpen,
  onClose,
}: WorkoutLoggerModalProps) {
  const queryClient = useQueryClient();
  const [split, setSplit] = useState<WorkoutSplit>("PUSH");
  const [title, setTitle] = useState("Push Day: Progressive Overload");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [intensityRating, setIntensityRating] = useState(8);
  const [notes, setNotes] = useState("");

  const [exercises, setExercises] = useState<ExerciseEntry[]>([
    {
      exerciseName: "Barbell Bench Press",
      sets: [
        { setNumber: 1, reps: 10, weightKg: 60, isPersonalRecord: false },
        { setNumber: 2, reps: 8, weightKg: 70, isPersonalRecord: false },
        { setNumber: 3, reps: 6, weightKg: 75, isPersonalRecord: true },
      ],
      notes: "Focused on paused eccentric reps",
    },
  ]);

  const workoutMutation = useMutation({
    mutationFn: async (payload: {
      split: WorkoutSplit;
      title: string;
      durationMinutes: number;
      intensityRating: number;
      exercises: ExerciseEntry[];
      notes?: string;
    }) => {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to log workout");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-protocol"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exerciseName: "",
        sets: [{ setNumber: 1, reps: 10, weightKg: 20, isPersonalRecord: false }],
        notes: "",
      },
    ]);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleAddSet = (exIdx: number) => {
    const ex = exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSet: SetEntry = {
      setNumber: ex.sets.length + 1,
      reps: lastSet ? lastSet.reps : 10,
      weightKg: lastSet ? lastSet.weightKg : 20,
      isPersonalRecord: false,
    };
    const updated = [...exercises];
    updated[exIdx].sets.push(newSet);
    setExercises(updated);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updated = [...exercises];
    updated[exIdx].sets = updated[exIdx].sets.filter((_, i) => i !== setIdx);
    setExercises(updated);
  };

  const handleSetChange = (
    exIdx: number,
    setIdx: number,
    field: keyof SetEntry,
    val: unknown
  ) => {
    const updated = [...exercises];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[exIdx].sets[setIdx] as any)[field] = val;
    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || exercises.length === 0) return;
    workoutMutation.mutate({
      split,
      title: title.trim(),
      durationMinutes,
      intensityRating,
      exercises,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl border border-rose-500/30 bg-[#0B0D13] p-4 sm:p-6 font-mono text-white shadow-2xl space-y-4 sm:space-y-5 animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1F2435] pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-400 shrink-0">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 flex-wrap">
                <span>GYM SESSION</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  +75 XP
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">
                Target 7:30 - 8:00 PM evening workout with progressive overload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* General Workout Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#050608] p-3.5 rounded-xl border border-[#1F2435]">
            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                Workout Split
              </label>
              <select
                value={split}
                onChange={(e) => setSplit(e.target.value as WorkoutSplit)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B0D13] border border-[#1F2435] text-xs text-white focus:outline-none focus:border-rose-400"
              >
                <option value="PUSH">Push (Chest, Shoulders, Tris)</option>
                <option value="PULL">Pull (Back, Biceps, Traps)</option>
                <option value="LEGS">Legs (Quads, Hamstrings, Calves)</option>
                <option value="UPPER">Upper Body</option>
                <option value="LOWER">Lower Body</option>
                <option value="CUSTOM">Custom Session</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                Duration (Mins)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0B0D13] border border-[#1F2435] text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
                Intensity Rating (1-10)
              </label>
              <div className="relative">
                <Flame className="w-3.5 h-3.5 text-rose-500 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={intensityRating}
                  onChange={(e) => setIntensityRating(parseInt(e.target.value, 10))}
                  className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#0B0D13] border border-[#1F2435] text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
              Session Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Exercises & Progressive Sets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                EXERCISES &amp; WORKING SETS
              </span>
              <button
                type="button"
                onClick={handleAddExercise}
                className="px-2.5 py-1 rounded bg-[#131620] hover:bg-[#1F2435] border border-[#1F2435] text-xs text-[#00F0FF] font-mono flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Exercise</span>
              </button>
            </div>

            {exercises.map((ex, exIdx) => (
              <div
                key={exIdx}
                className="p-3.5 rounded-xl bg-[#050608] border border-[#1F2435] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Exercise name (e.g. Incline Bench Press)"
                    value={ex.exerciseName}
                    onChange={(e) => {
                      const updated = [...exercises];
                      updated[exIdx].exerciseName = e.target.value;
                      setExercises(updated);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#0B0D13] border border-[#1F2435] text-xs text-white font-bold placeholder-[#475569] focus:outline-none focus:border-[#00F0FF]"
                  />
                  {exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="text-[#64748B] hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sets Table */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-12 gap-2 text-[9px] uppercase font-mono text-[#64748B] px-1">
                    <span className="col-span-2">Set</span>
                    <span className="col-span-3">Weight (kg)</span>
                    <span className="col-span-3">Reps</span>
                    <span className="col-span-3">PR?</span>
                    <span className="col-span-1"></span>
                  </div>

                  {ex.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className="grid grid-cols-12 gap-2 items-center bg-[#0B0D13] p-1.5 rounded-lg border border-[#181B26]"
                    >
                      <span className="col-span-2 text-xs font-bold text-[#94A3B8] pl-2">
                        #{set.setNumber}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={set.weightKg}
                        onChange={(e) =>
                          handleSetChange(
                            exIdx,
                            setIdx,
                            "weightKg",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="col-span-3 px-2 py-1 bg-[#050608] border border-[#1F2435] rounded text-xs text-white"
                      />
                      <input
                        type="number"
                        min={1}
                        value={set.reps}
                        onChange={(e) =>
                          handleSetChange(
                            exIdx,
                            setIdx,
                            "reps",
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="col-span-3 px-2 py-1 bg-[#050608] border border-[#1F2435] rounded text-xs text-white"
                      />
                      <label className="col-span-3 flex items-center gap-1.5 text-[10px] text-[#CBD5E1] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={set.isPersonalRecord}
                          onChange={(e) =>
                            handleSetChange(
                              exIdx,
                              setIdx,
                              "isPersonalRecord",
                              e.target.checked
                            )
                          }
                          className="rounded border-[#1F2435] text-amber-500 focus:ring-0"
                        />
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> PR
                        </span>
                      </label>
                      <div className="col-span-1 text-right">
                        {ex.sets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(exIdx, setIdx)}
                            className="text-[#64748B] hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => handleAddSet(exIdx)}
                    className="w-full py-1 text-[10px] font-mono rounded bg-[#0B0D13] hover:bg-[#131620] border border-dashed border-[#1F2435] text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    + Add Set
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] text-[#94A3B8] uppercase block mb-1">
              Coach Notes / Progressive Overload Reflections
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Added 2.5kg to top set, good mind-muscle connection..."
              className="w-full px-3 py-1.5 rounded-lg bg-[#050608] border border-[#1F2435] text-xs text-white placeholder-[#475569] focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Action Bar */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#1F2435] bg-[#131620] text-xs font-bold text-[#94A3B8] hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={workoutMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {workoutMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Session...</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" />
                  <span>Record Workout (+75 XP)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

