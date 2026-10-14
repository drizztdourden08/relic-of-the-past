/* @layer renderer-lib @kind logic */
import { CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, capacityBonusValuesOf, capacityValuesOf, reconcileCapacityPond, difficultyValuesOf, itemPowerValuesOf, storyGateValuesOf, potionPriceOverrides, progressiveValuesOf, progressiveModeValuesOf, retroBowValuesOf, pondProfileValuesOf, shopScopeValues } from '@rotp/randomizer';
import type { OptionValue } from '@rotp/randomizer';
import type { RandomizerOptionChoices } from './randomizer-choices.type';
import { PLAIN_FIELD_BY_KEY } from './randomizer-choices.constants';
import { capacityPondOf } from './capacity-pond-of';

const plainOverrides = (choices: RandomizerOptionChoices): Record<string, OptionValue> =>
  Object.fromEntries(Object.entries(PLAIN_FIELD_BY_KEY).map(([key, field]) => [key, choices[field]]));

const randomizerChoiceOverrides = (
  choices: RandomizerOptionChoices,
): Readonly<Record<string, OptionValue>> => {
  const { enabled, capacity, pond } = reconcileCapacityPond(capacityPondOf(choices));
  return {
    ...plainOverrides(choices),
    ...shopScopeValues(choices.shops),
    ...choices.shopPrices,
    ...potionPriceOverrides(choices.shops),
    [CAPACITY_ENABLED_KEY]: enabled,
    ...capacityValuesOf(capacity),
    [CAPACITY_PROGRESSIVE_KEY]: choices.capacityProgressive,
    ...capacityBonusValuesOf(choices.capacityBonus),
    ...pondProfileValuesOf({ ...choices.ponds, capacity: pond }, choices.pondShare === true),
    ...progressiveValuesOf(choices.progressiveTiers),
    ...progressiveModeValuesOf(choices.progressiveModes),
    ...retroBowValuesOf(choices.retroBow),
    ...itemPowerValuesOf(choices.itemPower),
    ...difficultyValuesOf(choices.difficulty),
    ...storyGateValuesOf(choices.storyGates),
  };
};

export { randomizerChoiceOverrides };
