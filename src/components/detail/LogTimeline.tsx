"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useMotionValueEvent, useMotionValue, useTransform } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, BookOpenCheck, Code } from "lucide-react";
import { RoverSprite } from "./RoverSprite";

interface Log {
  id: string;
  date: string;
  title: string;
  type: string;
  content: string;
  link?: string;
}

export function LogTimeline({ logs }: { logs: Log[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stickyHeight, setStickyHeight] = useState(600);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isParked, setIsParked] = useState(true);
  const [measurements, setMeasurements] = useState<{top: number, bottom: number}[]>([]);

  useEffect(() => {
    // Height of the sticky window path
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
        // offset relative to container
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        return { top: top / containerHeight, bottom: bottom / containerHeight };
      });
      setMeasurements(newMeasurements);
    };
    
    // Give DOM a tick to layout
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

  // Track scroll of the ENTIRE stacked container
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
        // Character is STOPPED at the current node while user reads the card
        newY = nodeY;
        newIndex = i;
        currentlyParked = true;
        break;
      } else if (i < logs.length - 1 && latest > m.bottom && latest < measurements[i+1].top) {
        // Character WALKS in the gap between cards
        const gapStart = m.bottom;
        const gapEnd = measurements[i+1].top;
        const progressInGap = (latest - gapStart) / (gapEnd - gapStart);
        newY = nodeY + progressInGap * (nextNodeY - nodeY);
        newIndex = i; // Avatar has not reached the next node yet
        currentlyParked = false;
        break;
      } else if (i === logs.length - 1 && latest > m.bottom) {
        // Past the last card
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
    <div className="flex flex-col md:flex-row relative w-full pt-12 pb-24 gap-8 md:gap-0" id="logs" ref={containerRef}>
      {/* LEFT: Sticky Path */}
      <div className="w-full md:w-32 shrink-0 relative hidden md:block">
        <div className="sticky top-32 w-full" style={{ height: `${pathHeight}px` }}>
          
          <div className="absolute inset-0 pointer-events-none">
            <svg width={pathWidth} height={pathHeight} viewBox={`0 0 ${pathWidth} ${pathHeight}`} fill="none" className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible">
              <path d={svgPath} stroke="#334155" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <motion.path d={svgPath} stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: characterProgress }} />
            </svg>
          </div>

          {/* Nodes spaced evenly on the sticky path */}
          {logs.map((log, i) => {
            const yPos = i * (pathHeight / Math.max(1, logs.length - 1));
            // A node lights up if the avatar has reached it (activeIndex >= i)
            const isPastOrActive = activeIndex >= i;
            const isCurrent = activeIndex === i;
            
            return (
              <div 
                key={log.id} 
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none" 
                style={{ top: `${yPos}px`, zIndex: 10 }}
              >
                <div className={`absolute right-6 text-sm font-bold whitespace-nowrap transition-all duration-300 ${isCurrent ? 'text-cyan-400' : 'text-slate-600'}`}>
                  {log.date}
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

      {/* RIGHT: Stacked Content Cards */}
      <div className="w-full md:flex-1 relative flex flex-col z-30">
        {logs.map((node, i) => (
          <div 
            key={node.id} 
            ref={(el) => { cardRefs.current[i] = el; }} 
            className="mb-[120vh] last:mb-0 transition-all duration-700 ease-out"
            style={{ 
              opacity: activeIndex >= i ? 1 : 0,
              transform: activeIndex >= i ? 'translateY(0)' : 'translateY(40px)'
            }}
          >
            <GlassCard className="p-6 md:p-10 shadow-2xl border-cyan-900/50">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-4">
                <span>{node.date}</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                  {node.type === "Learning" ? <BookOpenCheck size={12} /> : <Code size={12} />}
                  {node.type}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {node.title}
                </h2>
                {node.link && (
                   <a href={node.link} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-white transition-colors flex-shrink-0 shadow-sm">
                     <ArrowUpRight size={18} />
                   </a>
                )}
              </div>
              <div className="prose prose-invert prose-lg max-w-none prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl">
                <ReactMarkdown>{node.content}</ReactMarkdown>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
