"use client";

import { useEffect, useState } from "react";
import { Check, Lightbulb, Link2, X } from "lucide-react";
import { CLASSIC, IDEAS, IDEA_KEYS, NEWEST, setIdeas, useIdea, type IdeaKey } from "@/lib/ideas";

// Preview-only switcher for the homepage design ideas. Delete with src/lib/ideas.ts
// once each section's version is chosen.
export function IdeasPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Design ideas"
          className="fixed right-3 top-[140px] z-[70] max-h-[calc(100dvh-160px)] w-[min(360px,calc(100vw-24px))] sm:top-auto sm:bottom-20 sm:max-h-[75vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-sm text-slate-300 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:right-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-white">Design ideas</p>
            <button onClick={() => setOpen(false)} aria-label="Close design ideas" className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">
            Switch each section between what&apos;s on main and the new ideas. Your picks are saved in this browser and in the link.
          </p>
          <div className="space-y-4">
            {IDEA_KEYS.map((key) => (
              <IdeaRow key={key} ideaKey={key} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button onClick={() => setIdeas(CLASSIC)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium hover:border-white/25 hover:text-white">
              All classic
            </button>
            <button onClick={() => setIdeas(NEWEST)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium hover:border-white/25 hover:text-white">
              All newest
            </button>
            <button onClick={copyLink} className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium hover:border-white/25 hover:text-white">
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      )}
      {/* Under the header on phones, so it never covers the full-width consent banner */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="fixed right-3 top-[88px] z-[70] inline-flex sm:top-auto sm:bottom-5 h-11 items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900/90 px-4 text-sm font-semibold text-cyan-200 shadow-lg backdrop-blur-xl transition-colors hover:border-cyan-300 hover:text-white sm:right-5"
      >
        <Lightbulb size={16} />
        Ideas
      </button>
    </>
  );
}

function IdeaRow({ ideaKey }: { ideaKey: IdeaKey }) {
  const idea = IDEAS[ideaKey];
  const selected = useIdea(ideaKey);
  const note = idea.options.find((o) => o.id === selected)?.note;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{idea.label}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={idea.label}>
        {idea.options.map((option) => {
          const active = option.id === selected;
          return (
            <button
              key={option.id}
              aria-pressed={active}
              onClick={() => setIdeas({ [ideaKey]: option.id })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-cyan-400 text-slate-950" : "border border-white/10 text-slate-300 hover:border-white/25 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {note && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{note}</p>}
    </div>
  );
}
