"use client";

import { useState, useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { Hero } from "./Hero";
import { PillarTabs } from "./PillarTabs";
import { BentoGrid } from "./BentoGrid";
import { ExperienceTimeline } from "./ExperienceTimeline";
import dynamic from "next/dynamic";

const OverallJourney = dynamic(
  () => import("./OverallJourney").then(mod => mod.OverallJourney),
  { ssr: false }
);
import { GlassCard } from "@/components/ui/GlassCard";
import { LazyMount } from "@/components/ui/LazyMount";
import { Briefcase, Code, BookOpen } from "lucide-react";
import { SplitLayout } from "@/components/detail/SplitLayout";

function SidebarNav() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    const sections = ["projects", "experience", "journal"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fixed right-4 xl:right-12 top-32 w-40 hidden lg:flex flex-col text-sm pl-2">
      <div className="font-semibold text-white mb-3">On this page</div>
      <div className="flex flex-col border-l border-slate-800">
        <button 
          onClick={() => scrollTo("projects")}
          className={`text-left px-4 py-1.5 transition-colors -ml-[1px] border-l ${
            activeSection === "projects" 
              ? "text-white border-cyan-400 font-medium" 
              : "text-slate-400 border-transparent hover:text-cyan-400 hover:border-cyan-400"
          }`}
        >
          Projects
        </button>
        <button 
          onClick={() => scrollTo("experience")}
          className={`text-left px-4 py-1.5 transition-colors -ml-[1px] border-l ${
            activeSection === "experience" 
              ? "text-white border-cyan-400 font-medium" 
              : "text-slate-400 border-transparent hover:text-cyan-400 hover:border-cyan-400"
          }`}
        >
          Experience
        </button>
        <button 
          onClick={() => scrollTo("journal")}
          className={`text-left px-4 py-1.5 transition-colors -ml-[1px] border-l ${
            activeSection === "journal" 
              ? "text-white border-cyan-400 font-medium" 
              : "text-slate-400 border-transparent hover:text-cyan-400 hover:border-cyan-400"
          }`}
        >
          Overall Journey
        </button>
      </div>
    </div>
  );
}

export function HomeContent({ projects, pillars, experiences, logs }: { projects: any[], pillars: any[], experiences: any[], logs: any[] }) {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative">
        <Hero pillars={pillars} />
        <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto px-4 md:px-8">
          <div id="pillars" className="scroll-mt-28">
            <PillarTabs activeTab={activeTab} setActiveTab={setActiveTab} pillars={pillars} projects={projects} />
          </div>
          {/* The cards fly in from off-axis; clip them at the screen edge so phones can't scroll sideways */}
          <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-x-clip">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
              <BentoGrid activeTab={activeTab} projects={projects} pillars={pillars} />
            </div>
          </div>
          <ExperienceTimeline experiences={experiences} />
        </div>

        {/* Overall Journey section — full-width breakout.
            Deferred via LazyMount so the 3D (three.js) bundle and its WebGL
            textures only load when the user scrolls near this section, keeping
            them off the initial load path. */}
        {/* The anchor lives on this always-rendered wrapper: the journey itself is lazy and
            client-only, so an id inside it doesn't exist yet for the side nav to scroll to or observe. */}
        <div id="journal" className="mt-16 w-[100vw] relative left-1/2 -translate-x-1/2">
          <LazyMount minHeight={700}>
            <OverallJourney pillars={pillars} allLogs={logs} />
          </LazyMount>
        </div>
        <SidebarNav />
      </div>
    </MotionConfig>
  );
}
