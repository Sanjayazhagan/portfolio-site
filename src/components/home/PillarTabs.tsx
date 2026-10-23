"use client";

import { useState } from "react";
import { matchesPillar, showcased, type PillarLike, type ProjectLike } from "@/lib/pillars";

type IndexPillar = PillarLike & { summary?: string | null };

interface PillarTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pillars: IndexPillar[];
  projects: ProjectLike[];
}

// Kinetic-type index: one row per pillar from the database, the word itself is the control.
// Montserrat is loaded as a variable font, so weight and tracking morph smoothly on hover.
export function PillarTabs({ activeTab, setActiveTab, pillars, projects }: PillarTabsProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const visible = showcased(projects);
  const rows: IndexPillar[] = [
    {
      id: "All",
      title: "Everything",
      summary: `${visible.length} projects across ${pillars.length} pillars.`,
    },
    ...pillars,
  ];
  const lit = hovered ?? activeTab;

  return (
    <section aria-label="Filter projects by pillar" className="w-full pt-16">
      <div className="mb-3 flex items-baseline justify-between px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
        <span>Index — pick a pillar</span>
        <span>{String(pillars.length).padStart(2, "0")} pillars</span>
      </div>

      <ul role="tablist" aria-label="Pillars" className="border-t border-white/10" onMouseLeave={() => setHovered(null)}>
        {rows.map((row, i) => {
          const active = activeTab === row.id;
          const isLit = lit === row.id;
          const count = visible.filter((p) => matchesPillar(p, row.id, pillars)).length;
          return (
            <li key={row.id} role="presentation" className="border-b border-white/10">
              <button
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(row.id)}
                onMouseEnter={() => setHovered(row.id)}
                onFocus={() => setHovered(row.id)}
                onBlur={() => setHovered(null)}
                className="grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-2 text-left outline-none focus-visible:bg-white/[0.03] md:grid-cols-[3.5rem_1fr_auto] md:gap-6"
              >
                <span className="font-mono text-[11px] tabular-nums text-slate-400">{String(i).padStart(2, "0")}</span>
                <span
                  className="text-[clamp(34px,5.6vw,80px)] leading-[1.05] transition-[font-weight,letter-spacing,color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                    fontFamily: "var(--font-montserrat)",
                    fontWeight: isLit || active ? 900 : 300,
                    letterSpacing: isLit || active ? "-0.035em" : "0em",
                    color: active ? "#67e8f9" : isLit ? "#ffffff" : "rgba(148,163,184,0.6)",
                  }}
                >
                  {row.title}
                </span>
                <span className={`font-mono text-[11px] tabular-nums transition-colors duration-200 ${isLit || active ? "text-cyan-300" : "text-slate-400"}`}>
                  {String(count).padStart(2, "0")} {count === 1 ? "project" : "projects"}
                </span>
              </button>
              {/* The pillar's own summary from the db unfolds under the word */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                  isLit && row.summary ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <p className="overflow-hidden pb-0 pl-[calc(2.5rem+0.75rem)] text-sm text-slate-400 md:pl-[calc(3.5rem+1.5rem)] md:text-base">
                  <span className="block pb-4">{row.summary}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
