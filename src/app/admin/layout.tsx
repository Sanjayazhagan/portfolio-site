"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Home } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-50 p-4">
        <GlassCard className="flex items-center justify-between px-6 py-4 rounded-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors">
              <Home size={20} />
              <span className="font-semibold hidden sm:inline">Back to Site</span>
            </Link>
            <div className="h-6 w-px bg-slate-700 mx-2" />
            <span className="text-white font-bold text-lg tracking-wide">Admin Dashboard</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-800"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </GlassCard>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
