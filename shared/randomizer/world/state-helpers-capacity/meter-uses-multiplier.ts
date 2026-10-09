/* @layer shared-game @kind logic */
import { ITEM } from '../item-ids.data';
import { METER } from '../capacity/capacity-family';
import { familySettingOf } from './family-setting-of';
import { tierReached } from './tier-reached';
import type { CollectionState } from '../collection-state.type';

const meterUsesMultiplier = (state: CollectionState): number => {
  const setting = familySettingOf(state, METER);
  if (setting.mode !== 'custom') {
    if (state.has(ITEM.magicUpgradeQuarter)) return 4;
    return state.has(ITEM.magicUpgradeHalf) ? 2 : 1;
  }
  const rung = tierReached(state, METER, setting);
  return rung === 0 ? 0 : 2 ** (rung - 1);
};

export { meterUsesMultiplier };
