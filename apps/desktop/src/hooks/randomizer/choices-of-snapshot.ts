/* @layer renderer-lib @kind logic */
import { capacityBonusOfValues, capacityEnabledOf, capacityProgressiveOf, parseCapacityProfile } from '@rotp/randomizer';
import { darkRoomSettingOfValues } from '@rotp/randomizer';
import { difficultyOfValues } from '@rotp/randomizer';
import { itemPowerOfValues } from '@rotp/randomizer';
import { parsePondProfiles } from '@rotp/randomizer';
import { progressiveSettingOfValues } from '@rotp/randomizer';
import { progressiveModesOfValues } from '@rotp/randomizer';
import { retroBowOfValues } from '@rotp/randomizer';
import { shopScopeOfValues } from '@rotp/randomizer';
import { storyGatesOfValues } from '@rotp/randomizer';
import { withDarkRoomSetting } from './dark-room-choices';
import { PLAIN_FIELD_BY_KEY } from './randomizer-choices';
import type { ChoiceField, RandomizerOptionChoices } from './randomizer-choices';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';

const plainChoicesOf = (values: RandomizerOptionsSnapshot['values']): Pick<RandomizerOptionChoices, ChoiceField> =>
  Object.fromEntries(Object.entries(PLAIN_FIELD_BY_KEY).map(([key, field]) => [field, values[key]])) as
    unknown as Pick<RandomizerOptionChoices, ChoiceField>;

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
