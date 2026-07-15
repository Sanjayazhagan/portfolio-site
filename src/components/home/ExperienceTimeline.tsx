"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import ReactMarkdown from "react-markdown";

export function ExperienceTimeline({ experiences }: { experiences: any[] }) {
  return (
    <section id="experience" className="py-12">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-8 px-2">Experience</h2>
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
          >
            <GlassCard className="p-6 relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-600/20 group-hover:bg-cyan-500 transition-colors" />
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                  <p className="text-cyan-400 font-medium">{exp.company}</p>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-400 mt-2 prose-p:leading-relaxed prose-li:my-0">
                    <ReactMarkdown>{exp.description}</ReactMarkdown>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full whitespace-nowrap border border-slate-700/50">
                  {exp.period}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
