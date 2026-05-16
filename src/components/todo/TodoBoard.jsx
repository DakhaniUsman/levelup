"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import TodoHero from "./TodoHero";
import TodoInput from "./TodoInput";
import TodoFilters from "./TodoFilters";
import TodoList from "./TodoList";
import {
  useTodos,
  useAddTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
} from "@/hooks/useTodos";
import { getTodoStats } from "@/lib/utils";

export default function TodoBoard() {
  const [filter, setFilter] = useState("all");

  const { data: todos = [], isLoading, isError } = useTodos();
  const addTodo = useAddTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const reorderTodos = useReorderTodos();

  const stats = useMemo(() => getTodoStats(todos), [todos]);

  /* ── Filter logic ── */
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((t) => !t.completed);
      case "completed":
        return todos.filter((t) => t.completed);
      case "high":
        return todos.filter((t) => t.priority === "high" && !t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  /* ── Filter counts ── */
  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
      high: todos.filter((t) => t.priority === "high" && !t.completed).length,
    }),
    [todos]
  );

  /* ── Handlers ── */
  const handleAdd = (payload) => addTodo.mutate(payload);

  const handleToggle = (id, completed) =>
    updateTodo.mutate({ id, completed });

  const handleEdit = (id, updates) =>
    updateTodo.mutate({ id, ...updates });

  const handleDelete = (id) => deleteTodo.mutate(id);

  const handleReorder = (orderedIds) => reorderTodos.mutate(orderedIds);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <TodoHero stats={stats} />

      {/* Board section */}
      <section
        id="todo-board"
        className="relative px-4 sm:px-6 pb-24 flex flex-col items-center gap-4"
        style={{ minHeight: "60vh" }}
      >
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2
            className="text-3xl sm:text-4xl font-black mb-2 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Today's{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #00eeff, #c50b9c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Missions
            </span>
          </h2>
          <p
            className="text-sm"
            style={{ color: "rgba(123,168,196,0.6)", fontFamily: "var(--font-sans)" }}
          >
            {stats.active} active · {stats.completed} completed · {stats.rate}%
            done
          </p>
        </motion.div>

        {/* Input */}
        <TodoInput
          onAdd={handleAdd}
          isLoading={addTodo.isPending}
        />

        {/* Filters */}
        <TodoFilters
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        {/* Loading skeleton */}
        {isLoading && (
          <div className="w-full max-w-2xl mx-auto space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl h-16 animate-pulse"
                style={{
                  background: "rgba(13,37,56,0.4)",
                  border: "1px solid rgba(26,58,82,0.5)",
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            className="w-full max-w-2xl mx-auto rounded-2xl p-6 text-center"
            style={{
              background: "rgba(255,71,87,0.05)",
              border: "1px solid rgba(255,71,87,0.2)",
              color: "rgba(255,71,87,0.8)",
            }}
          >
            Failed to load todos. Please refresh.
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && (
          <TodoList
            todos={filteredTodos}
            filter={filter}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReorder={handleReorder}
          />
        )}

        {/* Completed tasks summary at bottom */}
        {stats.completed > 0 && filter === "all" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "rgba(0,238,255,0.3)" }}
            >
              ✦ {stats.completed} task{stats.completed !== 1 ? "s" : ""} completed ✦
            </span>
          </motion.div>
        )}
      </section>
    </div>
  );
}
