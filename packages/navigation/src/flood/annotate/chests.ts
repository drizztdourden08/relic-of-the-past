/* @layer bridge-wasm @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenAnnotation, SimChest } from '../../simulation';
import type { ItemId } from '@rotp/game-data';
import { itemLabel, resolveDuplicate } from '@rotp/game-data';

const chestAnnotation = (chest: SimChest, inventory: ReadonlySet<ItemId>): ScreenAnnotation => {
  const yielded = chest.itemId !== undefined ? resolveDuplicate(chest.itemId, inventory) : undefined;
  const name = yielded !== undefined ? itemLabel(yielded) : undefined;
  const swapped = chest.itemId !== undefined && yielded !== chest.itemId;
  return {
    kind: chest.isBig ? 'big-chest' : 'chest',
    tile: chest.tile,
    label: name ?? msg('nav-labels:label.chest'),
    state: chest.opened ? 'done' : 'available',
    detail: swapped
      ? msg('nav-labels:detail.chestOwned', { index: chest.chestIndex })
      : msg('nav-labels:detail.chest', { index: chest.chestIndex }),
    ...(chest.isBig ? { requires: ['bigkey:*'] } : {}),
  };
};

export { chestAnnotation };
