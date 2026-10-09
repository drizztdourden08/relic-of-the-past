/* @layer renderer-lib @kind logic */
import { all } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';

let bigKeys: readonly ItemId[] | null = null;

const bigKeyItemIds = (): readonly ItemId[] => {
  bigKeys ??= all('item').filter((item) => item.name.startsWith('Big Key (')).map((item) => item.id);
  return bigKeys;
};

export { bigKeyItemIds };
