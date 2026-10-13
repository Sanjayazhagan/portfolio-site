"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "./JourneyCanvas";

const Z_SPACING = 15;

export function JourneyNode({ log, index, total, containerRef }: { log: any, index: number, total: number, containerRef: React.RefObject<HTMLDivElement | null> }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const defaultImages = [
    "/journey_1.jpg",
    "/journey_2.jpg",
    "/journey_3.jpg",
    "/journey_4.jpg"
  ];
  const imagePath = log.image || defaultImages[index % defaultImages.length];
  const texture = useTexture(imagePath) as THREE.Texture;

  // Alternate sides: even = RIGHT, odd = LEFT
  const isEven = index % 2 === 0;
  const xPosition = isEven ? 3.5 : -3.5;
  const zPosition = -(index * Z_SPACING);
  const rotationY = isEven ? -0.2 : 0.2;

  // Gentle float
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(Date.now() / 1500 + index) * 0.08;
  });

  return (
    <group ref={groupRef} position={[xPosition, 0, zPosition]} rotation={[0, rotationY, 0]}>
      {/* Monitor Screen - Portrait */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      
      {/* Glowing Neon Frame */}
      <lineSegments position={[0, 0, 0.05]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(2.4, 3.4)]} />
        <lineBasicMaterial color={isEven ? "#22d3ee" : "#a78bfa"} linewidth={2} toneMapped={false} />
      </lineSegments>
      
      {/* Backlight glow */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[2.8, 3.8]} />
        <meshBasicMaterial color={isEven ? "#0891b2" : "#7c3aed"} transparent opacity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}
