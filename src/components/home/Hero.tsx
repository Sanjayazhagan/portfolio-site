"use client";

import { motion } from "framer-motion";
import { CodeXml, Database, Cloud, BrainCircuit } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 min-h-[85vh] -mt-24 pt-24 mb-0 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background Video with CSS Mask to fade out at the bottom */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ 
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)", 
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" 
        }}
      >
        <source src="/1000109720.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay to fade the top into the header and darken the video */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/20 to-transparent z-0 pointer-events-none"></div>

      {/* Content */}
      <motion.div
        className="relative z-10 px-4 flex flex-col items-center translate-y-[20vh] md:translate-y-[15vh] scale-[0.8] origin-center"
        style={{ fontFamily: "var(--font-montserrat)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Name Header */}
        <h1 className="flex flex-col items-center text-3xl md:text-5xl lg:text-6xl font-black tracking-[0.3em] md:tracking-[0.4em] mb-10 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl pl-[0.3em]">
            SANJAY
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl pl-[0.3em]">
            AZHAGAN
          </span>
        </h1>

        {/* Roles Line */}
        <div className="flex items-center gap-3 text-[8px] md:text-[10px] font-semibold tracking-[0.3em] text-slate-400 mb-10 uppercase">
          <div className="h-[1px] w-8 md:w-16 bg-slate-700"></div>
          <span>Engineer</span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          <span>Builder</span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
          <span>Optimizer</span>
          <div className="h-[1px] w-8 md:w-16 bg-slate-700"></div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 md:gap-6 text-slate-300 mb-10">
          <CodeXml size={24} className="opacity-80 hover:opacity-100 hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
          <div className="h-6 w-px bg-slate-700"></div>
          <Database size={24} className="opacity-80 hover:opacity-100 hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
          <div className="h-6 w-px bg-slate-700"></div>
          <Cloud size={24} className="opacity-80 hover:opacity-100 hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
          <div className="h-6 w-px bg-slate-700"></div>
          <BrainCircuit size={24} className="opacity-80 hover:opacity-100 hover:text-cyan-400 transition-colors" strokeWidth={1.5} />
        </div>

        {/* Tagline */}
        <p className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          Scalable Systems. <span className="text-cyan-400">Intelligent Solutions.</span>
        </p>
      </motion.div>
    </section>
  );
}
