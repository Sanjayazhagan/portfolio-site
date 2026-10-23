"use client";

import { useRef, Suspense, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Grid, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { JourneyNode } from "./JourneyNode";
import * as THREE from "three";
import ReactMarkdown from "react-markdown";
import { BookOpenCheck, Code, ArrowUpRight, GitBranch, Share2, Globe, Database, ExternalLink } from "lucide-react";

export const scrollState = { progress: 0, currentIndex: 0 };

const Z_SPACING = 15;

// ─── Camera Rig ─────────────────────────────────────────────────────
function CameraRig({ containerRef, totalLogs }: { containerRef: React.RefObject<HTMLDivElement | null>, totalLogs: number }) {
  const clock = useRef(0);
  
  useFrame(({ camera }, delta) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollHeight = rect.height - window.innerHeight;
    
    let progress = 0;
    if (scrollHeight > 0) {
      progress = -rect.top / scrollHeight;
      progress = Math.max(0, Math.min(1, progress));
    }
    
    scrollState.progress = progress;
    clock.current += delta;

    const totalDistance = totalLogs * Z_SPACING;
    
    const flyPhase = Math.min(progress / 0.88, 1);
    const outroPhase = Math.max(0, (progress - 0.88) / 0.12);
    
    // Fly forward (gentle smoothing)
    const targetZ = 8 - (flyPhase * totalDistance);
    camera.position.z += (targetZ - camera.position.z) * 0.06;

    if (totalLogs > 0) {
      const currentIndex = Math.min(totalLogs - 1, Math.floor(flyPhase * totalLogs));
      scrollState.currentIndex = currentIndex;
      
      const isEven = currentIndex % 2 === 0;
      
      // Camera swings to face the active monitor side
      // Even = monitor RIGHT, Odd = monitor LEFT
      const targetRotY = outroPhase > 0 ? 0 : (isEven ? -0.12 : 0.12);
      const targetPosX = outroPhase > 0 ? 0 : (isEven ? 1.2 : -1.2);
      
      // Breathing bob
      const bobY = outroPhase > 0 ? 0 : Math.sin(clock.current * 0.7) * 0.1;
      
      // Banking
      const targetRotZ = outroPhase > 0 ? 0 : (isEven ? 0.015 : -0.015);
      
      // Outro: rise to top view
      const endZ = 8 - totalDistance;
      const targetPosY = outroPhase > 0 ? (1 + outroPhase * 30) : (1 + bobY);
      const targetRotX = outroPhase > 0 ? (-outroPhase * 1.4) : -0.015;
      
      if (outroPhase > 0) {
        camera.position.z += ((endZ + 5) - camera.position.z) * 0.04;
      }
      
      camera.rotation.y += (targetRotY - camera.rotation.y) * 0.05;
      camera.rotation.x += (targetRotX - camera.rotation.x) * 0.05;
      camera.rotation.z += (targetRotZ - camera.rotation.z) * 0.03;
      camera.position.x += (targetPosX - camera.position.x) * 0.05;
      camera.position.y += (targetPosY - camera.position.y) * 0.05;
    }
  });
  return null;
}

