"use client";
import { ReactNode } from "react";

export function SplitLayout({ left, right, sidebarPosition = "left" }: { left: ReactNode; right: ReactNode; sidebarPosition?: "left" | "right" }) {
  if (sidebarPosition === "right") {
    return (
      <div className="flex flex-col-reverse md:flex-row gap-8 py-12 md:py-24">
        <div className="w-full md:w-3/4">
          {left}
        </div>
        <div className="w-full md:w-1/4 shrink-0">
          <div className="md:sticky top-28">
            {right}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 py-12 md:py-24">
      <div className="w-full md:w-1/3 shrink-0">
        <div className="md:sticky top-28">
          {left}
        </div>
      </div>
      <div className="w-full md:w-2/3">
        {right}
      </div>
    </div>
  );
}
