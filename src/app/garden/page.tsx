"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const GardenExperience = dynamic(
  () =>
    import("@/components/garden/garden-experience").then(
      (m) => m.GardenExperience,
    ),
  { ssr: false },
);

export default function GardenPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;
  return <GardenExperience />;
}
