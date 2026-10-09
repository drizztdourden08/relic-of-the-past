/* @layer shared-game @kind types */
import type { ItemKey } from '../item-ids';

interface ItemPool {
  pool: readonly ItemKey[];
  progression: readonly ItemKey[];
  useful: readonly ItemKey[];
  filler: readonly ItemKey[];
  uncleWeapon?: ItemKey;
  promotedHeartContainers: number;
  dungeonItems: ReadonlyMap<string, readonly ItemKey[]>;
  prizes: readonly ItemKey[];
  startInventory: readonly ItemKey[];
}

export type { ItemPool };
