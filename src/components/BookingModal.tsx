"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";
import Cal, { getCalApi } from "@calcom/embed-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Update this if you create a specific event type (e.g. "sanjay-azhagan/15min")
const CAL_LINK = "sanjay-azhagan";

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  useEffect(() => {
    if (isOpen) {
      (async function () {
        const cal = await getCalApi();
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#0891b2" } }, // cyan-600
          hideEventTypeDetails: false,
          layout: "month_view"
        });
        cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
      })();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-4xl max-h-[90vh] pointer-events-auto flex flex-col"
            >
              <GlassCard className="p-2 sm:p-6 !bg-slate-900/95 border-slate-700/50 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-xl font-bold tracking-tight text-white px-2">Book a Call</h2>
                  <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="w-full h-[560px] overflow-hidden bg-slate-950/50 rounded-xl rounded-b-none border-t border-slate-800 relative">
                  {/* CSS Hack to crop the Cal.com watermark at the bottom */}
                  <div className="absolute top-0 left-0 right-0 -bottom-[60px]">
                    <Cal 
                      calLink={CAL_LINK} 
                      style={{ width: "100%", height: "100%", overflow: "scroll" }}
                      config={{ layout: "month_view" }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
