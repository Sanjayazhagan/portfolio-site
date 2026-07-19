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
        <GlassCard className="flex items-center justify-between px-6 py-3 !rounded-full">
          {/* Left */}
          <Link href="/" className="flex items-center">
            <img src="/logo2.png?v=7" alt="Sanjay Azhagan Logo" width={60} height={60} className="w-10 h-10 object-contain scale-[1.5] origin-left" />
          </Link>
          
          {/* Center: Command Palette Trigger */}
          <button 
            id="search-trigger"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors text-slate-400 text-sm"
          >
            <Search size={16} />
            <span>Search...</span>
            <kbd className="ml-4 font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 shadow-sm text-slate-400">⌘K</kbd>
          </button>

          {/* Right */}
          <div className="flex items-center gap-6">
            <Link href="/journal" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Journal
            </Link>
            <button 
              onClick={() => {
                posthog?.capture('resume_clicked');
              }}
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors hidden md:block"
            >
              Resume
            </button>
            <button 
              onClick={() => {
                posthog?.capture('book_call_clicked', { location: 'header' });
                setIsBookingOpen(true);
              }}
              className="text-sm font-medium bg-cyan-600 text-white px-5 py-2 rounded-full shadow-sm hover:bg-cyan-500 hover:shadow-md transition-all active:scale-95"
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
