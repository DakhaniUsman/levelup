"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, CheckSquare, Filter, Loader2 } from "lucide-react";
import { ITask, TaskCategory, TaskStatus } from "@/models/Task";
import TaskCard from "@/features/tasks/components/TaskCard";
import TaskModal from "@/features/tasks/components/TaskModal";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: tasks = [], isLoading } = useQuery<ITask[]>({
    queryKey: ["tasks", statusFilter, categoryFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/tasks?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1F2435]">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#00F0FF]" />
            TASK DIRECTIVES
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Execute tactical directives to earn XP and level up your skills
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW DIRECTIVE</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search directives..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#131620] border border-[#1F2435] text-white focus:border-[#00F0FF] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#131620] border border-[#1F2435] px-3 py-1.5 rounded-lg">
          <Filter className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#131620]">
              All Statuses
            </option>
            <option value="TODO" className="bg-[#131620]">
              Active (Todo)
            </option>
            <option value="IN_PROGRESS" className="bg-[#131620]">
              In Progress
            </option>
            <option value="COMPLETED" className="bg-[#131620]">
              Completed
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#131620] border border-[#1F2435] px-3 py-1.5 rounded-lg">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-white w-full focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-[#131620]">
              All Categories
            </option>
            <option value="PERSONAL" className="bg-[#131620]">
              Personal
            </option>
            <option value="CAREER" className="bg-[#131620]">
              Career
            </option>
            <option value="FITNESS" className="bg-[#131620]">
              Fitness
            </option>
            <option value="LEARNING" className="bg-[#131620]">
              Learning
            </option>
            <option value="SPIRITUAL" className="bg-[#131620]">
              Spiritual
            </option>
            <option value="FINANCE" className="bg-[#131620]">
              Finance
            </option>
            <option value="BUSINESS" className="bg-[#131620]">
              Business
            </option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#00F0FF]" />
          <span>QUERYING DIRECTIVE LEDGER...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="hud-card p-12 text-center rounded-2xl border border-[#1F2435] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#1F2435]/50 flex items-center justify-center mx-auto text-[#64748B]">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold font-mono text-white">
            No Directives Found
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto font-sans">
            Your directive backlog is clear. Initialize a new task directive to begin earning XP.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id.toString()}
              task={task}
              onToggleStatus={(id, status) => updateMutation.mutate({ id, status })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}
      />
    </div>
  );
}

