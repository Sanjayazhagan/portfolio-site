import type { PostHog } from "posthog-js";
import { readConsent } from "./consent";

/**
 * Lazy, consent-gated PostHog loader.
 *
 * posthog-js (~220KB) is loaded via dynamic import() only, so it never lands
 * in the initial/shared bundle, and only after the visitor allows analytics
 * (see ConsentBanner). Events captured before they decide are queued: sent if
 * they allow, dropped if they decline.
 */

type QueuedEvent = { event: string; props?: Record<string, unknown> };

const MAX_QUEUED = 50;

let instance: PostHog | null = null;
let loading: Promise<void> | null = null;
const queue: QueuedEvent[] = [];

function posthogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

/** Load + initialize posthog-js once, if the visitor has allowed it. Safe to call repeatedly. */
export function loadPosthog(): void {
  if (typeof window === "undefined" || instance || loading || !posthogKey()) {
    return;
  }
  if (readConsent() !== "granted") return;

  loading = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(posthogKey()!, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false, // tracked manually for soft navigations
        capture_pageleave: true,
      });
      instance = posthog;
      // Flush anything captured while loading.
      const pending = queue.splice(0, queue.length);
      for (const e of pending) {
        posthog.capture(e.event, e.props);
      }
    })
    .catch((err) => {
      console.error("Failed to load analytics:", err);
      loading = null; // allow a later retry
    });
}

// PostHog keeps its state in `ph_*` cookies and localStorage keys.
function clearPosthogStorage() {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("ph_")) window.localStorage.removeItem(key);
    }
  } catch {
    // storage blocked
  }
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name?.startsWith("ph_")) {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

/** Bring analytics in line with the current consent choice. */
export function applyConsent(): void {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (consent === "granted") {
    if (instance?.has_opted_out_capturing()) instance.opt_in_capturing();
    loadPosthog();
  } else if (consent === "denied") {
    queue.length = 0;
    if (instance) instance.opt_out_capturing();
    clearPosthogStorage();
  }
}

/**
 * Capture an event. If posthog hasn't loaded yet the event is queued and sent
 * once it does (or discarded if the visitor declines), so this is always safe
 * to call from handlers and effects.
 */
export function capture(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (instance) {
    instance.capture(event, props);
    return;
  }
  if (readConsent() === "denied") return;
  if (queue.length < MAX_QUEUED) queue.push({ event, props });
}
