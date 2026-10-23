"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

export type HeroPillar = { id: string; title: string; summary?: string | null; logs?: unknown[] };

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const LENS = 190; // lens radius on desktop (px)
const MAX_ROWS = 6; // keep the data panel clear of the statement however many pillars exist

function subscribeToPointer(onChange: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const listFormat = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

// Wraps a piece of the layout. On the "system" layer it shows its bounds and what it is;
// outline + an absolutely placed label keep both layers' layout identical so they line up.
function Bounds({ system, label, className, children }: { system: boolean; label: string; className?: string; children: ReactNode }) {
  return (
    <div
      className={`relative ${className ?? ""}`}
      style={system ? { outline: "1px dashed rgba(34,211,238,0.45)", outlineOffset: 8 } : undefined}
    >
      {system && (
        <span className="absolute -top-7 left-0 whitespace-nowrap font-mono text-[11px] text-cyan-300/80">{label}</span>
      )}
      {children}
    </div>
  );
}

function HeroLayer({ system, pillars }: { system: boolean; pillars: HeroPillar[] }) {
  const titles = pillars.map((p) => p.title);
  const statement = titles.length
    ? `Software engineer building the systems behind the screen — across ${listFormat.format(titles)}.`
    : "Software engineer building the systems behind the screen.";
  const nameStyle: CSSProperties = { fontFamily: "var(--font-montserrat)" };

  const primary = system
    ? "border border-dashed border-cyan-300/60 text-cyan-200"
    : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.97]";
  const secondary = system
    ? "border border-dashed border-cyan-300/40 text-cyan-200/80"
    : "border border-white/10 text-slate-300 hover:border-white/25 hover:text-white";
  const button = "inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-[transform,background-color,color,border-color] duration-150";

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-8">
      <Bounds system={system} label="<h1> · Montserrat 900 · clamp(56px, 11vw, 168px)" className="w-fit">
        <h1
          className={`text-[clamp(56px,11vw,168px)] font-black leading-[0.86] tracking-[-0.02em] ${
            system ? "text-transparent [-webkit-text-stroke:1.25px_rgba(103,232,249,0.9)]" : "text-white"
          }`}
          style={nameStyle}
        >
          Sanjay
          <br />
          Azhagan
        </h1>
      </Bounds>

      <Bounds system={system} label={`<p> · built from ${pillars.length} pillars in the db`} className="mt-12 max-w-xl">
        <p className={`text-lg leading-relaxed md:text-2xl ${system ? "text-cyan-100/60" : "text-slate-300"}`}>{statement}</p>
      </Bounds>

      <div className="mt-12 flex flex-wrap gap-4">
        <Bounds system={system} label='<Link href="#projects">'>
          {system ? (
            <span className={`${button} ${primary}`}>See the work <ArrowRight size={16} /></span>
          ) : (
            <Link href="#projects" className={`${button} ${primary}`}>
              See the work <ArrowRight size={16} />
            </Link>
          )}
        </Bounds>
        <Bounds system={system} label='<Link href="/journal">'>
          {system ? (
            <span className={`${button} ${secondary}`}>Read the journal</span>
          ) : (
            <Link href="/journal" className={`${button} ${secondary}`}>
              Read the journal
            </Link>
          )}
        </Bounds>
      </div>
    </div>
  );
}

// Only exists on the system layer: the query and rows that the hero is rendered from.
function DataPanel({ pillars }: { pillars: HeroPillar[] }) {
  return (
    <div className="absolute bottom-16 right-8 z-10 hidden w-[420px] font-mono text-[12px] leading-6 lg:block xl:right-[max(2rem,calc((100vw-72rem)/2))]">
      <div className="text-slate-400">{"// app/page.tsx — what this hero is rendered from"}</div>
      <div>
        <span className="text-cyan-300">const</span> <span className="text-slate-200">pillars</span> ={" "}
        <span className="text-cyan-300">await</span> <span className="text-sky-100">db.pillar.findMany</span>
        <span className="text-slate-300">();</span>
      </div>
      <div className="text-slate-400">{`// → ${pillars.length} rows`}</div>
      <div className="text-slate-300">[</div>
      {pillars.slice(0, MAX_ROWS).map((p) => (
        <div key={p.id} className="pl-4 text-slate-300">
          {"{ "}
          <span className="text-teal-200">id</span>: <span className="text-amber-200/90">&quot;{p.id}&quot;</span>,{" "}
          <span className="text-teal-200">title</span>: <span className="text-amber-200/90">&quot;{p.title}&quot;</span>,{" "}
          <span className="text-teal-200">logs</span>: <span className="text-amber-200/90">{p.logs?.length ?? 0}</span>
          {" },"}
        </div>
      ))}
      {pillars.length > MAX_ROWS && <div className="pl-4 text-slate-400">{`// …+${pillars.length - MAX_ROWS} more`}</div>}
      <div className="text-slate-300">]</div>
    </div>
  );
}

