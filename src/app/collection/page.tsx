"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CollectionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/garden?view=pond");
  }, [router]);
  return null;
}
