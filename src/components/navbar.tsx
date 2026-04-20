"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import gsap from "gsap";

const navLinks = [
  { href: "/browse", label: "Browse", kanji: "探" },
  { href: "/collection", label: "Collection", kanji: "集" },
  { href: "/shelf", label: "Shelf", kanji: "蔵" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sealRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => {
    if (!sealRef.current) return;
    gsap.fromTo(
      sealRef.current,
      { scale: 0, rotation: -25, opacity: 0 },
      { scale: 1, rotation: -4, opacity: 1, duration: 0.7, ease: "elastic.out(1.2, 0.5)", delay: 0.1 }
    );
  }, [user]);

  if (!user) return null;

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,6,4,.92), rgba(10,6,4,.72))",
          borderBottom: "1px solid rgba(244,228,192,.14)",
          boxShadow: "0 1px 0 rgba(196,30,58,.25)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/browse"
            className="group flex items-center gap-2"
            aria-label="Anime Collector home"
          >
            <span
              ref={sealRef}
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-[2px] text-[13px] font-black"
              style={{
                background: "var(--hanko)",
                color: "var(--washi)",
                fontFamily: "var(--font-jp)",
                boxShadow: "0 2px 4px rgba(0,0,0,.45)",
              }}
            >
              集
            </span>
            <span
              className="text-[15px] font-bold tracking-[.14em]"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--washi)",
              }}
            >
              ANIME COLLECTOR
            </span>
          </Link>

          {/* Desktop nav */}
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
                      ? "var(--washi)"
                      : "rgba(244,228,192,.5)",
                  }}
                  onMouseEnter={(e) => {
                    const kanji = e.currentTarget.children[0] as HTMLElement;
                    gsap.to(kanji, { scale: 1.3, duration: 0.12, ease: "power2.out", overwrite: true });
                  }}
                  onMouseLeave={(e) => {
                    const kanji = e.currentTarget.children[0] as HTMLElement;
                    gsap.to(kanji, { scale: 1, duration: 0.2, ease: "power2.in", overwrite: true });
                  }}
                >
                  <span
                    aria-hidden
                    className="text-[9px] leading-none"
                    style={{
                      fontFamily: "var(--font-jp)",
                      opacity: active ? 0.85 : 0.45,
                    }}
                  >
                    {link.kanji}
                  </span>
                  <span className="mt-0.5 font-semibold">
                    {link.label.toUpperCase()}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 h-[2px] w-6 rounded-full transition-all duration-200"
                    style={{
                      background: active ? "var(--hanko)" : "transparent",
                      boxShadow: active
                        ? "0 0 6px rgba(196,30,58,.5)"
                        : undefined,
                    }}
                  />
                </Link>
              );
            })}

            <button
              onClick={signOut}
              className="text-[11px] transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: ".14em",
                color: "rgba(244,228,192,.4)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--washi)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(244,228,192,.4)")
              }
            >
              SIGN OUT
            </button>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center sm:hidden"
            style={{ color: "var(--washi)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
          className="fixed inset-0 z-50 sm:hidden"
          onClick={() => setDrawerOpen(false)}
          style={{ background: "rgba(0,0,0,0.6)" }}
        />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        inert={!drawerOpen}
        className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col sm:hidden"
        style={{
          background: "rgba(10,6,4,.95)",
          borderLeft: "1px solid rgba(244,228,192,.14)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms ease-out",
        }}
      >
        <div className="flex h-14 items-center justify-end px-4">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-10 w-10 items-center justify-center"
            style={{ color: "var(--washi)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-1 flex-col px-2">
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
                  color: active ? "var(--washi)" : "rgba(244,228,192,.5)",
                  background: active ? "rgba(244,228,192,.06)" : "transparent",
                }}
              >
                <span
                  aria-hidden
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-jp)",
                    opacity: active ? 0.85 : 0.45,
                  }}
                >
                  {link.kanji}
                </span>
                <span className="text-sm font-semibold">
                  {link.label.toUpperCase()}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="ml-auto h-[2px] w-4 rounded-full"
                    style={{
                      background: "var(--hanko)",
                      boxShadow: "0 0 6px rgba(196,30,58,.5)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sign out at bottom */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid rgba(244,228,192,.1)" }}
        >
          <button
            onClick={() => {
              signOut();
              setDrawerOpen(false);
            }}
            className="flex h-12 w-full items-center justify-center rounded-lg text-xs font-semibold uppercase tracking-[.14em] transition-colors"
            style={{
              fontFamily: "var(--font-display)",
              color: "rgba(244,228,192,.5)",
              background: "rgba(244,228,192,.04)",
              border: "1px solid rgba(244,228,192,.1)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
