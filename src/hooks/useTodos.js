"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/lib/api";

const QUERY_KEY = ["todos"];

/** Fetch all todos */
export function useTodos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: todoApi.getAll,
  });
}

/** Add a new todo */
export function useAddTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: todoApi.create,
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      // Optimistic: add temporary item
      qc.setQueryData(QUERY_KEY, (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          text: payload.text,
          completed: false,
          priority: payload.priority || "medium",
          category: payload.category || "General",
          order: old.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      return { previous };
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Toggle / edit a todo */
export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }) => todoApi.update(id, updates),
    onMutate: async ({ id, ...updates }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return { previous };
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Delete a todo */
export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: todoApi.remove,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { previous };
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

/** Reorder todos (after drag-and-drop) */
export function useReorderTodos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: todoApi.reorder,
    onMutate: async (orderedIds) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData(QUERY_KEY);
      // Optimistic: reorder client-side immediately
      qc.setQueryData(QUERY_KEY, (old = []) => {
        const map = new Map(old.map((t) => [t.id, t]));
        return orderedIds.map((id) => map.get(id)).filter(Boolean);
      });
      return { previous };
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
