"use client";

import { useSyncExternalStore } from "react";

// Preview-only: the homepage design ideas side by side, switchable from the Ideas panel.
// Once an option is picked for each section, keep that component and delete the rest
// (and this file) before merging to main.
export const IDEAS = {
  hero: {
    label: "Hero",
    options: [
      { id: "classic", label: "Classic video", note: "What's live on main: the background video hero." },
      { id: "editor", label: "Copilot editor", note: "A live editor types one file per pillar." },
      { id: "dive", label: "Editor + scroll dive", note: "Desktop: scrolling lifts the title and dives into the editor." },
      { id: "xray", label: "X-ray lens", note: "Cursor lens reveals the system behind the name (pillars from the db)." },
    ],
  },
  pillars: {
    label: "Pillar filter",
    options: [
      { id: "classic", label: "Classic tabs", note: "What's live on main." },
      { id: "console", label: "Console", note: "Segmented control with project counts and an `ls work --pillar` echo." },
      { id: "kinetic", label: "Kinetic index", note: "Big type rows; weight grows on hover and the pillar summary unfolds." },
    ],
  },
  projects: {
    label: "Projects",
    options: [
      { id: "classic", label: "Classic grid", note: "What's live on main." },
      { id: "bento", label: "Artifact bento", note: "Varied card sizes; each card wakes a mini artifact on hover." },
      { id: "assemble", label: "Bento + assembly", note: "Same bento, scattered like an exploded diagram until you scroll to it." },
    ],
  },
  experience: {
    label: "Experience",
    options: [
      { id: "classic", label: "Classic timeline", note: "What's live on main." },
      { id: "gitlog", label: "git log", note: "Roles as a `git log --graph` with hashes and tags." },
      { id: "replay", label: "git log + replay", note: "Scrolling replays the history; commits light up as they're reached." },
    ],
  },
  titles: {
    label: "Section titles",
    options: [
      { id: "plain", label: "Plain", note: "Static headings." },
      { id: "ghost", label: "Ghost trails", note: "Outlined copies trail the heading with scroll speed. Applies to the new Projects/Experience." },
    ],
  },
} as const;

export type IdeaKey = keyof typeof IDEAS;
export type IdeaChoice<K extends IdeaKey> = (typeof IDEAS)[K]["options"][number]["id"];
type Choices = { [K in IdeaKey]: IdeaChoice<K> };

export const IDEA_KEYS = Object.keys(IDEAS) as IdeaKey[];

// Start on the newest version of every section; "All classic" in the panel shows main.
export const NEWEST: Choices = { hero: "xray", pillars: "kinetic", projects: "assemble", experience: "replay", titles: "ghost" };
export const CLASSIC: Choices = { hero: "classic", pillars: "classic", projects: "classic", experience: "classic", titles: "plain" };

const STORAGE_KEY = "ideas.v1";
const EVENT = "ideaschange";

function isValid<K extends IdeaKey>(key: K, value: unknown): value is IdeaChoice<K> {
  return IDEAS[key].options.some((o) => o.id === value);
}

let current: Choices | null = null;

function load(): Choices {
  const next: Choices = { ...NEWEST };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (const key of IDEA_KEYS) if (isValid(key, saved[key])) (next as Record<IdeaKey, string>)[key] = saved[key];
  } catch {}
  // ?hero=classic&projects=bento overrides what's saved, so a combination can be shared as a link.
  const params = new URLSearchParams(window.location.search);
  for (const key of IDEA_KEYS) {
    const value = params.get(key);
    if (isValid(key, value)) (next as Record<IdeaKey, string>)[key] = value;
  }
  return next;
}

function choices(): Choices {
  if (!current) current = load();
  return current;
}

export function setIdeas(update: Partial<Choices>) {
  current = { ...choices(), ...update };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
  // Keep the address bar in sync so "copy link" shares exactly what's on screen.
  const url = new URL(window.location.href);
  for (const key of IDEA_KEYS) url.searchParams.set(key, current[key]);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

// The server always renders the newest set; a saved choice swaps in right after hydration.
export function useIdea<K extends IdeaKey>(key: K): IdeaChoice<K> {
  return useSyncExternalStore(
    subscribe,
    () => choices()[key],
    () => NEWEST[key],
  ) as IdeaChoice<K>;
}
