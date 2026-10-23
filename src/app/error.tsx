"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs text-slate-500">
        <span className="text-cyan-400/80">{"$ "}</span>exit code 1
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">Something broke on this page.</h1>
      <p className="mt-3 max-w-md text-slate-400">An unexpected error stopped it from rendering. Trying again usually fixes it.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-slate-600">ref: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="inline-flex h-11 items-center rounded-full bg-cyan-400 px-6 text-sm font-semibold text-slate-950 transition-[transform,background-color] duration-150 hover:bg-cyan-300 active:scale-[0.97]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-white/10 px-6 text-sm font-semibold text-slate-300 transition-colors duration-150 hover:border-white/25 hover:text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
