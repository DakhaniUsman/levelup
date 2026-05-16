"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useAppTheme } from "@/hooks/useAppTheme";

const WORD_SETS = ["YOUR DAY", "YOUR FOCUS", "YOUR LIFE", "YOUR GOALS"];

export default function TodoHero({ stats }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const c = useAppTheme();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setWordIndex((i) => (i + 1) % WORD_SETS.length),
      2600
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pb-20"
      style={{ paddingTop: "6rem" }}
    >
      {/* Ambient orbs — themed */}
      <div
        className="orb w-[480px] h-[480px]"
        style={{
          top: "8%", left: "-12%",
          background: c.primary,
          opacity: c.isDark ? 0.12 : 0.07,
          animationDuration: "16s",
        }}
      />
      <div
        className="orb w-[360px] h-[360px]"
        style={{
          top: "25%", right: "-10%",
          background: c.secondary,
          opacity: c.isDark ? 0.1 : 0.06,
          animationDelay: "5s",
          animationDuration: "20s",
        }}
      />
      <div
        className="orb w-[280px] h-[280px]"
        style={{
          bottom: "12%", left: "40%",
          background: c.primary,
          opacity: c.isDark ? 0.07 : 0.04,
          animationDelay: "10s",
          animationDuration: "24s",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${c.primary}18 1px, transparent 1px),
            linear-gradient(90deg, ${c.primary}18 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          opacity: c.isDark ? 1 : 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <span className="h-px w-10" style={{ background: `${c.primary}55` }} />
          <span
            className="text-xs font-semibold tracking-[0.28em] uppercase"
            style={{ fontFamily: "var(--font-display)", color: `${c.primary}99` }}
          >
            Personal Growth System · Step 01
          </span>
          <span className="h-px w-10" style={{ background: `${c.primary}55` }} />
        </motion.div>

        {/* LEVEL UP — static headline */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-black leading-[0.88] tracking-[-0.04em] select-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(4rem, 12vw, 10rem)",
              color: c.text,
            }}
          >
            LEVEL UP
          </motion.h1>
        </div>

        {/* Animated cycling word */}
        <div className="overflow-hidden mb-12">
          <AnimatedWord key={wordIndex} word={WORD_SETS[wordIndex]} gradient={c.gradient} />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-base sm:text-lg max-w-lg mx-auto mb-14 leading-relaxed"
          style={{
            color: c.muted,
            fontFamily: "var(--font-sans)",
          }}
        >
          One task at a time. Build momentum, track progress,{" "}
          and compound your wins every single day.
        </motion.p>

        {/* Live stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap"
          >
            {[
              { label: "Total Tasks",  value: stats.total },
              { label: "Completed",    value: stats.completed },
              { label: "Completion",   value: `${stats.rate}%` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-4xl font-black mb-1.5"
                  style={{ fontFamily: "var(--font-display)", color: c.primary }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs uppercase tracking-[0.18em]"
                  style={{ color: c.subtle }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col items-center gap-2 mt-16"
        >
          <span
            className="text-xs tracking-[0.22em] uppercase"
            style={{ color: `${c.muted}55` }}
          >
            Scroll to tasks
          </span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
            style={{ border: `1px solid ${c.primaryBorder}` }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: c.primary }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedWord({ word, gradient }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="font-black leading-[0.88] tracking-[-0.04em] select-none"
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(4rem, 12vw, 10rem)",
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {word}
    </motion.div>
  );
}
