"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogTimeline } from "@/components/detail/LogTimeline";
import { JourneyCanvas } from "./journey3d/JourneyCanvas";

export function OverallJourney({ pillars, allLogs }: { pillars: any[], allLogs: any[] }) {
  const [isMobile, setIsMobile] = useState(true); // default to true to prevent hydration mismatch

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);



  return (
    <section className="pt-4 pb-0">
      <motion.h2
        className="text-2xl font-bold tracking-tight text-white mb-8 px-2 md:hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Overall Journey
      </motion.h2>
      
      {isMobile ? (
        <LogTimeline logs={allLogs} />
      ) : (
        <JourneyCanvas logs={allLogs} />
      )}
    </section>
  );
}
