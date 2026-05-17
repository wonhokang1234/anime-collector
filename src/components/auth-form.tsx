"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useAuthStore } from "@/stores/auth-store";
import { HankoSeal } from "@/components/ui/hanko-seal";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const formCardRef = useRef<HTMLFormElement>(null);

  const isLogin = mode === "login";

  // GSAP shake on auth error
  useEffect(() => {
    if (!error || !formCardRef.current) return;
    const tl = gsap.timeline();
    tl.to(formCardRef.current, { x: 6, duration: 0.06, ease: "none" })
      .to(formCardRef.current, { x: -6, duration: 0.06, ease: "none" })
      .to(formCardRef.current, { x: 4, duration: 0.05, ease: "none" })
      .to(formCardRef.current, { x: -4, duration: 0.05, ease: "none" })
      .to(formCardRef.current, { x: 0, duration: 0.1, ease: "power2.out" })
      .set(formCardRef.current, { clearProps: "transform" });
    return () => {
      tl.kill();
    };
  }, [error]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (isLogin) {
      router.push("/browse");
    } else {
      setSignUpSuccess(true);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-default)",
    boxShadow: "var(--shadow-modal)",
    borderRadius: 8,
    padding: "2.25rem 2rem",
  };

  if (signUpSuccess) {
    return (
      <div
        className="relative z-10 w-full max-w-sm text-center"
        style={cardStyle}
      >
        <div
          aria-hidden
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "var(--bg-panel)",
            color: "var(--accent)",
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 500,
            fontStyle: "italic",
            border: "1px solid var(--border-default)",
          }}
        >
          ✓
        </div>
        <h2
          className="mb-3 text-2xl"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--text-primary)",
          }}
        >
          Check your email
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          We sent a confirmation link to{" "}
          <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
          Click it to activate your account, then come back and log in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-xs uppercase tracking-[.2em] transition-colors"
          style={{
            fontFamily: "var(--font-sans)",
            color: "var(--accent)",
          }}
        >
          → Go to login
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formCardRef}
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
      style={cardStyle}
    >
      {/* kanji seal badge */}
      <div className="mb-2 text-center">
        <HankoSeal
          kanji={isLogin ? "入" : "新"}
          size="md"
          aria-hidden
          className="mx-auto mb-3"
        />
        <h2
          className="text-2xl"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            color: "var(--text-primary)",
          }}
        >
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
      </div>

      {error && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            border: "1px solid rgba(196,30,58,.35)",
            background: "rgba(196,30,58,.08)",
            color: "var(--status-error)",
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-[10px] uppercase tracking-[.24em]"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 4,
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(196,30,58,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[10px] uppercase tracking-[.24em]"
          style={{
            color: "var(--text-secondary)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderRadius: 4,
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.9375rem",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(196,30,58,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full"
      >
        {submitting ? "…" : isLogin ? "Log in" : "Sign up"}
      </button>

      <div className="hairline" aria-hidden />

      <p
        className="text-center text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="transition-colors"
          style={{
            color: "var(--accent)",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
