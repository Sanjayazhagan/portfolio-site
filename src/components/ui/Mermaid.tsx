"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      securityLevel: "loose",
    });

    const renderMermaid = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error("Failed to render Mermaid chart:", error);
      }
    };

    renderMermaid();
  }, [chart]);

  return (
    <div 
      className="mermaid-container flex justify-center my-8 overflow-x-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}
