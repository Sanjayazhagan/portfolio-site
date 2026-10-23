"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

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

function Line({ x, top, bottom, color }: { x: number; top: number | string; bottom: number | string; color: string }) {
  return (
    <motion.span
      aria-hidden
      className="absolute w-px origin-top"
      style={{ left: x, top, bottom, background: color }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    />
  );
}

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
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

          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          >
            {experiences.map((exp, i) => {
              const onBranch = i === branchIdx;
              const branchAbove = branchIdx > -1 && i < branchIdx;
              const laneX = onBranch ? LANE[1] : LANE[0];
              const refs = [
                i === 0 && !onBranch ? "HEAD -> main" : null,
                onBranch ? slug(exp.company) : null,
                `tag: ${exp.period}`,
              ].filter(Boolean);

              return (
                <motion.li
                  key={exp.id}
                  variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="group/commit relative flex gap-4"
                >
                  {/* Graph column */}
                  <div className="relative w-14 shrink-0" aria-hidden>
                    {/* main lane passes through every row */}
                    <Line
                      x={LANE[0]}
                      top={i === 0 ? NODE_Y : 0}
                      bottom={i === n - 1 ? `calc(100% - ${onBranch ? NODE_Y + 30 : NODE_Y}px)` : 0}
                      color="rgba(148,163,184,0.35)"
                    />
                    {/* side branch: live from the top until it forks off main */}
                    {branchAbove && <Line x={LANE[1]} top={0} bottom={0} color="rgba(34,211,238,0.45)" />}
                    {onBranch && (
                      <>
                        <Line x={LANE[1]} top={0} bottom={`calc(100% - ${NODE_Y}px)`} color="rgba(34,211,238,0.45)" />
                        <svg className="absolute" style={{ left: LANE[0], top: NODE_Y }} width={LANE[1] - LANE[0] + 1} height={30}>
                          <path d={`M ${LANE[1] - LANE[0]} 0 C ${LANE[1] - LANE[0]} 18, 0 12, 0 30`} fill="none" stroke="rgba(34,211,238,0.45)" strokeWidth={1} />
                        </svg>
                      </>
                    )}
                    <span
                      className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                        i === 0 || onBranch ? "border-cyan-400 bg-cyan-400/30" : "border-slate-400 bg-[#070d1a]"
                      }`}
                      style={{ left: laneX + 0.5, top: NODE_Y }}
                    />
                  </div>

                  {/* Commit */}
                  <div className="min-w-0 flex-1 pb-8 pt-[18px] group-last/commit:pb-2">
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
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>

          <div className="mt-2 font-mono text-[12px] text-slate-600">(END)</div>
        </div>
      </div>
    </section>
  );
}
