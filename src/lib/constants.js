export const PRIORITIES = {
  high: {
    label: "High",
    color: "#ff4757",
    glow: "glow-red",
    bg: "rgba(255, 71, 87, 0.1)",
    border: "rgba(255, 71, 87, 0.35)",
    text: "#ff6b78",
  },
  medium: {
    label: "Medium",
    color: "#ffa502",
    glow: "",
    bg: "rgba(255, 165, 2, 0.1)",
    border: "rgba(255, 165, 2, 0.35)",
    text: "#ffb730",
  },
  low: {
    label: "Low",
    color: "#00eeff",
    glow: "glow-cyan",
    bg: "rgba(0, 238, 255, 0.07)",
    border: "rgba(0, 238, 255, 0.25)",
    text: "#00eeff",
  },
};

export const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Done" },
  { key: "high", label: "🔥 Priority" },
];

export const CATEGORIES = [
  "General",
  "Dev",
  "Learning",
  "Health",
  "Finance",
  "Personal",
];
