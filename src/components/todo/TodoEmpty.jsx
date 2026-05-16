"use client";

import { motion } from "framer-motion";
import { useAppTheme } from "@/hooks/useAppTheme";

const MESSAGES = {
  all:       { icon: "✦", title: "Your canvas is blank",  sub: "Add your first task and start leveling up today." },
  active:    { icon: "⚡", title: "All caught up!",        sub: "No active tasks — you're crushing it." },
  completed: { icon: "◈", title: "Nothing done yet",      sub: "Complete a task to see it here." },
  high:      { icon: "○", title: "No urgent items",       sub: "You're all clear on high-priority tasks." },
};

export default function TodoEmpty({ filter }) {
  const c = useAppTheme();
  const msg = MESSAGES[filter] || MESSAGES.all;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-28 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
        className="text-6xl mb-8 select-none"
        style={{
          color: `${c.primary}88`,
          fontFamily: "var(--font-display)",
          filter: `drop-shadow(0 0 16px ${c.primaryGlow})`,
        }}
      >
        {msg.icon}
      </motion.div>

      <h3
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: c.text }}
      >
        {msg.title}
      </h3>
      <p
        className="text-sm max-w-xs leading-relaxed"
        style={{ color: c.muted }}
      >
        {msg.sub}
      </p>
    </motion.div>
  );
}
