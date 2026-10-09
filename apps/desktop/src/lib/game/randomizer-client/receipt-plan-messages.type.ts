/* @layer bridge-wasm @kind types */
import type { CapacityFamilyId } from '@shared/randomizer/world/capacity';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { PlanPondDemandLines } from './pond-demand-messages';

interface PlanFixedLine {
  family: CapacityFamilyId;
  fromRung: number;
  jump: number;
  index: number;
}

interface PlanPondLines {
  byPrice: ReadonlyMap<number, number>;
  byRefund: ReadonlyMap<number, number>;
  awardMore: number;
  awardLast: number;
  closed: number;
}

interface PlanWishPondLines {
  award: number;
  closed: number;
}

interface PlanReceiptTexts {
  lines: ReceiptLine[];
  indexByLocation: Map<string, number>;
  fallbackByLocation: Map<string, number>;
  rungIndexByFamily: Map<CapacityFamilyId, readonly number[]>;
  fixedLines: PlanFixedLine[];
  pondLines: PlanPondLines;
  wishPondLines: PlanWishPondLines;
  pondDemandLines: PlanPondDemandLines;
}

export type { PlanFixedLine, PlanPondLines, PlanReceiptTexts, PlanWishPondLines };
