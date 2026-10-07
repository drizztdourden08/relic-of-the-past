/* @layer renderer-components @kind logic */
/**
 * The five family cards, derived from the catalog data alone: one card per
 * family, one box per rung, in climb order, and the order question the family
 * is generated under. Everything the card draws is settled here so the card
 * itself stays presentational, and every click leaves as a (family, rung
 * index) pair or a mode the edit helpers turn back into a setting.
 *
 * The count line is the point of the card. A rung is one copy of the family's
 * item in the pool, so "3 of 4" says exactly what unticking did: the fourth
 * copy is a small rupee pickup now, without the player having to know the
 * pool arithmetic behind it.
 *
 * Names come from the dataset instead of from wording written here
 * (progressive/progressive-display-names.ts): the record set knows what each
 * rung is called, and a checkout without it keeps the short neutral words the
 * family table carries.
 */
import { PROGRESSIVE_FAMILIES } from '@shared/randomizer/ap-world/progressive/progressive-families.data';
import { progressiveFamilyName, progressiveTierName } from '@shared/randomizer/ap-world/progressive/progressive-display-names';
import { progressiveTierKeyOf } from '@shared/randomizer/ap-world/progressive/progressive-option-keys';
import type {
  ProgressiveFamilyId, ProgressiveFamilyMode, ProgressiveModeSetting, ProgressiveSetting,
} from '@shared/randomizer/ap-world/progressive/progressive.type';

interface ProgressiveTierToggleModel {
  /** The catalog key this box stands for, which is also its react key. */
  key: string;
  label: string;
  index: number;
  checked: boolean;
}

interface ProgressiveCardModel {
  id: ProgressiveFamilyId;
  name: string;
  /** "3 of 4 in the pool": what the ticks add up to. */
  countText: string;
  tiers: ProgressiveTierToggleModel[];
  /** Nothing ticked: the family is out of the seed entirely. */
  noneOn: boolean;
  /** Whether the copies are steps up the ladder or the rungs themselves. */
  mode: ProgressiveFamilyMode;
}

const countTextOf = (ticked: number, total: number): string =>
  (ticked === 0 ? 'none in the pool' : `${ticked} of ${total} in the pool`);

const progressiveCardsOf = (
  setting: ProgressiveSetting, modes: ProgressiveModeSetting,
): ProgressiveCardModel[] =>
  PROGRESSIVE_FAMILIES.map((family) => {
    const tiers = family.tierLabels.map((_neutral, index) => ({
      key: progressiveTierKeyOf(family.id, index),
      label: progressiveTierName(family, index),
      index,
      checked: setting[family.id][index] !== false,
    }));
    const ticked = tiers.filter((tier) => tier.checked).length;
    return {
      id: family.id,
      name: progressiveFamilyName(family),
      countText: countTextOf(ticked, tiers.length),
      tiers,
      noneOn: ticked === 0,
      mode: modes[family.id] ?? 'progressive',
    };
  });

export { progressiveCardsOf };
export type { ProgressiveCardModel, ProgressiveTierToggleModel };
