/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import type { ShownItemsParams } from './check-contents.type';

const shownItemsOf = (params: ShownItemsParams): (ItemId | undefined)[] => {
  const { check, run, override, receipt, expand = false } = params;
  if (override !== undefined) return [override];
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return [placed];
  const live = run?.liveItems?.get(check.id);
  if (live !== undefined) return [live];
  if (receipt !== undefined) return [receipt];
  if (run?.kind === 'online') return [undefined];
  if (expand && check.vanillaItemIds.length > 1) return [...check.vanillaItemIds];
  return [check.vanillaItemIds[0]];
};

export { shownItemsOf };
