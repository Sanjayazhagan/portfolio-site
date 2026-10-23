"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { matchesPillar, showcased, type PillarLike } from "@/lib/pillars";
import { ProjectArtifact, artifactFor } from "./ProjectArtifacts";

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
                  <span key={p} className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {pillar ? pillar.title : p}
                  </span>
                );
              })}
            </div>
            <ArrowUpRight
              size={18}
              className={cn(
                "shrink-0 transition-[color,transform] duration-200",
                hovered ? "translate-x-0.5 -translate-y-0.5 text-cyan-400" : "text-slate-600"
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

export function BentoGrid({ activeTab, projects, pillars }: BentoGridProps) {
  const filtered = showcased(projects).filter((p) => matchesPillar(p, activeTab, pillars));

  return (
    <section id="projects" className="pb-12">
      <div className="mb-8 flex items-baseline justify-between px-2">
        <h2 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-montserrat)" }}>
          Selected work
        </h2>
        <span className="font-mono text-xs text-slate-500">{String(filtered.length).padStart(2, "0")} projects</span>
      </div>
      <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:auto-rows-[minmax(220px,auto)] lg:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.div
              layout
              key={project.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className={spanFor(i, filtered.length)}
            >
              <BentoCard project={project} pillars={pillars} featured={i === 0 && filtered.length >= 3} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
