/* @layer shared-game @kind logic */
/**
 * What one capacity climb reads as on the receipt. The numbers are the whole
 * point (tiers jumped, the capacity before and after, and where the family
 * is eventually headed) but they are carried by a sentence the game would
 * say, not a status line: "Your bomb bag swells 2 tiers. 10 > 20. 50 is the
 * ceiling." A rung reads as the family's own ladder entry
 * (capacity-ladders.data.ts); the meter is the exception, because its bar
 * never grows, since its rungs are the cost tiers the game has, so a meter climb
 * names those (none, normal, half, quarter) instead of an amount. The wallet
 * counts in rupee caps. The ceiling sentence names the plan's FINAL rung, not
 * the next one (a phrase like "on the way to" read as the next pickup's rung,
 * which it never was); on the last rung it says the climb has arrived. The
 * composer may drop it entirely when the box is short of rows, so the jump
 * and the two values always survive.
 */
import { CAPACITY_RECEIPT_LABELS } from '@shared/game/data/capacity-upgrade-names.data';
import { METER_LEVEL_LABELS } from '../ap-world/capacity/capacity-ladders.data';
import { familyById } from '../ap-world/capacity/capacity-family';
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';
import type { ReceiptLine } from './receipt-line.type';

/** How each family grows, so the four lines do not read as one template filled in. */
const GROWTH_VERB: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'swells',
  projectiles: 'fills out',
  meter: 'deepens',
  wallet: 'stretches',
};

/** The unit the values are counted in, where a bare number would be ambiguous. */
const VALUE_UNIT: Readonly<Partial<Record<CapacityFamilyId, string>>> = {
  wallet: ' rupees',
};

/** What a family shows on |rung|: its ladder value, or the meter's cost tier. */
const capacityRungText = (family: CapacityFamilyId, rung: number): string =>
  (family === 'meter' ? METER_LEVEL_LABELS[rung] : String(familyById(family).ladder[rung]));

/** "1 tier" · "3 tiers": every family climbs in tiers on the receipt. */
const capacityTierText = (tiers: number): string => `${tiers} tier${tiers === 1 ? '' : 's'}`;

/** The label opens a possessive clause, so it reads as speech and not as a heading. */
const ownedLabel = (family: CapacityFamilyId): string => {
  const label = CAPACITY_RECEIPT_LABELS[family];
  return `Your ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
};

/** A rung value opening its own sentence, so it is capitalized. */
const sentenceText = (family: CapacityFamilyId, rung: number): string => {
  const text = capacityRungText(family, rung);
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

/** The plan's final rung, named as the ceiling; or that this climb has reached it. */
const aheadText = (family: CapacityFamilyId, toRung: number, maxRung: number): string =>
  (toRung >= maxRung
    ? '. That is the ceiling.'
    : `. ${sentenceText(family, maxRung)} is the ceiling.`);

/** The climb from |fromRung| to |toRung| under a plan that stops at |maxRung|. */
const renderCapacityStep = (
  family: CapacityFamilyId, fromRung: number, toRung: number, maxRung: number,
): ReceiptLine => {
  const climb = `${ownedLabel(family)} ${GROWTH_VERB[family]} ${capacityTierText(toRung - fromRung)}. `
    + `${sentenceText(family, fromRung)} > ${capacityRungText(family, toRung)}${VALUE_UNIT[family] ?? ''}`;
  return [`${climb}${aheadText(family, toRung, maxRung)}`, `${climb}.`];
};

/** The climb with no values behind it: the location's own line, when no rung line exists. */
const capacityGrowthLine = (family: CapacityFamilyId, tiers: number): string =>
  `${ownedLabel(family)} ${GROWTH_VERB[family]} ${capacityTierText(tiers)}.`;

/** A progressive pickup whose jump the core has not resolved yet. */
const capacityNextStepLine = (family: CapacityFamilyId): string =>
  `${ownedLabel(family)} takes its next step up.`;

export {
  capacityGrowthLine, capacityNextStepLine, capacityRungText, capacityTierText, renderCapacityStep,
};
