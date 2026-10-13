"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AvatarContextType {
  hoverFrames: HTMLImageElement[];
  landFrames: HTMLImageElement[];
  isLoaded: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  hoverFrames: [],
  landFrames: [],
  isLoaded: false,
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [hoverFrames, setHoverFrames] = useState<HTMLImageElement[]>([]);
  const [landFrames, setLandFrames] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run this on the client
    if (typeof window === 'undefined') return;

    const totalHoverFrames = 190;
    const totalLandFrames = 69;
    let loadedHoverCount = 0;
    let loadedLandCount = 0;
    let revealed = false;
    let cancelled = false;
    // Frames are pre-keyed transparent WebP, so they can be drawn directly —
    // no per-pixel chroma-keying on the main thread.
    const hover: HTMLImageElement[] = new Array(totalHoverFrames);
    const land: HTMLImageElement[] = new Array(totalLandFrames);
    const pending = new Set<HTMLImageElement>();

    const commit = () => {
      // Hand out fresh array references so consumers pick up newly decoded frames.
      setHoverFrames(hover.slice());
      setLandFrames(land.slice());
    };

    const onFrameReady = () => {
      const total = loadedHoverCount + loadedLandCount;

      // Reveal as soon as the first frame of each sequence is ready so the
      // sprite can start animating instead of blocking on all 259 frames.
      if (!revealed && hover[0] && land[0]) {
        revealed = true;
        commit();
        setIsLoaded(true);
        return;
      }

      // Stream the rest in without blocking: commit in small batches to keep
      // re-renders cheap while the remaining frames decode.
      if (total === totalHoverFrames + totalLandFrames) {
        commit();
      } else if (revealed && total % 24 === 0) {
        commit();
      }
    };

    const loadSequence = (
      total: number,
      path: string,
      arr: HTMLImageElement[],
      isHover: boolean,
    ) => {
      for (let i = 1; i <= total; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          pending.delete(img);
          if (cancelled) return;
          arr[i - 1] = img;
          if (isHover) loadedHoverCount++; else loadedLandCount++;
          onFrameReady();
        };
        img.onerror = () => {
          pending.delete(img);
          if (cancelled) return;
          // Keep the counters moving so the "all done" commit can still fire.
          if (isHover) loadedHoverCount++; else loadedLandCount++;
          onFrameReady();
        };
        img.src = `${path}/frame_${String(i).padStart(3, '0')}.webp`;
        pending.add(img);
      }
    };

    const start = () => {
      if (cancelled) return;
      loadSequence(totalHoverFrames, '/hover', hover, true);
      loadSequence(totalLandFrames, '/landing', land, false);
    };

    // Defer the fetch until the browser is idle so it never competes with the
    // initial page render / hydration.
    let idleId = 0;
    let timeoutId = 0;
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(start, 200);
    }

    return () => {
      cancelled = true;
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
      pending.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      pending.clear();
    };
  }, []);

  return (
    <AvatarContext.Provider value={{ hoverFrames, landFrames, isLoaded }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatarContext() {
  return useContext(AvatarContext);
}
