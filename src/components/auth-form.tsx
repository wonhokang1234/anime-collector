"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import { useAuthStore } from "@/stores/auth-store";

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
    background: "color-mix(in oklab, var(--panel) 78%, transparent)",
    border: "1px solid var(--line)",
    boxShadow: "0 24px 60px rgba(0,0,0,.32)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: 18,
    padding: "2.5rem 2rem",
    animation: "mg-riseIn .8s ease-out both",
  };

  const eyebrowStyle: React.CSSProperties = {
    margin: "0 0 10px",
    fontFamily: "var(--font-mincho), serif",
    fontSize: 11,
    letterSpacing: "0.5em",
    color: "var(--dim)",
  };

  const headingStyle: React.CSSProperties = {
    margin: 0,
    fontFamily: "var(--font-mincho), serif",
    fontWeight: 700,
    fontSize: "1.6rem",
    letterSpacing: "0.02em",
    color: "var(--ink)",
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
            background: "color-mix(in oklab, var(--moss) 16%, transparent)",
            color: "var(--moss)",
            fontFamily: "var(--font-mincho), serif",
            fontSize: 24,
            fontWeight: 700,
            border: "1px solid var(--line2)",
          }}
        >
          ✓
        </div>
        <p style={eyebrowStyle}>文 送</p>
        <h2 className="mb-3" style={headingStyle}>
          Check your email
        </h2>
        <p
          className="text-sm"
          style={{
            color: "var(--mut)",
            lineHeight: 1.9,
            fontWeight: 300,
          }}
        >
          We sent a confirmation link to{" "}
          <strong style={{ color: "var(--ink)", fontWeight: 500 }}>
            {email}
          </strong>
          . Click it to activate your account, then come back and log in.
        </p>
        <Link
          href="/login"
          className="mg-link mt-6 inline-block text-xs uppercase tracking-[.2em]"
          style={{
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
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
      {/* kanji eyebrow + heading */}
      <div className="mb-2 text-center">
        <p style={eyebrowStyle}>{isLogin ? "帰 庭" : "入 庭"}</p>
        <h2 style={headingStyle}>
          {isLogin ? "Return to the garden" : "Enter the garden"}
        </h2>
      </div>

      {error && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            border:
              "1px solid color-mix(in oklab, var(--mg-error) 45%, transparent)",
            background: "color-mix(in oklab, var(--mg-error) 12%, transparent)",
            color: "var(--mg-error)",
            borderRadius: 10,
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
            color: "var(--mut)",
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
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
          className="mg-input"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: 10,
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
            fontSize: "0.9375rem",
          }}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[10px] uppercase tracking-[.24em]"
          style={{
            color: "var(--mut)",
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
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
          className="mg-input"
          style={{
            width: "100%",
            padding: "0.625rem 0.875rem",
            borderRadius: 10,
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
            fontSize: "0.9375rem",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mg-moss-btn mg-primary w-full"
        style={{ padding: "0.7rem 1rem", fontSize: "0.9rem" }}
      >
        {submitting ? "…" : isLogin ? "Log in" : "Sign up"}
      </button>

      <div
        aria-hidden
        style={{ height: 1, background: "var(--line)", opacity: 0.8 }}
      />

      <p className="text-center text-xs" style={{ color: "var(--mut)" }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="mg-link"
          style={{
            fontFamily: "var(--font-kaku), system-ui, sans-serif",
            fontWeight: 600,
          }}
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
