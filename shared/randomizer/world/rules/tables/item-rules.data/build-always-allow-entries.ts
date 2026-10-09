/* @layer shared-game @kind logic */
import { ITEM } from '../../../item-ids.data';
import { REGION } from '../../../region-ids.data';
import { PALACE_OF_DARKNESS_SELF_LOCK_KEYS } from './item-rules.constants';
import type { World } from '../../../world.type';
import type { AlwaysAllowEntry } from '../../rule-entry.type';

const buildAlwaysAllowEntries = (world: World): AlwaysAllowEntry[] => {
  const entries: AlwaysAllowEntry[] = [
    {
      location: 'check-119',
      rule: (_state, item) => item === ITEM.bigKeyEasternPalace,
    },
    {
      location: 'check-137',
      rule: (_state, item) => item === ITEM.smallKeyTowerOfHera,
    },
    {
      location: 'check-159',
      rule: (_state, item) => item === ITEM.bigKeySwampPalace,
    },
    {
      location: 'check-186',
      rule: (_state, item) => item === ITEM.bigKeySkullWoods,
    },
    {
      location: 'check-145',
      rule: (state, item) => item === ITEM.smallKeyPalaceOfDarkness
        && state.has(ITEM.smallKeyPalaceOfDarkness, PALACE_OF_DARKNESS_SELF_LOCK_KEYS),
    },
    {
      location: 'check-154',
      rule: (state, item) => item === ITEM.smallKeyPalaceOfDarkness
        && state.has(ITEM.smallKeyPalaceOfDarkness, PALACE_OF_DARKNESS_SELF_LOCK_KEYS),
    },
    {
      location: 'check-224',
      rule: (state, item) => item === ITEM.smallKeyTurtleRock
        && state.canReachRegion(REGION.turtleRockSecondSection),
    },
  ];
  if (!world.options.keyDropShuffle) {
    entries.push({
      location: 'check-178',
      rule: (_state, item) => item === ITEM.smallKeyThievesTown,
    });
  }
  return entries;
};

export { buildAlwaysAllowEntries };
