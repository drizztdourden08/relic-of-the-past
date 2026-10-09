/* @layer bridge-wasm @kind logic */
import { locationDisplayName } from '@shared/randomizer/world/display-names/location-display-name';
import { itemKeyName } from '@shared/randomizer/world/display-names/item-key-name';
import { RANDOMIZER_RECEIPT_MSG } from '@rotp/asset-extraction';
import { classifyReceiptItem } from '@shared/randomizer/receipt-text/receipt-item-class';
import { renderReceiptMessage } from '@shared/randomizer/receipt-text/render-receipt-message';
import { capacityRungLinesOf } from '@shared/randomizer/receipt-text/capacity-rung-lines';
import { capacityFixedLinesOf } from '@shared/randomizer/receipt-text/capacity-fixed-lines';
import { pondLinesOf } from '@shared/randomizer/receipt-text/pond-lines';
import { pondPlanOf } from '@shared/randomizer/world/pond/pond-plan';
import { isForeignItem } from '@shared/randomizer/archipelago/foreign-item';
import { wishPondLinesOf } from './wish-pond-lines';
import { foreignItemLine } from './foreign-item-line';
import { appendPondDemandLines } from './pond-demand-messages';
import { NO_POND_LINES } from './receipt-plan-messages.constants';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CapacityFamilyId } from '@shared/randomizer/world/capacity';
import type { ReceiptCountOf } from '@shared/randomizer/receipt-text/receipt-counts';
import type { ReceiptLine } from '@rotp/game-core';
import type { PhysicalPlan, PlanEntry } from './physical-plan.type';
import type { ForeignItemOf } from './foreign-item-line';
import type { PlanFixedLine, PlanPondLines, PlanReceiptTexts } from './receipt-plan-messages.type';

const appendPondLines = (placement: Placement, lines: ReceiptLine[]): PlanPondLines => {
  const coreArmedPond = placement.stats.ponds.capacity;
  if (coreArmedPond.mode === 'capacity') return NO_POND_LINES;
  const { prices, refunds, lines: pondLines } = pondLinesOf(pondPlanOf(coreArmedPond));
  const base = lines.length;
  const end = base + pondLines.length;
  lines.push(...pondLines);
  return {
    byPrice: new Map(prices.map((price, offset) => [price, base + offset])),
    byRefund: new Map(refunds.map((refund, offset) => [refund, base + prices.length + offset])),
    awardMore: end - 3,
    awardLast: end - 2,
    closed: end - 1,
  };
};

const fallbackClassId = (entry: PlanEntry): number => {
  if (entry.planClass === 'deliver') return RANDOMIZER_RECEIPT_MSG.delivered;
  const itemClass = classifyReceiptItem(entry.item);
  if (itemClass.kind === 'progressive') return RANDOMIZER_RECEIPT_MSG.progressive;
  if (itemClass.kind === 'dungeon-item') return RANDOMIZER_RECEIPT_MSG.dungeonItem;
  return RANDOMIZER_RECEIPT_MSG.generic;
};

const entryLine = (entry: PlanEntry, countOf: ReceiptCountOf, foreignItemOf?: ForeignItemOf): ReceiptLine =>
  (isForeignItem(entry.item) ? foreignItemLine(foreignItemOf?.(entry.location)) : renderReceiptMessage({
    kind: entry.planClass === 'deliver' ? 'delivered' : 'physical',
    itemName: itemKeyName(entry.item),
    locationName: locationDisplayName(entry.location),
    count: countOf(entry.location),
  }));

const buildPlanReceiptTexts = (
  plan: PhysicalPlan, placement: Placement, countOf: ReceiptCountOf, foreignItemOf?: ForeignItemOf,
): PlanReceiptTexts => {
  const lines: ReceiptLine[] = [];
  const indexByLocation = new Map<string, number>();
  const fallbackByLocation = new Map<string, number>();
  const rungIndexByFamily = new Map<CapacityFamilyId, readonly number[]>();
  const fixedLines: PlanFixedLine[] = [];
  for (const entry of plan.entries) {
    if (entry.planClass === 'vanilla-locked') continue;
    const line = entryLine(entry, countOf, foreignItemOf);
    indexByLocation.set(entry.location, lines.length);
    fallbackByLocation.set(entry.location, fallbackClassId(entry));
    lines.push(line);
  }
  const profile = placement.stats.capacity;
  if (placement.stats.capacityProgressive) {
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
  const wishLines = wishPondLinesOf(placement);
  const wishPondLines = wishLines.length === 0 ? { award: -1, closed: -1 } : { award: lines.length, closed: lines.length + 1 };
  lines.push(...wishLines);
  const pondDemandLines = appendPondDemandLines(placement, lines);
  return {
    lines, indexByLocation, fallbackByLocation, rungIndexByFamily, fixedLines, pondLines, wishPondLines, pondDemandLines,
  };
};

export { buildPlanReceiptTexts };
export type {
  PlanFixedLine, PlanPondLines, PlanReceiptTexts, PlanWishPondLines,
} from './receipt-plan-messages.type';
