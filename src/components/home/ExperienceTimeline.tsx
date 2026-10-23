"use client";

import { useRef } from "react";
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useScrollStory } from "./useScrollStory";

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
};

const LANE = [14, 40]; // x of main and side-branch lanes (px)
const NODE_Y = 30; // y of the commit dot within a row (px)

function shortHash(seed: string) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Span = { x: number; top: number | string; bottom: number | string };

function Line({ x, top, bottom, color }: Span & { color: string }) {
  return <span aria-hidden className="absolute w-px" style={{ left: x, top, bottom, background: color }} />;
}

function CommitRow({
  exp,
  index,
  count,
  branchIdx,
  progress,
}: {
  exp: Experience;
  index: number;
  count: number;
  branchIdx: number;
  progress: MotionValue<number>;
}) {
  const onBranch = index === branchIdx;
  const branchAbove = branchIdx > -1 && index < branchIdx;
  const laneX = onBranch ? LANE[1] : LANE[0];
  const refs = [
    index === 0 && !onBranch ? "HEAD -> main" : null,
    onBranch ? slug(exp.company) : null,
    `tag: ${exp.period}`,
  ].filter(Boolean);

  // This row owns one slice of the scroll: the commit lights as HEAD reaches it,
  // then the main line draws on toward the next one.
  const start = index / count;
  const end = (index + 1) / count;
  const reached = useTransform(progress, [start, start + 0.04], [0, 1]);
  const content = useTransform(progress, [start - 0.04, start + 0.04], [0.3, 1]);
  const draw = useTransform(progress, [start, end], [0, 1]);

  const main: Span = {
    x: LANE[0],
    top: index === 0 ? NODE_Y : 0,
    bottom: index === count - 1 ? `calc(100% - ${onBranch ? NODE_Y + 30 : NODE_Y}px)` : 0,
  };

  return (
    <li className="group/commit relative flex gap-4">
      <div className="relative w-14 shrink-0" aria-hidden>
        {/* main lane: dim track + the lit HEAD line drawn by scroll */}
        <Line {...main} color="rgba(148,163,184,0.22)" />
        <motion.span
          className="absolute w-px origin-top bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
          style={{ left: main.x, top: main.top, bottom: main.bottom, scaleY: draw }}
        />
        {/* side branch: live from the top until it forks off main */}
        {branchAbove && <Line x={LANE[1]} top={0} bottom={0} color="rgba(34,211,238,0.4)" />}
        {onBranch && (
          <>
            <Line x={LANE[1]} top={0} bottom={`calc(100% - ${NODE_Y}px)`} color="rgba(34,211,238,0.4)" />
            <svg className="absolute" style={{ left: LANE[0], top: NODE_Y }} width={LANE[1] - LANE[0] + 1} height={30}>
              <path d={`M ${LANE[1] - LANE[0]} 0 C ${LANE[1] - LANE[0]} 18, 0 12, 0 30`} fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth={1} />
            </svg>
          </>
        )}
        {/* commit dot, with a lit layer that fades in when HEAD arrives */}
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-500 bg-[#070d1a]"
          style={{ left: laneX + 0.5, top: NODE_Y }}
        />
        <motion.span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300 bg-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
          style={{ left: laneX + 0.5, top: NODE_Y, opacity: reached }}
        />
      </div>

      <motion.div style={{ opacity: content }} className="min-w-0 flex-1 pb-8 pt-[18px] group-last/commit:pb-2">
        <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-[12px]">
          <span className="text-amber-300/90">{shortHash(`${exp.id}${exp.role}${exp.company}`)}</span>
          <span className="text-cyan-300/90">({refs.join(", ")})</span>
        </div>
        <h3 className="mt-1.5 text-lg font-bold text-white md:text-xl">
          {exp.role} <span className="font-medium text-slate-400">@ {exp.company}</span>
        </h3>
        <div className="prose prose-invert prose-sm mt-1.5 max-w-2xl text-slate-400 prose-p:leading-relaxed prose-li:my-0">
          <ReactMarkdown>{exp.description}</ReactMarkdown>
        </div>
      </motion.div>
    </li>
  );
}

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { animate } = useScrollStory();
  // Scroll replays the history: from the list entering the lower part of the screen to its end passing mid-screen.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 80%", "end 60%"] });
  const settled = useMotionValue(1);
  const progress = animate ? scrollYProgress : settled;

  // An ongoing role runs on its own branch beside main, forking where it began.
  const branchIdx = experiences.findIndex((e) => /present/i.test(e.period));
  const n = experiences.length;

  return (
    <section id="experience" className="py-12">
      <div className="mb-8 flex items-baseline justify-between px-2">
        <h2 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-montserrat)" }}>
          Experience
        </h2>
        <span className="font-mono text-xs text-slate-500">{n} commits</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070d1a]/80 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-3 font-mono text-[11px] text-slate-500">~/career</span>
        </div>

        <div className="px-4 pb-6 pt-5 md:px-6">
          <div className="mb-4 font-mono text-[12px] text-slate-400 md:text-[13px]">
            <span className="text-cyan-400/80">{"$ "}</span>git log --graph --decorate --author=&quot;Sanjay Azhagan&quot;
          </div>

          <ol ref={listRef}>
            {experiences.map((exp, i) => (
              <CommitRow key={exp.id} exp={exp} index={i} count={n} branchIdx={branchIdx} progress={progress} />
            ))}
          </ol>

          <div className="mt-2 font-mono text-[12px] text-slate-600">(END)</div>
        </div>
      </div>
    </section>
  );
}
