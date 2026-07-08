"use client";

import { AuthForm } from "@/components/auth-form";
import { useGardenStore } from "@/stores/garden-store";

export default function LoginPage() {
  const mood = useGardenStore((s) => s.mood);
  return (
    <div
      className="moss relative flex items-center justify-center overflow-hidden px-4"
      data-mood={mood}
      suppressHydrationWarning
      style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 50% at 50% 30%, color-mix(in oklab, var(--moss) 12%, transparent), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <AuthForm mode="login" />
    </div>
  );
}
