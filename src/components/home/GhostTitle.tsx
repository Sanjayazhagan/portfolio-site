"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useIdea } from "@/lib/ideas";

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

// Outlined copies of the heading trail behind it in proportion to scroll speed and
// collapse back when scrolling stops (after Codrops' 2026 scroll-driven ghost trails).
export function GhostTitle({ children, className = "" }: { children: string; className?: string }) {
  // Its own switch in the Ideas panel, independent of the section's scroll effects.
  const reduce = useReducedMotion();
  const ghostOn = useIdea("titles") === "ghost";
  const animate = !reduce && ghostOn;
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 140, damping: 32 });
  // Scrolling down moves the page up, so the trail hangs below the title (and above it on the way up).
  const y1 = useTransform(velocity, (v) => clamp(v * 0.012, -90, 90));
  const y2 = useTransform(velocity, (v) => clamp(v * 0.024, -90, 90));
  const y3 = useTransform(velocity, (v) => clamp(v * 0.036, -90, 90));
  const o1 = useTransform(velocity, (v) => clamp(Math.abs(v) / 1400, 0, 0.7));
  const o2 = useTransform(velocity, (v) => clamp(Math.abs(v) / 1400, 0, 0.7) * 0.6);
  const o3 = useTransform(velocity, (v) => clamp(Math.abs(v) / 1400, 0, 0.7) * 0.35);

  const ghost = "pointer-events-none absolute inset-0 select-none text-transparent [-webkit-text-stroke:1px_rgba(103,232,249,0.85)]";
  return (
    <h2 className={`relative ${className}`} style={{ fontFamily: "var(--font-montserrat)" }}>
      {animate && (
        <>
          <motion.span aria-hidden className={ghost} style={{ y: y3, opacity: o3 }}>{children}</motion.span>
          <motion.span aria-hidden className={ghost} style={{ y: y2, opacity: o2 }}>{children}</motion.span>
          <motion.span aria-hidden className={ghost} style={{ y: y1, opacity: o1 }}>{children}</motion.span>
        </>
      )}
      <span className="relative">{children}</span>
    </h2>
  );
}
