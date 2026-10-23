"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders `children` only once the placeholder scrolls near the viewport.
 * Used to defer heavy, below-the-fold sections (e.g. the 3D journey canvas
 * and its WebGL textures) so their JS/assets stay off the initial load path.
 *
 * `minHeight` reserves vertical space so mounting the real content does not
 * cause layout shift.
 */
export function LazyMount({
  children,
  minHeight = 600,
  rootMargin = "300px",
}: {
  children: React.ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;

    // Fallback for environments without IntersectionObserver.
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
