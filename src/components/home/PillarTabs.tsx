"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


interface PillarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pillars: any[];
}

export function PillarTabs({ activeTab, setActiveTab, pillars }: PillarTabsProps) {
  const tabs = [{ id: "All", title: "All" }, ...pillars];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 py-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "relative px-5 py-2.5 text-sm font-semibold transition-colors rounded-full",
            activeTab === tab.id ? "text-cyan-400" : "text-slate-400 hover:text-white"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-pillar"
              className="absolute inset-0 bg-slate-800 border border-slate-700 shadow-sm rounded-full -z-10"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.title}</span>
        </button>
      ))}
    </div>
  );
}
