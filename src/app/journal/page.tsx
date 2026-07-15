import { getPillars } from "@/lib/data";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function JournalDirectory() {
  const pillars = await getPillars();

  return (
    <div className="py-24">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">Engineering Journal</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
          A collection of my thoughts, learnings, and architectural decisions across different domains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => (
          <Link key={pillar.id} href={`/pillar/${pillar.id}`} className="block outline-none group">
            <GlassCard className="h-full p-8 group-hover:border-cyan-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{pillar.title}</h2>
                <div className="p-2.5 bg-cyan-900/30 text-cyan-400 rounded-full group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <BookOpen size={20} />
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6">
                {pillar.summary}
              </p>
              <div className="text-sm font-semibold text-cyan-400">
                Read {pillar.logs.length} logs →
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
