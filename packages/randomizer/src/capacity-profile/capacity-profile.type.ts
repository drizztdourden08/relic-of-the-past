/* @layer bridge-wasm @kind types */
import type { CapacityFamilyId } from '@rotp/game-data';

type CapacityFamilyArm = {
  family: CapacityFamilyId;
  custom: boolean;
  startTier: number;
  maxTier: number;
};

export type { CapacityFamilyArm };
