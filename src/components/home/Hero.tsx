"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useScrollStory } from "./useScrollStory";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type EditorFile = {
  name: string;
  pillar: string;
  lang: string;
  code: string[];
  suggestion: string[];
};

// One file per pillar; the "copilot" ghost-types the next lines of each.
const FILES: EditorFile[] = [
  {
    name: "suggest.ts",
    pillar: "AI",
    lang: "TypeScript",
    code: [
      'import { model } from "./llm";',
      "",
      "export async function suggest(ctx: EditorContext) {",
      "  const prompt = buildPrompt(ctx.prefix, ctx.suffix);",
    ],
    suggestion: ['  return model.complete(prompt, { stop: ["\\n\\n"] });', "}"],
  },
  {
    name: "page.tsx",
    pillar: "Full-Stack",
    lang: "React",
    code: [
      'import { db } from "@/lib/db";',
      "",
      "export default async function Projects() {",
      "  const projects = await db.project.findMany();",
    ],
    suggestion: ["  return <ProjectGrid items={projects} />;", "}"],
  },
  {
    name: "deploy.yaml",
    pillar: "Cloud",
    lang: "YAML",
    code: [
      "service: scheduler",
      "regions: [us-east-1, eu-west-1]",
      "deploy:",
      "  strategy: rolling",
    ],
    suggestion: ["  healthcheck: /healthz", "  rollback: on-failure"],
  },
  {
    name: "Compounder.sol",
    pillar: "Web3",
    lang: "Solidity",
    code: [
      "function harvest() external nonReentrant {",
      "    uint256 rewards = strategy.claim();",
      "    require(rewards > 0, \"nothing to harvest\");",
      "",
    ],
    suggestion: ["    uint256 shares = _reinvest(rewards);", "    emit Harvested(rewards, shares);", "}"],
  },
];

const MAX_LINES = Math.max(...FILES.map((f) => f.code.length + f.suggestion.length));

const KEYWORDS = new Set([
  "import", "from", "export", "async", "function", "const", "return", "await", "default",
  "external", "nonReentrant", "uint256", "emit", "require",
]);

function highlight(line: string) {
  const out: { text: string; cls: string }[] = [];
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_][\w]*)|(\s+)|(.)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const tok = m[0];
    let cls = "text-slate-300";
    if (m[1]) cls = "text-slate-500 italic";
    else if (m[2] || m[3]) cls = "text-amber-200/90";
    else if (m[4]) {
      if (KEYWORDS.has(tok)) cls = "text-cyan-300";
      else if (line[re.lastIndex] === "(") cls = "text-sky-100";
      else if (line[re.lastIndex] === ":") cls = "text-cyan-300";
      else if (/^[A-Z]/.test(tok)) cls = "text-teal-200";
    }
    out.push({ text: tok, cls });
  }
  return out;
}

