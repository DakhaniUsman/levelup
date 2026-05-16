import { clsx } from "clsx";

/** Merge class names safely */
export function cn(...inputs) {
  return clsx(inputs);
}

/** Format ISO date string to readable format */
export function formatDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Calculate completion percentage */
export function getCompletionRate(todos) {
  if (!todos || todos.length === 0) return 0;
  const done = todos.filter((t) => t.completed).length;
  return Math.round((done / todos.length) * 100);
}

/** Get stats from todos array */
export function getTodoStats(todos = []) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const rate = getCompletionRate(todos);
  const highPriority = todos.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  return { total, completed, active, rate, highPriority };
}

/** Reorder array after drag-and-drop */
export function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
