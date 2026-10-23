"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const WIDE = "(min-width: 1024px)";

function subscribeToWidth(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Scroll-driven sections share one rule: nothing moves under prefers-reduced-motion,
// and the heavier effects only run where there's room for them.
export function useScrollStory() {
  const reduce = useReducedMotion();
  const wide = useSyncExternalStore(subscribeToWidth, () => window.matchMedia(WIDE).matches, () => false);
  return { animate: !reduce, wide };
}
