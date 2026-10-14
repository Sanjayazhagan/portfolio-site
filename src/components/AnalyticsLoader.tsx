"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { capture, loadPosthog } from "@/lib/analytics";

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
 * Mounts analytics without blocking initial load: posthog-js is pulled in and
 * initialized only once the browser goes idle after the page has loaded.
 */
export function AnalyticsLoader() {
  useEffect(() => {
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => loadPosthog(), { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => loadPosthog(), 2000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}