function CopilotEditor() {
  const reduce = useReducedMotion();
  const [fileIdx, setFileIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const file = FILES[fileIdx];
  const full = file.suggestion.join("\n");
  const shown = reduce ? full.length : typed;
  const done = shown >= full.length;

  useEffect(() => {
    if (reduce) return;
    if (typed < full.length) {
      const t = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 700 : 26);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setFileIdx((i) => (i + 1) % FILES.length);
      setTyped(0);
    }, 2600);
    return () => clearTimeout(t);
  }, [typed, full.length, reduce]);

  const ghostLines = full.slice(0, shown).split("\n");
  const lines: { kind: "code" | "ghost" | "empty"; text: string }[] = [
    ...file.code.map((text) => ({ kind: "code" as const, text })),
    ...ghostLines.map((text) => ({ kind: "ghost" as const, text })),
  ];
  while (lines.length < MAX_LINES) lines.push({ kind: "empty", text: "" });

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a101d]/90 shadow-[0_24px_80px_-20px_rgba(8,145,178,0.35)] backdrop-blur">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 font-mono text-[11px] text-slate-500">~/sanjay/workbench</span>
      </div>

      {/* Tabs — one per pillar */}
      <div role="tablist" aria-label="Pillars" className="flex overflow-x-auto no-scrollbar border-b border-white/[0.06] font-mono text-[12px]">
        {FILES.map((f, i) => (
          <button
            key={f.name}
            role="tab"
            aria-selected={i === fileIdx}
            onClick={() => {
              setFileIdx(i);
              setTyped(0);
            }}
            className={`relative shrink-0 px-4 py-2.5 transition-colors duration-150 ${
              i === fileIdx ? "bg-white/[0.04] text-slate-100" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {f.name}
            {i === fileIdx && <span className="absolute inset-x-0 top-0 h-px bg-cyan-400" />}
          </button>
        ))}
      </div>

      {/* Code */}
      <div className="overflow-x-auto no-scrollbar px-2 py-4 font-mono text-[12.5px] leading-6 md:text-[13.5px]">
        {lines.map((line, i) => {
          const isCaretLine = line.kind === "ghost" && i === file.code.length + ghostLines.length - 1;
          return (
            <div key={i} className="flex whitespace-pre">
              <span className="w-10 shrink-0 select-none pr-4 text-right text-slate-600">{i + 1}</span>
              {line.kind === "code" &&
                highlight(line.text).map((tok, j) => (
                  <span key={j} className={tok.cls}>{tok.text}</span>
                ))}
              {line.kind === "ghost" && <span className="italic text-slate-500">{line.text}</span>}
              {isCaretLine && !done && <span className="caret-blink ml-px inline-block h-5 w-[2px] translate-y-0.5 bg-cyan-400" />}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 whitespace-nowrap border-t border-white/[0.06] px-4 py-2 font-mono text-[11px] text-slate-500">
        <span className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-cyan-400" : "bg-amber-300"}`} />
          copilot · {done ? "suggestion ready" : "thinking"}
        </span>
        <span className="flex items-center gap-3">
          <motion.span
            initial={false}
            animate={{ opacity: done ? 1 : 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="hidden rounded border border-white/10 px-1.5 py-0.5 text-slate-300 sm:inline"
          >
            Tab ↹ accept
          </motion.span>
          <span className="hidden sm:inline">{file.lang}</span>
          <span className="text-cyan-400/80">{file.pillar}</span>
        </span>
      </div>
    </div>
  );
}

const ramp = (v: number, from: number, to: number) => Math.min(Math.max((v - from) / (to - from), 0), 1);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { animate, wide } = useScrollStory();
  // Desktop: the hero is a short scroll track; scrolling dives into the editor.
  const dive = animate && wide;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // `dive` flips on after hydration, so it reaches the transforms as a motion value: they stay pure
  // (no stale closure) and use the function form, which keeps them on the JS path. Framer's
  // hardware-accelerated opacity binding attached late and tracked the whole page's scroll instead.
  const diveOn = useMotionValue(0);
  useEffect(() => diveOn.set(dive ? 1 : 0), [dive, diveOn]);
  const track = [scrollYProgress, diveOn];
  const textOpacity = useTransform(track, ([v, d]: number[]) => (d ? 1 - ramp(v, 0, 0.3) : 1));
  const textY = useTransform(track, ([v, d]: number[]) => (d ? -48 * ramp(v, 0, 0.3) : 0));
  // Slide from the right column to the centre (~48% of its own width) while growing.
  const editorX = useTransform(track, ([v, d]: number[]) => `${d ? -48 * ramp(v, 0, 0.55) : 0}%`);
  const editorScale = useTransform(track, ([v, d]: number[]) => (d ? 1 + 0.32 * ramp(v, 0, 0.55) : 1));
  const stageOpacity = useTransform(track, ([v, d]: number[]) => (d ? 1 - ramp(v, 0.62, 0.95) : 1));

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  });

  return (
    <section
      ref={ref}
      className={`relative w-screen left-1/2 -translate-x-1/2 -mt-24 overflow-x-clip ${dive ? "h-[185vh]" : "pt-24 min-h-[88vh] flex items-center"}`}
    >
      <motion.div
        style={{ opacity: stageOpacity }}
        className={dive ? "sticky top-0 flex h-screen items-center pt-24" : "contents"}
      >
        {/* Ground: one dark field with a single cool light source behind the editor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 480px at 72% 46%, rgba(34,211,238,0.10), transparent 65%), #020617",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-10 md:px-8 md:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <motion.div style={{ opacity: textOpacity, y: textY }}>
            <motion.h1
              {...rise(0)}
              className="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Sanjay
              <br />
              Azhagan
            </motion.h1>
            <motion.p {...rise(0.08)} className="mt-6 max-w-md text-lg leading-relaxed text-slate-300 md:text-xl">
              I build the systems behind the screen — models that reason, apps that ship, clouds that scale and contracts that settle.
            </motion.p>
            <motion.div {...rise(0.16)} className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="#projects"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-6 text-[15px] font-semibold text-slate-950 transition-[transform,background-color] duration-150 hover:bg-cyan-300 active:scale-[0.97]"
              >
                See the work <ArrowRight size={16} />
              </Link>
              <Link
                href="/journal"
                className="inline-flex h-12 items-center rounded-full border border-white/10 px-6 text-[15px] font-semibold text-slate-300 transition-colors duration-150 hover:border-white/25 hover:text-white"
              >
                Read the journal
              </Link>
            </motion.div>
          </motion.div>

          <motion.div {...rise(0.12)}>
            <motion.div
              style={{ x: editorX, scale: editorScale }}
              className="origin-center will-change-transform"
            >
              <CopilotEditor />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
