import { type ReactNode } from "react";
import { getScatterTransform } from "@/lib/scatter";

interface ScatterCardProps {
  malId: number;
  children: ReactNode;
  className?: string;
}

export function ScatterCard({ malId, children, className }: ScatterCardProps) {
  const { rotation, jitterX, jitterY } = getScatterTransform(malId);

  return (
    <div
      className={`scatter-card${className ? ` ${className}` : ""}`}
      style={
        {
          "--scatter-rotation": `${rotation}deg`,
          "--scatter-x": `${jitterX}px`,
          "--scatter-y": `${jitterY}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
