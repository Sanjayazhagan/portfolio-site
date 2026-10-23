"use client";

import React, { useEffect, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const renderMermaid = async () => {
      try {
        // Load mermaid (~800KB) only when a chart actually renders, so it
        // stays out of the project-page bundle for diagram-free projects.
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: true,
          theme: "dark",
          securityLevel: "loose",
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(svg);
      } catch (error) {
        console.error("Failed to render Mermaid chart:", error);
      }
    };

    renderMermaid();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div 
      className="mermaid-container flex justify-center my-8 overflow-x-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
