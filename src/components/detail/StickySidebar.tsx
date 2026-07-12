"use client";
import { BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

interface StickySidebarProps {
  title: string;
  summary: string;
  philosophy: string;
}

export function StickySidebar({ title, summary, philosophy }: StickySidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors inline-block mb-2">
        ← Back to Dashboard
      </Link>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">{title}</h1>
        <p className="text-lg text-slate-400 leading-relaxed font-medium mb-8">{summary}</p>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">Philosophy</h3>
        <p className="text-slate-300 font-medium leading-relaxed">{philosophy}</p>
      </GlassCard>

      <button 
        onClick={() => {
          document.getElementById("logs")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-cyan-600 text-white rounded-xl shadow hover:bg-cyan-700 transition-colors font-medium mt-4"
      >
        <BookOpen size={18} />
        Read Engineering Logs
      </button>
    </div>
  );
}
