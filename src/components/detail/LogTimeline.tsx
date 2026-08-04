"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionValueEvent } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, BookOpenCheck, Code } from "lucide-react";
import { RoverSprite } from "./RoverSprite";
import { usePostHog } from 'posthog-js/react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posthog = usePostHog();
  const [stickyHeight, setStickyHeight] = useState(600);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isParked, setIsParked] = useState(true);
  const [measurements, setMeasurements] = useState<{top: number, bottom: number}[]>([]);

  useEffect(() => {
    setStickyHeight(window.innerHeight - 200);
    const handleResize = () => setStickyHeight(window.innerHeight - 200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.offsetHeight;
      
      const newMeasurements = logs.map((_, i) => {
        const el = cardRefs.current[i];
        if (!el) return { top: 0, bottom: 0 };
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        return { top: top / containerHeight, bottom: bottom / containerHeight };
      });
      setMeasurements(newMeasurements);
    };
    
    setTimeout(measure, 100);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div id="logs" className="py-12 text-center text-slate-400 font-medium">
        No engineering logs recorded for this pillar yet.
      </div>
    );
  }

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const pathHeight = stickyHeight;
  const pathWidth = 80;
  const svgPath = `M ${pathWidth/2} 0 L ${pathWidth/2} ${pathHeight}`;
  
  const characterY = useMotionValue(0);
  const characterProgress = useTransform(characterY, [0, pathHeight], [0, 1]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    if (measurements.length === 0 || logs.length <= 1) return;
    
    let newY = 0;
    let newIndex = 0;
    let currentlyParked = false;
    
    for (let i = 0; i < logs.length; i++) {
      const m = measurements[i];
      const nodeY = i * (pathHeight / (logs.length - 1));
      const nextNodeY = i < logs.length - 1 ? (i + 1) * (pathHeight / (logs.length - 1)) : nodeY;
      
      if (latest <= m.bottom) {
        newY = nodeY;
        newIndex = i;
        currentlyParked = true;
        break;
      } else if (i < logs.length - 1 && latest > m.bottom && latest < measurements[i+1].top) {
        const gapStart = m.bottom;
        const gapEnd = measurements[i+1].top;
        const progressInGap = (latest - gapStart) / (gapEnd - gapStart);
        newY = nodeY + progressInGap * (nextNodeY - nodeY);
        newIndex = i;
        currentlyParked = false;
        break;
      } else if (i === logs.length - 1 && latest > m.bottom) {
        newY = nodeY;
        newIndex = i;
        currentlyParked = true;
      }
    }
    
    characterY.set(newY);
    if (activeIndex !== newIndex) setActiveIndex(newIndex);
    setIsParked((prev) => prev !== currentlyParked ? currentlyParked : prev);
  });

  return (
    <div className="flex flex-col md:flex-row relative w-full max-w-5xl mx-auto pt-12 pb-24 gap-8 md:gap-0" id="logs" ref={containerRef}>
      {/* LEFT: Sticky Path */}
      <div className="w-full md:w-32 shrink-0 relative hidden md:block">
        <div className="sticky top-32 w-full" style={{ height: `${pathHeight}px` }}>
          
          <div className="absolute inset-0 pointer-events-none">
            <svg width={pathWidth} height={pathHeight} viewBox={`0 0 ${pathWidth} ${pathHeight}`} fill="none" className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible">
              <path d={svgPath} stroke="#1e293b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <motion.path d={svgPath} stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: characterProgress }} />
            </svg>
          </div>

          {/* Nodes spaced evenly on the sticky path */}
          {logs.map((log, i) => {
            const yPos = i * (pathHeight / Math.max(1, logs.length - 1));
            const isPastOrActive = activeIndex >= i;
            const isCurrent = activeIndex === i;
            
            return (
              <div 
                key={log.id} 
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none" 
                style={{ top: `${yPos}px`, zIndex: 10 }}
              >
                <div className={`absolute right-6 flex flex-col items-end transition-all duration-300 w-32 md:w-40 ${isCurrent ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <span className="text-sm font-bold whitespace-nowrap">{log.date}</span>
                  <span className={`text-xs text-right truncate w-full ${isCurrent ? 'text-cyan-300/80' : 'text-slate-500'}`} title={log.title}>
                    {log.title}
                  </span>
                </div>
                <div 
                  className={`w-4 h-4 rounded-full border-[3px] transition-all duration-300 ${
                    isPastOrActive ? 'bg-cyan-500 border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-900 border-slate-700'
                  }`} 
                />
              </div>
            );
          })}

          <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[85%] z-20 pointer-events-none" style={{ x: 0, y: characterY }}>
             <RoverSprite progress={characterProgress} pathHeight={pathHeight} isParked={isParked} />
          </motion.div>
        </div>
      </div>

      {/* Mobile Path Line (Visible only on small screens) */}
      <div className="md:hidden absolute left-[27px] top-12 bottom-24 w-[2px] bg-slate-800 rounded-full" />

      {/* RIGHT: Stacked Content Cards */}
      <div className="w-full md:flex-1 relative flex flex-col z-30">
        {logs.map((log, i) => (
          <div 
            key={log.id} 
            ref={(el) => { cardRefs.current[i] = el; }} 
            className="mb-16 md:mb-[120vh] last:mb-0 transition-all duration-700 ease-out relative"
            style={{ 
              opacity: activeIndex >= i ? 1 : 0,
              transform: activeIndex >= i ? 'translateY(0)' : 'translateY(40px)'
            }}
          >
            {/* Mobile Timeline Dot */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              className="absolute left-[27px] -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-500 border-[3px] border-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10 md:hidden mt-6" 
            />

            <div className="w-full pl-[60px] md:pl-0">
              <GlassCard className="p-6 md:p-8 shadow-2xl border-cyan-900/30">
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
                       <a href={log.github} target="_blank" rel="noopener noreferrer" onClick={() => posthog?.capture('project_link_clicked', { type: 'github', url: log.github, log_title: log.title })} className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="GitHub">
                         <GithubIcon size={16} />
                       </a>
                    )}
                    {log.linkedin && (
                       <a href={log.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => posthog?.capture('project_link_clicked', { type: 'linkedin', url: log.linkedin, log_title: log.title })} className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="LinkedIn">
                         <LinkedinIcon size={16} />
                       </a>
                    )}
                    {log.kaggle && (
                       <a href={log.kaggle} target="_blank" rel="noopener noreferrer" onClick={() => posthog?.capture('project_link_clicked', { type: 'kaggle', url: log.kaggle, log_title: log.title })} className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="Kaggle">
                         <KaggleIcon size={16} />
                       </a>
                    )}
                    {(log.live || log.link) && (
                       <a href={log.live || log.link!} target="_blank" rel="noopener noreferrer" onClick={() => posthog?.capture('project_link_clicked', { type: 'live', url: log.live || log.link, log_title: log.title })} className="p-2 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors shadow-sm" title="Link">
                         <ArrowUpRight size={16} />
                       </a>
                    )}
                  </div>
                </div>
                <div className="prose prose-invert prose-base max-w-none prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl">
                  <ReactMarkdown>{log.content}</ReactMarkdown>
                </div>
              </GlassCard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
