"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { readConsent, subscribeToConsent, writeConsent } from "@/lib/consent";

// The server can't know the stored choice, so it renders nothing ("unknown") and the
// client decides after hydration. That avoids flashing the banner at returning visitors.
const serverSnapshot = () => "unknown" as const;

export function ConsentBanner() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeToConsent, readConsent, serverSnapshot);

  if (consent !== null || pathname?.startsWith("/admin")) return null;

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="consent-in fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-5 text-sm text-slate-300 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:inset-x-auto sm:left-5 sm:bottom-5"
    >
      <p className="leading-relaxed">
        I use PostHog analytics to see which projects people read. It only runs, and only sets a
        cookie, if you allow it.{" "}
        <Link href="/privacy" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
          Privacy policy
        </Link>
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => writeConsent("granted")}
          className="h-10 flex-1 rounded-full bg-cyan-400 px-4 font-semibold text-slate-950 transition-[transform,background-color] duration-150 hover:bg-cyan-300 active:scale-[0.97]"
        >
          Allow analytics
        </button>
        <button
          onClick={() => writeConsent("denied")}
          className="h-10 flex-1 rounded-full border border-white/15 px-4 font-semibold text-slate-200 transition-colors duration-150 hover:border-white/30 hover:text-white"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
