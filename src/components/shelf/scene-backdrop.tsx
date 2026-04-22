import type { ReactNode } from "react";
import type { SpineTone } from "./manga-spine";

interface SceneBackdropProps {
  tone: SpineTone;
  children: ReactNode;
}

export function SceneBackdrop({ tone, children }: SceneBackdropProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/5 scene-${tone}`}
      style={{ minHeight: tone === "watching" ? 430 : 300 }}
    >
      {tone === "watching" && (
        <>
          <span className="lantern-glow" aria-hidden />
          <span className="stage-floor" aria-hidden />
        </>
      )}
      {tone === "plan" && (
        <>
          <span className="washi-frame" style={{ top: 14 }} aria-hidden />
          <span className="washi-frame" style={{ bottom: 14 }} aria-hidden />
        </>
      )}
      {tone === "watched" && (
        <span className="stamp-kan" aria-hidden>
          完
        </span>
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
