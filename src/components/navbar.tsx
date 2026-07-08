"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Moss-midnight chrome. The navbar renders OUTSIDE the .moss wrapper, so
// var(--moss)/var(--ink)/etc. are unavailable here — use concrete values that
// read correctly over the moss-styled pages (browse, card, login, signup).
// The two-card Karuta logo mark keeps its own cream/red per the brand design.
const NAV = {
  bg: "rgba(11, 19, 16, 0.85)",
  panel: "#0f1a15",
  border: "#23382f",
  text: "#e8f0e9",
  dim: "#8fa89a",
  muted: "#6f8578",
  accent: "#8fbf9f",
  accentTint: "rgba(143, 191, 159, 0.12)",
};

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/garden", label: "Garden 庭" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading: authLoading } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const hadOpened = useRef(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
      hadOpened.current = true;
    } else {
      document.body.style.overflow = "";
      // Restore focus to the trigger only after a real open (not on mount).
      if (hadOpened.current) hamburgerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Hide the app navbar inside the Moss Garden experience (own HUD/chrome).
  if (pathname?.startsWith("/garden")) return null;

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: NAV.bg,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: `1px solid ${NAV.border}`,
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Brand lock-up — links to /browse when logged in, / otherwise */}
          <Link
            href={user ? "/browse" : "/"}
            className="group flex items-center gap-2"
            aria-label="Karuta home"
          >
            <Image
              src="/karuta-mark.svg"
              alt=""
              width={24}
              height={24}
              aria-hidden
              priority
            />
            <span
              className="text-[15px] font-bold tracking-[.15em]"
              style={{
                fontFamily: "var(--font-display)",
                color: NAV.text,
              }}
            >
              KARUTA
            </span>
          </Link>

          {/* Desktop nav — logged-in state */}
          {!authLoading && user && (
            <div className="hidden items-center gap-6 sm:flex">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative flex flex-col items-center py-1 text-xs transition-colors"
                    style={{
                      fontFamily: "var(--font-display)",
                      letterSpacing: ".18em",
                      color: active ? NAV.text : NAV.dim,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = NAV.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = NAV.dim;
                      }
                    }}
                  >
                    <span className="mt-0.5 font-semibold">
                      {link.label.toUpperCase()}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 h-[2px] w-6 rounded-full transition-all duration-200"
                      style={{
                        background: active ? NAV.accent : "transparent",
                      }}
                    />
                  </Link>
                );
              })}

              <button
                onClick={signOut}
                className="text-[11px] transition-colors"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: ".14em",
                  color: NAV.muted,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = NAV.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = NAV.muted)}
              >
                SIGN OUT
              </button>
            </div>
          )}

          {/* Desktop nav — logged-out auth CTAs */}
          {!authLoading && !user && (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/login"
                className="btn-ghost text-[11px]"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: ".1em",
                  color: NAV.text,
                  borderColor: NAV.border,
                }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-[11px]"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: ".1em",
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger button — mobile only */}
          <button
            ref={hamburgerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center sm:hidden"
            style={{ color: NAV.text }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] sm:hidden"
          onClick={() => setDrawerOpen(false)}
          style={{ background: "rgba(4, 8, 6, 0.55)" }}
        />
      )}

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        inert={!drawerOpen}
        className="fixed right-0 top-0 z-[60] flex h-full w-[280px] flex-col sm:hidden"
        style={{
          background: NAV.panel,
          borderLeft: `1px solid ${NAV.border}`,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Drawer header with karuta-mark and wordmark */}
        <div
          className="flex h-14 items-center justify-between px-4"
          style={{ borderBottom: `1px solid ${NAV.border}` }}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/karuta-mark.svg"
              alt=""
              width={32}
              height={32}
              aria-hidden
            />
            <span
              className="text-[13px] font-bold tracking-[.15em]"
              style={{
                fontFamily: "var(--font-display)",
                color: NAV.text,
              }}
            >
              KARUTA
            </span>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-10 w-10 items-center justify-center"
            style={{ color: NAV.text }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Nav links — logged-in only */}
        {!authLoading && user && (
          <div className="flex flex-1 flex-col px-2 pt-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-12 items-center gap-3 rounded-lg px-4 transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: ".14em",
                    color: active ? NAV.accent : NAV.dim,
                    background: active ? NAV.accentTint : "transparent",
                  }}
                >
                  <span className="text-sm font-semibold">
                    {link.label.toUpperCase()}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="ml-auto h-[2px] w-4 rounded-full"
                      style={{
                        background: NAV.accent,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Logged-out auth links in drawer */}
        {!authLoading && !user && (
          <div className="flex flex-1 flex-col gap-2 px-4 pt-4">
            <Link
              href="/login"
              onClick={() => setDrawerOpen(false)}
              className="btn-ghost flex h-12 items-center justify-center"
              style={{ color: NAV.text, borderColor: NAV.border }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setDrawerOpen(false)}
              className="btn-primary flex h-12 items-center justify-center rounded-lg text-sm font-semibold"
              style={{
                fontFamily: "var(--font-sans)",
                letterSpacing: ".1em",
              }}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Sign out at bottom — logged-in only */}
        {!authLoading && user && (
          <div
            className="px-4 py-4"
            style={{ borderTop: `1px solid ${NAV.border}` }}
          >
            <button
              onClick={() => {
                signOut();
                setDrawerOpen(false);
              }}
              className="flex h-12 w-full items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-[.14em] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                color: NAV.dim,
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${NAV.border}`,
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
