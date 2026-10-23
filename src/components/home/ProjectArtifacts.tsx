"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type ArtifactKind = "topology" | "tokens" | "blocks" | "terminal" | "trace";

// Pick the picture from what the project says it is, not from a fixed slot.
export function artifactFor(project: { title: string; description: string; pillars: string[] }): ArtifactKind {
  const text = `${project.title} ${project.description}`;
  if (/distributed|scheduler|queue|cluster/i.test(text)) return "topology";
  if (/\bAI\b|LLM|copilot|model/i.test(text)) return "tokens";
  if (/web3|smart contract|defi|on-chain|blockchain/i.test(text)) return "blocks";
  if (/\bCLI\b|infra|provision|deploy/i.test(text)) return "terminal";
  const p = project.pillars.map((x) => x.toLowerCase());
  if (p.includes("web3")) return "blocks";
  if (p.includes("ai")) return "tokens";
  if (p.includes("cloud")) return "topology";
  return "trace";
}

function hashFrom(seed: string, n: number) {
  let h = 2166136261;
  for (const ch of `${n}:${seed}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  // final avalanche so neighbouring blocks don't share prefixes
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 4);
}

function Topology({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const nodes = [
    { x: 24, y: 56 },
    { x: 92, y: 22 },
    { x: 92, y: 90 },
    { x: 164, y: 40 },
    { x: 164, y: 80 },
    { x: 226, y: 58 },
  ];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 4], [1, 4], [3, 5], [4, 5]];
  const route = [0, 1, 4, 5];
  return (
    <svg viewBox="0 0 250 112" className="h-full w-full" aria-hidden>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="rgba(148,163,184,0.22)" strokeWidth={1} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i === 0 || i === 5 ? 6 : 4.5} fill="#0b1324" stroke={route.includes(i) && active ? "#22d3ee" : "rgba(148,163,184,0.45)"} strokeWidth={1.25} />
      ))}
      {active && !reduce && (
        <motion.circle
          r={3}
          fill="#67e8f9"
          initial={{ cx: nodes[0].x, cy: nodes[0].y }}
          animate={{ cx: route.map((i) => nodes[i].x), cy: route.map((i) => nodes[i].y) }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </svg>
  );
}

function Tokens({ active }: { active: boolean }) {
  const tokens = ["const", "fix", "=", "await", "copilot", ".", "suggest", "(", "ctx", ")"];
  return (
    <div className="font-mono text-[11px]">
      <div className="text-slate-400">› tighten this loop</div>
      <div className="mt-2 flex flex-wrap gap-1">
        {tokens.map((t, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: active ? 1 : 0.5 }}
            transition={{ duration: 0.2, delay: active ? i * 0.045 : 0, ease: EASE_OUT }}
            className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-cyan-200"
          >
            {t}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function Blocks({ active, seed }: { active: boolean; seed: string }) {
  const count = 4; // three settled blocks + the one that lands on hover; fits the narrow cells
  return (
    <div className="flex items-center gap-1 font-mono text-[10px]">
      {Array.from({ length: count }, (_, i) => {
        const isNew = i === count - 1;
        // The newest block (and its link) only lands when the card is active.
        return (
          <motion.div
            key={i}
            initial={false}
            animate={isNew ? { opacity: active ? 1 : 0, x: active ? 0 : 8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="flex items-center gap-1"
          >
            {i > 0 && <span className="h-px w-2.5 bg-slate-600" />}
            <div className={`rounded-md border px-2 py-1.5 ${isNew ? "border-cyan-400/60 text-cyan-200" : "border-white/10 text-slate-400"}`}>
              0x{hashFrom(seed, i)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Terminal({ active }: { active: boolean }) {
  const lines = [
    { t: "$ provision plan --clouds aws,gcp", c: "text-slate-300" },
    { t: "+ network.vpc-main", c: "text-emerald-300/80" },
    { t: "+ cluster.workers (autoscale)", c: "text-emerald-300/80" },
    { t: "✓ plan ready — 2 clouds, 0 drift", c: "text-cyan-300" },
  ];
  return (
    <div className="space-y-0.5 font-mono text-[11px]">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{ opacity: active || i === 0 ? 1 : 0.45 }}
          transition={{ duration: 0.18, delay: active ? i * 0.12 : 0, ease: EASE_OUT }}
          className={l.c}
        >
          {l.t}
        </motion.div>
      ))}
    </div>
  );
}

function Trace({ active }: { active: boolean }) {
  const rows = [
    { label: "client", left: 0, width: 100 },
    { label: "edge", left: 8, width: 84 },
    { label: "api", left: 20, width: 58 },
    { label: "db", left: 34, width: 26 },
  ];
  return (
    <div className="space-y-1.5 font-mono text-[10px] text-slate-400">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-10 shrink-0">{r.label}</span>
          <div className="relative h-1.5 flex-1">
            <motion.div
              initial={false}
              animate={{ scaleX: active ? 1 : 0.35 }}
              transition={{ duration: 0.3, delay: active ? i * 0.05 : 0, ease: EASE_OUT }}
              style={{ left: `${r.left}%`, width: `${r.width}%`, transformOrigin: "left" }}
              className="absolute inset-y-0 rounded-full bg-cyan-400/50"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectArtifact({ kind, active, seed }: { kind: ArtifactKind; active: boolean; seed: string }) {
  switch (kind) {
    case "topology":
      return <Topology active={active} />;
    case "tokens":
      return <Tokens active={active} />;
    case "blocks":
      return <Blocks active={active} seed={seed} />;
    case "terminal":
      return <Terminal active={active} />;
    default:
      return <Trace active={active} />;
  }
}
