/* @layer bridge-wasm @kind logic */
/**
 * Plan receipt texts: renders one contextual receipt line per planned grant
 * of a physical plan (chest override, scripted-giver override, queue
 * delivery) from the frozen placement and the seed's found/total numbers,
 * and records the baked class-template id each grant falls back to when the
 * session dialogue cannot be composed. Vanilla-locked locations keep their
 * native message and get neither. The capacity lines follow: a progressive
 * placement appends one line per planned rung per Custom family
 * (capacity-rung-lines.ts), a fixed-jump placement one line per (jump,
 * starting rung) (capacity-fixed-lines.ts), so the core can show the climb a
 * pickup actually applied. The pond's own three situations follow last (the
 * price of a toss, a throw that won nothing, an emptied pond,
 * pond-lines.ts): one line per distinct price and per distinct refund of its
 * plan, so a toss announces its real amount instead of a native line that
 * names amounts no plan charges.
 */

import { RANDOMIZER_RECEIPT_MSG } from '@shared/asset-extraction/text/data/randomizer-templates';
import { classifyReceiptItem } from '@shared/randomizer/receipt-text/receipt-item-class';
import { renderReceiptMessage } from '@shared/randomizer/receipt-text/render-receipt-message';
import { capacityRungLinesOf } from '@shared/randomizer/receipt-text/capacity-rung-lines';
import { capacityFixedLinesOf } from '@shared/randomizer/receipt-text/capacity-fixed-lines';
import { pondLinesOf } from '@shared/randomizer/receipt-text/pond-lines';
import { pondPlanOf } from '@shared/randomizer/ap-world/pond/pond-plan';
import { capacityProfileOfStats, capacityProgressiveOfStats } from '@shared/randomizer/ap-world/fill/placement-capacity';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { CapacityFamilyId } from '@shared/randomizer/ap-world/capacity';
import type { ReceiptCountOf } from '@shared/randomizer/receipt-text/receipt-counts';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';

/** One fixed-jump capacity line: the entry the core selects by the live rung. */
interface PlanFixedLine {
  family: CapacityFamilyId;
  fromRung: number;
  jump: number;
  /** Index into |lines|. */
  index: number;
}

/** Where the pond's own lines landed in the pool, which the arming looks up by amount. */
interface PlanPondLines {
  /** throw price → index into |lines|. */
  byPrice: ReadonlyMap<number, number>;
  /** throw refund → index into |lines|. */
  byRefund: ReadonlyMap<number, number>;
  /** Index of the emptied-pond line, or -1 when the pond keeps its native loop. */
  closed: number;
}

interface PlanReceiptTexts {
  /** The rendered lines, in allocation order. */
  lines: ReceiptLine[];
  /** location name → index into |lines|. */
  indexByLocation: Map<string, number>;
  /** location name → baked class-template id (the compose-failure fallback). */
  fallbackByLocation: Map<string, number>;
  /** family → indices into |lines| of its rung lines, in plan order (progressive placements only). */
  rungIndexByFamily: Map<CapacityFamilyId, readonly number[]>;
  /** The (jump, starting rung) lines (fixed-jump placements only). */
  fixedLines: PlanFixedLine[];
  /** The pond's price / consolation / closing lines (non-legacy ponds only). */
  pondLines: PlanPondLines;
}

/** The empty pond allocation: a legacy pond speaks with its own native lines. */
const NO_POND_LINES: PlanPondLines = { byPrice: new Map(), byRefund: new Map(), closed: -1 };

/**
 * Append the pond's lines and say where each landed. The plan is re-derived
 * from the setting and the placement's own seed, exactly as the session's
 * arming does, so the prices these lines quote are the prices charged.
 */
const appendPondLines = (placement: ApPlacement, lines: ReceiptLine[]): PlanPondLines => {
  const setting = placement.stats.pond;
  if (setting === undefined || setting.mode === 'capacity') return NO_POND_LINES;
  const { prices, refunds, lines: pondLines } = pondLinesOf(pondPlanOf(setting, placement.seed));
  const base = lines.length;
  lines.push(...pondLines);
  return {
    byPrice: new Map(prices.map((price, offset) => [price, base + offset])),
    byRefund: new Map(refunds.map((refund, offset) => [refund, base + prices.length + offset])),
    closed: base + pondLines.length - 1,
  };
};

/** The baked class line matching this grant, mirroring the core's own routing. */
const fallbackClassId = (entry: PlanEntry): number => {
  if (entry.planClass === 'deliver') return RANDOMIZER_RECEIPT_MSG.delivered;
  const itemClass = classifyReceiptItem(entry.itemName);
  if (itemClass.kind === 'progressive') return RANDOMIZER_RECEIPT_MSG.progressive;
  if (itemClass.kind === 'dungeon-item') return RANDOMIZER_RECEIPT_MSG.dungeonItem;
  return RANDOMIZER_RECEIPT_MSG.generic;
};

const buildPlanReceiptTexts = (plan: PhysicalPlan, placement: ApPlacement, countOf: ReceiptCountOf): PlanReceiptTexts => {
  const lines: ReceiptLine[] = [];
  const indexByLocation = new Map<string, number>();
  const fallbackByLocation = new Map<string, number>();
  const rungIndexByFamily = new Map<CapacityFamilyId, readonly number[]>();
  const fixedLines: PlanFixedLine[] = [];
  for (const entry of plan.entries) {
    if (entry.planClass === 'vanilla-locked') continue;
    const line = renderReceiptMessage({
      kind: entry.planClass === 'deliver' ? 'delivered' : 'physical',
      itemName: entry.itemName,
      locationName: entry.locationName,
      count: countOf(entry.locationName),
    });
    indexByLocation.set(entry.locationName, lines.length);
    fallbackByLocation.set(entry.locationName, fallbackClassId(entry));
    lines.push(line);
  }
  const profile = capacityProfileOfStats(placement.stats);
  if (capacityProgressiveOfStats(placement.stats)) {
    for (const { family, lines: rungLines } of capacityRungLinesOf(profile)) {
      rungIndexByFamily.set(family, rungLines.map((_, offset) => lines.length + offset));
      lines.push(...rungLines);
    }
  } else {
    for (const { family, fromRung, jump, line } of capacityFixedLinesOf(profile)) {
      fixedLines.push({ family, fromRung, jump, index: lines.length });
      lines.push(line);
    }
  }
  const pondLines = appendPondLines(placement, lines);
  return { lines, indexByLocation, fallbackByLocation, rungIndexByFamily, fixedLines, pondLines };
};

export { buildPlanReceiptTexts };
export type { PlanFixedLine, PlanPondLines, PlanReceiptTexts };
