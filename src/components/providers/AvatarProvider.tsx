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
    const processedHover: HTMLCanvasElement[] = new Array(totalHoverFrames);
    const processedLand: HTMLCanvasElement[] = new Array(totalLandFrames);

    const checkDone = () => {
       if (loadedHoverCount === totalHoverFrames && loadedLandCount === totalLandFrames) {
          setHoverFrames(processedHover);
          setLandFrames(processedLand);
          setIsLoaded(true);
       }
    };

    const processImage = (img: HTMLImageElement, arr: HTMLCanvasElement[], index: number, isHover: boolean) => {
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
        checkDone();
    };

    for (let i = 1; i <= totalHoverFrames; i++) {
      const img = new Image();
      img.src = `/hover/frame_${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => processImage(img, processedHover, i - 1, true);
    }
    
    for (let i = 1; i <= totalLandFrames; i++) {
      const img = new Image();
      img.src = `/landing/frame_${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => processImage(img, processedLand, i - 1, false);
    }
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