// ─── Procedural City ────────────────────────────────────────────────
function ProceduralCity({ totalLogs }: { totalLogs: number }) {
  const buildingRef = useRef<THREE.InstancedMesh>(null);
  const windowRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());
  const totalDepth = (totalLogs + 2) * Z_SPACING;
  
  const { buildings, windows } = useMemo(() => {
    const buildings: Array<{ x: number; z: number; height: number; width: number; depth: number }> = [];
    const windows: Array<{ x: number; y: number; z: number; sx: number; sy: number; color: string }> = [];
    
    for (let i = 0; i < 250; i++) {
      const z = 20 - (Math.random() * (totalDepth + 60));
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (9 + Math.random() * 40);
      const height = 10 + Math.random() * 55;
      const width = 3 + Math.random() * 7;
      const depth = 3 + Math.random() * 7;
      buildings.push({ x, z, height, width, depth });
      
      // Windows on inward face
      const windowFaceX = x > 0 ? x - width / 2 : x + width / 2;
      const cols = Math.floor(width / 1.5);
      const rows = Math.floor(height / 3);
      for (let row = 0; row < Math.min(rows, 8); row++) {
        for (let col = 0; col < Math.min(cols, 4); col++) {
          if (Math.random() > 0.4) continue;
          const colors = ["#22d3ee", "#f472b6", "#a78bfa", "#fbbf24", "#34d399"];
          windows.push({ 
            x: windowFaceX, y: -2.5 + 2 + row * 3, z: z + (col - cols / 2) * 1.5,
            sx: 0.5 + Math.random() * 0.3, sy: 1 + Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      }
    }
    return { buildings, windows: windows.slice(0, 800) };
  }, [totalDepth]);

  useEffect(() => {
    if (buildingRef.current) {
      buildings.forEach((b, i) => {
        dummy.current.position.set(b.x, (b.height / 2) - 2.5, b.z);
        dummy.current.scale.set(b.width, b.height, b.depth);
        dummy.current.updateMatrix();
        buildingRef.current!.setMatrixAt(i, dummy.current.matrix);
      });
      buildingRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [buildings]);

  useEffect(() => {
    if (windowRef.current) {
      windows.forEach((w, i) => {
        dummy.current.position.set(w.x, w.y, w.z);
        dummy.current.scale.set(w.sx, w.sy, 0.1);
        dummy.current.updateMatrix();
        windowRef.current!.setMatrixAt(i, dummy.current.matrix);
        windowRef.current!.setColorAt(i, new THREE.Color(w.color));
      });
      windowRef.current.instanceMatrix.needsUpdate = true;
      if (windowRef.current.instanceColor) windowRef.current.instanceColor.needsUpdate = true;
    }
  }, [windows]);

  return (
    <>
      <instancedMesh ref={buildingRef} args={[undefined, undefined, 250]}>
        <boxGeometry />
        <meshStandardMaterial color="#060612" roughness={0.4} metalness={0.9} />
      </instancedMesh>
      <instancedMesh ref={windowRef} args={[undefined, undefined, 800]}>
        <planeGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  );
}

// ─── Neon Pillars ───────────────────────────────────────────────────
function NeonPillars({ totalLogs }: { totalLogs: number }) {
  const totalDepth = (totalLogs + 2) * Z_SPACING;
  const pillars = useMemo(() => {
    const arr = [];
    for (let z = 10; z > -totalDepth; z -= 8) {
      arr.push({ x: -7, z, color: "#22d3ee" }, { x: 7, z, color: "#a78bfa" });
    }
    return arr;
  }, [totalDepth]);

  return (
    <group>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p.x, 3, p.z]}>
          <boxGeometry args={[0.12, 12, 0.12]} />
          <meshBasicMaterial color={p.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 2D Text Panel (HTML overlay) ─────────────────────────────────────
function TextPanel({ logs }: { logs: any[] }) {
  const [idxProgress, setIdxProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      // Re-calculate idxProgress exactly as in CameraRig
      const flyPhase = Math.min(scrollState.progress / 0.88, 1);
      setIdxProgress(flyPhase * logs.length);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {logs.map((log, i) => {
        const isEven = i % 2 === 0;
        
        // Calculate relative distance from current scroll position
        const distance = idxProgress - i;
        
        // Tighter window — only show the active panel
        if (distance < -0.6 || distance > 0.9) return null;
        
        // Sharp fade: fully visible when distance is 0–0.4, fades out quickly outside
        let opacity = 0;
        let translateY = 0;
        
        if (distance < 0) {
          // Approaching: fade in sharply
          opacity = Math.max(0, 1 - Math.abs(distance) * 2.5);
          translateY = Math.abs(distance) * 40;
        } else if (distance < 0.5) {
          // In view: fully visible
          opacity = 1;
          translateY = 0;
        } else {
          // Leaving: fade out sharply
          opacity = Math.max(0, 1 - (distance - 0.5) * 2.5);
          translateY = -(distance - 0.5) * 40;
        }

        return (
          <div 
            key={log.id}
            className={`absolute top-0 w-[50%] h-full flex items-center p-8 md:p-12 lg:p-20 ${isEven ? 'left-0' : 'right-0'}`}
            style={{ 
              opacity,
              transform: `translateY(${translateY}px)`,
              pointerEvents: opacity > 0.5 ? 'auto' : 'none'
            }}
          >
            <div 
              className={`relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.4)] p-8 md:p-10 rounded-2xl w-full max-w-xl transition-transform duration-75 overflow-hidden group ${isEven ? '' : 'ml-auto'}`}
            >
              {/* Cyan side indicator matching ExperienceTimeline */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />
              <div className="flex items-center gap-3 text-xs font-semibold mb-3">
                <span className="text-cyan-400 font-mono tracking-wider">{log.date}</span>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-300 border border-slate-700/50">
                  {log.type === "Learning" ? <BookOpenCheck size={12} className="text-cyan-400" /> : <Code size={12} className="text-cyan-400" />}
                  {log.type}
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight leading-snug">
                {log.title}
              </h3>
              
              <div className="prose prose-invert prose-sm max-w-none text-slate-400 max-h-[35vh] overflow-y-auto overscroll-contain custom-scrollbar pr-2 prose-p:leading-relaxed">
                <ReactMarkdown>{log.content}</ReactMarkdown>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                {log.live && (
                  <a 
                    href={log.live} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
                  >
                    <Globe size={16} /> Live Demo
                  </a>
                )}
                {log.github && (
                  <a 
                    href={log.github} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                  >
                    <GitBranch size={16} /> GitHub
                  </a>
                )}
                {log.linkedin && (
                  <a 
                    href={log.linkedin} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-[#0a66c2] hover:text-[#3b82f6] text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                  >
                    <Share2 size={16} /> LinkedIn
                  </a>
                )}
                {log.kaggle && (
                  <a 
                    href={log.kaggle} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-[#20beff] hover:text-[#34d399] text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                  >
                    <Database size={16} /> Kaggle
                  </a>
                )}
                {log.link && (
                  <a 
                    href={log.link} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all hover:-translate-y-0.5"
                  >
                    <ExternalLink size={16} /> Link
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Canvas ────────────────────────────────────────────────────
export function JourneyCanvas({ logs }: { logs: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heightStr = `${Math.max(300, (logs.length + 1) * 140)}vh`;

  return (
    <div ref={containerRef} style={{ height: heightStr }} className="relative w-full">
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Soft vignettes blending canvas edges into site background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent z-10 pointer-events-none" />

        {/* 2D Text Panel overlaid on the LEFT */}
        <TextPanel logs={logs} />
        
        {/* 3D Canvas takes up the full screen */}
        <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
          <CameraRig containerRef={containerRef} totalLogs={logs.length} />
          
          <color attach="background" args={["#020617"]} />
          <fog attach="fog" args={["#020617", 10, 55]} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 20, 5]} intensity={0.6} />
          
          <Grid 
            position={[0, -2.5, 0]} 
            args={[300, 300]} 
            cellSize={1} cellThickness={1} cellColor="#0891b2" 
            sectionSize={5} sectionThickness={1.5} sectionColor="#22d3ee" 
            fadeDistance={60} fadeStrength={1} 
          />
          
          <ProceduralCity totalLogs={logs.length} />
          <NeonPillars totalLogs={logs.length} />
          <Sparkles count={600} scale={80} size={2} speed={0.3} opacity={0.12} color="#f472b6" />

          <Suspense fallback={null}>
            <group>
              {logs.map((log, i) => (
                <JourneyNode key={log.id} log={log} index={i} total={logs.length} containerRef={containerRef} />
              ))}
              
              {/* Thank You on the ground */}
              <Text position={[0, -2, -(logs.length * Z_SPACING)]} fontSize={1.2} color="#22d3ee" anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]}>
                Thank You For Scrolling!
              </Text>
              <Text position={[0, 0, -(logs.length * Z_SPACING)]} fontSize={0.6} color="#22d3ee" anchorX="center" anchorY="middle">
                Thank You For Scrolling!
              </Text>
            </group>
          </Suspense>

          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={0.15} mipmapBlur intensity={1.8} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}
