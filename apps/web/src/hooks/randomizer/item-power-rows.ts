/* @layer renderer-hooks @kind logic */
import { forcedItemPowerReasons } from '@shared/randomizer/world/item-power/item-power-forced';
import {
  beamSwordReachable, swordReachable,
} from '@shared/randomizer/world/progressive/progressive-reach';
import type { OptionDef, OptionValue } from '@shared/randomizer/world/options.type';
import type { ProgressiveSetting } from '@shared/randomizer/world/progressive/progressive.type';
import type { ForcedItemPowerRows } from './item-power-rows.type';
import { NO_FORCED_KEYS } from './item-power-rows.constants';

const forcedItemPowerRows = (
  tiers: ProgressiveSetting, storedValueOf: (option: OptionDef) => OptionValue,
): ForcedItemPowerRows => {
  const notes = forcedItemPowerReasons(swordReachable(tiers), beamSwordReachable(tiers));
  const keys = notes.size === 0 ? NO_FORCED_KEYS : new Set(notes.keys());
  return {
    keys,
    notes,
    valueOf: (option) => (keys.has(option.key) ? true : storedValueOf(option)),
  };
};

export { forcedItemPowerRows };
export type { ForcedItemPowerRows };
