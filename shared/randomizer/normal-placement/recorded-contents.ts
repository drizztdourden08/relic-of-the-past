/* @layer shared-game @kind logic */
import { find } from '../../game/data';
import type { CheckId, ItemId } from '../../game/data/types/ids';

const recordedContents = (): ReadonlyMap<CheckId, ItemId> => {
  const contents = new Map<CheckId, ItemId>();
  for (const check of find('check', () => true)) {
    const first = check.vanillaItemIds[0];
    if (first !== undefined) contents.set(check.id, first);
  }
  return contents;
};

export { recordedContents };
