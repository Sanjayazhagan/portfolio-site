"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CommandPalette } from "@/components/CommandPalette";
import { BookingModal } from "@/components/BookingModal";
import { usePostHog } from 'posthog-js/react';

export function Header({ projects, pillars }: { projects: any[], pillars: any[] }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-50">
        <GlassCard className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 !rounded-full">
          {/* Left */}
          <Link href="/" className="flex items-center">
            <img src="/logo2.png?v=7" alt="Sanjay Azhagan Logo" width={60} height={60} className="w-8 h-8 md:w-10 md:h-10 object-contain scale-[1.5] origin-left" />
          </Link>
          
          {/* Center: Command Palette Trigger */}
          <button 
            id="search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors text-slate-400 text-xs md:text-sm"
          >
            <Search size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline ml-2 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 shadow-sm text-slate-400">⌘K</kbd>
          </button>

          {/* Right */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/journal" className="hidden sm:block text-xs md:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Journal
            </Link>
            <button 
              onClick={() => {
                posthog?.capture('resume_clicked');
              }}
              className="text-xs md:text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden md:block"
            >
              Resume
            </button>
            <button 
              onClick={() => {
                posthog?.capture('book_call_clicked', { location: 'header' });
                setIsBookingOpen(true);
              }}
              className="text-xs md:text-sm font-medium bg-cyan-600 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-full shadow-sm hover:bg-cyan-500 hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              Book a Call
            </button>
          </div>
        </GlassCard>
      </header>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} projects={projects} pillars={pillars} />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  );
}
