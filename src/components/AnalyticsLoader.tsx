"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { applyConsent, capture } from "@/lib/analytics";
import { subscribeToConsent } from "@/lib/consent";

/** Captures a $pageview on every route change (incl. soft navigations). */
function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    let url = window.origin + pathname;
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Mounts analytics without blocking initial load: once the browser goes idle,
 * posthog-js is pulled in and initialized, but only if the visitor has allowed
 * analytics. Changing the choice later (banner, "Cookie settings") applies at once.
 */
export function AnalyticsLoader() {
  useEffect(() => {
    const unsubscribe = subscribeToConsent(applyConsent);
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => applyConsent(), { timeout: 3000 });
      return () => {
        w.cancelIdleCallback?.(id);
        unsubscribe();
      };
    }
    const t = window.setTimeout(() => applyConsent(), 2000);
    return () => {
      window.clearTimeout(t);
      unsubscribe();
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}
