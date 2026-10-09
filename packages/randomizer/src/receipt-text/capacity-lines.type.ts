/* @layer shared-game @kind types */
import type { CapacityFamilyId } from '../world/capacity/capacity-profile.type';
import type { ReceiptLine } from '@rotp/game-core';

interface CapacityFixedLine {
  family: CapacityFamilyId;
  fromRung: number;
  jump: number;
  line: ReceiptLine;
}

interface CapacityRungLines {
  family: CapacityFamilyId;
  lines: readonly ReceiptLine[];
}

export type { CapacityFixedLine, CapacityRungLines };
