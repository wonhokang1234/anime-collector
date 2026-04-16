"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  const isLogin = mode === "login";

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
    background:
      "linear-gradient(180deg, rgba(26,18,8,.85), rgba(10,6,4,.92))",
    border: "1px solid rgba(244,228,192,.18)",
    borderTop: "3px solid var(--hanko)",
    boxShadow:
      "0 24px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(244,228,192,.08)",
    borderRadius: 6,
    padding: "2.25rem 2rem",
    backdropFilter: "blur(6px)",
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
            background: "var(--washi)",
            color: "var(--hanko)",
            fontFamily: "var(--font-jp)",
            fontSize: 22,
            fontWeight: 900,
            boxShadow: "0 2px 6px rgba(0,0,0,.5)",
          }}
        >
          信
        </div>
        <h2 className="display-title mb-3 text-2xl font-bold">
          Check your email
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(244,228,192,.7)" }}
        >
          We sent a confirmation link to{" "}
          <strong style={{ color: "var(--washi)" }}>{email}</strong>. Click it
          to activate your account, then come back and log in.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-xs uppercase tracking-[.2em] transition-colors"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--lantern-glow)",
          }}
        >
          → Go to login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-sm space-y-5"
      style={cardStyle}
    >
      {/* kanji seal badge */}
      <div className="mb-2 text-center">
        <div
          aria-hidden
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center"
          style={{
            background: "var(--hanko)",
            color: "var(--washi)",
            fontFamily: "var(--font-jp)",
            fontSize: 18,
            fontWeight: 900,
            transform: "rotate(-4deg)",
            borderRadius: 2,
            boxShadow: "0 3px 8px rgba(196,30,58,.45)",
          }}
        >
          {isLogin ? "入" : "新"}
        </div>
        <p
          className="mb-1 text-[10px] uppercase tracking-[.4em]"
          style={{
            color: "var(--washi-soft)",
            fontFamily: "var(--font-display)",
          }}
        >
          {isLogin ? "鑑 入 場" : "新 規 登 録"}
        </p>
        <h2 className="display-title text-2xl font-bold">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
      </div>

      {error && (
        <div
          className="px-4 py-3 text-sm"
          style={{
            border: "1px solid rgba(196,30,58,.35)",
            background: "rgba(196,30,58,.08)",
            color: "#f4a0ae",
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
            color: "var(--washi-soft)",
            fontFamily: "var(--font-display)",
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
          className="washi-input"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[10px] uppercase tracking-[.24em]"
          style={{
            color: "var(--washi-soft)",
            fontFamily: "var(--font-display)",
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
          className="washi-input"
          placeholder="At least 6 characters"
        />
      </div>

      <button type="submit" disabled={submitting} className="hanko-btn w-full">
        {submitting ? "…" : isLogin ? "Log in" : "Sign up"}
      </button>

      <div className="hairline" aria-hidden />

      <p
        className="text-center text-xs"
        style={{ color: "rgba(244,228,192,.55)" }}
      >
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="transition-colors"
          style={{
            color: "var(--lantern-glow)",
            fontFamily: "var(--font-display)",
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
