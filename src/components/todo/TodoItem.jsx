"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, GripVertical, Pencil, Check, X } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useTheme } from "next-themes";
import { PRIORITIES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function TodoItem({ todo, index, onToggle, onDelete, onEdit }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => setMounted(true), []);
  const isDark = !mounted || theme === "dark";

  const priority = PRIORITIES[todo.priority] || PRIORITIES.medium;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleEditSave = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onEdit(todo.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") handleEditSave();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          className="relative rounded-2xl mb-2.5 group"
          style={{
            background: isDark
              ? "rgba(13, 37, 56, 0.65)"
              : "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${
              snapshot.isDragging
                ? priority.border
                : isDark
                ? "rgba(26,58,82,0.7)"
                : "rgba(203,213,225,0.8)"
            }`,
            boxShadow: snapshot.isDragging
              ? `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${priority.border}, 0 0 24px ${priority.bg}`
              : hovered
              ? isDark
                ? "0 4px 20px rgba(0,0,0,0.2)"
                : "0 4px 20px rgba(0,0,0,0.07)"
              : "none",
            transform: snapshot.isDragging ? "rotate(1.5deg) scale(1.02)" : "none",
            transition: snapshot.isDragging ? "none" : "all 0.2s ease",
          }}
        >
          {/* Priority accent line */}
          <div
            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
            style={{ background: priority.color, opacity: todo.completed ? 0.3 : 0.8 }}
          />

          <div className="flex items-center gap-3 px-4 py-3.5 pl-5">
            {/* Drag handle */}
            <motion.div
              {...provided.dragHandleProps}
              animate={{ opacity: hovered || snapshot.isDragging ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              className="cursor-grab active:cursor-grabbing shrink-0"
              style={{ color: isDark ? "rgba(58,104,130,0.8)" : "#94a3b8" }}
            >
              <GripVertical size={16} />
            </motion.div>

            {/* Animated checkbox */}
            <button
              id={`todo-check-${todo.id}`}
              onClick={() => onToggle(todo.id, !todo.completed)}
              className="shrink-0 w-5 h-5 rounded-full relative flex items-center justify-center transition-all duration-200 focus-visible:outline-none"
              style={{
                background: todo.completed
                  ? "linear-gradient(135deg, #00eeff, #00c4d4)"
                  : "transparent",
                border: todo.completed
                  ? "1.5px solid #00eeff"
                  : isDark
                  ? "1.5px solid rgba(58,104,130,0.7)"
                  : "1.5px solid #94a3b8",
              }}
            >
              <AnimatePresence>
                {todo.completed && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {/* Animated SVG checkmark path */}
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <motion.path
                        d="M1 3.5L3.8 6.5L9 1"
                        stroke="#081c29"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Task text / edit input */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleEditSave}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: isDark ? "#fff" : "#0d1117",
                    borderBottom: "1px solid rgba(0,238,255,0.4)",
                    paddingBottom: "2px",
                  }}
                />
              ) : (
                <div className="flex flex-col gap-0.5">
                  <motion.span
                    layout
                    className="text-sm leading-snug block truncate"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: todo.completed
                        ? isDark ? "rgba(123,168,196,0.4)" : "#94a3b8"
                        : isDark ? "#e2f0f9" : "#0d1117",
                      textDecoration: todo.completed ? "line-through" : "none",
                      textDecorationColor: "rgba(123,168,196,0.4)",
                      transition: "color 0.25s, text-decoration 0.25s",
                    }}
                  >
                    {todo.text}
                  </motion.span>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Priority badge */}
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{
                        background: priority.bg,
                        color: priority.text,
                        border: `1px solid ${priority.border}`,
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.05em",
                        opacity: todo.completed ? 0.5 : 1,
                      }}
                    >
                      {priority.label}
                    </span>

                    {/* Category */}
                    {todo.category && todo.category !== "General" && (
                      <span
                        className="text-[10px]"
                        style={{
                          color: isDark ? "rgba(58,104,130,0.9)" : "#94a3b8",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {todo.category}
                      </span>
                    )}

                    {/* Timestamp */}
                    <span
                      className="text-[10px]"
                      style={{
                        color: isDark ? "rgba(58,104,130,0.7)" : "#b0bec5",
                        marginLeft: "auto",
                      }}
                    >
                      {formatDate(todo.createdAt)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <AnimatePresence>
                {(hovered || isEditing) && !todo.completed && (
                  <>
                    {isEditing ? (
                      <>
                        <motion.button
                          key="save"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={handleEditSave}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: "rgba(0,238,255,0.1)",
                            color: "#00eeff",
                          }}
                        >
                          <Check size={13} />
                        </motion.button>
                        <motion.button
                          key="cancel"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={() => {
                            setEditText(todo.text);
                            setIsEditing(false);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: "rgba(255,71,87,0.1)",
                            color: "#ff4757",
                          }}
                        >
                          <X size={13} />
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        key="edit"
                        id={`todo-edit-${todo.id}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsEditing(true)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: isDark
                            ? "rgba(26,58,82,0.5)"
                            : "rgba(241,245,249,0.8)",
                          color: isDark ? "rgba(123,168,196,0.7)" : "#64748b",
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Pencil size={12} />
                      </motion.button>
                    )}
                  </>
                )}
              </AnimatePresence>

              {/* Delete — always present on hover */}
              <AnimatePresence>
                {hovered && (
                  <motion.button
                    id={`todo-delete-${todo.id}`}
                    key="delete"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => onDelete(todo.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(255,71,87,0.08)",
                      color: "rgba(255,71,87,0.7)",
                    }}
                    whileHover={{
                      background: "rgba(255,71,87,0.18)",
                      color: "#ff4757",
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </Draggable>
  );
}
