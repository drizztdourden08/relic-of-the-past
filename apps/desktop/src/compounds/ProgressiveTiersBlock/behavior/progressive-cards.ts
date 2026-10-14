/* @layer renderer-components @kind logic */
import { PROGRESSIVE_FAMILIES, progressiveFamilyName, progressiveTierName, progressiveTierKeyOf } from '@rotp/randomizer';
import type { ProgressiveModeSetting, ProgressiveSetting } from '@rotp/randomizer';
import type { ProgressiveCardModel, ProgressiveTierToggleModel } from '../ProgressiveTiersBlock.type';

const countTextOf = (ticked: number, total: number): string =>
  (ticked === 0 ? 'none in the pool' : `${ticked} of ${total} in the pool`);

const progressiveCardsOf = (
  setting: ProgressiveSetting, modes: Partial<ProgressiveModeSetting>,
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
