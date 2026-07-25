"use client";

import { useState } from "react";
import { ProjectsManager } from "./ProjectsManager";
import { ExperienceManager } from "./ExperienceManager";
import { PillarsManager } from "./PillarsManager";
import { SettingsManager } from "./SettingsManager";
import { LogsManager } from "./LogsManager";

export function AdminTabs({ projects, pillars, experiences, logs, userEmail }: { projects: any[], pillars: any[], experiences: any[], logs: any[], userEmail: string }) {
  const [activeTab, setActiveTab] = useState("Projects");
  const tabs = ["Projects", "Experience", "Pillars", "Journeys", "Settings"];

  return (
    <div>
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-800 overflow-x-auto no-scrollbar whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-all ${
              activeTab === tab
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "Projects" && <ProjectsManager initialProjects={projects} availablePillars={pillars} />}
        {activeTab === "Experience" && <ExperienceManager initialExperiences={experiences} />}
        {activeTab === "Pillars" && <PillarsManager initialPillars={pillars} />}
        {activeTab === "Journeys" && <LogsManager initialLogs={logs} availablePillars={pillars} availableProjects={projects} />}
        {activeTab === "Settings" && <SettingsManager userEmail={userEmail} />}
      </div>
    </div>
  );
}
