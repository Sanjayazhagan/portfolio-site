"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tintRef = useRef<HTMLDivElement>(null);

  // If in admin area, do not render custom cursor at all
  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let animFrame: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot snaps instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      // Tint zone snaps instantly too (centered)
      if (tintRef.current) {
        tintRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    };

    const animateRing = () => {
      // Ring lags behind for a smooth trailing effect
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      animFrame = requestAnimationFrame(animateRing);
    };

    const onMouseEnterInteractive = () => {
      dot.classList.add("cursor-dot--active");
      ring.classList.add("cursor-ring--active");
    };

    const onMouseLeaveInteractive = () => {
      dot.classList.remove("cursor-dot--active");
      ring.classList.remove("cursor-ring--active");
    };

    window.addEventListener("mousemove", onMouseMove);
    animFrame = requestAnimationFrame(animateRing);

    // Scale up on hover over interactive elements
    const interactives = document.querySelectorAll("a, button, [role='button'], input, textarea, select");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnterInteractive);
      el.addEventListener("mouseleave", onMouseLeaveInteractive);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Glowing dot */}
      <div
        ref={dotRef}
        className="cursor-dot pointer-events-none fixed top-0 left-0 z-[9999] w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(6,182,212,0.8)]"
        style={{ willChange: "transform" }}
      />
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="cursor-ring pointer-events-none fixed top-0 left-0 z-[9998] w-8 h-8 rounded-full border border-cyan-400/50 transition-[width,height,border-color,opacity] duration-200"
        style={{ willChange: "transform" }}
      />
      {/* Color tint spotlight — tints white text to cyan near cursor */}
      <div
        ref={tintRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] w-[350px] h-[350px] rounded-full"
        style={{
          willChange: "transform",
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
