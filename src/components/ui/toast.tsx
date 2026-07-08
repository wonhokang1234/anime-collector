"use client";

import { useEffect, useRef, useState } from "react";
import { useToastStore } from "@/stores/toast-store";
import { RarityBadge } from "@/components/ui/rarity-badge";
import type { RarityTier } from "@/lib/types";
import gsap from "gsap";

interface ToastItemProps {
  id: number;
  message: string;
  type?: string;
  rarityTier?: string;
  onDismiss: (id: number) => void;
  isDismissing: boolean;
}

function ToastItem({
  id,
  message,
  type,
  rarityTier,
  onDismiss,
  isDismissing,
}: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" },
    );
    return () => {
      tween.kill();
    };
  }, []);

  useEffect(() => {
    if (!isDismissing || !ref.current) return;
    gsap.to(ref.current, {
      opacity: 0,
      y: -6,
      duration: 0.15,
      ease: "power2.in",
    });
  }, [isDismissing]);

  const accentColor =
    type === "success"
      ? "var(--status-success)"
      : type === "error"
        ? "var(--status-error)"
        : "var(--text-secondary)";

  const icon =
    type === "success" ? (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center text-sm font-bold"
        style={{ color: "var(--status-success)" }}
      >
        ✓
      </span>
    ) : type === "error" ? (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center text-sm font-bold"
        style={{
          color: "var(--status-error)",
          borderRadius: "50%",
          border: "1px solid var(--status-error)",
        }}
      >
        !
      </span>
    ) : (
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold"
        style={{
          color: "var(--text-secondary)",
          borderRadius: "50%",
          border: "1px solid var(--border-default)",
        }}
      >
        i
      </span>
    );

  return (
    <div
      ref={ref}
      className="pointer-events-auto flex items-center gap-3"
      role="status"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-default)",
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: "0.5rem",
        padding: "0.875rem 1rem",
        boxShadow: "var(--shadow-modal)",
        minWidth: 240,
        maxWidth: "min(360px, 100%)",
      }}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {message}
        </span>
      </div>
      {rarityTier && <RarityBadge tier={rarityTier as RarityTier} />}
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(id)}
        className="icon-btn ml-1 shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        ×
      </button>
    </div>
  );
}

export function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  const [dismissingIds, setDismissingIds] = useState<Set<number>>(new Set());

  if (toasts.length === 0) return null;

  function handleDismiss(id: number) {
    setDismissingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeToast(id);
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 150);
  }

  return (
    <div
      className="fixed bottom-6 left-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-6 sm:w-auto"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          rarityTier={toast.rarityTier}
          onDismiss={handleDismiss}
          isDismissing={dismissingIds.has(toast.id)}
        />
      ))}
    </div>
  );
}
