/* @layer renderer-lib @kind logic */
import { capacityBonusOfValues, capacityEnabledOf, capacityProgressiveOf, parseCapacityProfile, darkRoomSettingOfValues, difficultyOfValues, itemPowerOfValues, parsePondProfiles, progressiveSettingOfValues, progressiveModesOfValues, retroBowOfValues, shopScopeOfValues, storyGatesOfValues } from '@rotp/randomizer';
import { withDarkRoomSetting } from './dark-room-choices';
import { PLAIN_FIELD_BY_KEY } from './randomizer-choices';
import type { ChoiceField, RandomizerOptionChoices } from './randomizer-choices';
import type { OptionValue, RandomizerOptionsSnapshot } from '@rotp/randomizer';

const plainChoicesOf = (values: RandomizerOptionsSnapshot['values']): Pick<RandomizerOptionChoices, ChoiceField> => {
  const plain: Partial<Record<ChoiceField, OptionValue>> =
    Object.fromEntries(Object.entries(PLAIN_FIELD_BY_KEY).map(([key, field]) => [field, values[key]]));
  return plain as Pick<RandomizerOptionChoices, ChoiceField>;
};

const choicesOfSnapshot = (snapshot: RandomizerOptionsSnapshot, seed: string): RandomizerOptionChoices => {
  const { values } = snapshot;
  const ponds = parsePondProfiles(values);
  const choices: RandomizerOptionChoices = {
    ...plainChoicesOf(values),
    shops: shopScopeOfValues(values, seed),
    shopPrices: {},
    capacityEnabled: capacityEnabledOf(values),
    capacity: parseCapacityProfile(values).profile,
    capacityProgressive: capacityProgressiveOf(values),
    capacityBonus: capacityBonusOfValues(values),
    ponds: ponds.profiles,
    pondShare: ponds.shared,
    progressiveTiers: progressiveSettingOfValues(values),
    progressiveModes: progressiveModesOfValues(values),
    retroBow: retroBowOfValues(values),
    difficulty: difficultyOfValues(values),
    itemPower: itemPowerOfValues(values),
    storyGates: storyGatesOfValues(values),
  };
  return withDarkRoomSetting(choices, darkRoomSettingOfValues(values));
};

export { choicesOfSnapshot };
