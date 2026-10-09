/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation, SimChest } from '@shared/game/simulation';
import type { ItemId } from '@rotp/game-data';
import { itemLabel, resolveDuplicate } from '@rotp/game-data';

const chestAnnotation = (chest: SimChest, inventory: ReadonlySet<ItemId>): ScreenAnnotation => {
  const yielded = chest.itemId !== undefined ? resolveDuplicate(chest.itemId, inventory) : undefined;
  const name = yielded !== undefined ? itemLabel(yielded) : undefined;
  const swapped = chest.itemId !== undefined && yielded !== chest.itemId;
  return {
    kind: chest.isBig ? 'big-chest' : 'chest',
    tile: chest.tile,
    label: name ?? 'chest',
    state: chest.opened ? 'done' : 'available',
    detail: swapped ? `#${chest.chestIndex} · already owned` : `#${chest.chestIndex}`,
    ...(chest.isBig ? { requires: ['bigkey:*'] } : {}),
  };
};

export { chestAnnotation };
