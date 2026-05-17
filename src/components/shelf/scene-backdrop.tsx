import type { ReactNode } from "react";
import type { SpineTone } from "@/lib/types";

interface SceneBackdropProps {
  tone: SpineTone;
  children: ReactNode;
}

export function SceneBackdrop({ tone, children }: SceneBackdropProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl`}
      style={{
        minHeight: tone === "watching" ? 430 : 300,
        background: "var(--bg-panel)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        boxShadow: "inset 0 1px 3px rgba(26,22,20,0.05)",
      }}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
