"use client";

import type { FC } from "react";
import type { GardenView, GardenAnime } from "@/lib/garden/types";
import type { DerivedGarden } from "@/lib/garden/adapter";

// Implemented in Task 9
export const InteriorShell: FC<{
  view: GardenView;
  garden: GardenAnime[];
  derived: DerivedGarden;
}> = () => null;
