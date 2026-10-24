"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { capture } from "@/lib/analytics";
import { openBooking } from "@/lib/booking";
import { resetConsent } from "@/lib/consent";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative z-10 mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {/* The one call to action: everything on the site leads here */}
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Got something to build?</p>
            <h2
              className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Let&apos;s talk about it.
            </h2>
          </div>
          <button
            onClick={() => {
              capture("book_call_clicked", { location: "footer" });
              openBooking();
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-cyan-400 px-7 text-[15px] font-semibold text-slate-950 transition-[transform,background-color] duration-150 hover:bg-cyan-300 active:scale-[0.97]"
          >
            Book a call <ArrowRight size={16} />
          </button>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Sanjay Azhagan</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/journal" className="transition-colors hover:text-white">Journal</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <button onClick={resetConsent} className="transition-colors hover:text-white">Cookie settings</button>
            <a href="https://github.com/Sanjayazhagan" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
