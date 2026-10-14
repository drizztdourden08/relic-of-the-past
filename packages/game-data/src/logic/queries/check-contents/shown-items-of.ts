/* @layer shared-game @kind logic */
import type { ItemId } from '../../../data';
import type { RunContext } from '../check-grouping/check-grouping.type';
import type { ShownItemsParams } from './check-contents.type';

const recordedItemOf = (id: string, run?: RunContext): ItemId | undefined =>
  run?.placedItems?.get(id) ?? run?.liveItems?.get(id);

const shownItemsOf = (params: ShownItemsParams): (ItemId | undefined)[] => {
  const { check, run, override, receipt, expand = false } = params;
  if (override !== undefined) return [override];
  const recorded = recordedItemOf(check.id, run);
  if (recorded !== undefined) return [recorded];
  if (receipt !== undefined) return [receipt];
  if (run?.kind === 'online') return [undefined];
  if (expand && check.vanillaItemIds.length > 1) return [...check.vanillaItemIds];
  return [check.vanillaItemIds[0]];
};

export { shownItemsOf };
