"use client";

import { useState, useEffect } from "react";
import { Hero } from "./Hero";
import { PillarTabs } from "./PillarTabs";
import { BentoGrid } from "./BentoGrid";
import { ExperienceTimeline } from "./ExperienceTimeline";
import { OverallJourney } from "./OverallJourney";
import { GlassCard } from "@/components/ui/GlassCard";
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

export function HomeContent() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="pb-24 relative">
      <Hero />
      <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto">
        <div className="flex flex-col items-center">
          <PillarTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <BentoGrid activeTab={activeTab} />
        <ExperienceTimeline />
        <OverallJourney />
      </div>
      <SidebarNav />
    </div>
  );
}
