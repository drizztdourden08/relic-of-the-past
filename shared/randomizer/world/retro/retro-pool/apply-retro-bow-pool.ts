/* @layer shared-game @kind logic */
import { RETRO_ARROW_PICKUPS, RETRO_REPLACEMENT_ITEM } from '../retro-bow.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../../item-ids.data';
import type { RetroBowSetting } from '../retro.type';

const applyRetroBowPool = (pool: ItemKey[], setting: RetroBowSetting): void => {
  if (!setting.enabled) return;
  for (let index = 0; index < pool.length; index += 1) {
    if (RETRO_ARROW_PICKUPS.includes(pool[index] as ItemId)) pool[index] = RETRO_REPLACEMENT_ITEM;
  }
};

export { applyRetroBowPool };
