/* @layer renderer-lib @kind logic */
/**
 * A frozen option snapshot read back as the creation form's choices, so the
 * options panel can draw a profile's stored settings through the very same
 * blocks it draws a new profile's with. The other direction of
 * randomizer-choices.ts: every block is read with the snapshot reader the
 * generator itself uses, so what the read-only panel shows is what the seed
 * was rolled from.
 *
 * The shop price rows stay empty because the price block reads the snapshot
 * values straight, never the choices.
 */
import {
  capacityBonusOfValues, capacityEnabledOf, capacityProgressiveOf, parseCapacityProfile,
} from '@shared/randomizer/world/capacity';
import { darkRoomSettingOfValues } from '@shared/randomizer/world/dark-rooms/dark-room-from-snapshot';
import { difficultyOfValues } from '@shared/randomizer/world/difficulty/difficulty-from-snapshot';
import { itemPowerOfValues } from '@shared/randomizer/world/item-power/item-power-from-snapshot';
import { parsePondProfiles } from '@shared/randomizer/world/pond/pond-profiles-from-snapshot';
import { progressiveSettingOfValues } from '@shared/randomizer/world/progressive/progressive-from-snapshot';
import { progressiveModesOfValues } from '@shared/randomizer/world/progressive/progressive-mode-from-snapshot';
import { retroBowOfValues } from '@shared/randomizer/world/retro/retro-from-snapshot';
import { shopScopeOfValues } from '@shared/randomizer/world/shops/shop-scope-from-values';
import { storyGatesOfValues } from '@shared/randomizer/world/story-gates/story-gate-from-snapshot';
import { withDarkRoomSetting } from './dark-room-choices';
import { PLAIN_FIELD_BY_KEY } from './randomizer-choices';
import type { ChoiceField, RandomizerOptionChoices } from './randomizer-choices';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';

/**
 * The plain rows, read off the same key map the snapshot is written through.
 * A cast, because the map pairs each key with a field of its own type, and
 * the snapshot holds every value as the catalog's one union.
 */
const plainChoicesOf = (values: RandomizerOptionsSnapshot['values']): Pick<RandomizerOptionChoices, ChoiceField> =>
  Object.fromEntries(Object.entries(PLAIN_FIELD_BY_KEY).map(([key, field]) => [field, values[key]])) as
    unknown as Pick<RandomizerOptionChoices, ChoiceField>;

/** |seed| is the profile's own, which a random shop scope drew its shelves from. */
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
  // The lights as the generator reads them: masked by the world-item scope.
  return withDarkRoomSetting(choices, darkRoomSettingOfValues(values));
};

export { choicesOfSnapshot };
