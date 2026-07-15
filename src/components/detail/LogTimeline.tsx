"use client";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, BookOpenCheck, Code } from "lucide-react";

interface Log {
  id: string;
  date: string;
  title: string;
  type: string;
  content: string;
  link?: string | null;
  github?: string | null;
  linkedin?: string | null;
  live?: string | null;
  kaggle?: string | null;
}

const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const KaggleIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 22V2M8 12l8-10M8 12l8 10" />
  </svg>
);

export function LogTimeline({ logs }: { logs: Log[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div id="logs" className="py-12 text-center text-slate-400 font-medium">
        No engineering logs recorded for this pillar yet.
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 md:py-24" id="logs">
      {/* Center Line for Desktop */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-800 -translate-x-1/2 rounded-full" />
      
      {/* Mobile left-aligned line */}
      <div className="md:hidden absolute left-[27px] top-0 bottom-0 w-[2px] bg-slate-800 rounded-full" />

      <div className="relative space-y-16">
        {logs.map((log, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={log.id} className="relative flex flex-col md:flex-row items-center md:justify-between w-full group">
              {/* Timeline Dot */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 border-[3px] border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 hidden md:block" 
              />
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                className="absolute left-[27px] -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 border-[3px] border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 md:hidden mt-6" 
              />

              {/* Card Container */}
              <div className={`w-full md:w-[calc(50%-3rem)] pl-[60px] md:pl-0 ${!isEven ? 'md:ml-auto' : ''}`}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                >
                  <GlassCard className="p-6 md:p-8 shadow-2xl border-cyan-900/30 group-hover:border-cyan-500/50 transition-colors duration-500">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-4">
                      <span className="text-cyan-400/80">{log.date}</span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                        {log.type === "Learning" ? <BookOpenCheck size={12} /> : <Code size={12} />}
                        {log.type}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                        {log.title}
                      </h3>
                      <div className="flex gap-2 flex-wrap flex-shrink-0">
                        {log.github && (
                           <a href={log.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="GitHub">
                             <GithubIcon size={16} />
                           </a>
                        )}
                        {log.linkedin && (
                           <a href={log.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="LinkedIn">
                             <LinkedinIcon size={16} />
                           </a>
                        )}
                        {log.kaggle && (
                           <a href={log.kaggle} target="_blank" rel="noopener noreferrer" className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="Kaggle">
                             <KaggleIcon size={16} />
                           </a>
                        )}
                        {(log.live || log.link) && (
                           <a href={log.live || log.link!} target="_blank" rel="noopener noreferrer" className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="Link">
                             <ArrowUpRight size={16} />
                           </a>
                        )}
                      </div>
                    </div>
                    <div className="prose prose-invert prose-base max-w-none prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl">
                      <ReactMarkdown>{log.content}</ReactMarkdown>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
