"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, CheckSquare, Filter, Loader2, Archive } from "lucide-react";
import { ITask } from "@/models/Task";
import TaskCard from "@/features/tasks/components/TaskCard";
import TaskModal from "@/features/tasks/components/TaskModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [search, setSearch] = useState("");

  const { data: tasks = [], isLoading } = useQuery<ITask[]>({
    queryKey: ["tasks", statusFilter, categoryFilter, search, showArchived],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("isArchived", showArchived ? "true" : "false");

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
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to delete task");
      }
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progression-stats"] });
      setTaskToDelete(null);
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
              showArchived
                ? "bg-amber-950/40 border-amber-500/50 text-amber-300"
                : "bg-[#131620] border-[#1F2435] text-[#94A3B8] hover:text-white"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? "Hide Archived" : "Show Archived"}</span>
          </button>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F0FF] text-[#090A0F] font-mono font-bold text-xs hover:bg-[#00F0FF]/90 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NEW DIRECTIVE</span>
          </button>
        </div>
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
              onEdit={(t) => {
                setTaskToEdit(t);
                setIsModalOpen(true);
              }}
              onToggleArchive={(t) => {
                archiveMutation.mutate({ id: t._id.toString(), isArchived: !t.isArchived });
              }}
              onDelete={(t) => {
                setTaskToDelete(t);
              }}
            />
          ))}
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        taskToEdit={taskToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteMutation.mutate(taskToDelete._id.toString());
          }
        }}
        title="DELETE DIRECTIVE"
        itemName={taskToDelete?.title || "Directive"}
        description="Are you sure you want to permanently delete this tactical directive?"
        warningText="Historical XP transactions previously awarded for completing this directive will remain safely preserved in your ledger."
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

