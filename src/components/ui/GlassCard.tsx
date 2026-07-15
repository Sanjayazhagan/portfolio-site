"use client";

import { HTMLMotionProps, motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import React, { MouseEvent, ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(200px circle at ${mouseX}px ${mouseY}px, rgba(6, 182, 212, 0.08), transparent 80%)`;

  return (
    <motion.div
      onMouseMove={onMouseMove}
      className={cn(
        "relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl overflow-hidden group",
        className
      )}
      {...props}
    >
      {/* Spotlight glow that follows cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlightBackground }}
      />
      {children}
    </motion.div>
  );
}
