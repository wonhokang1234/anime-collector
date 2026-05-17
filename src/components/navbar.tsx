"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import gsap from "gsap";
import { EASE } from "@/lib/motion";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/collection", label: "Collection" },
  { href: "/shelf", label: "Shelf" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut, loading: authLoading } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <nav
        className="sticky top-0 z-50"
        style={{
          background: "rgba(247, 243, 238, 0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--border-subtle)",
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
                color: "var(--text-primary)",
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
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text-secondary)";
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
                        background: active ? "var(--accent)" : "transparent",
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
                  color: "var(--text-muted)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
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
                className="ghost-btn text-[11px]"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: ".1em",
                }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="hanko-btn text-[11px]"
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
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center sm:hidden"
            style={{ color: "var(--text-primary)" }}
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
          style={{ background: "rgba(26, 22, 20, 0.4)" }}
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
          background: "var(--bg-raised)",
          borderLeft: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-modal)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        {/* Drawer header with karuta-mark and wordmark */}
        <div
          className="flex h-14 items-center justify-between px-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
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
                color: "var(--text-primary)",
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
            style={{ color: "var(--text-primary)" }}
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
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    background: active ? "var(--accent-tint)" : "transparent",
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
                        background: "var(--accent)",
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
              className="ghost-btn flex h-12 items-center justify-center"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setDrawerOpen(false)}
              className="hanko-btn flex h-12 items-center justify-center rounded-lg text-sm font-semibold"
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
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <button
              onClick={() => {
                signOut();
                setDrawerOpen(false);
              }}
              className="flex h-12 w-full items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-[.14em] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                color: "var(--text-muted)",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-default)",
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
