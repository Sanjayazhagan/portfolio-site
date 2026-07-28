"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BentoGridProps {
  activeTab: string;
  projects: any[];
  pillars: any[];
}

export function BentoGrid({ activeTab, projects, pillars }: BentoGridProps) {
  const filteredProjects = activeTab === "All" 
    ? projects.filter(p => p.showcase)
    : projects.filter(p => {
        const activePillarTitle = pillars.find((pl) => pl.id === activeTab)?.title;
        return p.showcase && (p.pillars.includes(activeTab) || p.pillars.includes(activePillarTitle || ""));
      });

  return (
    <section id="projects" className="py-12">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-8 px-2">Featured Projects</h2>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key={project.id}
            >
              <Link href={`/project/${project.slug}`} className="block h-full outline-none">
                <GlassCard 
                  className="h-full p-6 flex flex-col justify-between cursor-pointer group"
                  whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{project.title}</h3>
                      <div className="p-2 bg-slate-800/50 rounded-full text-slate-500 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 transition-colors">
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{project.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.pillars.map((p: string) => {
                      const actualPillar = pillars.find(pl => pl.id === p || pl.title === p);
                      return (
                        <span key={p} className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-900/20 px-2.5 py-1 rounded-md border border-cyan-900/50">
                          {actualPillar ? actualPillar.title : p}
                        </span>
                      );
                    })}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
