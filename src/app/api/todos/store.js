import { NextResponse } from "next/server";
import { nanoid } from "./utils";
import { DUMMY_TODOS } from "./seed";

/**
 * In-memory store — replace with MongoDB when MONGODB_URI is set.
 * The store is module-level so it persists between requests in dev.
 */
let todos = [...DUMMY_TODOS];

export function getTodos() {
  return todos;
}

export function createTodo({ text, priority = "medium", category = "General" }) {
  const todo = {
    id: nanoid(),
    text,
    completed: false,
    priority,
    category,
    order: todos.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, updates) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;
  todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
  return todos[index];
}

export function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

export function reorderTodos(orderedIds) {
  const map = new Map(todos.map((t) => [t.id, t]));
  todos = orderedIds
    .map((id, idx) => {
      const t = map.get(id);
      if (!t) return null;
      return { ...t, order: idx, updatedAt: new Date().toISOString() };
    })
    .filter(Boolean);
  return todos;
}
