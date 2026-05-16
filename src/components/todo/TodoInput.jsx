"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown } from "lucide-react";
import { PRIORITIES, CATEGORIES } from "@/lib/constants";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function TodoInput({ onAdd, isLoading }) {
  const c = useAppTheme();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");
  const [focused, setFocused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onAdd({ text: text.trim(), priority, category });
    setText("");
    setShowOptions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
    if (e.key === "Escape") { setShowOptions(false); setFocused(false); }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <motion.div
        animate={{
          boxShadow: focused ? c.inputFocus : `0 0 0 1px ${c.border}`,
        }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: c.surface,
          backdropFilter: "blur(16px)",
          border: `1px solid ${focused ? c.primaryBorder : c.border}`,
        }}
      >
        {/* Input row */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5">
          {/* Placeholder circle */}
          <div
            className="w-5 h-5 rounded-full shrink-0"
            style={{
              border: `1.5px solid ${focused ? c.primaryBorder : c.subtle}`,
              transition: "border-color 0.2s",
            }}
          />

          <input
            id="todo-input"
            type="text"
            placeholder="Add a new task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => { setFocused(true); setShowOptions(true); }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{
              fontFamily: "var(--font-sans)",
              color: c.text,
            }}
            autoComplete="off"
          />

          {/* Chevron */}
          <motion.button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            className="flex items-center shrink-0 p-1"
            style={{ color: c.subtle, background: "transparent" }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronDown
              size={14}
              style={{
                transform: showOptions ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </motion.button>

          {/* Add button */}
          <motion.button
            id="add-todo-btn"
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: text.trim() ? c.checkBg : c.primaryBg,
              transition: "background 0.2s",
            }}
            whileHover={text.trim() ? { scale: 1.07 } : {}}
            whileTap={text.trim() ? { scale: 0.91 } : {}}
          >
            <Plus
              size={17}
              color={text.trim() ? c.checkStroke : c.subtle}
              strokeWidth={2.5}
            />
          </motion.button>
        </form>

        {/* Options panel */}
        <motion.div
          initial={false}
          animate={{ height: showOptions ? "auto" : 0, opacity: showOptions ? 1 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <div
            className="px-4 pb-4 pt-2 flex flex-wrap items-center gap-4"
            style={{ borderTop: `1px solid ${c.border}` }}
          >
            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: c.muted }}>
                Priority:
              </span>
              <div className="flex gap-1">
                {Object.entries(PRIORITIES).map(([key, p]) => (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background:  priority === key ? c.priorities[key].bg : "transparent",
                      color:       priority === key ? c.priorities[key].text : c.subtle,
                      border:      `1px solid ${priority === key ? c.priorities[key].border : "transparent"}`,
                      transition: "all 0.15s",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: c.muted }}>
                Category:
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg outline-none cursor-pointer"
                style={{
                  background: c.primaryBg,
                  color: c.muted,
                  border: `1px solid ${c.border}`,
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
