"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, cubicBezier, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { matchesPillar, showcased, type PillarLike } from "@/lib/pillars";
import { ProjectArtifact, artifactFor } from "./ProjectArtifacts";
import { useScrollStory } from "./useScrollStory";
import { GhostTitle } from "./GhostTitle";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pillars: string[];
  showcase?: boolean | null;
};

interface BentoGridProps {
  activeTab: string;
  projects: Project[];
  pillars: PillarLike[];
}

// A real bento: the lead project gets the big cell, the rest pair up, a lone last one spans the row.
function spanFor(i: number, n: number) {
  if (n === 1) return "md:col-span-2 lg:col-span-6";
  if (n === 2) return "lg:col-span-3";
  if (i === 0) return "md:col-span-2 lg:col-span-4 lg:row-span-2";
  if (i < 3) return "lg:col-span-2";
  const rest = n - 3;
  return rest % 2 === 1 && i === n - 1 ? "md:col-span-2 lg:col-span-6" : "lg:col-span-3";
}

function BentoCard({ project, pillars, featured }: { project: Project; pillars: PillarLike[]; featured: boolean }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || featured;
  const kind = artifactFor(project);

  return (
    <Link href={`/project/${project.slug}`} className="block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60">
      <GlassCard
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        className={cn("flex h-full flex-col justify-between gap-6 p-6", featured && "md:p-8")}
      >
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {project.pillars.map((p) => {
                const pillar = pillars.find((pl) => pl.id === p || pl.title === p);
                return (
                  <span key={p} className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {pillar ? pillar.title : p}
                  </span>
                );
              })}
            </div>
            <ArrowUpRight
              size={18}
              className={cn(
                "shrink-0 transition-[color,transform] duration-200",
                hovered ? "translate-x-0.5 -translate-y-0.5 text-cyan-400" : "text-slate-400"
              )}
            />
          </div>
          <h3 className={cn("font-bold tracking-tight text-white", featured ? "text-2xl md:text-3xl" : "text-lg")}>
            {project.title}
          </h3>
          <p className={cn("mt-2 leading-relaxed text-slate-400", featured ? "max-w-md text-base" : "line-clamp-2 text-sm")}>
            {project.description}
          </p>
        </div>

        <div
          className={cn(
            "relative z-10 rounded-xl border border-white/[0.06] bg-slate-950/50 p-4 transition-opacity duration-200",
            featured ? "min-h-44 flex-1" : "h-28",
            active ? "opacity-100" : "opacity-60"
          )}
        >
          <ProjectArtifact kind={kind} active={active} seed={project.slug} />
        </div>
      </GlassCard>
    </Link>
  );
}

// Where each card starts in the "exploded" diagram before scroll pulls it into place.
const SCATTER = [
  { x: -90, y: 70, r: -4 },
  { x: 120, y: -50, r: 5 },
  { x: 130, y: 80, r: 3 },
  { x: -50, y: 130, r: -2 },
  { x: 90, y: 120, r: 4 },
  { x: -120, y: -40, r: -5 },
];
// ease-in-out: this is on-screen movement scrubbed by scroll, not an entrance
const settle = cubicBezier(0.45, 0, 0.55, 1);

function Assemble({ progress, index, magnitude, children }: { progress: MotionValue<number>; index: number; magnitude: number; children: ReactNode }) {
  const v = SCATTER[index % SCATTER.length];
  const x = useTransform(progress, [0, 1], [v.x * magnitude, 0], { ease: settle });
  const y = useTransform(progress, [0, 1], [v.y * magnitude, 0], { ease: settle });
  const rotate = useTransform(progress, [0, 1], [v.r * magnitude, 0], { ease: settle });
  const scale = useTransform(progress, [0, 1], [0.92, 1], { ease: settle });
  const opacity = useTransform(progress, [0, 0.6], [0.2, 1]);
  return (
    <motion.div className="h-full" style={{ x, y, rotate, scale, opacity }}>
      {children}
    </motion.div>
  );
}

export function BentoGrid({ activeTab, projects, pillars }: BentoGridProps) {
  const filtered = showcased(projects).filter((p) => matchesPillar(p, activeTab, pillars));
  const ref = useRef<HTMLElement>(null);
  const { animate, wide } = useScrollStory();
  // 0 while the section's top is still low on screen (70%), 1 once it has risen near the top (10%),
  // so the cards come together while you can actually see them.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "start 10%"] });
  const blueprint = useTransform(scrollYProgress, [0, 1], [0.7, 0]);
  const magnitude = wide ? 1 : 0.35;

  return (
    <section ref={ref} id="projects" className="pb-12">
      <div className="mb-8 flex items-baseline justify-between px-2">
        <GhostTitle className="text-3xl font-bold tracking-tight text-white md:text-5xl">Selected work</GhostTitle>
        <span className="font-mono text-xs text-slate-400">{String(filtered.length).padStart(2, "0")} projects</span>
      </div>
      <div className="relative">
        {animate && (
          // Blueprint dots under the parts while they're still apart
          <motion.div
            aria-hidden
            style={{ opacity: blueprint }}
            className="pointer-events-none absolute -inset-8 rounded-3xl [background-image:radial-gradient(rgba(34,211,238,0.35)_1px,transparent_1px)] [background-size:22px_22px]"
          />
        )}
        {filtered.length === 0 && (
          <p className="relative rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center font-mono text-sm text-slate-400">
            {"// no projects in "}
            <span className="text-slate-300">{pillars.find((p) => p.id === activeTab)?.title ?? activeTab}</span>
            {" yet"}
          </p>
        )}
        <motion.div layout className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => {
              const card = <BentoCard project={project} pillars={pillars} featured={i === 0 && filtered.length >= 3} />;
              return (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                  className={spanFor(i, filtered.length)}
                >
                  {animate ? (
                    <Assemble progress={scrollYProgress} index={i} magnitude={magnitude}>
                      {card}
                    </Assemble>
                  ) : (
                    card
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
