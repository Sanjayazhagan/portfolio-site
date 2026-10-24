"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import "./globals.css";

// Replaces the root layout when it fails (e.g. the database is unreachable),
// so it brings its own <html>/<body> and avoids depending on anything the layout loads.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-4 text-center text-slate-50 antialiased">
        <title>Something went wrong | Sanjay Azhagan</title>
        <p className="font-mono text-xs text-slate-400">
          <span className="text-cyan-400/80">{"$ "}</span>exit code 1
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">The site hit an error.</h1>
        <p className="mt-3 max-w-md text-slate-400">It couldn&apos;t load right now. Please try again in a moment.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-slate-400">ref: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => unstable_retry()}
            className="inline-flex h-11 items-center rounded-full bg-cyan-400 px-6 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-white/10 px-6 text-sm font-semibold text-slate-300 hover:border-white/25 hover:text-white"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
