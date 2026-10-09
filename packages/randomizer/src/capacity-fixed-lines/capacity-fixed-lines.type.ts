/* @layer bridge-wasm @kind types */
import type { CapacityFamilyId } from '@rotp/game-data';

interface CapacityFixedLineArm {
  family: CapacityFamilyId;
  fromRung: number;
  jump: number;
  messageId: number;
}

export type { CapacityFixedLineArm };
