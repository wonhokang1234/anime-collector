"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const navLinks = [
  { href: "/browse", label: "Browse", kanji: "探" },
  { href: "/collection", label: "Collection", kanji: "集" },
  { href: "/shelf", label: "Shelf", kanji: "蔵" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  return (
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
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-[2px] text-[13px] font-black"
            style={{
              background: "var(--hanko)",
              color: "var(--washi)",
              fontFamily: "var(--font-jp)",
              transform: "rotate(-4deg)",
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

        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  );
}
