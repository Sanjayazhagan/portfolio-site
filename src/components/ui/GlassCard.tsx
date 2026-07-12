"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

export function GlassCard({ className, children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={cn(
        "bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
