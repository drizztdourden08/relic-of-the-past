/* @layer bridge-wasm @kind logic */
import { MEDALLION_ITEMS, VANILLA_MEDALLIONS } from '../../world/item-groups';
import { itemKeyOfName } from '../../world/display-names/item-key-name';
import type { MedallionId } from '../../world/item-groups';
import type { ItemKey } from '../../world/item-ids.data';
import type { RotpSlotData } from '../../archipelago/slot-data.type';
import type { Medallions } from './slot-data-values.type';

const medallionOf = (keyOrName: string, fallback: MedallionId): MedallionId => {
  const key = (MEDALLION_ITEMS as readonly string[]).includes(keyOrName) ? keyOrName as ItemKey : itemKeyOfName(keyOrName);
  return (MEDALLION_ITEMS as readonly string[]).includes(key) ? key as MedallionId : fallback;
};

const medallionsOfSlot = (slotData: RotpSlotData): Medallions => ({
  mire: medallionOf(slotData.medallions.mire, VANILLA_MEDALLIONS.mire),
  turtleRock: medallionOf(slotData.medallions.turtleRock, VANILLA_MEDALLIONS.turtleRock),
});

export { medallionsOfSlot };
