"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCollectionStore } from "@/stores/collection-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const loadCollection = useCollectionStore((s) => s.loadCollection);
  const resetCollection = useCollectionStore((s) => s.reset);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load (or reset) collection when user changes
  useEffect(() => {
    if (user) {
      loadCollection(user.id);
    } else {
      resetCollection();
    }
  }, [user, loadCollection, resetCollection]);

  return <>{children}</>;
}