export function Hero({ pillars }: { pillars: HeroPillar[] }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const canHover = useSyncExternalStore(subscribeToPointer, () => window.matchMedia(FINE_POINTER).matches, () => false);

  // Lens position/size. Decorative mouse tracking, so it rides on springs instead of snapping.
  const targetX = useMotionValue(-999);
  const targetY = useMotionValue(-999);
  const targetR = useMotionValue(0);
  const x = useSpring(targetX, { stiffness: 260, damping: 30, mass: 0.6 });
  const y = useSpring(targetY, { stiffness: 260, damping: 30, mass: 0.6 });
  const r = useSpring(targetR, { stiffness: 220, damping: 28 });
  const mask = useMotionTemplate`radial-gradient(circle ${r}px at ${x}px ${y}px, #000 0%, #000 82%, transparent 100%)`;
  const rimX = useTransform(() => x.get() - r.get());
  const rimY = useTransform(() => y.get() - r.get());
  const rimSize = useTransform(() => r.get() * 2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (canHover && !reduce) {
      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        targetX.set(e.clientX - b.left);
        targetY.set(e.clientY - b.top);
        targetR.set(LENS);
      };
      const onLeave = () => targetR.set(0);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    }

    // No mouse (or reduced motion): park the lens over the name so the idea still reads,
    // anchored to wherever the name actually renders rather than to viewport fractions.
    const b = el.getBoundingClientRect();
    const name = el.querySelector("h1")?.getBoundingClientRect();
    const small = b.width < 768;
    const homeX = name ? name.left - b.left + name.width * 0.62 : b.width * 0.5;
    const homeY = name ? name.top - b.top + name.height * 0.5 : b.height * 0.4;
    const radius = small ? 105 : 150;
    x.jump(homeX);
    y.jump(homeY);
    r.jump(radius);
    targetX.set(homeX);
    targetY.set(homeY);
    targetR.set(radius);
    if (reduce) return;

    // Touch: drift slowly while the hero is on screen; a finger can drag the lens too.
    let raf = 0;
    let dragging = false;
    const start = performance.now();
    const tick = (t: number) => {
      if (!dragging) {
        const k = (t - start) / 1000;
        targetX.set(homeX + Math.sin(k * 0.55) * b.width * 0.18);
        targetY.set(homeY + Math.sin(k * 0.8) * b.height * 0.06);
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    const onDown = () => (dragging = true);
    const onDrag = (e: PointerEvent) => {
      if (!dragging) return;
      const box = el.getBoundingClientRect();
      targetX.set(e.clientX - box.left);
      targetY.set(e.clientY - box.top);
    };
    const onUp = () => (dragging = false);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", onUp);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      window.removeEventListener("pointerup", onUp);
    };
  }, [canHover, reduce, targetX, targetY, targetR, x, y, r]);

  return (
    <section
      ref={ref}
      className="relative left-1/2 -mt-24 flex min-h-[92vh] w-screen -translate-x-1/2 items-center overflow-hidden pt-24"
    >
      {/* The screen: what everyone sees */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(800px 520px at 30% 40%, rgba(34,211,238,0.07), transparent 65%), #020617" }}
      />
      <HeroLayer system={false} pillars={pillars} />

      {/* The system behind it, seen only through the lens. Purely visual: hidden from AT and inert. */}
      <motion.div
        aria-hidden
        inert
        className="pointer-events-none absolute inset-0 z-20 flex items-center bg-[#030b18] pt-24"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <HeroLayer system pillars={pillars} />
        <DataPanel pillars={pillars} />
      </motion.div>

      {/* Lens rim */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 rounded-full border border-cyan-300/50 shadow-[0_0_40px_rgba(34,211,238,0.25),inset_0_0_30px_rgba(34,211,238,0.15)]"
        style={{ x: rimX, y: rimY, width: rimSize, height: rimSize }}
      />

      <p className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] text-slate-400">
        {canHover ? "move your cursor — see the system behind the screen" : "drag — see the system behind the screen"}
      </p>
    </section>
  );
}
