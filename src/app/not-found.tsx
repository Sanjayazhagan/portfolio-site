import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs text-slate-400">
        <span className="text-cyan-400/80">{"$ "}</span>cd ./this-page
      </p>
      <p className="mt-1 font-mono text-xs text-slate-400">no such file or directory</p>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-5xl">404</h1>
      <p className="mt-3 max-w-md text-slate-400">This page doesn&apos;t exist — it may have moved, or the link is wrong.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-cyan-400 px-6 text-sm font-semibold text-slate-950 transition-[transform,background-color] duration-150 hover:bg-cyan-300 active:scale-[0.97]"
        >
          Back home
        </Link>
        <Link
          href="/journal"
          className="inline-flex h-11 items-center rounded-full border border-white/10 px-6 text-sm font-semibold text-slate-300 transition-colors duration-150 hover:border-white/25 hover:text-white"
        >
          Read the journal
        </Link>
      </div>
    </div>
  );
}
