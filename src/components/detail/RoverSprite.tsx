"use client";

import React, { useRef, useEffect } from 'react';
import { useMotionValueEvent, MotionValue } from 'framer-motion';
import { useAvatarContext } from '@/components/providers/AvatarProvider';

interface RoverSpriteProps {
  progress: MotionValue<number>;
  pathHeight: number;
  isParked?: boolean;
}

export function RoverSprite({ progress, pathHeight, isParked = true }: RoverSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Consume the globally preloaded frames
  const { hoverFrames, landFrames, isLoaded } = useAvatarContext();

  const engineState = useRef<'FLYING' | 'LANDING' | 'TAKING_OFF'>('LANDING');
  const frameIndex = useRef(0);

  useEffect(() => {
    if (isParked) {
       // If transitioning from FLYING to LANDING, start the landing animation from the beginning
       if (engineState.current === 'FLYING') {
           frameIndex.current = 0;
       }
       engineState.current = 'LANDING';
    } else {
       // If transitioning from LANDING to TAKING OFF, just reverse the current frame index
       // If he was fully landed, frameIndex is at the end, so he will smoothly stand up.
       engineState.current = 'TAKING_OFF';
    }
  }, [isParked]);

  // Animation Engine Loop
  useEffect(() => {
    if (!isLoaded || hoverFrames.length === 0 || landFrames.length === 0) return;
    
    let animationId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      animationId = requestAnimationFrame(render);
      const deltaTime = time - lastTime;
      
      let currentFps = 24;
      if (engineState.current === 'LANDING') currentFps = 90;
      if (engineState.current === 'TAKING_OFF') currentFps = 240;
      
      const interval = 1000 / currentFps;
      const framesToAdvance = Math.floor(deltaTime / interval);
      
      if (framesToAdvance > 0) {
        lastTime = time - (deltaTime % interval);
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame: HTMLCanvasElement | undefined;

        if (engineState.current === 'FLYING') {
           frameIndex.current = (frameIndex.current + framesToAdvance) % hoverFrames.length;
           frame = hoverFrames[frameIndex.current];
        } 
        else if (engineState.current === 'LANDING') {
           frameIndex.current = Math.min(frameIndex.current + framesToAdvance, landFrames.length - 1);
           frame = landFrames[frameIndex.current];
        }
        else if (engineState.current === 'TAKING_OFF') {
           frameIndex.current -= framesToAdvance;
           if (frameIndex.current <= 0) {
              engineState.current = 'FLYING';
              frameIndex.current = 0;
           } else {
              frame = landFrames[frameIndex.current];
           }
        }

        // If it switched to FLYING this frame, grab the first flying frame
        if (!frame && engineState.current === 'FLYING') {
           frame = hoverFrames[frameIndex.current];
        }

        if (frame) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const baseScale = (canvas.height / frame.height) * 1.0;
          const drawWidth = frame.width * baseScale;
          const drawHeight = frame.height * baseScale;
          
          const x = (canvas.width - drawWidth) / 2;
          const y = (canvas.height - drawHeight) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(frame, x, y, drawWidth, drawHeight);
        }
      }
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isLoaded, hoverFrames, landFrames]);

  return (
    <div className="relative flex items-center justify-center -ml-2">
      {/* Fallback loading state while images are processing */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin" />
        </div>
      )}
      
      {/* High-res canvas. Using CSS width/height to scale it down sharply */}
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600} 
        className={`w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  );
}
