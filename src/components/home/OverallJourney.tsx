"use client";
import pillars from "@/data/pillars.json";
import { LogTimeline } from "@/components/detail/LogTimeline";

export function OverallJourney() {
  const allLogs = pillars
    .flatMap((p) => p.logs)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <section id="journal" className="py-12">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-8 px-2">Overall Journey</h2>
      <LogTimeline logs={allLogs} />
    </section>
  );
}
