"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const { user, loading } = useAuthStore();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
        Anime <span className="text-indigo-400">Collector</span>
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-400">
        Collect anime as stylized cards with rarity effects and organize them on
        your personal shelf.
      </p>

      <div className="mt-8 flex gap-4">
        {loading ? null : user ? (
          <Link
            href="/browse"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Browse Anime
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
