"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const WIDE = "(min-width: 1024px)";

function subscribeToWidth(onChange: () => void) {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// Lets one component offer a static and a scroll-driven version (Ideas panel):
// wrap it in <ScrollMotion.Provider value={false}> to switch the scroll effects off.
export const ScrollMotion = createContext(true);

// Scroll-driven sections share one rule: nothing moves under prefers-reduced-motion,
// and the heavier effects only run where there's room for them.
export function useScrollStory() {
  const reduce = useReducedMotion();
  const wide = useSyncExternalStore(subscribeToWidth, () => window.matchMedia(WIDE).matches, () => false);
  const allowed = useContext(ScrollMotion);
  return { animate: !reduce && allowed, wide };
}
