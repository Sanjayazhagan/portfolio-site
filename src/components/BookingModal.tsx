"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarCheck, Clock, Mail } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <GlassCard className="p-6 !bg-slate-900/95 border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-white">Book a Call</h2>
                  <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    I'm currently open to discussing new opportunities, distributed systems challenges, or just grabbing a virtual coffee.
                  </p>

                  <button className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white font-medium px-4 py-3 rounded-xl shadow-sm hover:bg-cyan-500 transition-colors">
                    <CalendarCheck size={18} />
                    Schedule via Calendly
                  </button>

                  <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} />
                      15 or 30 min
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={16} />
                      Direct Email
                    </div>
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
