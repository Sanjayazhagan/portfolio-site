"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import projects from "@/data/projects.json";
import pillars from "@/data/pillars.json";
import Link from "next/link";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else document.getElementById("search-trigger")?.click();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-xl pointer-events-auto"
            >
              <GlassCard className="overflow-hidden !bg-slate-900/95 border-slate-700/50">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
                  <Search size={20} className="text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search projects, pillars..."
                    className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500"
                  />
                  <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  <div className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pillars
                  </div>
                  {pillars.map((pillar) => (
                    <Link
                      key={pillar.id}
                      href={`/pillar/${pillar.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="font-medium text-white">{pillar.title}</div>
                    </Link>
                  ))}
                  
                  <div className="px-2 py-2 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Projects
                  </div>
                  {projects.map((project) => (
                    <a
                      key={project.id}
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                    >
                      <span className="font-medium text-white">{project.title}</span>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">External</span>
                    </a>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
