"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

// Only devices with a real mouse get the custom cursor; touch screens keep their native behaviour.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const INTERACTIVE = "a, button, [role='button'], input, textarea, select";

function subscribeToPointer(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function CustomCursor() {
  const pathname = usePathname();
  const hasFinePointer = useSyncExternalStore(
    subscribeToPointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false
  );
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  // Not in the admin area. Decided after the hooks above so their order never changes.
  const enabled = hasFinePointer && !pathname?.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const tint = tintRef.current;
    if (!dot || !ring) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let shown = false;
    let animFrame = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        // Stay hidden until the first move so nothing sits in the corner at (0, 0).
        shown = true;
        ringX = mouseX;
        ringY = mouseY;
        for (const el of [dot, ring, tint]) if (el) el.style.opacity = "1";
      }
      // Dot and tint snap to the pointer
      place(dot, mouseX, mouseY);
      if (tint) place(tint, mouseX, mouseY);
      if (reduceMotion) place(ring, mouseX, mouseY);
    };

    const animateRing = () => {
      // Ring lags behind for a smooth trailing effect
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      place(ring, ringX, ringY);
      animFrame = requestAnimationFrame(animateRing);
    };

    // Delegated, so links and buttons rendered after mount (modals, client navigation) also count.
    const onMouseOver = (e: MouseEvent) => {
      const overInteractive = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      dot.classList.toggle("cursor-dot--active", overInteractive);
      ring.classList.toggle("cursor-ring--active", overInteractive);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    if (!reduceMotion) animFrame = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(animFrame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Glowing dot */}
      <div
        ref={dotRef}
        className="cursor-dot pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(6,182,212,0.8)] transition-opacity duration-200"
        style={{ willChange: "transform", opacity: 0 }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border border-cyan-400/50 transition-[width,height,border-color,opacity] duration-200"
        style={{ willChange: "transform", opacity: 0 }}
      />
      {/* Color tint spotlight — tints white text to cyan near cursor */}
      <div
        ref={tintRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] w-[350px] h-[350px] rounded-full transition-opacity duration-200"
        style={{
          willChange: "transform",
          opacity: 0,
          mixBlendMode: "color",
          background: "radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)",
        }}
      />

      <style jsx global>{`
        *, *:hover {
          cursor: none !important;
        }
        .cursor-dot--active {
          width: 10px !important;
          height: 10px !important;
          background-color: white !important;
          box-shadow: 0 0 12px 4px rgba(6, 182, 212, 0.9) !important;
        }
        .cursor-ring--active {
          width: 44px !important;
          height: 44px !important;
          border-color: rgba(6, 182, 212, 0.8) !important;
        }
      `}</style>
    </>
  );
}
