"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { matchesPillar, showcased, type PillarLike, type ProjectLike } from "@/lib/pillars";

interface PillarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pillars: PillarLike[];
  projects: ProjectLike[];
}

export function PillarTabsConsole({ activeTab, setActiveTab, pillars, projects }: PillarTabsProps) {
  const tabs: PillarLike[] = [{ id: "All", title: "All" }, ...pillars];
  const visible = showcased(projects);
  const activeTitle = tabs.find((t) => t.id === activeTab)?.title ?? "All";

  return (
    <div className="-mb-6 flex w-full flex-col items-center gap-4 pt-10">
      {/* The filter reads as the command it is */}
      <div className="font-mono text-xs text-slate-400" aria-hidden>
        <span className="text-cyan-400/80">$</span> ls work --pillar=
        <span className="text-slate-200">{activeTab === "All" ? "*" : activeTitle.toLowerCase()}</span>
      </div>

      <div
        role="tablist"
        aria-label="Filter projects by pillar"
        className="flex flex-wrap justify-center gap-1 rounded-full border border-white/10 bg-slate-900/60 p-1 backdrop-blur"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const count = visible.filter((p) => matchesPillar(p, tab.id, pillars)).length;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150",
                active ? "text-white" : "text-slate-400 hover:text-slate-200"
              )}
            >
              {active && (
                <motion.span
                  layoutId="pillar-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-cyan-400/40"
                  transition={{ type: "spring", stiffness: 520, damping: 42 }}
                />
              )}
              <span className="relative">{tab.title}</span>
              <span
                className={cn(
                  "relative font-mono text-[11px] tabular-nums",
                  active ? "text-cyan-300" : "text-slate-400"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
