import { createBrowserClient } from "@supabase/ssr";

// Use the SSR browser client so sessions live in cookies.
// This keeps auth state consistent across the proxy middleware,
// server components, and client components — required for RLS to work.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
