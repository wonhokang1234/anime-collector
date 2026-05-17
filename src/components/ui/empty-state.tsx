"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const tween = gsap.fromTo(
      rootRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`flex flex-col items-center justify-center py-20 text-center${className ? ` ${className}` : ""}`}
    >
      {icon !== undefined && (
        <div
          aria-hidden
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "1.5rem",
            marginBottom: "1.25rem",
            flexShrink: 0,
          }}
        >
          {icon || "—"}
        </div>
      )}
      {icon === undefined && (
        <div
          aria-hidden
          style={{
            color: "var(--text-muted)",
            fontSize: "1.25rem",
            marginBottom: "1rem",
            lineHeight: 1,
          }}
        >
          —
        </div>
      )}
      <h2
        className="display-section"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          className="mt-3 max-w-[280px] text-sm"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--text-secondary)",
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn-ghost mt-6"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
