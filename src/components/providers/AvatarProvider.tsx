"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AvatarContextType {
  hoverFrames: HTMLCanvasElement[];
  landFrames: HTMLCanvasElement[];
  isLoaded: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  hoverFrames: [],
  landFrames: [],
  isLoaded: false,
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [hoverFrames, setHoverFrames] = useState<HTMLCanvasElement[]>([]);
  const [landFrames, setLandFrames] = useState<HTMLCanvasElement[]>([]);
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
    const processedHover: HTMLCanvasElement[] = new Array(totalHoverFrames);
    const processedLand: HTMLCanvasElement[] = new Array(totalLandFrames);
    const pending = new Set<HTMLImageElement>();

    const commit = () => {
      // Hand out fresh array references so consumers pick up newly decoded frames.
      setHoverFrames(processedHover.slice());
      setLandFrames(processedLand.slice());
    };

    const onFrameReady = () => {
      const total = loadedHoverCount + loadedLandCount;

      // Reveal as soon as the first frame of each sequence is ready so the
      // sprite can start animating instead of blocking on all 259 frames.
      if (!revealed && processedLand[0] && processedHover[0]) {
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

    const processImage = (
      img: HTMLImageElement,
      arr: HTMLCanvasElement[],
      index: number,
      isHover: boolean,
    ) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const ctx = offscreen.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const data = imageData.data;

        for (let j = 0; j < data.length; j += 4) {
          const r = data[j];
          const g = data[j + 1];
          const b = data[j + 2];
          const maxRB = Math.max(r, b);

          if (g > maxRB + 35) {
            data[j + 3] = 0;
          } else {
            if (g > maxRB) data[j + 1] = maxRB;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        arr[index] = offscreen;
      }

      if (isHover) loadedHoverCount++; else loadedLandCount++;
      onFrameReady();
    };

    const loadSequence = (
      total: number,
      path: string,
      arr: HTMLCanvasElement[],
      isHover: boolean,
    ) => {
      for (let i = 1; i <= total; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          pending.delete(img);
          if (cancelled) return;
          processImage(img, arr, i - 1, isHover);
        };
        img.onerror = () => {
          pending.delete(img);
          if (cancelled) return;
          // Keep the counters moving so the "all done" commit can still fire.
          if (isHover) loadedHoverCount++; else loadedLandCount++;
          onFrameReady();
        };
        img.src = `${path}/frame_${String(i).padStart(3, '0')}.jpg`;
        pending.add(img);
      }
    };

    const start = () => {
      if (cancelled) return;
      loadSequence(totalHoverFrames, '/hover', processedHover, true);
      loadSequence(totalLandFrames, '/landing', processedLand, false);
    };

    // Defer the heavy fetch + main-thread chroma-keying until the browser is
    // idle so it never competes with the initial page render / hydration.
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
