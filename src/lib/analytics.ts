import type { PostHog } from "posthog-js";

/**
 * Lazy PostHog loader.
 *
 * posthog-js (~220KB) is loaded via dynamic import() only, so it never lands
 * in the initial/shared bundle. `loadPosthog()` is triggered on browser idle
 * (see AnalyticsLoader); any events captured before it finishes loading are
 * queued and flushed once the client initializes.
 */

type QueuedEvent = { event: string; props?: Record<string, unknown> };

let instance: PostHog | null = null;
let loading: Promise<void> | null = null;
const queue: QueuedEvent[] = [];

function posthogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

/** Load + initialize posthog-js once. Safe to call repeatedly. */
export function loadPosthog(): void {
  if (typeof window === "undefined" || instance || loading || !posthogKey()) {
    return;
  }

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

/**
 * Capture an event. If posthog hasn't loaded yet the event is queued and sent
 * once it does, so this is always safe to call from handlers and effects.
 */
export function capture(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (instance) {
    instance.capture(event, props);
    return;
  }
  queue.push({ event, props });
}
