"use client";

import { motion } from "framer-motion";
import { LogTimeline } from "@/components/detail/LogTimeline";

export function OverallJourney({ pillars }: { pillars: any[] }) {
  const allLogs = pillars
    .flatMap((p) => p.logs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section id="journal" className="py-12">
      <motion.h2
        className="text-2xl font-bold tracking-tight text-white mb-8 px-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Overall Journey
      </motion.h2>
      <LogTimeline logs={allLogs} />
    </section>
  );
}
