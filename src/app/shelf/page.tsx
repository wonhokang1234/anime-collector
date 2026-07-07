"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShelfPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/garden?view=grove");
  }, [router]);
  return null;
}
