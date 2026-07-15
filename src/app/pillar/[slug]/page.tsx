import { notFound } from "next/navigation";
import { getPillars } from "@/lib/data";
import { LogTimeline } from "@/components/detail/LogTimeline";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const pillars = await getPillars();
  return pillars.map((p: any) => ({ slug: p.id }));
}

export default async function PillarPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const pillars = await getPillars();
  const pillar = pillars.find((p: any) => p.id === params.slug);
  
  if (!pillar) {
    notFound();
  }

  return (
    <div className="py-24 w-full relative min-h-screen flex flex-col items-center max-w-5xl mx-auto px-4">
      <div className="w-full text-left mb-8">
        <Link href="/#pillars" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          {pillar.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed">
          {pillar.summary}
        </p>
      </div>

      {/* Philosophy Card */}
      <div className="w-full max-w-4xl mb-24">
        <GlassCard className="p-8 md:p-12 border-cyan-900/30">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6">Philosophy</h2>
          <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
            {pillar.philosophy}
          </p>
        </GlassCard>
      </div>

      {/* Logs Timeline */}
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Engineering Logs</h2>
          <p className="text-slate-400">A chronological record of milestones, learnings, and builds.</p>
        </div>
        <LogTimeline logs={pillar.logs} />
      </div>
    </div>
  );
}
